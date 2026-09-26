import React, { useState, useEffect, useRef } from "react";
import { api, Dashboard, EtlResult } from "../api";
import { Disc, Play, Server, ArrowRight, CheckCircle2, ChevronRight, Activity, Database, Award } from "lucide-react";

interface EtlSimulatorProps {
  onEtlComplete: (success: boolean) => void;
  isEtlDone: boolean;
  dashboard: Dashboard | null;
}

export default function EtlSimulator({ onEtlComplete, isEtlDone, dashboard }: EtlSimulatorProps) {
  const [status, setStatus] = useState<"idle" | "extracting" | "transforming" | "loading" | "completed">(
    isEtlDone ? "completed" : "idle"
  );
  const [progress, setProgress] = useState(isEtlDone ? 100 : 0);
  const [logs, setLogs] = useState<string[]>(
    isEtlDone && dashboard?.lastEtl
      ? [`[LAST RUN ${new Date(dashboard.lastEtl.finishedAt).toLocaleString()}] Loaded ${dashboard.lastEtl.rowsLoaded} rows into fact_sales in ${dashboard.lastEtl.durationMs} ms.`]
      : []
  );
  const logContainerRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${msg}`]);
  };

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);  const handleStartETL = async () => {
    setStatus("extracting");
    setProgress(5);
    setLogs([]);
    addLog("Connecting to SQL Server (database SalesDW)...");

    let result: EtlResult;
    try {
      result = await api.runEtl();
    } catch (err: any) {
      addLog(`ERROR: ${err.message}`);
      setStatus("idle");
      setProgress(0);
      return;
    }

    // The ETL already ran as one transaction on the server; replay its real steps so each phase is visible.
    const icons = { extract: "[Extract]", transform: "[Transform]", load: "[Load]" } as const;
    const phaseStatus = { extract: "extracting", transform: "transforming", load: "loading" } as const;
    for (let i = 0; i < result.steps.length; i++) {
      const step = result.steps[i];
      await new Promise((resolve) => setTimeout(resolve, 250));
      setStatus(phaseStatus[step.phase]);
      setProgress(Math.round(((i + 1) / result.steps.length) * 95));
      addLog(`${icons[step.phase]} ${step.message} (${step.ms} ms)`);
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
    setProgress(100);
    setStatus("completed");
    addLog(`Done: ${result.rowsLoaded} fact rows loaded in ${result.durationMs} ms (one transaction, logged in dbo.etl_runs).`);
    onEtlComplete(true);
  };

  return (
    <div className="bg-[#141414] p-6 rounded-none border border-[#262626] space-y-6">
      {/* Target Section Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-5">
        <div>
          <h3 className="text-base sm:text-lg font-serif italic text-[#D4AF37] tracking-wider flex items-center gap-2">
            <Server className="text-[#D4AF37] w-5 h-5" />
            ETL Pipeline (SQL Server)
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Runs a real Extract, Transform and Load in SQL Server: source tables (schema oltp) into the Star Schema (dim_* and fact_sales).
          </p>
        </div>
        <button
          onClick={handleStartETL}
          disabled={status !== "idle" && status !== "completed"}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-none text-xs font-bold transition-all duration-150 uppercase tracking-wider font-mono shadow-[0_0_15px_rgba(212,175,55,0.12)] ${
            status !== "idle" && status !== "completed"
              ? "bg-[#0F0F0F] text-zinc-650 border border-zinc-850 cursor-not-allowed"
              : "bg-[#D4AF37] hover:bg-amber-300 text-slate-950 border border-[#D4AF37]/50 cursor-pointer"
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          Run ETL
        </button>
      </div>

      {/* Database Node Connectors block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-[#0F0F0F] p-5 rounded-none border border-[#262626]">
        {/* Source DB Box */}
        <div className="bg-[#141414] p-4 rounded-none border border-[#262626] text-center space-y-2 relative">
          <div className="mx-auto w-10 h-10 bg-[#0F0F0F] border border-[#262626] text-[#D4AF37] rounded-none flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div className="font-serif italic text-sm text-[#E0E0E0]">Source tables (oltp.*)</div>
          <div className="text-[10px] text-zinc-500 font-mono">{dashboard ? `${dashboard.source_counts.customers} Customers • ${dashboard.source_counts.products} Products • ${dashboard.source_counts.items} Order lines` : "Loading..."}</div>
          <div className="pt-2">
            <span className="text-[9px] bg-[#0A0A0A] text-amber-500 px-2 py-0.5 rounded-none border border-amber-900/40 uppercase tracking-wider font-mono font-bold">
              Raw Staging Staged
            </span>
          </div>
        </div>

        {/* Transition Progress Animation Arrow */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="text-[10px] uppercase text-zinc-500 tracking-[0.15em] font-mono">
            ETL Ingress Status
          </div>
          
          <div className="w-full flex items-center justify-center gap-2 text-zinc-350 text-[10.5px] font-mono font-bold bg-[#141414] px-3 py-1.5 rounded-none border border-[#262626]">
            {status === "idle" && <span className="text-zinc-500 uppercase">STANDBY FOR TRIGGER</span>}
            {status === "extracting" && (
              <span className="text-[#D4AF37] flex items-center gap-1.5 uppercase">
                <SpinnerIcon /> EXTRACTING RAW METRICS...
              </span>
            )}
            {status === "transforming" && (
              <span className="text-[#D4AF37] flex items-center gap-1.5 uppercase">
                <SpinnerIcon /> TRANSFORMING DIM SCHEMA...
              </span>
            )}
            {status === "loading" && (
              <span className="text-amber-500 flex items-center gap-1.5 uppercase">
                <SpinnerIcon /> LOADING FACT STREAMS...
              </span>
            )}
            {status === "completed" && (
              <span className="text-emerald-500 flex items-center gap-1.5 uppercase font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> PIPELINE SYNCHRONIZED
              </span>
            )}
          </div>

          <div className="w-full bg-[#1A1A1A] rounded-none h-1.5 overflow-hidden relative">
            <div
              className={`h-full transition-all duration-300 ${
                status === "completed"
                  ? "bg-emerald-500"
                  : "bg-[#D4AF37]"
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">{progress}% COMPLETED</div>
        </div>

        {/* Target Warehouse DB Box */}
        <div className="bg-[#141414] p-4 rounded-none border border-[#262626] text-center space-y-2 relative">
          <div className="mx-auto w-10 h-10 bg-[#0F0F0F] border border-[#262626] text-[#D4AF37] rounded-none flex items-center justify-center">
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div className="font-serif italic text-sm text-[#E0E0E0]">Star Schema (dbo.dim_* / fact_sales)</div>
          <div className="text-[10px] text-zinc-500 font-mono">
            {isEtlDone && dashboard?.lastEtl ? `3 Dimensions • ${dashboard.lastEtl.rowsLoaded} Fact Rows` : "0 Dimensions • Empty Facts"}
          </div>
          <div className="pt-2">
            <span className={`text-[9px] px-2 py-0.5 rounded-none border uppercase tracking-wider font-mono font-bold ${
              isEtlDone ? "bg-[#0A0A0A] text-[#D4AF37] border-[#D4AF37]/45" : "bg-[#0A0A0A] text-zinc-650 border-[#262626]"
            }`}>
              {isEtlDone ? "Active & Analyzable" : "WAITING FOR PIPELINE"}
            </span>
          </div>
        </div>
      </div>

      {/* ETL step log returned by the server */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
            <Activity className="w-4 h-4 text-[#D4AF37]" />
            ETL Execution Log (SQL Server)
          </span>
          <span className="font-mono text-[10px] text-zinc-600">SQL SERVER • SalesDW</span>
        </div>

        <div
          ref={logContainerRef}
          className="bg-[#0A0A0A] p-4 rounded-none border border-[#262626] font-mono text-xs text-zinc-350 space-y-1.5 h-[170px] overflow-y-auto"
        >
          {logs.length === 0 ? (
            <div className="text-zinc-650 flex flex-col items-center justify-center h-full space-y-1">
              <span className="text-[10px] tracking-widest uppercase text-zinc-600">-- SYSTEM QUIET --</span>
              <span className="text-[10.5px]">Click "Run ETL" above to load the Star Schema from the source tables.</span>
            </div>
          ) : (
            logs.map((log, index) => {
              let textClass = "text-zinc-300";
              if (log.includes("EXTRACT")) textClass = "text-amber-500";
              else if (log.includes("TRANSFORM")) textClass = "text-[#D4AF37]";
              else if (log.includes("LOAD")) textClass = "text-zinc-400";
              else if (log.includes("Success") || log.includes("เสร็จสมบูรณ์") || log.includes("TARGET")) textClass = "text-emerald-400 font-bold";

              return (
                <div key={index} className={`flex items-start gap-1 leading-relaxed ${textClass}`}>
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-zinc-600" />
                  <span>{log}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin h-3 w-3 text-current" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
