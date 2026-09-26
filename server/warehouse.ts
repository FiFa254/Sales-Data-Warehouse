// SQL Server warehouse (database SalesDW by default).
//   oltp.*  – source tables the shop writes to (customers, products, orders, order_items)
//   dbo.*   – star schema built by the ETL (dim_customers, dim_products, dim_time, fact_sales) + etl_runs log
// The SQL playground runs as a read-only database user, on its own short-lived connection.
import sql from 'msnodesqlv8';
import { Db } from './db';
import { initialCustomers, initialOrderItems, initialOrders, initialProducts } from './seed';

// Idempotent: safe to run on every start.
const SCHEMA = `
IF SCHEMA_ID(N'oltp') IS NULL EXEC(N'CREATE SCHEMA oltp');

IF OBJECT_ID(N'oltp.customers') IS NULL
CREATE TABLE oltp.customers (
  customer_id INT           NOT NULL PRIMARY KEY,
  name        NVARCHAR(100) NOT NULL,
  email       NVARCHAR(200) NOT NULL,
  city        NVARCHAR(100) NOT NULL,
  age         INT           NOT NULL,
  created_at  DATE          NOT NULL
);
IF OBJECT_ID(N'oltp.products') IS NULL
CREATE TABLE oltp.products (
  product_id INT            NOT NULL PRIMARY KEY,
  name       NVARCHAR(200)  NOT NULL,
  category   NVARCHAR(100)  NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
  cost_price DECIMAL(12, 2) NOT NULL CHECK (cost_price >= 0)
);
IF OBJECT_ID(N'oltp.orders') IS NULL
CREATE TABLE oltp.orders (
  order_id    INT          NOT NULL PRIMARY KEY,
  customer_id INT          NOT NULL REFERENCES oltp.customers(customer_id),
  order_date  DATE         NOT NULL,
  status      NVARCHAR(20) NOT NULL DEFAULT N'Completed'
);
IF OBJECT_ID(N'oltp.order_items') IS NULL
CREATE TABLE oltp.order_items (
  item_id    INT            NOT NULL PRIMARY KEY,
  order_id   INT            NOT NULL REFERENCES oltp.orders(order_id) ON DELETE CASCADE,
  product_id INT            NOT NULL REFERENCES oltp.products(product_id),
  quantity   INT            NOT NULL CHECK (quantity > 0),
  price      DECIMAL(12, 2) NOT NULL CHECK (price >= 0)
);

IF OBJECT_ID(N'dbo.dim_customers') IS NULL
CREATE TABLE dbo.dim_customers (
  customer_key      INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
  customer_id       INT            NOT NULL UNIQUE,
  name              NVARCHAR(100)  NOT NULL,
  city              NVARCHAR(100)  NOT NULL,
  tier              NVARCHAR(10)   NOT NULL,
  registration_year INT            NOT NULL,
  total_spend       DECIMAL(14, 2) NOT NULL
);
IF OBJECT_ID(N'dbo.dim_products') IS NULL
CREATE TABLE dbo.dim_products (
  product_key INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
  product_id  INT            NOT NULL UNIQUE,
  name        NVARCHAR(200)  NOT NULL,
  category    NVARCHAR(100)  NOT NULL,
  unit_price  DECIMAL(12, 2) NOT NULL,
  cost_price  DECIMAL(12, 2) NOT NULL
);
IF OBJECT_ID(N'dbo.dim_time') IS NULL
CREATE TABLE dbo.dim_time (
  time_key     INT          NOT NULL PRIMARY KEY, -- YYYYMMDD
  full_date    DATE         NOT NULL,
  day_of_week  NVARCHAR(10) NOT NULL,
  day_of_month INT          NOT NULL,
  month_name   NVARCHAR(10) NOT NULL,
  quarter      INT          NOT NULL,
  year         INT          NOT NULL
);
IF OBJECT_ID(N'dbo.fact_sales') IS NULL
CREATE TABLE dbo.fact_sales (
  sale_id      INT            NOT NULL PRIMARY KEY, -- = oltp.order_items.item_id
  order_id     INT            NOT NULL,
  customer_key INT            NOT NULL REFERENCES dbo.dim_customers(customer_key),
  product_key  INT            NOT NULL REFERENCES dbo.dim_products(product_key),
  time_key     INT            NOT NULL REFERENCES dbo.dim_time(time_key),
  quantity     INT            NOT NULL,
  unit_price   DECIMAL(12, 2) NOT NULL,
  cost_price   DECIMAL(12, 2) NOT NULL,
  revenue      DECIMAL(14, 2) NOT NULL,
  cost         DECIMAL(14, 2) NOT NULL,
  profit       DECIMAL(14, 2) NOT NULL,
  discount     DECIMAL(12, 2) NOT NULL DEFAULT 0
);
IF OBJECT_ID(N'dbo.etl_runs') IS NULL
CREATE TABLE dbo.etl_runs (
  run_id      INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
  started_at  DATETIME2     NOT NULL,
  finished_at DATETIME2     NOT NULL,
  rows_loaded INT           NOT NULL,
  duration_ms INT           NOT NULL
);

-- Read-only identity for the SQL playground (a database user without a login;
-- it can only SELECT inside this database).
IF DATABASE_PRINCIPAL_ID(N'playground_reader') IS NULL
BEGIN
  CREATE USER playground_reader WITHOUT LOGIN;
  ALTER ROLE db_datareader ADD MEMBER playground_reader;
END
`;

