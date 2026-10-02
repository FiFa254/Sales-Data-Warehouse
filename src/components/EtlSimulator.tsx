import React, { useState, useEffect, useRef } from "react";
import { api, Dashboard, EtlResult } from "../api";
import { Play, Server, ArrowRight, Check, ChevronRight, Activity, Database } from "lucide-react";

type EtlStatus = "idle" | "extracting" | "transforming" | "loading" | "completed";

interface EtlSimulatorProps {
  onEtlComplete: (success: boolean) => void;
  isEtlDone: boolean;
  dashboard: Dashboard | null;
}

export default function EtlSimulator({ onEtlComplete, isEtlDone, dashboard }: EtlSimulatorProps) {
  const [status, setStatus] = useState<EtlStatus>(
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
  }, [logs]);

  const handleStartETL = async () => {
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

  const running = status !== "idle" && status !== "completed";
  const activeIndex = PHASE_INDEX[status];

  const phaseState = (index: number): StepState => {
    if (status === "completed" || (activeIndex !== undefined && index < activeIndex)) return "done";
    return index === activeIndex ? "active" : "pending";
  };

  return (
    <section className="rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)] p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
            <Server className="w-4 h-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold text-ink">ETL pipeline</h2>
            <p className="text-sm text-muted mt-0.5">
              A real extract, transform and load in SQL Server: source tables (schema oltp) into the star schema (dim_* and fact_sales).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleStartETL}
          disabled={running}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent hover:bg-accent-strong disabled:bg-line disabled:text-faint disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 shrink-0 transition-colors cursor-pointer"
        >
          {running ? <SpinnerIcon /> : <Play className="w-4 h-4 fill-current" aria-hidden="true" />}
          Run ETL
        </button>
      </div>

      <ol className="grid grid-cols-3 gap-2" aria-label="ETL phases">
        {PHASES.map((phase, index) => {
          const state = phaseState(index);
          return (
            <li key={phase.label} className="flex flex-col gap-2">
              <div className={`h-1.5 rounded-full ${state === "pending" ? "bg-line" : "bg-accent"}`} />
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${STEP_BADGE[state]}`}>
                  {state === "done" ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : index + 1}
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${state === "pending" ? "text-muted" : "text-ink"}`}>{phase.label}</p>
                  <p className="text-xs text-muted truncate">{phase.detail}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
        <div className="rounded-2xl bg-subtle p-4 flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-surface text-accent flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">Source tables</p>
            <p className="text-xs text-muted font-mono">oltp.*</p>
            <p className="text-sm text-muted mt-1">
              {dashboard
                ? `${dashboard.source_counts.customers} customers · ${dashboard.source_counts.products} products · ${dashboard.source_counts.items} order lines`
                : "Loading…"}
            </p>
          </div>
        </div>

        <div className="flex md:flex-col items-center justify-center gap-2 px-2">
          <ArrowRight className="w-5 h-5 text-faint rotate-90 md:rotate-0" aria-hidden="true" />
        </div>

        <div className="rounded-2xl bg-subtle p-4 flex items-start gap-3">
          <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isEtlDone ? "bg-accent text-white" : "bg-surface text-faint"}`}>
            <Database className="w-5 h-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">Star schema</p>
            <p className="text-xs text-muted font-mono">dbo.dim_* · dbo.fact_sales</p>
            <p className="text-sm text-muted mt-1">
              {isEtlDone && dashboard?.lastEtl ? `3 dimensions · ${dashboard.lastEtl.rowsLoaded} fact rows` : "Empty until the first ETL run"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink">{STATUS_LABEL[status]}</span>
          <span className="text-muted tabular-nums">{progress}%</span>
        </div>
        <div
          role="progressbar"
          aria-label="ETL progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-2 w-full rounded-full bg-line overflow-hidden"
        >
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${status === "completed" ? "bg-emerald-500" : "bg-accent"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Activity className="w-4 h-4 text-accent" aria-hidden="true" />
            Execution log
          </h3>
          <span className="text-xs text-muted">SQL Server · SalesDW</span>
        </div>

        <div
          ref={logContainerRef}
          role="log"
          aria-live="polite"
          className="rounded-2xl bg-subtle p-4 font-mono text-xs text-ink space-y-1.5 h-[180px] overflow-y-auto custom-scrollbar"
        >
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-sm text-muted font-sans">
              Click "Run ETL" to load the star schema from the source tables.
            </div>
          ) : (
            logs.map((log, index) => {
              const tag = LOG_TAGS.find((item) => log.includes(item.match));
              return (
                <div key={index} className="flex items-start gap-2 leading-relaxed">
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-faint" aria-hidden="true" />
                  <span className={tag?.className ?? "text-ink"}>{log}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

const PHASES = [
  { label: "Extract", detail: "Read source order lines" },
  { label: "Transform", detail: "Build dimensions and tiers" },
  { label: "Load", detail: "Write fact_sales" }
];

const PHASE_INDEX: Partial<Record<EtlStatus, number>> = { extracting: 0, transforming: 1, loading: 2 };

type StepState = "done" | "active" | "pending";

const STEP_BADGE: Record<StepState, string> = {
  done: "bg-accent text-white",
  active: "bg-accent-soft text-accent ring-2 ring-accent",
  pending: "bg-subtle text-faint"
};

const STATUS_LABEL: Record<EtlStatus, string> = {
  idle: "Ready to run",
  extracting: "Extracting source rows…",
  transforming: "Transforming dimensions…",
  loading: "Loading fact rows…",
  completed: "Pipeline complete"
};

const LOG_TAGS = [
  { match: "[Extract]", className: "text-amber-800" },
  { match: "[Transform]", className: "text-accent" },
  { match: "[Load]", className: "text-emerald-800" },
  { match: "ERROR", className: "text-red-700 font-semibold" },
  { match: "Done:", className: "text-emerald-800 font-semibold" }
];

function SpinnerIcon() {
  return (
    <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
