// Integration tests against the local SQL Server (database SalesDW_Test, recreated for each run).
// Run: npm test   (override the server with MSSQL_TEST_CONNECTION_STRING)
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import sql from 'msnodesqlv8';
import { QueryRejected, Warehouse, validateSelect } from '../server/warehouse';
import { initialOrderItems, initialProducts } from '../server/seed';
import { sampleQueries } from '../src/data';

const CONNECTION_STRING =
  process.env.MSSQL_TEST_CONNECTION_STRING ||
  'Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=SalesDW_Test;Trusted_Connection=yes;';

let wh: Warehouse;

async function dropTestDatabase() {
  const master = CONNECTION_STRING.replace(/Database=[^;]+/i, 'Database=master');
  await sql.promises.query(
    master,
    `IF DB_ID(N'SalesDW_Test') IS NOT NULL
     BEGIN
       ALTER DATABASE SalesDW_Test SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
       DROP DATABASE SalesDW_Test;
     END`
  );
}

const expectedRevenue = initialOrderItems.reduce((sum, i) => sum + i.quantity * i.price, 0);
const expectedCost = initialOrderItems.reduce(
  (sum, i) => sum + i.quantity * initialProducts.find((p) => p.product_id === i.product_id)!.cost_price,
  0
);

before(async () => {
  await dropTestDatabase();
  wh = await Warehouse.open(CONNECTION_STRING);
});

after(async () => {
  await wh.close();
  await dropTestDatabase();
});

beforeEach(async () => {
  await wh.reset();
});