export interface EtlStep {
  phase: 'extract' | 'transform' | 'load';
  message: string;
  rows: number;
  ms: number;
}

export interface EtlResult {
  steps: EtlStep[];
  rowsLoaded: number;
  durationMs: number;
  finishedAt: string;
}

export interface Dashboard {
  source: 'warehouse' | 'oltp';
  lastEtl: { finishedAt: string; rowsLoaded: number; durationMs: number } | null;
  metrics: { revenue: number; cost: number; profit: number; orders: number; items: number; margin: number; aov: number };
  trend: { month: string; Revenue: number; Profit: number }[];
  tiers: { name: string; Spending: number; Customers: number }[];
  categories: { name: string; Profit: number; sales: number }[];
  source_counts: { customers: number; products: number; orders: number; items: number };
  ordersNotInWarehouse: number;
}

export interface QueryResult {
  headers: string[];
  rows: unknown[][];
  rowCount: number;
  truncated: boolean;
  executionTimeMs: number;
}

export class QueryRejected extends Error {}

const MAX_ROWS = 500;
const QUERY_TIMEOUT_MS = 5000;
const TIER_ORDER = ['Platinum', 'Gold', 'Silver', 'Standard'];

export class Warehouse {
  private constructor(readonly db: Db, private readonly connectionString: string) {}

  static async open(connectionString: string): Promise<Warehouse> {
    const db = await Db.connect(connectionString);
    await db.run(SCHEMA);
    return new Warehouse(db, connectionString);
  }

