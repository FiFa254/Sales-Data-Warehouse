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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#141414] p-6 rounded-none border border-[#262626]">
      {/* File Tree Explorer Menu */}
      <div className="lg:col-span-4 space-y-4">
        <div>
          <h4 className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-400 flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-[#D4AF37]" />
            PHP & MySQL Project Files
          </h4>
          <p className="text-xs text-zinc-400 mt-1">
            Copy these production files directly to host the Star Schema Data Warehouse on your local server environment.
          </p>
        </div>

        {/* File Navigator layout */}
        <div className="bg-[#0A0A0A] p-3 rounded-none border border-[#262626] space-y-1">
          <div className="text-[9px] uppercase font-bold text-[#D4AF37] tracking-[0.12em] font-mono pl-2 mb-2">📁 project_sales_dw/</div>
          
          <button
            id="tab-select-mysql"
            onClick={() => setActiveTab("mysql")}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-none text-left text-xs transition-all duration-150 cursor-pointer border ${
              activeTab === "mysql"
                ? "bg-[#141414] text-[#D4AF37] border-[#D4AF37]/45 font-bold"
                : "text-zinc-400 hover:bg-[#141414] border-transparent"
            }`}
          >
            <Terminal className="w-4 h-4 shrink-0 text-amber-500" />
            <div className="flex-1 font-mono">schema_warehouse.sql</div>
          </button>

          <button
            id="tab-select-connect"
            onClick={() => setActiveTab("connect")}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-none text-left text-xs transition-all duration-150 cursor-pointer border ${
              activeTab === "connect"
                ? "bg-[#141414] text-[#D4AF37] border-[#D4AF37]/45 font-bold"
                : "text-zinc-400 hover:bg-[#141414] border-transparent"
            }`}
          >
            <FileCode className="w-4 h-4 shrink-0 text-zinc-400" />
            <div className="flex-1 font-mono">db_connect.php</div>
          </button>

          <button
            id="tab-select-etl"
            onClick={() => setActiveTab("etl")}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-none text-left text-xs transition-all duration-150 cursor-pointer border ${
              activeTab === "etl"
                ? "bg-[#141414] text-[#D4AF37] border-[#D4AF37]/45 font-bold"
                : "text-zinc-400 hover:bg-[#141414] border-transparent"
            }`}
          >
            <FileCode className="w-4 h-4 shrink-0 text-[#D4AF37] animate-pulse" />
            <div className="flex-1 font-mono">etl.php</div>
          </button>

          <button
            id="tab-select-api"
            onClick={() => setActiveTab("api")}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-none text-left text-xs transition-all duration-150 cursor-pointer border ${
              activeTab === "api"
                ? "bg-[#141414] text-[#D4AF37] border-[#D4AF37]/45 font-bold"
                : "text-zinc-400 hover:bg-[#141414] border-transparent"
            }`}
          >
            <Server className="w-4 h-4 shrink-0 text-zinc-400" />
            <div className="flex-1 font-mono">api_dashboard.php</div>
          </button>
        </div>

        {/* Theoretical Details Explainer */}
        <div className="bg-[#0F0F0F] p-4 rounded-none border border-[#262626] space-y-2">
          <h5 className="text-[11.5px] font-bold text-zinc-300 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
            File &amp; Architecture Specifications
          </h5>
          <div className="text-[11px] text-zinc-400 leading-relaxed space-y-2">
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
            <div className="pt-1 text-[10px] text-[#D4AF37] font-mono uppercase tracking-wider font-bold">
              *These files are cross-compatible and ready for local systems!*
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer Editor view */}
      <div className="lg:col-span-8 flex flex-col justify-between space-y-3">
        <div className="bg-[#0A0A0A] rounded-none border border-[#262626] flex-1 flex flex-col overflow-hidden">
          <div className="bg-[#141414] px-4 py-3 border-b border-[#262626] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-bold text-zinc-300 font-mono">{current.title}</span>
            </div>
            <button
              id="btn-copy-code"
              onClick={handleCopy}
              className="bg-[#D4AF37] hover:bg-[#F5D061] text-[#0A0A0A] px-3.5 py-1.5 rounded-none text-[11px] tracking-widest uppercase font-mono font-bold flex items-center gap-1.5 hover:scale-101 transition-all duration-150 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Source Code"}
            </button>
          </div>

          <div className="p-4 flex-1 font-mono text-xs text-zinc-350 leading-relaxed min-h-[340px] max-h-[460px] overflow-auto whitespace-pre bg-[#0A0A0A]">
            {current.code}
          </div>
        </div>
      </div>
    </div>
  );
}
