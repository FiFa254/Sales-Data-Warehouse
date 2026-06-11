import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize GoogleGenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
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
      history.forEach((h: any) => {
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
  if (process.env.NODE_ENV !== "production") {
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
