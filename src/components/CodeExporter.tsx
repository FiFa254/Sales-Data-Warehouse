import React, { useState } from "react";
import { FileCode, Copy, Check, FileText, Server, Terminal, HelpCircle } from "lucide-react";
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
    <section className="rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)] p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 space-y-4">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
            <FileCode className="w-4 h-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-ink">PHP &amp; MySQL project files</h2>
            <p className="text-sm text-muted mt-0.5">Copy these files to host the same star schema warehouse on a PHP + MySQL server.</p>
          </div>
        </div>

        <div className="rounded-2xl bg-subtle p-2 space-y-1">
          <p className="px-2 pt-1 pb-2 text-xs font-medium text-muted font-mono">project_sales_dw/</p>
          {FILES.map((file) => {
            const selected = activeTab === file.id;
            return (
              <button
                key={file.id}
                id={`tab-select-${file.id}`}
                type="button"
                aria-pressed={selected}
                onClick={() => setActiveTab(file.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-mono transition-colors cursor-pointer ${
                  selected ? "bg-surface text-accent font-semibold shadow-[var(--shadow-card)]" : "text-muted hover:text-ink hover:bg-surface/70"
                }`}
              >
                <file.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="flex-1 truncate">{file.name}</span>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl bg-subtle p-4 space-y-2">
          <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-accent" aria-hidden="true" />
            About this file
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            <code className="font-mono text-xs text-ink">{current.title}</code> {FILES.find((file) => file.id === activeTab)?.about}
          </p>
        </div>
      </div>

      <div className="lg:col-span-8 min-w-0">
        <div className="rounded-2xl bg-[#14161d] flex flex-col overflow-hidden h-full">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-white/60" aria-hidden="true" />
              <span className="text-sm font-medium text-white font-mono truncate">{current.title}</span>
            </div>
            <button
              id="btn-copy-code"
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent hover:bg-accent-strong text-white px-4 py-1.5 text-sm font-semibold transition-colors cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
              {copied ? "Copied" : "Copy code"}
            </button>
          </div>

          <pre className="p-4 flex-1 font-mono text-[13px] text-[#e6e8ef] leading-relaxed min-h-[340px] max-h-[520px] overflow-auto custom-scrollbar">
            {current.code}
          </pre>
        </div>
      </div>
    </section>
  );
}

const FILES = [
  {
    id: "mysql",
    name: "schema_warehouse.sql",
    icon: Terminal,
    about: "creates the MySQL catalog: the staging (OLTP) tables, the fact and dimension tables, their keys and indexes."
  },
  {
    id: "connect",
    name: "db_connect.php",
    icon: FileCode,
    about: "opens a PDO connection with UTF-8 and prepared statements, so queries are safe from SQL injection."
  },
  {
    id: "etl",
    name: "etl.php",
    icon: FileCode,
    about: "is the ETL job: it cleans staging rows, computes customer loyalty tiers, builds date keys and fills fact_sales."
  },
  {
    id: "api",
    name: "api_dashboard.php",
    icon: Server,
    about: "reads the fact table and returns the dashboard numbers as JSON."
  }
] as const;