const count = async (table: string) => (await wh.db.query<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`))[0].n;

describe('source data', () => {
  test('seed fills the source tables once', async () => {
    assert.equal(await count('oltp.customers'), 10);
    assert.equal(await count('oltp.products'), 9);
    assert.equal(await count('oltp.orders'), 25);
    assert.equal(await count('oltp.order_items'), 30);
    assert.equal(await wh.seed(), false);
  });

  test('dashboard reads the source tables before the first ETL', async () => {
    const d = await wh.dashboard();
    assert.equal(d.source, 'oltp');
    assert.equal(d.lastEtl, null);
    assert.equal(d.metrics.revenue, expectedRevenue);
    assert.equal(d.metrics.cost, expectedCost);
    assert.equal(d.metrics.orders, 25);
    assert.equal(d.ordersNotInWarehouse, 25);
    assert.ok(d.tiers.every((t) => t.Customers === 0));
  });

  test('addOrder stores a completed order at current prices and validates input', async () => {
    const order = await wh.addOrder({ customerId: 3, orderDate: '2026-07-01', items: [{ productId: 101, quantity: 2 }] });
    assert.equal(order.orderId, 1026);
    assert.equal(order.total, 37000);
    assert.equal(await count('oltp.order_items'), 31);

    await assert.rejects(wh.addOrder({ customerId: 999, items: [{ productId: 101, quantity: 1 }] }), QueryRejected);
    await assert.rejects(wh.addOrder({ customerId: 1, items: [{ productId: 999, quantity: 1 }] }), QueryRejected);
    await assert.rejects(wh.addOrder({ customerId: 1, items: [] }), QueryRejected);
    await assert.rejects(wh.addOrder({ customerId: 1, items: [{ productId: 101, quantity: 0 }] }), QueryRejected);
    assert.equal(await count('oltp.orders'), 26, 'failed orders leave nothing behind');
  });
});

describe('ETL', () => {
  test('builds the star schema with correct measures', async () => {
    const result = await wh.runEtl();
    assert.equal(result.rowsLoaded, 30);
    assert.deepEqual([...new Set(result.steps.map((s) => s.phase))], ['extract', 'transform', 'load']);

    assert.equal(await count('dbo.dim_customers'), 10);
    assert.equal(await count('dbo.dim_products'), 9);
    assert.equal(await count('dbo.fact_sales'), 30);

    const [day] = await wh.db.query(
      "SELECT day_of_week, month_name, quarter, CONVERT(CHAR(10), full_date, 23) AS d FROM dbo.dim_time WHERE time_key = 20260112"
    );
    assert.deepEqual(day, { day_of_week: 'Monday', month_name: 'January', quarter: 1, d: '2026-01-12' });

    const d = await wh.dashboard();
    assert.equal(d.source, 'warehouse');
    assert.equal(d.metrics.revenue, expectedRevenue);
    assert.equal(d.metrics.profit, expectedRevenue - expectedCost);
    assert.equal(d.trend.length, 6);
    assert.equal(d.trend[0].month, 'Jan 2026');
    assert.equal(d.ordersNotInWarehouse, 0);
    assert.equal(d.tiers.reduce((n, t) => n + t.Customers, 0), 10);
    assert.equal(d.tiers.reduce((n, t) => n + t.Spending, 0), expectedRevenue);
    assert.ok(d.lastEtl);
  });

  test('re-running keeps surrogate keys and picks up new orders', async () => {
    await wh.runEtl();
    const keysBefore = await wh.db.query('SELECT customer_id, customer_key FROM dbo.dim_customers ORDER BY customer_id');

    await wh.addOrder({ customerId: 5, orderDate: '2026-07-15', items: [{ productId: 108, quantity: 3 }] });
    assert.equal((await wh.dashboard()).ordersNotInWarehouse, 1);

    const result = await wh.runEtl();
    assert.equal(result.rowsLoaded, 31);
    assert.deepEqual(await wh.db.query('SELECT customer_id, customer_key FROM dbo.dim_customers ORDER BY customer_id'), keysBefore);

    const d = await wh.dashboard();
    assert.equal(d.metrics.revenue, expectedRevenue + 3 * 12500);
    assert.equal(d.trend.at(-1)!.month, 'Jul 2026');
    const [tier] = await wh.db.query<{ tier: string }>('SELECT tier FROM dbo.dim_customers WHERE customer_id = 5');
    assert.equal(tier.tier, 'Platinum'); // 3,900 + 12,500 + 3 x 12,500 = 53,900
  });
});

describe('SQL playground', () => {
  test('every sample query runs on SQL Server', async () => {
    await wh.runEtl();
    for (const q of sampleQueries) {
      const r = await wh.runQuery(q.sql);
      assert.ok(r.headers.length > 0, q.id);
      assert.ok(r.rowCount > 0, q.id);
    }
    const summary = await wh.runQuery(sampleQueries[0].sql);
    assert.equal(summary.rows[0][0], 30);
    assert.equal(summary.rows[0][2], expectedRevenue);
  });

  test('returns column names even with no rows, and SQL errors as messages', async () => {
    const empty = await wh.runQuery('SELECT sale_id, revenue FROM fact_sales');
    assert.deepEqual(empty.headers, ['sale_id', 'revenue']);
    assert.equal(empty.rowCount, 0);

    await assert.rejects(wh.runQuery('SELECT nope FROM fact_sales'), (err: Error) =>
      err instanceof QueryRejected && /Invalid column name 'nope'/.test(err.message));
  });

  test('rejects anything but a single SELECT', () => {
    for (const bad of [
      'UPDATE oltp.products SET unit_price = 0',
      'SELECT 1; DROP TABLE dbo.fact_sales',
      'SELECT * INTO copy_table FROM fact_sales',
      'EXEC sp_who',
      'WITH x AS (SELECT 1 AS a) DELETE FROM fact_sales',
      '   ',
    ]) {
      assert.throws(() => validateSelect(bad), QueryRejected, bad);
    }
    assert.equal(validateSelect('-- comment\nSELECT 1;'), 'SELECT 1');
  });

  test('the playground user cannot change data even if validation were bypassed', async () => {
    await assert.rejects(
      sql.promises.query(CONNECTION_STRING, "EXECUTE AS USER = N'playground_reader'; UPDATE oltp.products SET unit_price = 0;"),
      /permission was denied/i
    );
    const [p] = await wh.db.query<{ n: number }>('SELECT COUNT(*) AS n FROM oltp.products WHERE unit_price = 0');
    assert.equal(p.n, 0);
  });
});
