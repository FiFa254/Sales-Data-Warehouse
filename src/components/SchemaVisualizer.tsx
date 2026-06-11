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
    <div id="schema-sec" className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#141414] p-6 rounded-none border border-[#262626]">
      {/* Schema Architecture Intro */}
      <div className="lg:col-span-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-5">
          <div>
            <h3 className="text-base sm:text-lg font-serif italic text-[#D4AF37] tracking-wider flex items-center gap-2">
              <Layers className="text-[#D4AF37] w-5 h-5 animate-pulse" />
              Data Warehouse Architecture (OLTP vs. OLAP Star Schema)
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Visualizing how staging transaction entries map to a clean, highly performing MySQL Star Schema.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#0F0F0F] px-3.5 py-1.5 rounded-none border border-[#262626] text-[10px] tracking-wider font-mono font-bold text-zinc-400">
            <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-ping"></span>
            <span>MODEL SCHEMATICS ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Model Visualizer Map */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-[#0F0F0F] p-5 rounded-none border border-[#262626] relative overflow-x-auto">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4 text-[10px] tracking-wider uppercase font-mono">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2.5 h-2.5 bg-[#141414] border border-[#262626] rounded-none"></span>
              OLTP (Raw Transaction Staging)
            </div>
            <div className="flex items-center gap-1.5 text-amber-500">
              <span className="w-2.5 h-2.5 bg-amber-500/15 border border-amber-500/40 rounded-none"></span>
              Dimension (Analytical Context Table)
            </div>
            <div className="flex items-center gap-1.5 text-[#D4AF37]">
              <span className="w-2.5 h-2.5 bg-[#D4AF37]/15 border border-[#D4AF37] rounded-none animate-pulse"></span>
              Fact Table (Core Numeric Metrics)
            </div>
          </div>

          <div className="min-w-[650px] space-y-8 py-3">
            {/* Row 1: Source OLTP System */}
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-mono font-bold mb-3 flex items-center gap-1">
                <Database className="w-3.5 h-3.5" />
                Step 1: Raw Transactional Core (OLTP Data Catalog)
              </div>
              <div className="grid grid-cols-4 gap-3">
                {["oltp_customers", "oltp_products", "oltp_orders", "oltp_order_items"].map((t) => (
                  <button
                     id={`btn-table-${t}`}
                    key={t}
                    onClick={() => setSelectedTable(t)}
                    className={`p-3 rounded-none border text-left transition-all duration-150 cursor-pointer ${
                      selectedTable === t
                        ? "bg-[#141414] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.06)]"
                        : "bg-[#0A0A0A] border-[#262626] hover:border-zinc-700 hover:bg-[#141414]"
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-zinc-500 font-mono font-bold mb-1">
                      <Table className="w-3.5 h-3.5 text-[#D4AF37]" />
                      OLTP Source
                    </div>
                    <div className="text-xs font-bold text-zinc-200 font-mono">{t}</div>
                    <div className="text-[10px] text-zinc-500 mt-1 line-clamp-1">
                      {tablesInfo[t].desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Transition ETL pipeline arrow */}
            <div className="flex items-center justify-between px-5 py-3 bg-[#141414] rounded-none border border-[#262626]">
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium font-mono">
                <Disc className="w-4 h-4 text-[#D4AF37] animate-spin" />
                PHP Automation Pipeline: (Extract → Transform → Load)
              </div>
              <div className="flex items-center gap-1 text-[#D4AF37]">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>

            {/* Row 2: DW Schema (Star Schema) */}
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-mono font-bold mb-4 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                Step 2: Multi-Dimensional Schema (Analytics-Optimized Star Schema)
              </div>

              {/* Star Schema Interactive Center Layout */}
              <div className="relative p-6 bg-[#141414]/40 rounded-none border border-[#262626]">
                {/* 3 Dimensions on sides */}
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Customer Dimension on left */}
                  <div className="col-span-4 space-y-4">
                    <button
                      id="btn-dim-customers"
                      onClick={() => setSelectedTable("dim_customers")}
                      className={`w-full p-3 rounded-none border text-left transition-all duration-150 cursor-pointer ${
                        selectedTable === "dim_customers"
                          ? "bg-[#141414] border-l-2 border-[#D4AF37] text-zinc-100 shadow-[0_0_15px_rgba(212,175,55,0.055)]"
                          : "bg-[#0A0A0A] border-[#262626] hover:border-zinc-700 hover:bg-[#141414]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-zinc-500 font-mono font-bold mb-1">
                        <span className="flex items-center gap-1">
                          <Table className="w-3.5 h-3.5 text-[#D4AF37]" />
                          Dimension
                        </span>
                        <span className="bg-[#0A0A0A] text-[#D4AF37] border border-[#262626] text-[8.5px] px-1 rounded-none font-sans font-bold">CUSTOMERS</span>
                      </div>
                      <div className="text-xs font-bold text-zinc-200 font-mono">dim_customers</div>
                      <div className="text-[9.5px] text-zinc-500 line-clamp-1 mt-1">Slices sales via user RFM Loyalty Tiers</div>
                    </button>

                    <button
                      id="btn-dim-products"
                      onClick={() => setSelectedTable("dim_products")}
                      className={`w-full p-3 rounded-none border text-left transition-all duration-150 cursor-pointer ${
                        selectedTable === "dim_products"
                          ? "bg-[#141414] border-l-2 border-[#D4AF37] text-zinc-100 shadow-[0_0_15px_rgba(212,175,55,0.055)]"
                          : "bg-[#0A0A0A] border-[#262626] hover:border-zinc-700 hover:bg-[#141414]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-zinc-500 font-mono font-bold mb-1">
                        <span className="flex items-center gap-1">
                          <Table className="w-3.5 h-3.5 text-[#D4AF37]" />
                          Dimension
                        </span>
                        <span className="bg-[#0A0A0A] text-[#D4AF37] border border-[#262626] text-[8.5px] px-1 rounded-none font-sans font-bold">PRODUCTS</span>
                      </div>
                      <div className="text-xs font-bold text-zinc-200 font-mono">dim_products</div>
                      <div className="text-[9.5px] text-zinc-500 line-clamp-1 mt-1">Enables inventory & profit margin analysis</div>
                    </button>
                  </div>

                  {/* Fact Table in the Center */}
                  <div className="col-span-4 flex flex-col items-center">
                    {/* Visual Connector lines helper */}
                    <div className="flex items-center gap-2 mb-2 w-full justify-between px-3 text-[9px] text-[#D4AF37]/60 font-mono uppercase tracking-wider">
                      <span>FK Key</span>
                      <span className="flex-1 border-b border-dashed border-[#262626] mx-1"></span>
                      <span>Star Schema</span>
                      <span className="flex-1 border-b border-dashed border-[#262626] mx-1"></span>
                      <span>FK Key</span>
                    </div>

                    <button
                      id="btn-fact-sales"
                      onClick={() => setSelectedTable("fact_sales")}
                      className={`w-full p-4 rounded-none border text-left transition-all duration-150 cursor-pointer ${
                        selectedTable === "fact_sales"
                          ? "bg-[#0F0F0F] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.08)] scale-102"
                          : "bg-[#0A0A0A] border-[#262626] hover:border-[#D4AF37]/50 hover:bg-[#141414]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9.5px] uppercase tracking-wider text-amber-500 font-mono font-bold mb-2">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                          Fact Table
                        </span>
                        <span className="bg-[#141414] text-[#D4AF37] border border-[#262626] text-[8.5px] px-1.5 py-0.2 rounded-none">MEASURES</span>
                      </div>
                      <div className="text-xs font-bold text-zinc-50 font-mono tracking-wider text-center border-b border-[#262626] pb-2 mb-2">
                        fact_sales
                      </div>
                      <div className="text-[9.5px] space-y-1 text-zinc-400 font-mono">
                        <div className="flex justify-between"><span>• Revenue</span><span className="text-[#D4AF37]">$ sales</span></div>
                        <div className="flex justify-between"><span>• Profit</span><span className="text-zinc-200">$ net margin</span></div>
                        <div className="flex justify-between"><span>• Columns</span><span className="text-[#D4AF37]">11 fields</span></div>
                      </div>
                    </button>
                  </div>

                  {/* Date Dimension on Right */}
                  <div className="col-span-4">
                    <button
                      id="btn-dim-time"
                      onClick={() => setSelectedTable("dim_time")}
                      className={`w-full p-4 rounded-none border text-left transition-all duration-150 cursor-pointer ${
                        selectedTable === "dim_time"
                          ? "bg-[#141414] border-[#D4AF37] text-zinc-100 shadow-[0_0_15px_rgba(212,175,55,0.055)]"
                          : "bg-[#0A0A0A] border-[#262626] hover:border-zinc-700 hover:bg-[#141414]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-zinc-500 font-mono font-bold mb-1">
                        <span className="flex items-center gap-1">
                          <Table className="w-3.5 h-3.5 text-[#D4AF37]" />
                          Dimension
                        </span>
                        <span className="bg-[#0A0A0A] text-[#D4AF37] border border-[#262626] text-[8.5px] px-1 rounded-none font-sans font-bold">TIME</span>
                      </div>
                      <div className="text-xs font-bold text-zinc-200 font-mono">dim_time</div>
                      <div className="text-[9.5px] text-zinc-500 line-clamp-2 mt-1">Calendar dimension avoiding expensive runtime string-to-date queries.</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Detail Selected Table Panel */}
      <div className="lg:col-span-4 flex flex-col justify-between">
        <div className="bg-[#0F0F0F] p-5 rounded-none border border-[#262626] flex-1 flex flex-col">
          <div className="border-b border-[#262626] pb-3 mb-4">
            <h4 className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 font-mono font-bold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
              Schema Attribute Index
            </h4>
            <div className="flex items-baseline mt-2 gap-2">
              <span className="text-base font-serif italic text-[#D4AF37] tracking-wide">{tablesInfo[selectedTable].name}</span>
              <span className={`text-[9px] px-2 py-0.5 rounded-none font-bold uppercase border ${
                tablesInfo[selectedTable].type === "fact"
                  ? "bg-[#0A0A0A] text-amber-400 border-amber-900/40"
                  : tablesInfo[selectedTable].type === "dimension"
                  ? "bg-[#0A0A0A] text-[#D4AF37] border-zinc-800"
                  : "bg-[#0A0A0A] text-zinc-400 border-[#262626]"
              }`}>
                {tablesInfo[selectedTable].type}
              </span>
            </div>
            <p className="text-[11.5px] text-zinc-400 mt-2.5 leading-relaxed">
              {tablesInfo[selectedTable].desc}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[280px] space-y-2 pr-1 custom-scrollbar">
            {tablesInfo[selectedTable].columns.map((c, idx) => (
              <div key={idx} className="bg-[#141414] p-3 rounded-none border border-[#262626] flex flex-col justify-between text-xs gap-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-zinc-200 flex items-center gap-1">
                    {c.key === "PK" && <span className="bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-[8.5px] px-1 rounded-none font-bold">PK</span>}
                    {c.key === "FK" && <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 text-[8.5px] px-1 rounded-none font-bold">FK</span>}
                    {c.name}
                  </span>
                  <span className="text-zinc-500 text-[10px]">{c.type}</span>
                </div>
                <div className="text-zinc-500 text-[10.5px] leading-relaxed mt-0.5">
                  {c.desc}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#262626] text-[10px] text-zinc-500 font-mono uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
            <Link className="w-3 h-3 text-[#D4AF37]" />
            SELECT TABLE TO VIEW SCHEMA
          </div>
        </div>
      </div>
    </div>
  );
}