  /**
   * Inserts the demo source data when oltp.customers is empty. Not called automatically unless
   * SEED_DEMO_DATA=true; the "Load demo data" button calls reset().
   */
  async loadDemoData(): Promise<boolean> {
    const { n } = (await this.db.queryOne<{ n: number }>('SELECT COUNT(*) AS n FROM oltp.customers'))!;
    if (n > 0) return false;

    await this.db.transaction(async (tx) => {
      for (const c of initialCustomers) {
        await tx.run('INSERT INTO oltp.customers (customer_id, name, email, city, age, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [c.customer_id, c.name, c.email, c.city, c.age, c.created_at]);
      }
      for (const p of initialProducts) {
        await tx.run('INSERT INTO oltp.products (product_id, name, category, unit_price, cost_price) VALUES (?, ?, ?, ?, ?)',
          [p.product_id, p.name, p.category, p.unit_price, p.cost_price]);
      }
      for (const o of initialOrders) {
        await tx.run('INSERT INTO oltp.orders (order_id, customer_id, order_date, status) VALUES (?, ?, ?, ?)',
          [o.order_id, o.customer_id, o.order_date, o.status]);
      }
      for (const i of initialOrderItems) {
        await tx.run('INSERT INTO oltp.order_items (item_id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
          [i.item_id, i.order_id, i.product_id, i.quantity, i.price]);
      }
    });
    return true;
  }

  /** Deletes all source data, the star schema and the ETL log. */
  async clear(): Promise<void> {
    await this.db.run(`
      DELETE FROM dbo.fact_sales; DELETE FROM dbo.dim_time; DELETE FROM dbo.dim_customers; DELETE FROM dbo.dim_products;
      DELETE FROM dbo.etl_runs;
      DELETE FROM oltp.order_items; DELETE FROM oltp.orders; DELETE FROM oltp.products; DELETE FROM oltp.customers;
      DBCC CHECKIDENT ('dbo.dim_customers', RESEED, 0) WITH NO_INFOMSGS;
      DBCC CHECKIDENT ('dbo.dim_products', RESEED, 0) WITH NO_INFOMSGS;`);
  }

  /** Clears everything and loads the demo source data. */
  async reset(): Promise<void> {
    await this.clear();
    await this.loadDemoData();
  }

  async addCustomer(input: { name?: string; email?: string; city?: string; age?: number }) {
    const name = String(input.name ?? '').trim();
    const email = String(input.email ?? '').trim();
    const city = String(input.city ?? '').trim();
    const age = Number(input.age);
    if (!name || name.length > 100) throw new QueryRejected('Customer name is required (max 100 characters).');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) throw new QueryRejected('Enter a valid e-mail address.');
    if (!city || city.length > 100) throw new QueryRejected('City is required (max 100 characters).');
    if (!Number.isInteger(age) || age < 1 || age > 120) throw new QueryRejected('Age must be a whole number from 1 to 120.');

    return this.db.transaction(async (tx) => {
      const [{ id }] = await tx.query<{ id: number }>(
        'SELECT ISNULL(MAX(customer_id), 0) + 1 AS id FROM oltp.customers WITH (UPDLOCK, HOLDLOCK)'
      );
      await tx.run('INSERT INTO oltp.customers (customer_id, name, email, city, age, created_at) VALUES (?, ?, ?, ?, ?, CAST(GETDATE() AS DATE))',
        [id, name, email, city, age]);
      return { id, name, city };
    });
  }

  async addProduct(input: { name?: string; category?: string; unitPrice?: number; costPrice?: number }) {
    const name = String(input.name ?? '').trim();
    const category = String(input.category ?? '').trim();
    const unitPrice = Number(input.unitPrice);
    const costPrice = Number(input.costPrice);
    if (!name || name.length > 200) throw new QueryRejected('Product name is required (max 200 characters).');
    if (!category || category.length > 100) throw new QueryRejected('Category is required (max 100 characters).');
    if (!Number.isFinite(unitPrice) || unitPrice < 0 || !Number.isFinite(costPrice) || costPrice < 0) {
      throw new QueryRejected('Prices must be numbers of 0 or more.');
    }

    return this.db.transaction(async (tx) => {
      const [{ id }] = await tx.query<{ id: number }>(
        'SELECT ISNULL(MAX(product_id), 100) + 1 AS id FROM oltp.products WITH (UPDLOCK, HOLDLOCK)'
      );
      await tx.run('INSERT INTO oltp.products (product_id, name, category, unit_price, cost_price) VALUES (?, ?, ?, ?, ?)',
        [id, name, category, unitPrice, costPrice]);
      return { id, name, category, unitPrice };
    });
  }

  // ---------- Source (OLTP) ----------

  async sourceOptions() {
    const customers = await this.db.query('SELECT customer_id AS id, name, city FROM oltp.customers ORDER BY customer_id');
    const products = await this.db.query(
      'SELECT product_id AS id, name, category, CAST(unit_price AS FLOAT) AS unitPrice FROM oltp.products ORDER BY product_id'
    );
    return { customers, products };
  }

