import React, { useCallback, useEffect, useState } from "react";
import {
  TrendingUp,
  Server,
  Layers,
  Database,
  Terminal,
  FileCode,
  AlertCircle,
  CheckCircle2,
  Award,
  BookOpen,
  ArrowRight,
  DollarSign,
  ShoppingBag,
  PieChart,
  type LucideIcon
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
  Legend,
  Cell,
  LabelList
} from "recharts";

import SchemaVisualizer from "./components/SchemaVisualizer";
import EtlSimulator from "./components/EtlSimulator";
import SqlPlayground from "./components/SqlPlayground";
import CodeExporter from "./components/CodeExporter";
import WebChat from "./components/WebChat";
import SourceOrders from "./components/SourceOrders";
import { api, Dashboard, money } from "./api";

type TabId = "dashboard" | "etl" | "schema" | "queries" | "code";

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Overview", icon: TrendingUp },
  { id: "etl", label: "ETL Pipeline", icon: Server },
  { id: "schema", label: "Star Schema", icon: Layers },
  { id: "queries", label: "SQL Playground", icon: Terminal },
  { id: "code", label: "PHP & MySQL", icon: FileCode }
];

const BANNER_TONES = {
  warning: { box: "bg-amber-50 border-amber-200", icon: "bg-amber-100 text-amber-800", Icon: AlertCircle },
  success: { box: "bg-emerald-50 border-emerald-200", icon: "bg-emerald-100 text-emerald-800", Icon: CheckCircle2 }
};

function StatusBanner({
  tone,
  title,
  children,
  actionLabel,
  onAction
}: {
  tone: keyof typeof BANNER_TONES;
  title: string;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { box, icon, Icon } = BANNER_TONES[tone];
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border px-5 py-4 ${box}`}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${icon}`}>
          <Icon className="w-4.5 h-4.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="text-sm text-muted mt-0.5 leading-relaxed">{children}</p>
        </div>
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-accent hover:bg-accent-strong text-white text-sm font-semibold px-4 py-2 shrink-0 transition-colors cursor-pointer"
        >
          {actionLabel}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

const CHART = {
  revenue: "#2f5bea",
  profit: "#d2601a",
  barMuted: "#b7c7f8",
  grid: "#e3e6ee",
  axis: "#656b7d",
  label: "#12141a"
};

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e3e6ee",
  borderRadius: 12,
  boxShadow: "0 8px 24px -12px rgb(18 20 26 / 0.2)",
  color: "#12141a",
  fontSize: 12
};

const ACTIVE_DOT = { r: 5, strokeWidth: 2, stroke: "#ffffff" };

const compactMoney = (value: number) => (Math.abs(value) >= 1000 ? `$${Math.round(value / 1000)}k` : `$${value}`);

const PRINCIPLES = [
  {
    title: "Why a star schema?",
    body: "By normalizing data into simpler dimensions surrounding a central fact table, analytics queries require far fewer multi-table JOINs, slashing database processing loads by up to 80%."
  },
  {
    title: "PHP ETL pipeline",
    body: "The custom script extracts raw transactions from the staging database, maps customer loyalty rankings dynamically using aggregated RFM attributes, and loads cleanly into central fact tables."
  },
  {
    title: "Database indexes",
    body: "B-Tree indexing is systematically configured on dimension relationships. This guarantees sub-millisecond query responses even as transactional ledger indexes scale to millions of orders."
  }
];

