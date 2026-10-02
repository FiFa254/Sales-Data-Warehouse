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
    <section className="rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)] p-5 sm:p-6 grid grid-cols-1 gap-6">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
            <Database className="w-4 h-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-ink">Sample queries</h2>
            <p className="text-sm text-muted mt-0.5">T-SQL queries over the star schema. Pick one, edit it, run it.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
          {sampleQueries.map((q) => {
            const selected = selectedQueryId === q.id;
            return (
              <button
                id={`query-select-${q.id}`}
                key={q.id}
                type="button"
                aria-pressed={selected}
                onClick={() => handleSelectQuery(q)}
                className={`w-full h-full p-3.5 text-left rounded-2xl border transition-colors block cursor-pointer ${
                  selected ? "bg-accent-soft border-accent" : "bg-subtle border-transparent hover:border-line-strong"
                }`}
              >
                <span className="inline-block rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-accent">
                  {q.category}
                </span>
                <div className="text-sm font-semibold text-ink mt-2 line-clamp-2">{q.title}</div>
                <p className="text-xs text-muted line-clamp-2 mt-1 leading-relaxed">{q.description}</p>
              </button>
            );
          })}
        </div>

      </div>

      <div className="flex flex-col gap-4 min-w-0">
        <div className="rounded-2xl bg-[#14161d] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Terminal className="w-4 h-4 text-white/60" aria-hidden="true" />
              <span className="text-sm font-medium text-white truncate">SQL console · SalesDW <span className="text-white/60">(read-only)</span></span>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-copy-sql"
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                id="btn-execute-sql"
                type="button"
                onClick={handleExecuteSql}
                disabled={running}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent hover:bg-accent-strong disabled:opacity-60 text-white px-4 py-1.5 text-sm font-semibold transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
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
            className="p-4 w-full font-mono text-[13px] text-[#e6e8ef] leading-relaxed min-h-[240px] max-h-[420px] resize-y bg-transparent outline-none caret-white custom-scrollbar"
          />
        </div>

        <div className="rounded-2xl border border-line p-4 min-h-[180px] flex flex-col gap-3">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h3 className="text-sm font-semibold text-ink">Result</h3>
            {queryResult && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                {queryResult.executionTimeMs} ms · {queryResult.rowCount}{queryResult.truncated ? "+" : ""} rows{queryResult.truncated ? " (showing 500)" : ""}
              </span>
            )}
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            {errorText ? (
              <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-2.5 text-sm text-red-800 leading-relaxed">
                <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span className="font-mono text-xs">{errorText}</span>
              </div>
            ) : queryResult ? (
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr>
                    {queryResult.headers.map((h, i) => (
                      <th key={i} scope="col" className="py-2.5 px-3 bg-subtle text-xs font-semibold text-muted whitespace-nowrap first:rounded-l-lg last:rounded-r-lg">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queryResult.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-line last:border-0">
                      {row.map((val: any, colIdx: any) => (
                        <td key={colIdx} className="py-2.5 px-3 text-ink tabular-nums whitespace-nowrap">{formatCell(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-10 text-center text-sm text-muted">
                Edit the SQL and click "Run Query" (Ctrl+Enter) to run it on SQL Server.
              </div>
            )}
          </div>

          {queryResult && !errorText && (
            <p className="rounded-xl bg-subtle px-3.5 py-2.5 text-xs text-muted leading-relaxed">
              {queryResult.rowCount === 0 && !isEtlDone
                ? "No rows: the star schema is empty. Run the ETL first, then query again."
                : "Live result from SQL Server, run as the read-only user playground_reader (SELECT only, 5 s timeout, max 500 rows)."}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-subtle p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-muted leading-relaxed">
            <span className="font-semibold text-ink block mb-0.5">Why a date dimension?</span>
            A lookup table (<code className="font-mono text-xs text-ink">dim_time</code>) makes grouping by month faster than parsing dates at query time, and removes date maths from every row.
          </p>
        </div>
    </section>
  );
}
