import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, User, AlertCircle, RefreshCw } from "lucide-react";
import { ChatMessage } from "../types";

export default function WebChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      content: "Hello there! Welcome to the Sales Data Warehouse learning platform and PHP + MySQL schema builder. 🚀\n\nI am your Data Engineering Co-Pilot ready to answer all your technical questions, covering:\n- Designing clean **Star Schema** architectures (Fact and Dimension models)\n- Writing automated **ETL (Extract, Transform, Load)** pipelines with PHP scripts\n- Formulating complex SQL queries for buyer analytics (**RFM Spending Tiers** or regional grouping performance)\n- Debugging MySQL database connections or raw PDO instance configurations\n\nAsk me anything below to begin your training sessions!",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMsg = userInput.trim();
    setUserInput("");
    setErrorText(null);

    const newMessages: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        content: userMsg,
        timestamp: new Date().toLocaleTimeString()
      }
    ];

    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Map frontend history to raw REST schema
      const history = messages.slice(1).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history })
      });

      if (!res.ok) {
        throw new Error("Server responded with an unexpected error. Network timeout occurred.");
      }

      const data = await res.json();
      
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: data.text || "Apologies, I could not retrieve an AI text response.",
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorText("Unable to connect to the Gemini AI server at this moment. You can still continue reviewing sample schemas and download production-ready code outputs from the menus!");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper parser to render bold, list and code markdown cleanly inside chat bubbles without external markdown libraries
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Detect Code block lines
      if (line.startsWith("```")) {
        return null; // Skip markdown backticks to keep it clean
      }
      
      // Inline block code or inline SQL highlighting simulated detection
      let formattedLine: React.ReactNode = line;
      
      // Handle bold **text**
      if (line.includes("**")) {
        const parts = line.split("**");
        formattedLine = parts.map((part, pIdx) => {
          if (pIdx % 2 === 1) {
            return <strong key={pIdx} className="text-[#D4AF37] font-serif italic font-bold">{part}</strong>;
          }
          return part;
        });
      }

      // Bullets detection
      if (line.trim().startsWith("-") || line.trim().startsWith("* ")) {
        const listText = line.trim().substring(1).trim();
        return (
          <div key={idx} className="flex items-start gap-1 pb-1 pl-2 text-xs leading-relaxed text-zinc-300">
            <span className="text-[#D4AF37] font-bold shrink-0">•</span>
            <span>{formattedLine}</span>
          </div>
        );
      }

      // Table query code highlighting or inline tags
      if (line.trim().startsWith("SELECT") || line.trim().startsWith("INSERT") || line.trim().startsWith("CREATE TABLE")) {
        return (
          <pre key={idx} className="bg-[#0A0A0A] p-3 rounded-none border border-[#262626] font-mono text-[10px] text-amber-500 overflow-x-auto my-1 whitespace-pre leading-relaxed">
            {line}
          </pre>
        );
      }

      return (
        <p key={idx} className="pb-1 text-xs text-zinc-300 leading-relaxed font-sans">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="bg-[#141414] p-5 rounded-none border border-[#262626] flex flex-col h-[520px]">
      {/* Box Header */}
      <div className="border-b border-[#262626] pb-3 mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-[0.08em]">
            <Sparkles className="text-[#D4AF37] w-4 h-4 animate-bounce" />
            AI Warehouse Assistant (Gemini Co-Pilot)
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Optimize PHP-MySQL scripts, debug PDO connection blocks, or understand analytics modelling.
          </p>
        </div>
        <span className="text-[9px] bg-[#0A0A0A] text-[#D4AF37] border border-[#262626] px-2 py-0.5 rounded-none font-mono font-bold uppercase tracking-wider">
          Online Assistant
        </span>
      </div>

      {/* Messages Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 scrollbar-thin scrollbar-thumb-zinc-800"
      >
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            {/* Avatar block */}
            <div className={`w-8 h-8 rounded-none flex items-center justify-center shrink-0 border ${
              m.role === "user" 
                ? "bg-[#141414] border-[#262626] text-zinc-300" 
                : "bg-[#0A0A0A] border-[#262626] text-[#D4AF37]"
            }`}>
              {m.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] rounded-none p-3.5 ${
              m.role === "user"
                ? "bg-[#1C1C1C] text-zinc-100 border border-[#333333]"
                : "bg-[#0A0A0A] text-zinc-300 border border-[#262626] font-sans"
            }`}>
              <div className="space-y-1">
                {renderMessageContent(m.content)}
              </div>
              <div className={`text-[9px] mt-2 font-mono text-zinc-600 ${m.role === "user" ? "text-right" : ""}`}>
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-[#0A0A0A] border border-[#262626] text-[#D4AF37] flex items-center justify-center shrink-0 animate-spin">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="bg-[#0A0A0A] p-3 rounded-none text-[11px] text-zinc-400 border border-[#262626]">
              Consulting data schemas and building engineering response...
            </div>
          </div>
        )}

        {errorText && (
          <div className="bg-red-950/20 border border-red-950 p-3.5 rounded-none flex items-start gap-2 text-xs text-red-300 leading-relaxed font-mono">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{errorText}</span>
          </div>
        )}
      </div>

      {/* Inputs Forms */}
      <form onSubmit={handleSend} className="flex items-center gap-2 mt-auto">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask about database connections, Star Schema modeling, or PHP ETL loops..."
          disabled={isLoading}
          className="flex-1 bg-[#0A0A0A] text-zinc-100 border border-[#262626] rounded-none px-4 py-3 text-xs focus:outline-none focus:border-[#D4AF37] transition-colors placeholder:text-zinc-650"
        />
        <button
          id="btn-send-chat"
          type="submit"
          disabled={isLoading || !userInput.trim()}
          className={`p-3 rounded-none flex items-center justify-center transition-all duration-150 cursor-pointer ${
            isLoading || !userInput.trim()
              ? "bg-[#141414] text-zinc-650 border border-[#262626] cursor-not-allowed"
              : "bg-[#D4AF37] hover:bg-[#F5D061] text-[#0A0A0A] hover:scale-102"
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
