import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { Warehouse, QueryRejected } from "./server/warehouse";
import { DEFAULT_CONNECTION_STRING } from "./server/db";

dotenv.config();

const app = express();
app.disable("x-powered-by");
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const MAX_CHAT_HISTORY = 20;

// --- DATABASE (SQL Server, see server/warehouse.ts) ---
// Default: local SQL Server, Windows login, database SalesDW (created with its tables on first start).
// Override with MSSQL_CONNECTION_STRING in .env.
const CONNECTION_STRING = process.env.MSSQL_CONNECTION_STRING || DEFAULT_CONNECTION_STRING;
let warehouse: Warehouse;

// Wraps async handlers so errors reach the error handler; QueryRejected becomes a 400 with its message.
const handle = (fn: (req: express.Request, res: express.Response) => Promise<unknown>) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => fn(req, res).catch(next);

app.get("/api/health", handle(async (req, res) => {
  await warehouse.db.query("SELECT 1 AS ok");
  res.json({ database: "SQL Server", status: "connected", assistant: ai ? "gemini" : "offline" });
}));

// Dashboard numbers: from the star schema after an ETL run, otherwise straight from the source tables.
app.get("/api/dashboard", handle(async (req, res) => {
  res.json(await warehouse.dashboard());
}));

// Runs the ETL (source tables -> star schema) and returns each step with row counts and timings.
app.post("/api/etl/run", handle(async (req, res) => {
  res.json(await warehouse.runEtl());
}));

// Source system: customers/products for the order form, and new orders.
app.get("/api/source/options", handle(async (req, res) => {
  res.json(await warehouse.sourceOptions());
}));

app.post("/api/source/orders", handle(async (req, res) => {
  res.json(await warehouse.addOrder(req.body ?? {}));
}));

app.post("/api/source/customers", handle(async (req, res) => {
  res.json(await warehouse.addCustomer(req.body ?? {}));
}));

app.post("/api/source/products", handle(async (req, res) => {
  res.json(await warehouse.addProduct(req.body ?? {}));
}));

// Replaces all data with the demo data set.
app.post("/api/source/reset", handle(async (req, res) => {
  await warehouse.reset();
  res.json({ success: true });
}));

// Deletes all source data and the warehouse.
app.post("/api/source/clear", handle(async (req, res) => {
  await warehouse.clear();
  res.json({ success: true });
}));

// SQL playground: one read-only SELECT, run as the playground_reader database user.
app.post("/api/query", handle(async (req, res) => {
  res.json(await warehouse.runQuery(req.body?.sql));
}));

// Initialize GoogleGenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Chat will operate in simulated assistant mode.");
}

// Simulated data warehouse response for offline fallback or offline guidance
const getOfflineResponse = (msg: string): string => {
  const query = msg.toLowerCase();
  if (query.includes("star") || query.includes("schema")) {
    return `### 📊 Star Schema Design for Sales Data Warehousing
In Data Warehousing, we prefer a **Star Schema** layout because it significantly speeds up aggregation queries for populating BI dashboards. It consists of two column categories:

1. **Fact Table**: Stores measurable, numeric transactions (Metrics) such as revenue, margins, and cost records.
   - \`fact_sales\`: Comprises surrogates like \`sale_id\`, \`customer_key\`, \`product_key\`, \`time_key\`, \`quantity\`, \`unit_price\`, \`cost_price\`, \`revenue\`, \`cost\`, \`profit\`.

2. **Dimension Tables**: Store descriptive attributes used for slicing, dicing, filtering, or grouping metrics.
   - \`dim_customers\`: Holds profiles and loyalties (\`customer_id\`, \`name\`, \`city\`, \`tier\`).
   - \`dim_products\`: Tracks catalog fields and cost indexes (\`product_id\`, \`name\`, \`category\`, \`unit_price\`, \`cost_price\`).
   - \`dim_time\`: Tracks day, month, quarter, and year coordinates to skip expensive datetime calculations on-the-fly (\`time_key\`, \`full_date\`, \`day_of_week\`, \`month_name\`, \`quarter\`, \`year\`).`;
  }
  if (query.includes("etl")) {
    return `### 🔄 Automated ETL Processes via PHP
The **ETL (Extract, Transform, Load)** workflow is the core pipeline shifting raw transactional records (OLTP) into the optimized analytics warehouse (OLAP):

1. **Extract**: Queries staging tables (\`oltp_customers\`, \`oltp_products\`, \`oltp_orders\`, \`oltp_order_items\`) for fresh transaction data.
2. **Transform**:
   - Compiles registration intervals and loyalty segments (\`customer_tier\`) depending on historical spending.
   - Converts standard order calendar dates to surrogate time keys.
   - Computes financial margin metrics.
3. **Load**: Performs bulk upserts into target dimensions and committing the central ledger records inside the \`fact_sales\` table.

*You can inspect and copy complete production-grade scripts in the **"PHP & MySQL Source"** panel tabs!*`;
  }
  return `Hello! I am your Data Engineering Co-Pilot ready to answer all your technical questions. 🚀

Today, I can recommend best practices on:
- **Sales Data Warehouse architecture** (incorporating PHP + MySQL foundations)
- Designing resilient **Star Schema** models and automated **ETL** loops
- Writing optimal SQL queries to track **Customer Trends** (e.g., RFM segments & retention)

*Ask whatever is on your mind below, or explore the analytics dashboard and download ready-to-use schemas!*`;
};

// Chat API route
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!ai) {
      return res.json({ text: getOfflineResponse(message) });
    }

    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.slice(-MAX_CHAT_HISTORY).forEach((h: any) => {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: "You are an expert Data Engineer specializing in Sales Data Warehousing, database design, and web development using PHP with MySQL. Guide other developers in structuring Star Schemas, analyzing sales KPIs, scoring customer loyalty metrics (such as SQL RFM analysis or Customer Cohort metrics), and writing production-grade PHP, SQL, and ETL scripts. Deliver replies in clear, concise, polite, and technical English, providing highly optimized and clean code snippets.",
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Graceful fallback to rich simulated response instead of crashing
    res.json({ text: getOfflineResponse(req.body.message) });
  }
});

// Start server
async function startServer() {
  try {
    warehouse = await Warehouse.open(CONNECTION_STRING);
    const demo = process.env.SEED_DEMO_DATA === "true" && (await warehouse.loadDemoData());
    console.log(demo ? "Database: loaded demo source data (SEED_DEMO_DATA=true)" : "Database: connected to SalesDW");
  } catch (err: any) {
    console.error("Cannot connect to SQL Server. Check that the SQL Server service is running and MSSQL_CONNECTION_STRING in .env.");
    console.error(err?.message ?? err);
    process.exit(1);
  }

  if (process.env.NODE_ENV !== "production" && !process.argv[1]?.endsWith("server.cjs")) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) return next(err);
    if (err instanceof QueryRejected) return res.status(400).json({ error: err.message });
    console.error(`${req.method} ${req.path} failed:`, err?.message ?? err);
    res.status(500).json({ error: "Database error. Check the server console." });
  });

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
