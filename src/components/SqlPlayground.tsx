import React, { useState } from "react";
import { Play, Database, Terminal, CheckCircle2, AlertCircle, Info, Copy, Check } from "lucide-react";
import { SqlQuery } from "../types";
import { sampleQueries } from "../data";

interface SqlPlaygroundProps {
  isEtlDone: boolean;
}

export default function SqlPlayground({ isEtlDone }: SqlPlaygroundProps) {
  const [selectedQueryId, setSelectedQueryId] = useState<string>("q1");
  const [customSql, setCustomSql] = useState<string>(sampleQueries[0].sql);
  const [copied, setCopied] = useState(false);
  const [queryResult, setQueryResult] = useState<{
    headers: string[];
    rows: any[];
    executionTimeMs: number;
    rowCount: number;
  } | null>(null);
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

  // Simulate SQL query responses
  const handleExecuteSql = () => {
    setErrorText(null);
    
    if (!isEtlDone) {
      setErrorText("❌ [ERROR 1146 (42S02)] Table 'sales_data_warehouse.fact_sales' does not exist. Please trigger the ETL data warehouse mappings (execute the ETL Pipeline in the simulator panel first) to compile target analytics schemas!");
      setQueryResult(null);
      return;
    }

    let headers: string[] = [];
    let rows: any[] = [];
    let executionTimeMs = 2.45; // Simulated ultra-fast index query

    // Match simulated query output
    if (selectedQueryId === "q1") {
      headers = ["Total_Sales_Count", "Total_Items_Sold", "Total_Revenue", "Total_Cost", "Total_Profit", "Profit_Margin_Percent"];
      rows = [[30, 37, "$304,800.00", "$215,200.00", "$89,600.00", "29.40 %"]];
      executionTimeMs = 1.12;
    } else if (selectedQueryId === "q2") {
      headers = ["Year", "Month", "Revenue", "Profit (Net Margin)"];
      rows = [
        [2026, "January", "$44,700.00", "$13,600.00"],
        [2026, "February", "$14,800.00", "$4,400.00"],
        [2026, "March", "$45,800.00", "$12,700.00"],
        [2026, "April", "$53,300.00", "$15,800.00"],
        [2026, "May", "$57,000.00", "$16,000.00"],
        [2026, "June", "$89,200.00", "$27,100.00"]
      ];
      executionTimeMs = 2.11;
    } else if (selectedQueryId === "q3") {
      headers = ["Customer_Tier", "Total_Customers", "Total_Spending", "Average_Order_Value", "Total_Purchased_Items"];
      rows = [
        ["Platinum (Spend ≥ $30K)", 1, "$64,150.00", "$16,037.50", 6],
        ["Gold (Spend ≥ $15K)", 4, "$151,350.00", "$12,612.50", 15],
        ["Silver (Spend ≥ $5K)", 3, "$66,950.00", "$11,158.33", 8],
        ["Standard (Spend < $5K)", 2, "$22,350.00", "$7,450.00", 8]
      ];
      executionTimeMs = 1.84;
    } else if (selectedQueryId === "q4") {
      headers = ["Product_Name", "Category", "Quantity_Sold", "Total_Revenue", "Total_Profit"];
      rows = [
        ["Smart TV 55\"", "Electronics", 7, "$129,500.00", "$35,000.00"],
        ["Standing Desk", "Furniture", 4, "$50,000.00", "$14,000.00"],
        ["Air Purifier", "Home Appliance", 4, "$35,600.00", "$11,200.00"],
        ["Ergonomic Office Chair", "Furniture", 5, "$34,500.00", "$8,500.00"],
        ["Vacuum Cleaner", "Home Appliance", 4, "$23,600.50", "$7,600.00"]
      ];
      executionTimeMs = 1.63;
    } else {
      headers = ["Province", "Revenue", "Profit", "Active_Customers"];
      rows = [
        ["Bangkok", "$111,100.00", "$31,800.00", 3],
        ["Chiang Mai", "$51,300.00", "$15,400.00", 3],
        ["Chonburi", "$29,900.00", "$8,400.00", 2],
        ["Phuket", "$17,800.00", "$5,600.00", 1],
        ["Khon Kaen", "$16,400.00", "$5,200.00", 1]
      ];
      executionTimeMs = 1.45;
    }

    setQueryResult({
      headers,
      rows,
      executionTimeMs,
      rowCount: rows.length
    });
  };

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
            Choose a pre-constructed high-value SQL query built to analyze the MySQL Star Schema.
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
                <span className="text-[10px] font-mono text-zinc-500 font-bold">MySQL</span>
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
            Utilizing a date lookup dimension table **(dim_time)** accelerates sales series grouping 3x over runtime MySQL datetime parsing. It eliminates calculation complexity on each matched row block.
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
              <span className="text-xs font-bold text-zinc-300 font-mono">SQL Console: OLAP Connection</span>
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
                className="bg-[#D4AF37] hover:bg-[#F5D061] text-[#0A0A0A] px-3.5 py-1.5 rounded-none text-[11px] tracking-widest uppercase font-mono font-bold flex items-center gap-1.5 hover:scale-102 transition-all duration-150 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Run Query
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 font-mono text-xs text-zinc-300 leading-relaxed min-h-[160px] max-h-[220px] overflow-y-auto whitespace-pre-wrap bg-[#0A0A0A]">
            {customSql}
          </div>
        </div>

        {/* Console Outputs / Query Result Table */}
        <div className="bg-[#0A0A0A] rounded-none border border-[#262626] p-4 min-h-[180px] flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-[#262626] flex justify-between items-center">
              <span className="font-mono">Result Matrix (Interactive Table)</span>
              {queryResult && (
                <span className="font-mono text-[10.5px] text-[#D4AF37] flex items-center gap-1 pr-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Execution: {queryResult.executionTimeMs} ms • {queryResult.rowCount} rows returned
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
                          <td key={colIdx} className="py-2.5 px-3 text-zinc-300">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-10 text-zinc-500 text-xs flex flex-col items-center justify-center space-y-1">
                  <span>- Query Result Empty -</span>
                  <span className="text-[11px] text-[#D4AF37]">Click "Run Query" above to trigger and view simulated relational data outputs.</span>
                </div>
              )}
            </div>
          </div>

          {/* Analysis feedback explanation */}
          {queryResult && !errorText && (
            <div className="bg-[#141414] border border-[#262626] p-3 rounded-none text-[11px] text-zinc-400 flex items-start gap-2 mt-4 leading-relaxed">
              <span className="bg-[#D4AF37] text-[#0A0A0A] text-[9px] px-1.5 py-0.5 font-bold uppercase rounded-none mt-0.5 font-mono">INSIGHT</span>
              <div>
                <strong className="text-zinc-200">Result Summary: </strong>
                {selectedQueryId === "q1" && "The analytical warehouse indexes a high-performing gross profit margin of 29.40% driven by efficient electronics and home appliance volume items."}
                {selectedQueryId === "q2" && "Sells indices show a robust incremental monthly upward growth trend peaking in June ($89,200.00), suggesting customer retention is accelerating."}
                {selectedQueryId === "q3" && "High-value Gold and Platinum tiers generate over 70% of total revenue streams ($215,500.00 combined). Suggests establishing targeted campaign loyalty cohorts."}
                {selectedQueryId === "q4" && "Smart TV 55\" leads total commodity margins, with 7 units bringing $129,500.00 gross revenues & $35,000.00 net利润 contribution."}
                {selectedQueryId === "q5" && "Bangkok is the major regional revenue generator ($111,100.00), shortly followed by Chiang Mai ($51,300.00), demonstrating strong centralized metropolitan demand."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
