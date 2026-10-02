import React, { useCallback, useEffect, useState } from "react";
import {
  TrendingUp,
  Server,
  Layers,
  Database,
  Terminal,
  FileCode,
  AlertCircle,
  Award,
  BookOpen,
  ArrowRight
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

import SchemaVisualizer from "./components/SchemaVisualizer";
import EtlSimulator from "./components/EtlSimulator";
import SqlPlayground from "./components/SqlPlayground";
import CodeExporter from "./components/CodeExporter";
import WebChat from "./components/WebChat";
import SourceOrders from "./components/SourceOrders";
import { api, Dashboard, money } from "./api";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "etl" | "schema" | "queries" | "code">("dashboard");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Every number on the dashboard comes from SQL Server: the star schema after an ETL run,
  // otherwise the source (OLTP) tables.
  const refresh = useCallback(async () => {
    try {
      setDashboard(await api.dashboard());
      setLoadError(null);
    } catch (err: any) {
      setLoadError(err.message);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isEtlDone = dashboard?.source === "warehouse";
  const pendingOrders = dashboard?.ordersNotInWarehouse ?? 0;
  const metrics = dashboard?.metrics ?? { revenue: 0, cost: 0, profit: 0, orders: 0, items: 0, margin: 0, aov: 0 };
  const trendData = dashboard?.trend ?? [];
  const tierData = dashboard?.tiers ?? [];
  const categoryPerformance = dashboard?.categories ?? [];

  const handleEtlComplete = () => {
    refresh();
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-canvas/85 backdrop-blur-md border-b border-line/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-lg font-bold tracking-tight text-ink truncate">
                Aether Sales Warehouse
              </h1>
              <p className="text-xs text-muted truncate">
                Star schema and ETL pipeline on SQL Server
              </p>
            </div>
          </div>
          <span
            role="status"
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-surface border border-line px-3.5 py-1.5 text-xs font-medium text-ink"
          >
            <span
              aria-hidden="true"
              className={`w-2 h-2 rounded-full ${loadError ? "bg-red-500" : dashboard ? "bg-emerald-500" : "bg-amber-400"}`}
            />
            {loadError ? "SQL Server offline" : dashboard ? "SalesDW connected" : "Connecting…"}
          </span>
        </div>
      </header>

      {/* Primary Workspace Sections */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive & Dashboard Workspace (TABS) */}
        <div className="lg:col-span-8 space-y-6 flex flex-col">
          
          {loadError && (
            <div className="bg-surface border border-red-200 p-5 rounded-xl text-[11px] text-red-700 font-mono">
              Cannot load data from SQL Server: {loadError}
            </div>
          )}

          {/* Quick Notice Banner if ETL not run yet */}
          {dashboard && !isEtlDone && (
            <div className="bg-surface border border-amber-200 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-display font-semibold text-amber-800 uppercase tracking-wider">Warehouse Database Not Loaded (OLAP Data Empty)</h4>
                  <p className="text-[11px] text-muted mt-1 leading-relaxed">
                    The dashboard is reading the source tables (OLTP) directly. Open the "ETL Pipeline" tab and run the ETL to build the Star Schema in SQL Server.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("etl")}
                className="bg-accent hover:bg-accent-strong text-white text-[11px] font-bold px-4 py-2 rounded-xl shrink-0 flex items-center gap-1.5 transition-all duration-150 cursor-pointer font-mono uppercase"
              >
                Execute ETL Now
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isEtlDone && pendingOrders > 0 && (
            <div className="bg-surface border border-amber-200 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-[11px] text-ink leading-relaxed">
                <span className="text-amber-800 font-bold">{pendingOrders} new source order{pendingOrders > 1 ? "s" : ""}</span> not in the warehouse yet. Run the ETL again to load them.
              </p>
              <button
                onClick={() => setActiveTab("etl")}
                className="bg-accent hover:bg-accent-strong text-white text-[11px] font-bold px-4 py-2 rounded-xl shrink-0 flex items-center gap-1.5 cursor-pointer font-mono uppercase"
              >
                Run ETL
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isEtlDone && pendingOrders === 0 && (
            <div className="bg-surface border border-emerald-200 p-5 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <Award className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="text-xs font-display font-semibold text-accent uppercase tracking-wider">Warehouse & ETL Scripts Ready!</h4>
                <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                  The dashboard is reading the Star Schema in SQL Server{dashboard?.lastEtl ? ` (last ETL: ${new Date(dashboard.lastEtl.finishedAt).toLocaleString()}, ${dashboard.lastEtl.rowsLoaded} fact rows in ${dashboard.lastEtl.durationMs} ms)` : ""}. Run live queries in the SQL Playground.
                </p>
              </div>
            </div>
          )}

          {/* Tab Navigation buttons */}
          <div className="flex flex-wrap gap-1.5 border-b border-line pb-2">
            {[
              { id: "dashboard", label: "📊 Overview Dashboard", icon: TrendingUp },
              { id: "etl", label: "🔄 ETL Pipeline", icon: Server },
              { id: "schema", label: "🛠️ Star Schema", icon: Layers },
              { id: "queries", label: "💻 SQL Playground", icon: Terminal },
              { id: "code", label: "💾 PHP & MySQL Reference", icon: FileCode }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-medium transition-all duration-150 border cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-surface border-l-2 border-accent text-accent border-t-line border-r-line border-b-line"
                    : "bg-subtle hover:bg-surface border-line text-muted hover:text-ink"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENTS RENDER */}
          <div className="flex-1">
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                
                {/* 1. Key Performance Indicators Blocks */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Total Revenue",
                      value: money(metrics.revenue),
                      desc: isEtlDone ? "fact_sales (star schema)" : "oltp tables (source)",
                      color: "text-accent"
                    },
                    {
                      label: "Net Profit",
                      value: money(metrics.profit),
                      desc: `Cost ${money(metrics.cost)}`,
                      color: "text-accent"
                    },
                    {
                      label: "Sales Transactions",
                      value: `${metrics.orders} Orders`,
                      desc: `${metrics.items} items • AOV ${money(metrics.aov)}`,
                      color: "text-ink"
                    },
                    {
                      label: "Profit Margin",
                      value: `${metrics.margin.toFixed(2)}%`,
                      desc: "profit / revenue",
                      color: "text-muted"
                    }
                  ].map((kpi, idx) => (
                    <div key={idx} className="bg-surface p-5 rounded-xl border border-line space-y-2 relative overflow-hidden group">
                      <div className="text-[10px] uppercase tracking-widest text-muted">{kpi.label}</div>
                      <div className={`text-xl sm:text-2xl font-display font-semibold ${idx === 0 || idx === 1 ? 'text-accent' : 'text-ink'}`}>
                        {kpi.value}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9.5px] text-faint font-mono">
                        <span className={`${isEtlDone ? "text-emerald-700" : "text-amber-700"} font-bold`}>
                          {kpi.desc}
                        </span>
                      </div>
                      <div className="absolute right-0 bottom-0 top-0 w-[2px] bg-line group-hover:bg-accent/40 transition-colors"></div>
                    </div>
                  ))}
                </div>

                {/* 2. Analytical Graphs sections */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Revenue vs Profit Time Series Monthly Trends */}
                  <div className="md:col-span-12 lg:col-span-7 bg-surface p-6 rounded-xl border border-line flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs uppercase font-display font-semibold tracking-wider text-accent flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        Monthly Sales and Profit Trends
                      </h4>
                      <p className="text-[10.5px] text-muted mt-1 leading-relaxed">
                        {isEtlDone ? "From fact_sales joined to dim_time in the Star Schema" : "From the source order tables (run the ETL to use the Star Schema)"}
                      </p>
                    </div>

                    <div className="h-[210px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#A3A3A3" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#A3A3A3" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                          <XAxis dataKey="month" stroke="#737373" fontSize={10} tickLine={false} />
                          <YAxis stroke="#737373" fontSize={10} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: "#0A0A0A", borderColor: "#262626", color: "#E0E0E0" }} />
                          <Legend wrapperStyle={{ fontSize: 10, marginTop: 5 }} />
                          <Area type="monotone" dataKey="Revenue" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenue Summary" />
                          <Area type="monotone" dataKey="Profit" stroke="#A3A3A3" strokeWidth={1.5} fillOpacity={1} fill="url(#colorProf)" name="Net Profit Stats" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Loyalty Grouping - Customers Tiers Value Metrics */}
                  <div className="md:col-span-12 lg:col-span-5 bg-surface p-6 rounded-xl border border-line flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs uppercase font-display font-semibold tracking-wider text-accent flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-accent" />
                        Customer Loyalty Tiers (AOV Profile)
                      </h4>
                      <p className="text-[10.5px] text-muted mt-1">
                        {isEtlDone ? "Lifetime spend per tier from dim_customers (tiers computed by the ETL)" : "Tiers are computed by the ETL - run it to fill this chart"}
                      </p>
                    </div>

                    <div className="h-[210px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={tierData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                          <XAxis dataKey="name" stroke="#737373" fontSize={10} tickLine={false} />
                          <YAxis stroke="#737373" fontSize={10} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: "#0A0A0A", borderColor: "#262626", color: "#E0E0E0" }} />
                          <Bar dataKey="Spending" fill="#D4AF37" fillOpacity={0.8} radius={[0, 0, 0, 0]} name="Total Spend" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* 3. Category performance list */}
                <div className="bg-surface p-6 rounded-xl border border-line space-y-4">
                  <div>
                    <h4 className="text-xs uppercase font-display font-semibold tracking-wider text-accent flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-accent" />
                      Product Category Performance
                    </h4>
                    <p className="text-[10.5px] text-muted mt-0.5">
                      Deep dive into revenues and profit margins using dimensional slices from the Product Dimension table
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categoryPerformance.map((cat, idx) => {
                      const percent = cat.sales > 0 ? ((cat.Profit / cat.sales) * 100).toFixed(1) : "0";
                      return (
                        <div key={idx} className="bg-subtle p-4 rounded-xl border border-line space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold text-ink">
                            <span>{cat.name}</span>
                            <span className="text-[10px] text-accent px-1.5 py-0.2 bg-surface border border-line rounded-xl font-mono">
                              {percent}% margin
                            </span>
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px] text-muted font-mono">
                              <span>Revenues:</span>
                              <span className="font-bold text-ink">{money(cat.sales)}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-muted font-mono">
                              <span>Net Profit:</span>
                              <span className="font-bold text-accent">{money(cat.Profit)}</span>
                            </div>
                          </div>

                          <div className="space-y-1 mt-2">
                            <div className="w-full bg-line h-1.5">
                              <div 
                                className="bg-accent h-full transition-all duration-500" 
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Lesson Introduction Block */}
                <div className="bg-surface p-6 rounded-xl border border-line space-y-3.5">
                  <h4 className="text-xs uppercase font-display font-semibold tracking-wider text-accent flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-accent" />
                    Data Warehouse Architecture & Design Principles
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs leading-relaxed text-muted">
                    <div className="bg-subtle p-4 rounded-xl border border-line space-y-1.5">
                      <span className="text-accent font-display font-semibold font-bold">1. Why Star Schema?</span>
                      <p className="text-[11px] text-muted">
                        By normalizing data into simpler dimensions surrounding a central fact table, analytics queries require far fewer multi-table JOINs, slashing database processing loads by up to 80%.
                      </p>
                    </div>

                    <div className="bg-subtle p-4 rounded-xl border border-line space-y-1.5">
                      <span className="text-accent font-display font-semibold font-bold">2. PHP ETL Pipeline</span>
                      <p className="text-[11px] text-muted">
                        The custom script extracts raw transactions from the staging database, maps customer loyalty rankings dynamically using aggregated RFM attributes, and loads cleanly into central fact tables.
                      </p>
                    </div>

                    <div className="bg-subtle p-4 rounded-xl border border-line space-y-1.5">
                      <span className="text-accent font-display font-semibold font-bold">3. Database Indexes</span>
                      <p className="text-[11px] text-muted">
                        B-Tree indexing is systematically configured on dimension relationships. This guarantees sub-millisecond query responses even as transactional ledger indexes scale to millions of orders.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "etl" && (
              <div className="space-y-6">
                <EtlSimulator onEtlComplete={handleEtlComplete} isEtlDone={isEtlDone} dashboard={dashboard} />
                <SourceOrders onChanged={refresh} />
              </div>
            )}

            {activeTab === "schema" && (
              <SchemaVisualizer />
            )}

            {activeTab === "queries" && (
              <SqlPlayground isEtlDone={isEtlDone} />
            )}

            {activeTab === "code" && (
              <CodeExporter />
            )}
          </div>
        </div>

        {/* Right Sidebar - AI Co-Pilot Consultant */}
        <div className="lg:col-span-4 flex flex-col">
          <WebChat />
        </div>
      </main>

      {/* Aesthetic Footer */}
      <footer className="mt-12 border-t border-line/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-faint">
          <span>© 2026 Aether Systems</span>
          <span>Node.js + Express API · SQL Server (SalesDW)</span>
        </div>
      </footer>
    </div>
  );
}
