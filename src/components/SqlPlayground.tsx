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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#141414] p-6 rounded-none border border-[#262626]">
      {/* Sidebar with Query Selection */}
      <div className="lg:col-span-4 space-y-4">
        <div>
          <h4 className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-400 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-[#D4AF37]" />
            Warehouse Analytical Queries
          </h4>
          <p className="text-xs text-zinc-400 mt-1">
            Choose a pre-constructed high-value SQL query built to analyze the Star Schema in SQL Server (T-SQL).
          </p>
        </div>

        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {sampleQueries.map((q) => (
            <button
              id={`query-select-${q.id}`}
              key={q.id}
              onClick={() => handleSelectQuery(q)}
              className={`w-full p-3.5 text-left rounded-none border transition-all duration-150 block cursor-pointer ${
                selectedQueryId === q.id
                  ? "bg-[#0A0A0A] border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.06)]"
                  : "bg-[#0A0A0A] border-[#262626] hover:border-zinc-700 hover:bg-[#141414]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold text-[#D4AF37] bg-[#141414] px-2 py-0.5 rounded-none border border-zinc-800 tracking-wider">
                  {q.category}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 font-bold">T-SQL</span>
              </div>
              <div className="text-xs font-bold text-zinc-200 mt-2 line-clamp-1 font-sans">{q.title}</div>
              <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                {q.description}
              </p>
            </button>
          ))}
        </div>

        <div className="bg-[#0F0F0F] p-4 rounded-none border border-[#262626] flex items-start gap-2.5">
          <Info className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5 animate-pulse" />
          <div className="text-[11px] text-zinc-400 leading-relaxed">
            <span className="font-bold text-zinc-200 block mb-0.5 font-mono">Data Engineer's Digest:</span>
            Utilizing a date lookup dimension table **(dim_time)** accelerates sales series grouping compared with parsing dates at query time. It eliminates calculation complexity on each matched row block.
          </div>
        </div>
      </div>

      {/* Editor & Execution Area */}
      <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
        {/* Editor Screen */}
        <div className="bg-[#0A0A0A] rounded-none border border-[#262626] flex-1 flex flex-col overflow-hidden">
          <div className="bg-[#141414] px-4 py-3 border-b border-[#262626] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-300 font-mono">SQL Console: SalesDW (read-only)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-copy-sql"
                onClick={handleCopySql}
                className="p-1 px-2.5 rounded-none hover:bg-[#141414] border border-[#262626] text-zinc-400 hover:text-zinc-200 text-[10px] tracking-wider uppercase font-mono flex items-center gap-1 transition-colors duration-150 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-450" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy SQL"}
              </button>
              <button
                id="btn-execute-sql"
                onClick={handleExecuteSql}
                disabled={running}
                className="disabled:opacity-60 bg-[#D4AF37] hover:bg-[#F5D061] text-[#0A0A0A] px-3.5 py-1.5 rounded-none text-[11px] tracking-widest uppercase font-mono font-bold flex items-center gap-1.5 hover:scale-102 transition-all duration-150 cursor-pointer"
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
            className="p-4 w-full flex-1 font-mono text-xs text-zinc-300 leading-relaxed min-h-[160px] max-h-[320px] resize-y bg-[#0A0A0A] outline-none focus:ring-1 focus:ring-[#D4AF37]/40"
          />
        </div>

        {/* Console Outputs / Query Result Table */}
        <div className="bg-[#0A0A0A] rounded-none border border-[#262626] p-4 min-h-[180px] flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-[#262626] flex justify-between items-center">
              <span className="font-mono">Result Matrix (Interactive Table)</span>
              {queryResult && (
                <span className="font-mono text-[10.5px] text-[#D4AF37] flex items-center gap-1 pr-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Execution: {queryResult.executionTimeMs} ms • {queryResult.rowCount} rows{queryResult.truncated ? " (showing 500)" : ""}
                </span>
              )}
            </div>

            <div className="mt-3 overflow-x-auto">
              {errorText ? (
                <div className="bg-red-950/25 border border-red-900/40 p-4 rounded-none flex items-start gap-2.5 text-xs text-red-500 leading-relaxed font-mono">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500 animate-bounce" />
                  <span>{errorText}</span>
                </div>
              ) : queryResult ? (
                <table className="w-full text-xs font-mono text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#262626] text-zinc-400 font-bold">
                      {queryResult.headers.map((h, i) => (
                        <th key={i} className="py-2.5 px-3 bg-[#141414]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-b border-zinc-800 hover:bg-[#141414]/30 text-zinc-200">
                        {row.map((val: any, colIdx: any) => (
                          <td key={colIdx} className="py-2.5 px-3 text-zinc-300">{formatCell(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-10 text-zinc-500 text-xs flex flex-col items-center justify-center space-y-1">
                  <span>- Query Result Empty -</span>
                  <span className="text-[11px] text-[#D4AF37]">Edit the SQL and click "Run Query" (Ctrl+Enter) to run it on SQL Server.</span>
                </div>
              )}
            </div>
          </div>

          {queryResult && !errorText && (
            <div className="bg-[#141414] border border-[#262626] p-3 rounded-none text-[11px] text-zinc-400 flex items-start gap-2 mt-4 leading-relaxed">
              <span className="bg-[#D4AF37] text-[#0A0A0A] text-[9px] px-1.5 py-0.5 font-bold uppercase rounded-none mt-0.5 font-mono">LIVE</span>
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