  /** Records a new completed order in the source system at the product's current price. */
  async addOrder(input: { customerId: number; orderDate?: string; items: { productId: number; quantity: number }[] }) {
    const customerId = Number(input.customerId);
    const orderDate = input.orderDate || new Date().toISOString().slice(0, 10);
    if (!Number.isInteger(customerId)) throw new QueryRejected('Choose a customer.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(orderDate) || isNaN(Date.parse(orderDate))) throw new QueryRejected('Invalid order date.');
    if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 20) {
      throw new QueryRejected('An order needs 1 to 20 items.');
    }
    for (const item of input.items) {
      if (!Number.isInteger(Number(item.productId)) || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 100) {
        throw new QueryRejected('Each item needs a product and a quantity from 1 to 100.');
      }
    }

    return this.db.transaction(async (tx) => {
      const customer = await tx.query('SELECT 1 AS ok FROM oltp.customers WHERE customer_id = ?', [customerId]);
      if (customer.length === 0) throw new QueryRejected('Customer not found.');

      const [{ orderId }] = await tx.query<{ orderId: number }>(
        'SELECT ISNULL(MAX(order_id), 1000) + 1 AS orderId FROM oltp.orders WITH (UPDLOCK, HOLDLOCK)'
      );
      await tx.run("INSERT INTO oltp.orders (order_id, customer_id, order_date, status) VALUES (?, ?, ?, N'Completed')",
        [orderId, customerId, orderDate]);

      let total = 0;
      for (const item of input.items) {
        const [product] = await tx.query<{ unit_price: number }>(
          'SELECT CAST(unit_price AS FLOAT) AS unit_price FROM oltp.products WHERE product_id = ?', [Number(item.productId)]
        );
        if (!product) throw new QueryRejected(`Product ${item.productId} not found.`);
        const [{ itemId }] = await tx.query<{ itemId: number }>(
          'SELECT ISNULL(MAX(item_id), 0) + 1 AS itemId FROM oltp.order_items WITH (UPDLOCK, HOLDLOCK)'
        );
        await tx.run('INSERT INTO oltp.order_items (item_id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
          [itemId, orderId, Number(item.productId), Number(item.quantity), product.unit_price]);
        total += product.unit_price * Number(item.quantity);
      }
      return { orderId, orderDate, total };
    });
  }

  // ---------- ETL ----------

