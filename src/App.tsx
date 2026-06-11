import React, { useState } from "react";
import {
  TrendingUp,
  Server,
  Layers,
  Database,
  Terminal,
  Activity,
  FileCode,
  AlertCircle,
  TrendingDown,
  Percent,
  TrendingUp as TrendIcon,
  Sparkles,
  Award,
  Clock,
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

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "etl" | "schema" | "queries" | "code">("dashboard");
  const [isEtlDone, setIsEtlDone] = useState<boolean>(false);

  // Simulated metrics
  const metrics = isEtlDone
    ? {
        revenue: 304800,
        cost: 215200,
        profit: 89600,
        count: 30,
        margin: "29.40",
        aov: "10,160"
      }
    : {
        revenue: 44700,
        cost: 31100,
        profit: 13600,
        count: 3,
        margin: "30.42",
        aov: "14,900"
      };

  // Recharts Data Sets
  const trendData = isEtlDone
    ? [
        { month: "Jan", Revenue: 44700, Profit: 13600 },
        { month: "Feb", Revenue: 14800, Profit: 4400 },
        { month: "Mar", Revenue: 45800, Profit: 12700 },
        { month: "Apr", Revenue: 53300, Profit: 15800 },
        { month: "May", Revenue: 57000, Profit: 16000 },
        { month: "Jun", Revenue: 89200, Profit: 27100 }
      ]
    : [
        { month: "Jan", Revenue: 44700, Profit: 13600 },
        { month: "Feb", Revenue: 0, Profit: 0 },
        { month: "Mar", Revenue: 0, Profit: 0 },
        { month: "Apr", Revenue: 0, Profit: 0 },
        { month: "May", Revenue: 0, Profit: 0 },
        { month: "Jun", Revenue: 0, Profit: 0 }
      ];

  const tierData = [
    { name: "Platinum", Spending: isEtlDone ? 64150 : 0, avgValue: isEtlDone ? 16037 : 0 },
    { name: "Gold", Spending: isEtlDone ? 151350 : 0, avgValue: isEtlDone ? 12612 : 0 },
    { name: "Silver", Spending: isEtlDone ? 66950 : 44700, avgValue: isEtlDone ? 11158 : 14900 },
    { name: "Standard", Spending: isEtlDone ? 22350 : 0, avgValue: isEtlDone ? 7450 : 0 }
  ];

  const categoryPerformance = [
    { name: "Electronics", Profit: isEtlDone ? 41200 : 8500, sales: isEtlDone ? 151200 : 21700 },
    { name: "Furniture", Profit: isEtlDone ? 30800 : 0, sales: isEtlDone ? 84500 : 0 },
    { name: "Home Appliance", Profit: isEtlDone ? 17600 : 5100, sales: isEtlDone ? 69100 : 23000 }
  ];

  const handleEtlComplete = () => {
    setIsEtlDone(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] flex flex-col font-sans transition-colors duration-350">
      {/* Decorative luxury golds ambient glimmers (subtle and high-end) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4AF37]/3 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-zinc-500/3 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Top Header Navigation Bar */}
      <header className="border-b border-[#262626] bg-[#0F0F0F]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-[#141414] border border-[#262626] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.08)]">
              <Database className="w-5 h-5 text-[#D4AF37] animate-pulse" />
            </div>
            <div>
              <h1 className="text-md sm:text-lg font-serif italic text-[#D4AF37] tracking-wider flex items-center gap-1.5">
                Aether Sales Warehouse
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
                Intelligence Layer v4.2 • Star Schema & PHP-MySQL ETL Pipeline
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#141414] border border-[#262626] text-zinc-400 font-bold px-3 py-1.5 rounded-none flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              Status: MySQL PRIMARY ACTIVE
            </span>
          </div>
        </div>
      </header>

      {/* Primary Workspace Sections */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive & Dashboard Workspace (TABS) */}
        <div className="lg:col-span-8 space-y-6 flex flex-col">
          
          {/* Quick Notice Banner if ETL not run yet */}
          {!isEtlDone && (
            <div className="bg-[#141414] border border-amber-900/40 p-5 rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(212,175,55,0.02)]">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-serif italic text-amber-200 uppercase tracking-wider">Warehouse Database Not Loaded (OLAP Data Empty)</h4>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    Currently, the analytical dashboard is operating on raw staging data (OLTP). Please navigate to the **"ETL Pipeline"** tab and execute the process to generate the analytics-optimized Star Schema database instantly!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("etl")}
                className="bg-[#D4AF37] hover:bg-amber-300 text-slate-950 text-[11px] font-bold px-4 py-2 rounded-none shrink-0 flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.2)] font-mono uppercase"
              >
                Execute ETL Now
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isEtlDone && (
            <div className="bg-[#141414] border border-emerald-900/40 p-5 rounded-none flex items-center gap-4 shadow-[0_0_25px_rgba(16,185,129,0.03)]">
              <div className="w-10 h-10 rounded-none bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Award className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h4 className="text-xs font-serif italic text-[#D4AF37] uppercase tracking-wider">Warehouse & ETL Scripts Ready!</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                  The Star Schema multidimensional database has been successfully transformed with computed analytical metrics. You can now download the PHP-MySQL production scripts or run interactive queries.
                </p>
              </div>
            </div>
          )}

          {/* Tab Navigation buttons */}
          <div className="flex flex-wrap gap-1.5 border-b border-[#262626] pb-2">
            {[
              { id: "dashboard", label: "📊 Overview Dashboard", icon: TrendingUp },
              { id: "etl", label: "🔄 ETL Pipeline", icon: Server },
              { id: "schema", label: "🛠️ Star Schema", icon: Layers },
              { id: "queries", label: "💻 SQL Playground", icon: Terminal },
              { id: "code", label: "💾 PHP & MySQL Source", icon: FileCode }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-none text-xs font-medium transition-all duration-150 border cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#141414] border-l-2 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.05)] border-t-[#262626] border-r-[#262626] border-b-[#262626]"
                    : "bg-[#0F0F0F] hover:bg-[#141414] border-[#262626] text-zinc-400 hover:text-zinc-200"
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
                      value: `$${metrics.revenue.toLocaleString()}`,
                      desc: `${isEtlDone ? "+582%" : "Initial Revenue"}`,
                      color: "text-[#D4AF37]"
                    },
                    {
                      label: "Net Profit",
                      value: `$${metrics.profit.toLocaleString()}`,
                      desc: `${isEtlDone ? "+558%" : "Initial Profit"}`,
                      color: "text-[#D4AF37]"
                    },
                    {
                      label: "Sales Transactions",
                      value: `${metrics.count} Orders`,
                      desc: `${isEtlDone ? "+900%" : "Initial Orders"}`,
                      color: "text-[#E0E0E0]"
                    },
                    {
                      label: "Profit Margin",
                      value: `${metrics.margin}%`,
                      desc: "Analytical Formula",
                      color: "text-zinc-400"
                    }
                  ].map((kpi, idx) => (
                    <div key={idx} className="bg-[#141414] p-5 rounded-none border border-[#262626] space-y-2 relative overflow-hidden group">
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500">{kpi.label}</div>
                      <div className={`text-xl sm:text-2xl font-serif italic ${idx === 0 || idx === 1 ? 'text-[#D4AF37]' : 'text-[#E0E0E0]'}`}>
                        {kpi.value}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9.5px] text-zinc-650 font-mono">
                        <span className={`${isEtlDone ? "text-emerald-500" : "text-amber-500"} font-bold`}>
                          {kpi.desc}
                        </span>
                      </div>
                      <div className="absolute right-0 bottom-0 top-0 w-[2px] bg-[#262626] group-hover:bg-[#D4AF37]/40 transition-colors"></div>
                    </div>
                  ))}
                </div>

                {/* 2. Analytical Graphs sections */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Revenue vs Profit Time Series Monthly Trends */}
                  <div className="md:col-span-12 lg:col-span-7 bg-[#141414] p-6 rounded-none border border-[#262626] flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs uppercase font-serif italic tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                        Monthly Sales and Profit Trends
                      </h4>
                      <p className="text-[10.5px] text-zinc-500 mt-1 leading-relaxed">
                        Analytics model plotted from the Fact Sales table and Time Dimension in the Star Schema (Jan - Jun)
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
                  <div className="md:col-span-12 lg:col-span-5 bg-[#141414] p-6 rounded-none border border-[#262626] flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs uppercase font-serif italic tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-[#D4AF37]" />
                        Customer Loyalty Tiers (AOV Profile)
                      </h4>
                      <p className="text-[10.5px] text-zinc-500 mt-1">
                        Revenues grouped by loyalty tiers (Customer RFM Analyst Profile)
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
                <div className="bg-[#141414] p-6 rounded-none border border-[#262626] space-y-4">
                  <div>
                    <h4 className="text-xs uppercase font-serif italic tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#D4AF37]" />
                      Product Category Performance
                    </h4>
                    <p className="text-[10.5px] text-zinc-500 mt-0.5">
                      Deep dive into revenues and profit margins using dimensional slices from the Product Dimension table
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categoryPerformance.map((cat, idx) => {
                      const percent = cat.sales > 0 ? ((cat.Profit / cat.sales) * 100).toFixed(1) : "0";
                      return (
                        <div key={idx} className="bg-[#0F0F0F] p-4 rounded-none border border-[#262626] space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold text-zinc-250">
                            <span>{cat.name}</span>
                            <span className="text-[10px] text-[#D4AF37] px-1.5 py-0.2 bg-[#141414] border border-[#262626] rounded-none font-mono">
                              {percent}% margin
                            </span>
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                              <span>Revenues:</span>
                              <span className="font-bold text-zinc-300">${cat.sales.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                              <span>Net Profit:</span>
                              <span className="font-bold text-[#D4AF37]">${cat.Profit.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="space-y-1 mt-2">
                            <div className="w-full bg-[#1A1A1A] h-1.5">
                              <div 
                                className="bg-[#D4AF37] h-full transition-all duration-500" 
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
                <div className="bg-[#141414] p-6 rounded-none border border-[#262626] space-y-3.5">
                  <h4 className="text-xs uppercase font-serif italic tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                    Data Warehouse Architecture & Design Principles
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs leading-relaxed text-zinc-400">
                    <div className="bg-[#0F0F0F] p-4 rounded-none border border-[#262626] space-y-1.5">
                      <span className="text-[#D4AF37] font-serif italic font-bold">1. Why Star Schema?</span>
                      <p className="text-[11px] text-zinc-500">
                        By normalizing data into simpler dimensions surrounding a central fact table, analytics queries require far fewer multi-table JOINs, slashing database processing loads by up to 80%.
                      </p>
                    </div>

                    <div className="bg-[#0F0F0F] p-4 rounded-none border border-[#262626] space-y-1.5">
                      <span className="text-[#D4AF37] font-serif italic font-bold">2. PHP ETL Pipeline</span>
                      <p className="text-[11px] text-zinc-500">
                        The custom script extracts raw transactions from the staging database, maps customer loyalty rankings dynamically using aggregated RFM attributes, and loads cleanly into central fact tables.
                      </p>
                    </div>

                    <div className="bg-[#0F0F0F] p-4 rounded-none border border-[#262626] space-y-1.5">
                      <span className="text-[#D4AF37] font-serif italic font-bold">3. Database Indexes</span>
                      <p className="text-[11px] text-zinc-500">
                        B-Tree indexing is systematically configured on dimension relationships. This guarantees sub-millisecond query responses even as transactional ledger indexes scale to millions of orders.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "etl" && (
              <EtlSimulator onEtlComplete={handleEtlComplete} isEtlDone={isEtlDone} />
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
      <footer className="border-t border-[#262626] bg-[#0F0F0F] py-8 mt-12 text-center text-[10px] tracking-widest text-zinc-600 font-mono flex flex-col items-center justify-center gap-2">
        <span>© 2026 AETHER SYSTEMS. ALL RIGHTS RESERVED.</span>
        <span className="opacity-50">ENGINE STRUCTURE: PHP 8.2.12 (FPM) • MYSQL WAREHOUSE PRIMARIES</span>
      </footer>
    </div>
  );
}
