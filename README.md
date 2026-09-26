# Aether Sales Warehouse — Sales Data Warehouse

Interactive sales data-warehouse app: a real ETL from source tables into a Star Schema in **SQL Server**,
a dashboard computed from the warehouse, a read-only SQL playground, and a Gemini AI guide.
React + TypeScript frontend, Express backend.

## Features

- **Dashboard** — revenue, profit, margin, AOV, monthly trend, customer tiers and category performance, all
  queried from SQL Server (source tables before the first ETL, the Star Schema after).
- **ETL pipeline** — Extract → Transform → Load in one transaction: customers and products are merged into
  `dim_customers` / `dim_products` (surrogate keys stay stable), dates into `dim_time` (`YYYYMMDD` keys), and
  order lines into `fact_sales` with revenue, cost and profit. Loyalty tiers come from lifetime spend. Each run
  is logged in `etl_runs`.
- **New source orders** — record a sale in `oltp.orders`, see the "not in warehouse yet" notice, re-run the ETL.
- **SQL playground** — edit and run one `SELECT` (T-SQL) against the warehouse; runs as a read-only database user.
- **PHP & MySQL reference** — downloadable reference scripts for the same design on PHP + MySQL.

## Run on Windows

**Prerequisites:** Node.js 22+, SQL Server (Developer / Express, running locally), ODBC Driver 17 or 18 for SQL Server.

Double-click **`start.bat`**. On first run it creates `.env` from `.env.example` (optional `GEMINI_API_KEY`),
installs packages, builds, and opens <http://localhost:3001>.

Manual: `npm install`, `npm run build`, `npm start` (or `npm run dev` for hot reload).

## Database

| Setting | Default |
|---|---|
| `MSSQL_CONNECTION_STRING` | `Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=SalesDW;Trusted_Connection=yes;` |

On start the server creates the `SalesDW` database, its tables, and the demo source data (Windows login, no password).

| Schema | Tables |
|---|---|
| `oltp` (source) | `customers`, `products`, `orders`, `order_items` |
| `dbo` (Star Schema) | `dim_customers`, `dim_products`, `dim_time`, `fact_sales`, `etl_runs` |

The SQL playground runs as `playground_reader` (a database user without a login, `db_datareader` only):
one `SELECT`/`WITH` statement, 5-second timeout, max 500 rows.

Code: `server/db.ts` (connection), `server/warehouse.ts` (schema, ETL, dashboard, playground), `server/seed.ts` (demo data).

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | SQL Server connection check |
| GET | `/api/dashboard` | Dashboard metrics, trend, tiers, categories |
| POST | `/api/etl/run` | Run the ETL; returns each step with row counts and timings |
| GET | `/api/source/options` | Customers and products for the order form |
| POST | `/api/source/orders` | Add a completed order to the source tables |
| POST | `/api/source/reset` | Restore the demo source data and empty the warehouse |
| POST | `/api/query` | Run a read-only query (`{ "sql": "SELECT ..." }`) |
| POST | `/api/chat` | AI guide (Gemini; offline answers without a key) |

## Tests

```bash
npm test
```

Runs against a throwaway `SalesDW_Test` database on the local SQL Server
(override with `MSSQL_TEST_CONNECTION_STRING`).