function Panel({
  title,
  subtitle,
  icon: Icon,
  className = "",
  children
}: {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)] p-5 sm:p-6 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
          {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = TABS.findIndex((tab) => tab.id === activeTab);
    const targets: Record<string, number> = {
      ArrowRight: (index + 1) % TABS.length,
      ArrowLeft: (index - 1 + TABS.length) % TABS.length,
      Home: 0,
      End: TABS.length - 1
    };
    const next = targets[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setActiveTab(TABS[next].id);
    document.getElementById(`tab-${TABS[next].id}`)?.focus();
  };
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
  const topTierSpend = Math.max(0, ...tierData.map((tier) => tier.Spending));

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
            <div role="alert" className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-800">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              <p>Cannot load data from SQL Server: {loadError}</p>
            </div>
          )}

          {dashboard && !isEtlDone && (
            <StatusBanner
              tone="warning"
              title="The warehouse is not loaded yet"
              actionLabel="Run the ETL"
              onAction={() => setActiveTab("etl")}
            >
              The dashboard is reading the source (OLTP) tables directly. Run the ETL to build the star schema in SQL Server.
            </StatusBanner>
          )}

          {isEtlDone && pendingOrders > 0 && (
            <StatusBanner
              tone="warning"
              title={`${pendingOrders} new source order${pendingOrders > 1 ? "s" : ""} not in the warehouse`}
              actionLabel="Run ETL again"
              onAction={() => setActiveTab("etl")}
            >
              Run the ETL again to load them into the star schema.
            </StatusBanner>
          )}

          {isEtlDone && pendingOrders === 0 && (
            <StatusBanner tone="success" title="Warehouse is up to date">
              Reading the star schema in SQL Server
              {dashboard?.lastEtl
                ? ` · last ETL ${new Date(dashboard.lastEtl.finishedAt).toLocaleString()}, ${dashboard.lastEtl.rowsLoaded} fact rows in ${dashboard.lastEtl.durationMs} ms`
                : ""}
              .
            </StatusBanner>
          )}

          <div
            role="tablist"
            aria-label="Warehouse views"
            onKeyDown={handleTabKeyDown}
            className="flex gap-1 overflow-x-auto rounded-full bg-surface border border-line p-1 shadow-[var(--shadow-card)] self-start max-w-full custom-scrollbar"
          >
            {TABS.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="tab-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    selected ? "bg-accent text-white" : "text-muted hover:text-ink hover:bg-subtle"
                  }`}
                >
                  <tab.icon className="w-4 h-4" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB CONTENTS RENDER */}
          <div id="tab-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="flex-1">
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                
                {/* 1. Key Performance Indicators Blocks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Total revenue",
                      value: money(metrics.revenue),
                      desc: isEtlDone ? "fact_sales · star schema" : "oltp · source tables",
                      icon: DollarSign
                    },
                    {
                      label: "Net profit",
                      value: money(metrics.profit),
                      desc: `Cost ${money(metrics.cost)}`,
                      icon: TrendingUp
                    },
                    {
                      label: "Orders",
                      value: String(metrics.orders),
                      desc: `${metrics.items} items · AOV ${money(metrics.aov)}`,
                      icon: ShoppingBag
                    },
                    {
                      label: "Profit margin",
                      value: `${metrics.margin.toFixed(2)}%`,
                      desc: "Profit ÷ revenue",
                      icon: PieChart
                    }
                  ].map((kpi, idx) => {
                    const featured = idx === 0;
                    return (
                      <div
                        key={kpi.label}
                        className={`rounded-[var(--radius-card)] p-5 flex flex-col gap-4 ${
                          featured ? "bg-accent text-white" : "bg-surface text-ink shadow-[var(--shadow-card)]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm font-medium ${featured ? "text-white/85" : "text-muted"}`}>{kpi.label}</span>
                          <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              featured ? "bg-white/15 text-white" : "bg-accent-soft text-accent"
                            }`}
                          >
                            <kpi.icon className="w-4 h-4" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="font-display text-3xl font-bold tracking-tight tabular-nums">
                          {kpi.value}
                        </div>
                        <span
                          className={`self-start rounded-full px-2.5 py-1 text-xs font-medium truncate max-w-full ${
                            featured ? "bg-white/15 text-white" : "bg-subtle text-muted"
                          }`}
                        >
                          {kpi.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* 2. Analytical Graphs sections */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <Panel
                    className="lg:col-span-7"
                    icon={TrendingUp}
                    title="Monthly sales and profit"
                    subtitle={isEtlDone ? "fact_sales joined to dim_time in the star schema" : "Source order tables · run the ETL to use the star schema"}
                  >
                    <div className="h-[240px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={CHART.revenue} stopOpacity={0.18} />
                              <stop offset="100%" stopColor={CHART.revenue} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid vertical={false} stroke={CHART.grid} />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} interval={0} padding={{ left: 12, right: 12 }} tick={{ fill: CHART.axis, fontSize: 12 }} tickFormatter={(month: string) => month.slice(0, 3)} />
                          <YAxis axisLine={false} tickLine={false} width={48} tick={{ fill: CHART.axis, fontSize: 12 }} tickFormatter={compactMoney} />
                          <Tooltip
                            cursor={{ stroke: CHART.axis, strokeWidth: 1 }}
                            contentStyle={TOOLTIP_STYLE}
                            formatter={(value: number) => money(value)}
                          />
                          <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
                          <Area type="monotone" dataKey="Revenue" name="Revenue" stroke={CHART.revenue} strokeWidth={2} fill="url(#fillRevenue)" activeDot={ACTIVE_DOT} />
                          <Area type="monotone" dataKey="Profit" name="Profit" stroke={CHART.profit} strokeWidth={2} fill="transparent" activeDot={ACTIVE_DOT} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <table className="sr-only">
                      <caption>Monthly revenue and profit</caption>
                      <thead><tr><th scope="col">Month</th><th scope="col">Revenue</th><th scope="col">Profit</th></tr></thead>
                      <tbody>
                        {trendData.map((row) => (
                          <tr key={row.month}><th scope="row">{row.month}</th><td>{money(row.Revenue)}</td><td>{money(row.Profit)}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </Panel>

                  <Panel
                    className="lg:col-span-5"
                    icon={Award}
                    title="Spend by loyalty tier"
                    subtitle={isEtlDone ? "Lifetime spend per tier from dim_customers" : "Tiers are computed by the ETL · run it to fill this chart"}
                  >
                    <div className="h-[240px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={tierData} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
                          <CartesianGrid vertical={false} stroke={CHART.grid} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} tick={{ fill: CHART.axis, fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} width={48} tick={{ fill: CHART.axis, fontSize: 12 }} tickFormatter={compactMoney} />
                          <Tooltip cursor={{ fill: CHART.grid, opacity: 0.5 }} contentStyle={TOOLTIP_STYLE} formatter={(value: number) => money(value)} />
                          <Bar dataKey="Spending" name="Total spend" barSize={24} radius={[4, 4, 0, 0]}>
                            {tierData.map((tier) => (
                              <Cell key={tier.name} fill={tier.Spending === topTierSpend ? CHART.revenue : CHART.barMuted} />
                            ))}
                            <LabelList dataKey="Spending" position="top" formatter={compactMoney} style={{ fill: CHART.label, fontSize: 12, fontWeight: 600 }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <table className="sr-only">
                      <caption>Lifetime spend by loyalty tier</caption>
                      <thead><tr><th scope="col">Tier</th><th scope="col">Spend</th><th scope="col">Customers</th></tr></thead>
                      <tbody>
                        {tierData.map((tier) => (
                          <tr key={tier.name}><th scope="row">{tier.name}</th><td>{money(tier.Spending)}</td><td>{tier.Customers}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </Panel>
                </div>

                {/* 3. Category performance list */}
                <Panel icon={Layers} title="Category performance" subtitle="Revenue and profit margin by product category from dim_products">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    {categoryPerformance.map((cat) => {
                      const percent = cat.sales > 0 ? (cat.Profit / cat.sales) * 100 : 0;
                      return (
                        <div key={cat.name} className="rounded-2xl bg-subtle p-4 flex flex-col gap-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-ink">{cat.name}</span>
                            <span className="rounded-full bg-accent-soft text-accent text-xs font-semibold px-2.5 py-0.5 tabular-nums shrink-0">
                              {percent.toFixed(1)}% margin
                            </span>
                          </div>
                          <dl className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <dt className="text-xs text-muted">Revenue</dt>
                              <dd className="font-semibold text-ink tabular-nums">{money(cat.sales)}</dd>
                            </div>
                            <div>
                              <dt className="text-xs text-muted">Net profit</dt>
                              <dd className="font-semibold text-ink tabular-nums">{money(cat.Profit)}</dd>
                            </div>
                          </dl>
                          <div className="h-2 w-full rounded-full bg-line overflow-hidden" aria-hidden="true">
                            <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${Math.min(percent, 100)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Panel>

                {/* 4. Lesson Introduction Block */}
                <Panel icon={BookOpen} title="Data warehouse design principles">
                  <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                    {PRINCIPLES.map((item, idx) => (
                      <li key={item.title} className="rounded-2xl bg-subtle p-4 space-y-2">
                        <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">
                          {idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-ink">{item.title}</p>
                        <p className="text-sm text-muted leading-relaxed">{item.body}</p>
                      </li>
                    ))}
                  </ol>
                </Panel>

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
