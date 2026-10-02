import React, { useState } from "react";
import { Table, ArrowRight, Database, Disc, Layers, Link } from "lucide-react";

export default function SchemaVisualizer() {
  const [selectedTable, setSelectedTable] = useState<string>("fact_sales");

  const tablesInfo: Record<string, {
    name: string;
    type: "fact" | "dimension" | "oltp";
    desc: string;
    columns: { name: string; type: string; key?: string; desc: string }[];
  }> = {
    oltp_customers: {
      name: "oltp_customers",
      type: "oltp",
      desc: "Transactional staging table hosting raw customer data, demographic details, and registration registration date flags.",
      columns: [
        { name: "customer_id", type: "INT (PK)", key: "PK", desc: "Staging database customer primary identifier." },
        { name: "name", type: "VARCHAR(150)", desc: "Full registered name profile of the registrant." },
        { name: "email", type: "VARCHAR(100)", desc: "Contact email index." },
        { name: "city", type: "VARCHAR(100)", desc: "Geographic delivery location of the customer." },
        { name: "age", type: "INT", desc: "Customer age attribute." },
        { name: "created_at", type: "DATE", desc: "Sign-up checkout timestamp index." }
      ]
    },
    oltp_products: {
      name: "oltp_products",
      type: "oltp",
      desc: "Staging store catalog tracking commercial selling prices and manufacturing base cost margins.",
      columns: [
        { name: "product_id", type: "INT (PK)", key: "PK", desc: "Staging database item primary identifier." },
        { name: "name", type: "VARCHAR(200)", desc: "Display item commercial title." },
        { name: "category", type: "VARCHAR(100)", desc: "Category department classification of the item." },
        { name: "unit_price", type: "DECIMAL(10,2)", desc: "Stagewise base selling price tag." },
        { name: "cost_price", type: "DECIMAL(10,2)", desc: "Manufacturer base supply cost." }
      ]
    },
    oltp_orders: {
      name: "oltp_orders",
      type: "oltp",
      desc: "Staging transactional ledger headers capturing date indices, raw order ID, and execution state.",
      columns: [
        { name: "order_id", type: "INT (PK)", key: "PK", desc: "Unique transactional order transaction identifier." },
        { name: "customer_id", type: "INT (FK)", key: "FK", desc: "Foreign key reference targeting raw oltp_customers database." },
        { name: "order_date", type: "DATE", desc: "Datetime event log for checkout transactions." },
        { name: "status", type: "VARCHAR(50)", desc: "State of order processing, e.g., Completed, Canceled." }
      ]
    },
    oltp_order_items: {
      name: "oltp_order_items",
      type: "oltp",
      desc: "Detailed line item streams tracking product counts, checkout rates, and invoice IDs.",
      columns: [
        { name: "item_id", type: "INT (PK)", key: "PK", desc: "Autoincrement line item record index." },
        { name: "order_id", type: "INT (FK)", key: "FK", desc: "Foreign key reference pointing to relevant order header." },
        { name: "product_id", type: "INT (FK)", key: "FK", desc: "Foreign key linking back to product catalog." },
        { name: "quantity", type: "INT", desc: "Quantity volume count purchased in the transaction." },
        { name: "price", type: "DECIMAL(10,2)", desc: "Price of the product unit at transaction instant." }
      ]
    },
    dim_customers: {
      name: "dim_customers",
      type: "dimension",
      desc: "Customer Dimension Table: Custom surrogate keys replacing natural keys. Models RFM marketing loyalty clusters computed from total customer lifetime transactions.",
      columns: [
        { name: "customer_key", type: "INT (PK)", key: "PK", desc: "Surrogate Key: Unique analytical identifier used in the Data Warehouse." },
        { name: "customer_id", type: "INT", desc: "Natural Key: Mapped identifier pointing to original transactional database customer." },
        { name: "name", type: "VARCHAR(150)", desc: "Full billing profile name of the customer." },
        { name: "city", type: "VARCHAR(100)", desc: "Geographic target delivery terminal location." },
        { name: "tier", type: "VARCHAR(50)", desc: "Sales tier (Standard, Silver, Gold, Platinum) dynamically scored by the PHP ETL pipeline." },
        { name: "registration_year", type: "INT", desc: "Staged account creation year, utilized for cohort and period analysis." }
      ]
    },
    dim_products: {
      name: "dim_products",
      type: "dimension",
      desc: "Product Dimension Table: Enables efficient analytical slicing, indexing product name classifications, prices, and unit supply costs.",
      columns: [
        { name: "product_key", type: "INT (PK)", key: "PK", desc: "Surrogate Key: Unique primary product warehouse key." },
        { name: "product_id", type: "INT", desc: "Natural Key: Staging item ID mapping to original transaction database." },
        { name: "name", type: "VARCHAR(200)", desc: "Optimized product title for analytics reporting." },
        { name: "category", type: "VARCHAR(100)", desc: "Product category name for high-level dimensional grouping and aggregations." },
        { name: "unit_price", type: "DECIMAL(10,2)", desc: "Standard catalog retail listing price point." },
        { name: "cost_price", type: "DECIMAL(10,2)", desc: "Standard supply unit cost baseline for determining gross profit margins." }
      ]
    },
    dim_time: {
      name: "dim_time",
      type: "dimension",
      desc: "Calendar Time Dimension: Eliminates slow runtime datetime parsing. Pre-populates calendar metrics like Weekdays, Months, Financial Quarters, and Years.",
      columns: [
        { name: "time_key", type: "INT (PK)", key: "PK", desc: "Surrogate Key: Numeric date format key acting as primary index (e.g. 20260611)." },
        { name: "full_date", type: "DATE", desc: "Datetime field representing full calendar reference (YYYY-MM-DD)." },
        { name: "day_of_week", type: "VARCHAR(20)", desc: "Full name label of chronological weekday, e.g. Monday, Friday." },
        { name: "day_of_month", type: "INT", desc: "Day sequence number of month (1 to 31)." },
        { name: "month_name", type: "VARCHAR(20)", desc: "Full identifier label of calendar month, e.g. June, July." },
        { name: "quarter", type: "INT", desc: "Financial billing quarter index (1, 2, 3, 4)." },
        { name: "year", type: "INT", desc: "Calendar monitoring financial year." }
      ]
    },
    fact_sales: {
      name: "fact_sales",
      type: "fact",
      desc: "Central Fact Sales Table: Houses aggregated, precomputed core performance metrics (Revenue, Cost, Profit, Discounts) linked to dimensions via surrogate keys.",
      columns: [
        { name: "sale_id", type: "INT (PK)", key: "PK", desc: "Analytical unique identifier sequence key." },
        { name: "customer_key", type: "INT (FK)", key: "FK", desc: "Surrogate Foreign Key mapping to the dim_customers dimension." },
        { name: "product_key", type: "INT (FK)", key: "FK", desc: "Surrogate Foreign Key mapping to the dim_products dimension." },
        { name: "time_key", type: "INT (FK)", key: "FK", desc: "Surrogate Foreign Key mapping to the dim_time calendar dimension." },
        { name: "quantity", type: "INT", desc: "Transaction purchase checkout item volume." },
        { name: "unit_price", type: "DECIMAL(10,2)", desc: "Assumed sale list price of the item at billing time." },
        { name: "cost_price", type: "DECIMAL(10,2)", desc: "Base unit supply cost registered at billing time." },
        { name: "revenue", type: "DECIMAL(10,2)", desc: "Computed gross revenue metrics: (Quantity * Unit Price)." },
        { name: "cost", type: "DECIMAL(10,2)", desc: "Computed gross supply expenditure: (Quantity * Cost Price)." },
        { name: "profit", type: "DECIMAL(10,2)", desc: "Computed net revenue contribution (Revenue - Cost)." },
        { name: "discount", type: "DECIMAL(10,2)", desc: "Promotional deduction value mapped to checkout records." }
      ]
    }
  };

  return (
    <section id="schema-sec" className="rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)] p-5 sm:p-6 grid grid-cols-1 gap-6">
      {/* Schema Architecture Intro */}
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
          <Layers className="w-4 h-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold text-ink">Warehouse architecture: OLTP to star schema</h2>
          <p className="text-sm text-muted mt-0.5">
            How the source transaction tables map to the star schema the ETL builds in SQL Server. Select a table to see its columns.
          </p>
        </div>
      </div>

      {/* Model Visualizer Map */}
      <div className="space-y-6 min-w-0">
        <div className="rounded-2xl bg-subtle p-5 relative overflow-x-auto custom-scrollbar">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1.5 text-muted">
              <span className="w-2.5 h-2.5 bg-surface border border-line rounded-xl"></span>
              OLTP (Raw Transaction Staging)
            </div>
            <div className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2.5 h-2.5 bg-amber-100 border border-amber-300 rounded-xl"></span>
              Dimension (Analytical Context Table)
            </div>
            <div className="flex items-center gap-1.5 text-accent">
              <span className="w-2.5 h-2.5 bg-accent/15 border border-accent rounded-xl"></span>
              Fact Table (Core Numeric Metrics)
            </div>
          </div>

          <div className="min-w-[650px] space-y-8 py-3">
            {/* Row 1: Source OLTP System */}
            <div>
              <div className="text-xs font-semibold text-muted mb-3 flex items-center gap-1">
                <Database className="w-3.5 h-3.5" />
                Step 1: Raw Transactional Core (OLTP Data Catalog)
              </div>
              <div className="grid grid-cols-4 gap-3">
                {["oltp_customers", "oltp_products", "oltp_orders", "oltp_order_items"].map((t) => (
                  <button
                     id={`btn-table-${t}`}
                    key={t}
                    onClick={() => setSelectedTable(t)}
                    className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                      selectedTable === t
                        ? "bg-surface border-accent"
                        : "bg-subtle border-line hover:border-line-strong hover:bg-surface"
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-muted mb-1">
                      <Table className="w-3.5 h-3.5 text-accent" />
                      OLTP Source
                    </div>
                    <div className="text-xs font-bold text-ink font-mono">{t}</div>
                    <div className="text-[10px] text-muted mt-1 line-clamp-1">
                      {tablesInfo[t].desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Transition ETL pipeline arrow */}
            <div className="flex items-center justify-between px-5 py-3 bg-surface rounded-xl border border-line">
              <div className="flex items-center gap-2 text-xs text-ink font-medium font-mono">
                <Disc className="w-4 h-4 text-accent" />
                PHP Automation Pipeline: (Extract → Transform → Load)
              </div>
              <div className="flex items-center gap-1 text-accent">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>

            {/* Row 2: DW Schema (Star Schema) */}
            <div>
              <div className="text-xs font-semibold text-muted mb-4 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-accent" />
                Step 2: Multi-Dimensional Schema (Analytics-Optimized Star Schema)
              </div>

              {/* Star Schema Interactive Center Layout */}
              <div className="relative p-6 bg-surface/40 rounded-xl border border-line">
                {/* 3 Dimensions on sides */}
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Customer Dimension on left */}
                  <div className="col-span-4 space-y-4">
                    <button
                      id="btn-dim-customers"
                      onClick={() => setSelectedTable("dim_customers")}
                      className={`w-full p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                        selectedTable === "dim_customers"
                          ? "bg-surface border-accent text-ink"
                          : "bg-subtle border-line hover:border-line-strong hover:bg-surface"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold text-muted mb-1">
                        <span className="flex items-center gap-1">
                          <Table className="w-3.5 h-3.5 text-accent" />
                          Dimension
                        </span>
                      </div>
                      <div className="text-xs font-bold text-ink font-mono">dim_customers</div>
                      <div className="text-[9.5px] text-muted line-clamp-1 mt-1">Slices sales via user RFM Loyalty Tiers</div>
                    </button>

                    <button
                      id="btn-dim-products"
                      onClick={() => setSelectedTable("dim_products")}
                      className={`w-full p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                        selectedTable === "dim_products"
                          ? "bg-surface border-accent text-ink"
                          : "bg-subtle border-line hover:border-line-strong hover:bg-surface"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold text-muted mb-1">
                        <span className="flex items-center gap-1">
                          <Table className="w-3.5 h-3.5 text-accent" />
                          Dimension
                        </span>
                      </div>
                      <div className="text-xs font-bold text-ink font-mono">dim_products</div>
                      <div className="text-[9.5px] text-muted line-clamp-1 mt-1">Enables inventory & profit margin analysis</div>
                    </button>
                  </div>

                  {/* Fact Table in the Center */}
                  <div className="col-span-4 flex flex-col items-center">
                    {/* Visual Connector lines helper */}
                    <div className="mb-2 w-full px-3" aria-hidden="true">
                      <span className="block border-b border-dashed border-line"></span>
                    </div>

                    <button
                      id="btn-fact-sales"
                      onClick={() => setSelectedTable("fact_sales")}
                      className={`w-full p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                        selectedTable === "fact_sales"
                          ? "bg-subtle border-accent scale-102"
                          : "bg-subtle border-line hover:border-accent/50 hover:bg-surface"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold text-amber-700 mb-2">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-accent" />
                          Fact Table
                        </span>
                      </div>
                      <div className="text-xs font-bold text-ink font-mono tracking-wider text-center border-b border-line pb-2 mb-2">
                        fact_sales
                      </div>
                      <div className="text-[9.5px] space-y-1 text-muted font-mono">
                        <div className="flex justify-between"><span>• Revenue</span><span className="text-accent">$ sales</span></div>
                        <div className="flex justify-between"><span>• Profit</span><span className="text-ink">$ net margin</span></div>
                        <div className="flex justify-between"><span>• Columns</span><span className="text-accent">11 fields</span></div>
                      </div>
                    </button>
                  </div>

                  {/* Date Dimension on Right */}
                  <div className="col-span-4">
                    <button
                      id="btn-dim-time"
                      onClick={() => setSelectedTable("dim_time")}
                      className={`w-full p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                        selectedTable === "dim_time"
                          ? "bg-surface border-accent text-ink"
                          : "bg-subtle border-line hover:border-line-strong hover:bg-surface"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold text-muted mb-1">
                        <span className="flex items-center gap-1">
                          <Table className="w-3.5 h-3.5 text-accent" />
                          Dimension
                        </span>
                      </div>
                      <div className="text-xs font-bold text-ink font-mono">dim_time</div>
                      <div className="text-[9.5px] text-muted line-clamp-2 mt-1">Calendar dimension avoiding expensive runtime string-to-date queries.</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Detail Selected Table Panel */}
      <div className="flex flex-col">
        <div className="rounded-2xl bg-subtle p-5 flex-1 flex flex-col">
          <div className="border-b border-line pb-3 mb-4">
            <h4 className="text-xs font-semibold text-muted flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-accent" />
              Schema Attribute Index
            </h4>
            <div className="flex items-baseline mt-2 gap-2">
              <span className="text-base font-display font-semibold text-accent tracking-wide">{tablesInfo[selectedTable].name}</span>
              <span className={`text-[9px] px-2 py-0.5 rounded-xl font-bold uppercase border ${
                tablesInfo[selectedTable].type === "fact"
                  ? "bg-subtle text-amber-700 border-amber-200"
                  : tablesInfo[selectedTable].type === "dimension"
                  ? "bg-subtle text-accent border-line-strong"
                  : "bg-subtle text-muted border-line"
              }`}>
                {tablesInfo[selectedTable].type}
              </span>
            </div>
            <p className="text-[11.5px] text-muted mt-2.5 leading-relaxed">
              {tablesInfo[selectedTable].desc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tablesInfo[selectedTable].columns.map((c, idx) => (
              <div key={idx} className="bg-surface p-3 rounded-xl border border-line flex flex-col justify-between text-xs gap-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-ink flex items-center gap-1">
                    {c.key === "PK" && <span className="bg-accent/15 text-accent border border-accent/30 text-[10px] px-1.5 py-0.5 rounded-full font-bold">PK</span>}
                    {c.key === "FK" && <span className="bg-line text-muted border border-line-strong text-[10px] px-1.5 py-0.5 rounded-full font-bold">FK</span>}
                    {c.name}
                  </span>
                  <span className="text-muted text-[10px]">{c.type}</span>
                </div>
                <div className="text-muted text-[10.5px] leading-relaxed mt-0.5">
                  {c.desc}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 pt-3 border-t border-line text-xs text-muted flex items-center gap-1.5">
            <Link className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            Select a table in the diagram to see its columns.
          </p>
        </div>
      </div>
    </section>
  );
}