  /** Full refresh of the star schema from the source tables, in one transaction. */
  async runEtl(): Promise<EtlResult> {
    const startedAt = new Date();
    const steps: EtlStep[] = [];

    await this.db.transaction(async (tx) => {
      const timed = async (phase: EtlStep['phase'], message: (rows: number) => string, work: () => Promise<number>) => {
        const t0 = performance.now();
        const rows = await work();
        steps.push({ phase, message: message(rows), rows, ms: Math.round(performance.now() - t0) });
      };
      const count = async (table: string) => (await tx.query<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`))[0].n;

      // Extract
      await timed('extract', (n) => `Read ${n} customers from oltp.customers`, () => count('oltp.customers'));
      await timed('extract', (n) => `Read ${n} products from oltp.products`, () => count('oltp.products'));
      await timed('extract', (n) => `Read ${n} completed orders from oltp.orders`,
        () => tx.query<{ n: number }>("SELECT COUNT(*) AS n FROM oltp.orders WHERE status = N'Completed'").then((r) => r[0].n));
      await timed('extract', (n) => `Read ${n} order lines from oltp.order_items`, () => count('oltp.order_items'));

      // Transform + load dimensions (SCD type 1: surrogate keys stay stable, attributes are overwritten)
      await timed('transform', (n) => `Computed lifetime spend and loyalty tier for ${n} customers, merged into dim_customers`, () => tx.run(`
        WITH spend AS (
          SELECT c.customer_id, c.name, c.city, YEAR(c.created_at) AS registration_year,
                 ISNULL(SUM(CASE WHEN o.status = N'Completed' THEN i.quantity * i.price END), 0) AS total_spend
          FROM oltp.customers c
          LEFT JOIN oltp.orders o ON o.customer_id = c.customer_id
          LEFT JOIN oltp.order_items i ON i.order_id = o.order_id
          GROUP BY c.customer_id, c.name, c.city, c.created_at
        ), src AS (
          SELECT *, CASE WHEN total_spend >= 30000 THEN N'Platinum' WHEN total_spend >= 15000 THEN N'Gold'
                         WHEN total_spend >= 5000 THEN N'Silver' ELSE N'Standard' END AS tier
          FROM spend
        )
        MERGE dbo.dim_customers AS d USING src AS s ON d.customer_id = s.customer_id
        WHEN MATCHED THEN UPDATE SET name = s.name, city = s.city, tier = s.tier,
                                     registration_year = s.registration_year, total_spend = s.total_spend
        WHEN NOT MATCHED THEN INSERT (customer_id, name, city, tier, registration_year, total_spend)
                              VALUES (s.customer_id, s.name, s.city, s.tier, s.registration_year, s.total_spend);`));

      await timed('transform', (n) => `Merged ${n} products into dim_products`, () => tx.run(`
        MERGE dbo.dim_products AS d USING oltp.products AS s ON d.product_id = s.product_id
        WHEN MATCHED THEN UPDATE SET name = s.name, category = s.category, unit_price = s.unit_price, cost_price = s.cost_price
        WHEN NOT MATCHED THEN INSERT (product_id, name, category, unit_price, cost_price)
                              VALUES (s.product_id, s.name, s.category, s.unit_price, s.cost_price);`));

      await timed('transform', (n) => `Added ${n} new calendar dates to dim_time (YYYYMMDD keys)`, () => tx.run(`
        INSERT INTO dbo.dim_time (time_key, full_date, day_of_week, day_of_month, month_name, quarter, year)
        SELECT DISTINCT CONVERT(INT, FORMAT(o.order_date, 'yyyyMMdd')), o.order_date,
               FORMAT(o.order_date, 'dddd', 'en-US'), DAY(o.order_date), FORMAT(o.order_date, 'MMMM', 'en-US'),
               DATEPART(QUARTER, o.order_date), YEAR(o.order_date)
        FROM oltp.orders o
        WHERE NOT EXISTS (SELECT 1 FROM dbo.dim_time t WHERE t.full_date = o.order_date);`));

      // Load facts (full refresh: revenue, cost and profit are pre-computed per line)
      await timed('load', (n) => `Cleared ${n} old rows from fact_sales`, () => tx.run('DELETE FROM dbo.fact_sales;'));
      await timed('load', (n) => `Loaded ${n} rows into fact_sales with revenue, cost and profit`, () => tx.run(`
        INSERT INTO dbo.fact_sales (sale_id, order_id, customer_key, product_key, time_key,
                                    quantity, unit_price, cost_price, revenue, cost, profit, discount)
        SELECT i.item_id, o.order_id, dc.customer_key, dp.product_key, CONVERT(INT, FORMAT(o.order_date, 'yyyyMMdd')),
               i.quantity, i.price, p.cost_price,
               i.quantity * i.price, i.quantity * p.cost_price, i.quantity * (i.price - p.cost_price), 0
        FROM oltp.order_items i
        JOIN oltp.orders o ON o.order_id = i.order_id AND o.status = N'Completed'
        JOIN oltp.products p ON p.product_id = i.product_id
        JOIN dbo.dim_customers dc ON dc.customer_id = o.customer_id
        JOIN dbo.dim_products dp ON dp.product_id = i.product_id;`));
    });

    const finishedAt = new Date();
    const rowsLoaded = steps[steps.length - 1].rows;
    const durationMs = finishedAt.getTime() - startedAt.getTime();
    await this.db.run('INSERT INTO dbo.etl_runs (started_at, finished_at, rows_loaded, duration_ms) VALUES (?, ?, ?, ?)',
      [startedAt, finishedAt, rowsLoaded, durationMs]);

    return { steps, rowsLoaded, durationMs, finishedAt: finishedAt.toISOString() };
  }

  // ---------- Dashboard ----------

  async dashboard(): Promise<Dashboard> {
    const [counts] = await this.db.query<Dashboard['source_counts'] & { facts: number }>(`
      SELECT (SELECT COUNT(*) FROM oltp.customers) AS customers, (SELECT COUNT(*) FROM oltp.products) AS products,
             (SELECT COUNT(*) FROM oltp.orders) AS orders, (SELECT COUNT(*) FROM oltp.order_items) AS items,
             (SELECT COUNT(*) FROM dbo.fact_sales) AS facts`);
    const last = await this.db.queryOne(
      'SELECT TOP 1 finished_at, rows_loaded, duration_ms FROM dbo.etl_runs ORDER BY run_id DESC'
    );
    const warehouse = counts.facts > 0;

    // Same measures from either the star schema or, before the first ETL, straight from the source tables.
    const lines = warehouse
      ? `SELECT fs.order_id, fs.quantity, fs.revenue, fs.cost, fs.profit, dt.full_date AS order_date, dp.category
         FROM dbo.fact_sales fs JOIN dbo.dim_time dt ON dt.time_key = fs.time_key
         JOIN dbo.dim_products dp ON dp.product_key = fs.product_key`
      : `SELECT o.order_id, i.quantity, i.quantity * i.price AS revenue, i.quantity * p.cost_price AS cost,
                i.quantity * (i.price - p.cost_price) AS profit, o.order_date, p.category
         FROM oltp.order_items i JOIN oltp.orders o ON o.order_id = i.order_id AND o.status = N'Completed'
         JOIN oltp.products p ON p.product_id = i.product_id`;

    const [m] = await this.db.query(`
      WITH l AS (${lines})
      SELECT CAST(ISNULL(SUM(revenue), 0) AS FLOAT) AS revenue, CAST(ISNULL(SUM(cost), 0) AS FLOAT) AS cost,
             CAST(ISNULL(SUM(profit), 0) AS FLOAT) AS profit, COUNT(DISTINCT order_id) AS orders,
             ISNULL(SUM(quantity), 0) AS items FROM l`);

    const trend = await this.db.query(`
      WITH l AS (${lines})
      SELECT FORMAT(MIN(order_date), 'MMM yyyy', 'en-US') AS month,
             CAST(SUM(revenue) AS FLOAT) AS Revenue, CAST(SUM(profit) AS FLOAT) AS Profit
      FROM l GROUP BY YEAR(order_date), MONTH(order_date) ORDER BY YEAR(order_date), MONTH(order_date)`);

    const categories = await this.db.query(`
      WITH l AS (${lines})
      SELECT category AS name, CAST(SUM(profit) AS FLOAT) AS Profit, CAST(SUM(revenue) AS FLOAT) AS sales
      FROM l GROUP BY category ORDER BY SUM(revenue) DESC`);

    const tierRows = warehouse
      ? await this.db.query<{ name: string; Spending: number; Customers: number }>(`
          SELECT tier AS name, CAST(SUM(total_spend) AS FLOAT) AS Spending, COUNT(*) AS Customers
          FROM dbo.dim_customers GROUP BY tier`)
      : [];
    const tiers = TIER_ORDER.map((name) => tierRows.find((t) => t.name === name) ?? { name, Spending: 0, Customers: 0 });

    const [{ n: ordersNotInWarehouse }] = await this.db.query<{ n: number }>(`
      SELECT COUNT(*) AS n FROM oltp.orders o
      WHERE o.status = N'Completed' AND NOT EXISTS (SELECT 1 FROM dbo.fact_sales f WHERE f.order_id = o.order_id)`);

    return {
      source: warehouse ? 'warehouse' : 'oltp',
      lastEtl: last ? { finishedAt: toIso(last.finished_at), rowsLoaded: last.rows_loaded, durationMs: last.duration_ms } : null,
      metrics: {
        revenue: m.revenue,
        cost: m.cost,
        profit: m.profit,
        orders: m.orders,
        items: m.items,
        margin: m.revenue > 0 ? round2((m.profit / m.revenue) * 100) : 0,
        aov: m.orders > 0 ? round2(m.revenue / m.orders) : 0,
      },
      trend: trend as Dashboard['trend'],
      tiers,
      categories: categories as Dashboard['categories'],
      source_counts: { customers: counts.customers, products: counts.products, orders: counts.orders, items: counts.items },
      ordersNotInWarehouse,
    };
  }

  // ---------- SQL playground ----------

  /** Runs one read-only SELECT as playground_reader on a fresh connection (max 500 rows, 5 s). */
  async runQuery(text: string): Promise<QueryResult> {
    const statement = validateSelect(text);
    const t0 = performance.now();
    let result: any;
    const connection: any = await sql.promises.open(this.connectionString);
    try {
      // The user's text is a parameter, never spliced into the batch. REVERT runs on success and on error,
      // so the connection never stays impersonated.
      result = await connection.promises.query(
        `DECLARE @q NVARCHAR(MAX) = ?;
         EXECUTE AS USER = N'playground_reader';
         BEGIN TRY
           EXEC sp_executesql @q;
         END TRY
         BEGIN CATCH
           REVERT;
           THROW;
         END CATCH
         REVERT;`,
        [statement],
        { timeoutMs: QUERY_TIMEOUT_MS }
      );
    } catch (err: any) {
      throw new QueryRejected(cleanSqlError(err?.message ?? String(err)));
    } finally {
      await connection.promises.close().catch(() => undefined);
    }
    const executionTimeMs = round2(performance.now() - t0);

    const headers: string[] = (result.firstMeta ?? []).map((meta: { name: string }) => meta.name);
    const all: Record<string, unknown>[] = result.first ?? [];
    const rows = all.slice(0, MAX_ROWS).map((row) => headers.map((h) => formatCell(row[h])));
    return { headers, rows, rowCount: all.length, truncated: all.length > MAX_ROWS, executionTimeMs };
  }

  close(): Promise<void> {
    return this.db.close();
  }
}

/** Accepts exactly one SELECT (or WITH … SELECT) statement. The database user is the real guard; this gives clear errors. */
export function validateSelect(text: string): string {
  const withoutComments = String(text ?? '')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--[^\n]*/g, ' ')
    .trim()
    .replace(/;\s*$/, '')
    .trim();

  if (!withoutComments) throw new QueryRejected('Write a SELECT query first.');
  if (withoutComments.length > 10_000) throw new QueryRejected('Query is too long.');
  if (withoutComments.includes(';')) throw new QueryRejected('Run one statement at a time (remove the extra ";").');
  if (!/^(select|with)\b/i.test(withoutComments)) {
    throw new QueryRejected('The playground is read-only: start the query with SELECT or WITH.');
  }
  if (/\b(insert|update|delete|merge|drop|alter|create|truncate|exec|execute|grant|revoke|deny|backup|restore|shutdown|kill|dbcc|waitfor|openrowset|opendatasource|openquery|revert|use)\b/i.test(withoutComments)
      || /\binto\b/i.test(withoutComments)) {
    throw new QueryRejected('The playground is read-only: only SELECT queries are allowed.');
  }
  return withoutComments;
}

function cleanSqlError(message: string): string {
  return message.replace(/\[Microsoft\]\[ODBC Driver \d+ for SQL Server\]\[SQL Server\]/g, '').trim();
}

function formatCell(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'number') return round2(value);
  return value;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function toIso(value: unknown): string {
  return value instanceof Date ? value.toISOString() : new Date(String(value)).toISOString();
}
