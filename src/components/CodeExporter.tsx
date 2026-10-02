import React, { useState } from "react";
import { FileCode, Copy, Check, Info, FileText, Server, Terminal, HelpCircle } from "lucide-react";
import { phpConnectCode, phpEtlCode, phpApiDashboardCode, mysqlSchemaCode } from "../data";

export default function CodeExporter() {
  const [activeTab, setActiveTab] = useState<"mysql" | "connect" | "etl" | "api">("mysql");
  const [copied, setCopied] = useState(false);

  const getCodeContent = () => {
    switch (activeTab) {
      case "mysql":
        return { code: mysqlSchemaCode, lang: "sql", title: "schema_warehouse.sql" };
      case "connect":
        return { code: phpConnectCode, lang: "php", title: "db_connect.php" };
      case "etl":
        return { code: phpEtlCode, lang: "php", title: "etl.php" };
      case "api":
        return { code: phpApiDashboardCode, lang: "php", title: "api_dashboard.php" };
    }
  };

  const current = getCodeContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-surface p-6 rounded-xl border border-line">
      {/* File Tree Explorer Menu */}
      <div className="lg:col-span-4 space-y-4">
        <div>
          <h4 className="text-xs font-mono uppercase tracking-[0.15em] text-muted flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-accent" />
            PHP & MySQL Project Files
          </h4>
          <p className="text-xs text-muted mt-1">
            Copy these production files directly to host the Star Schema Data Warehouse on your local server environment.
          </p>
        </div>

        {/* File Navigator layout */}
        <div className="bg-subtle p-3 rounded-xl border border-line space-y-1">
          <div className="text-[9px] uppercase font-bold text-accent tracking-[0.12em] font-mono pl-2 mb-2">📁 project_sales_dw/</div>
          
          <button
            id="tab-select-mysql"
            onClick={() => setActiveTab("mysql")}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs transition-all duration-150 cursor-pointer border ${
              activeTab === "mysql"
                ? "bg-surface text-accent border-accent/45 font-bold"
                : "text-muted hover:bg-surface border-transparent"
            }`}
          >
            <Terminal className="w-4 h-4 shrink-0 text-amber-700" />
            <div className="flex-1 font-mono">schema_warehouse.sql</div>
          </button>

          <button
            id="tab-select-connect"
            onClick={() => setActiveTab("connect")}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs transition-all duration-150 cursor-pointer border ${
              activeTab === "connect"
                ? "bg-surface text-accent border-accent/45 font-bold"
                : "text-muted hover:bg-surface border-transparent"
            }`}
          >
            <FileCode className="w-4 h-4 shrink-0 text-muted" />
            <div className="flex-1 font-mono">db_connect.php</div>
          </button>

          <button
            id="tab-select-etl"
            onClick={() => setActiveTab("etl")}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs transition-all duration-150 cursor-pointer border ${
              activeTab === "etl"
                ? "bg-surface text-accent border-accent/45 font-bold"
                : "text-muted hover:bg-surface border-transparent"
            }`}
          >
            <FileCode className="w-4 h-4 shrink-0 text-accent animate-pulse" />
            <div className="flex-1 font-mono">etl.php</div>
          </button>

          <button
            id="tab-select-api"
            onClick={() => setActiveTab("api")}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs transition-all duration-150 cursor-pointer border ${
              activeTab === "api"
                ? "bg-surface text-accent border-accent/45 font-bold"
                : "text-muted hover:bg-surface border-transparent"
            }`}
          >
            <Server className="w-4 h-4 shrink-0 text-muted" />
            <div className="flex-1 font-mono">api_dashboard.php</div>
          </button>
        </div>

        {/* Theoretical Details Explainer */}
        <div className="bg-subtle p-4 rounded-xl border border-line space-y-2">
          <h5 className="text-[11.5px] font-bold text-ink flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-accent" />
            File &amp; Architecture Specifications
          </h5>
          <div className="text-[11px] text-muted leading-relaxed space-y-2">
            {activeTab === "mysql" && (
              <p>
                **schema_warehouse.sql**: Prepares the full catalog on MySQL, defining staging areas (OLTP) and OLAP collections (Fact and Dimensions). Includes schema relationships and performance compounds.
              </p>
            )}
            {activeTab === "connect" && (
              <p>
                **db_connect.php**: Manages connection details securely via a PHP PDO link, establishing UTF-8 encoding and parameterized sanitization guards (SQL Injection Protection).
              </p>
            )}
            {activeTab === "etl" && (
              <p>
                **etl.php**: The central PHP ETL Pipeline workflow. It queries and cleans raw staging entries, computes customer RFM loyalty brackets, formats date surrogate keys, and populates the Fact Sales table.
              </p>
            )}
            {activeTab === "api" && (
              <p>
                **api_dashboard.php**: Queries the sales warehouse fact ledger and serves high-performance analytics in nested JSON format to feed dashboards with zero latency.
              </p>
            )}
            <div className="pt-1 text-[10px] text-accent font-mono uppercase tracking-wider font-bold">
              *These files are cross-compatible and ready for local systems!*
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer Editor view */}
      <div className="lg:col-span-8 flex flex-col justify-between space-y-3">
        <div className="bg-subtle rounded-xl border border-line flex-1 flex flex-col overflow-hidden">
          <div className="bg-surface px-4 py-3 border-b border-line flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold text-ink font-mono">{current.title}</span>
            </div>
            <button
              id="btn-copy-code"
              onClick={handleCopy}
              className="bg-accent hover:bg-accent-strong text-white px-3.5 py-1.5 rounded-xl text-[11px] tracking-widest uppercase font-mono font-bold flex items-center gap-1.5 hover:scale-101 transition-all duration-150 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Source Code"}
            </button>
          </div>

          <div className="p-4 flex-1 font-mono text-xs text-ink leading-relaxed min-h-[340px] max-h-[460px] overflow-auto whitespace-pre bg-subtle">
            {current.code}
          </div>
        </div>
      </div>
    </div>
  );
}
