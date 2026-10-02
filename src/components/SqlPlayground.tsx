import React, { useState } from "react";
import { Play, Database, Terminal, CheckCircle2, AlertCircle, Info, Copy, Check } from "lucide-react";
import { SqlQuery } from "../types";
import { sampleQueries } from "../data";
import { api, QueryResult } from "../api";

interface SqlPlaygroundProps {
  isEtlDone: boolean;
}

export default function SqlPlayground({ isEtlDone }: SqlPlaygroundProps) {
  const [selectedQueryId, setSelectedQueryId] = useState<string>("q1");
  const [customSql, setCustomSql] = useState<string>(sampleQueries[0].sql);
  const [copied, setCopied] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [running, setRunning] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const selectedQuery = sampleQueries.find((q) => q.id === selectedQueryId) || sampleQueries[0];

  const handleSelectQuery = (q: SqlQuery) => {
    setSelectedQueryId(q.id);
    setCustomSql(q.sql);
    setQueryResult(null);
    setErrorText(null);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(customSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Runs the SQL on SQL Server as the read-only database user playground_reader (one SELECT, max 500 rows).
  const handleExecuteSql = async () => {
    setErrorText(null);
    setRunning(true);
    try {
      setQueryResult(await api.query(customSql));
    } catch (err: any) {
      setErrorText(err.message);
      setQueryResult(null);
    } finally {
      setRunning(false);
    }
  };

  const formatCell = (value: unknown) =>
    value === null || value === undefined ? "NULL" : typeof value === "number" ? value.toLocaleString("en-US") : String(value);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-surface p-6 rounded-xl border border-line">
      {/* Sidebar with Query Selection */}
      <div className="lg:col-span-4 space-y-4">
        <div>
          <h4 className="text-xs font-mono uppercase tracking-[0.15em] text-muted flex items-center gap-1.5">
            <Database className="w-4 h-4 text-accent" />
            Warehouse Analytical Queries
          </h4>
          <p className="text-xs text-muted mt-1">
            Choose a pre-constructed high-value SQL query built to analyze the Star Schema in SQL Server (T-SQL).
          </p>
        </div>

        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {sampleQueries.map((q) => (
            <button
              id={`query-select-${q.id}`}
              key={q.id}
              onClick={() => handleSelectQuery(q)}
              className={`w-full p-3.5 text-left rounded-xl border transition-all duration-150 block cursor-pointer ${
                selectedQueryId === q.id
                  ? "bg-subtle border-accent"
                  : "bg-subtle border-line hover:border-line-strong hover:bg-surface"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold text-accent bg-surface px-2 py-0.5 rounded-xl border border-line-strong tracking-wider">
                  {q.category}
                </span>
                <span className="text-[10px] font-mono text-muted font-bold">T-SQL</span>
              </div>
              <div className="text-xs font-bold text-ink mt-2 line-clamp-1 font-sans">{q.title}</div>
              <p className="text-[11px] text-muted line-clamp-2 mt-1 leading-relaxed">
                {q.description}
              </p>
            </button>
          ))}
        </div>

        <div className="bg-subtle p-4 rounded-xl border border-line flex items-start gap-2.5">
          <Info className="w-5 h-5 text-accent shrink-0 mt-0.5 animate-pulse" />
          <div className="text-[11px] text-muted leading-relaxed">
            <span className="font-bold text-ink block mb-0.5 font-mono">Data Engineer's Digest:</span>
            Utilizing a date lookup dimension table **(dim_time)** accelerates sales series grouping compared with parsing dates at query time. It eliminates calculation complexity on each matched row block.
          </div>
        </div>
      </div>

      {/* Editor & Execution Area */}
      <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
        {/* Editor Screen */}
        <div className="bg-subtle rounded-xl border border-line flex-1 flex flex-col overflow-hidden">
          <div className="bg-surface px-4 py-3 border-b border-line flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-muted" />
              <span className="text-xs font-bold text-ink font-mono">SQL Console: SalesDW (read-only)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-copy-sql"
                onClick={handleCopySql}
                className="p-1 px-2.5 rounded-xl hover:bg-surface border border-line text-muted hover:text-ink text-[10px] tracking-wider uppercase font-mono flex items-center gap-1 transition-colors duration-150 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy SQL"}
              </button>
              <button
                id="btn-execute-sql"
                onClick={handleExecuteSql}
                disabled={running}
                className="disabled:opacity-60 bg-accent hover:bg-accent-strong text-white px-3.5 py-1.5 rounded-xl text-[11px] tracking-widest uppercase font-mono font-bold flex items-center gap-1.5 hover:scale-102 transition-all duration-150 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {running ? "Running..." : "Run Query"}
              </button>
            </div>
          </div>

          <textarea
            value={customSql}
            onChange={(e) => setCustomSql(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleExecuteSql();
            }}
            spellCheck={false}
            aria-label="SQL query"
            className="p-4 w-full flex-1 font-mono text-xs text-ink leading-relaxed min-h-[160px] max-h-[320px] resize-y bg-subtle outline-none focus:ring-1 focus:ring-accent/40"
          />
        </div>

        {/* Console Outputs / Query Result Table */}
        <div className="bg-subtle rounded-xl border border-line p-4 min-h-[180px] flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted pb-2 border-b border-line flex justify-between items-center">
              <span className="font-mono">Result Matrix (Interactive Table)</span>
              {queryResult && (
                <span className="font-mono text-[10.5px] text-accent flex items-center gap-1 pr-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Execution: {queryResult.executionTimeMs} ms • {queryResult.rowCount}{queryResult.truncated ? "+" : ""} rows{queryResult.truncated ? " (showing 500)" : ""}
                </span>
              )}
            </div>

            <div className="mt-3 overflow-x-auto">
              {errorText ? (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-2.5 text-xs text-red-700 leading-relaxed font-mono">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-700 animate-bounce" />
                  <span>{errorText}</span>
                </div>
              ) : queryResult ? (
                <table className="w-full text-xs font-mono text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line text-muted font-bold">
                      {queryResult.headers.map((h, i) => (
                        <th key={i} className="py-2.5 px-3 bg-surface">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-b border-line-strong hover:bg-surface/30 text-ink">
                        {row.map((val: any, colIdx: any) => (
                          <td key={colIdx} className="py-2.5 px-3 text-ink">{formatCell(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-10 text-muted text-xs flex flex-col items-center justify-center space-y-1">
                  <span>- Query Result Empty -</span>
                  <span className="text-[11px] text-accent">Edit the SQL and click "Run Query" (Ctrl+Enter) to run it on SQL Server.</span>
                </div>
              )}
            </div>
          </div>

          {queryResult && !errorText && (
            <div className="bg-surface border border-line p-3 rounded-xl text-[11px] text-muted flex items-start gap-2 mt-4 leading-relaxed">
              <span className="bg-accent text-white text-[9px] px-1.5 py-0.5 font-bold uppercase rounded-xl mt-0.5 font-mono">LIVE</span>
              <div>
                {queryResult.rowCount === 0 && !isEtlDone
                  ? "No rows: the star schema is empty. Run the ETL first, then query again."
                  : "Live result from SQL Server, run as the read-only user playground_reader (SELECT only, 5 s timeout, max 500 rows)."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
