import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, User, AlertCircle, RefreshCw } from "lucide-react";
import { ChatMessage } from "../types";
import { api } from "../api";

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
  const [offline, setOffline] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.health().then((h) => setOffline(h.assistant === "offline")).catch(() => undefined);
  }, []);

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
            return <strong key={pIdx} className="text-accent font-display font-semibold font-bold">{part}</strong>;
          }
          return part;
        });
      }

      // Bullets detection
      if (line.trim().startsWith("-") || line.trim().startsWith("* ")) {
        const listText = line.trim().substring(1).trim();
        return (
          <div key={idx} className="flex items-start gap-1 pb-1 pl-2 text-xs leading-relaxed text-ink">
            <span className="text-accent font-bold shrink-0">•</span>
            <span>{formattedLine}</span>
          </div>
        );
      }

      // Table query code highlighting or inline tags
      if (line.trim().startsWith("SELECT") || line.trim().startsWith("INSERT") || line.trim().startsWith("CREATE TABLE")) {
        return (
          <pre key={idx} className="bg-subtle p-3 rounded-xl border border-line font-mono text-[10px] text-amber-700 overflow-x-auto my-1 whitespace-pre leading-relaxed">
            {line}
          </pre>
        );
      }

      return (
        <p key={idx} className="pb-1 text-xs text-ink leading-relaxed font-sans">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="bg-surface p-5 rounded-xl border border-line flex flex-col h-[520px]">
      {/* Box Header */}
      <div className="border-b border-line pb-3 mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-mono font-bold text-ink flex items-center gap-1.5 uppercase tracking-[0.08em]">
            <Sparkles className="text-accent w-4 h-4 animate-bounce" />
            AI Warehouse Assistant (Gemini Co-Pilot)
          </h3>
          <p className="text-[11px] text-muted mt-0.5">
            Optimize PHP-MySQL scripts, debug PDO connection blocks, or understand analytics modelling.
          </p>
        </div>
        <span className="text-[9px] bg-subtle text-accent border border-line px-2 py-0.5 rounded-xl font-mono font-bold uppercase tracking-wider">
          {offline ? "Offline Answers" : "Online Assistant"}
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
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
              m.role === "user" 
                ? "bg-surface border-line text-ink" 
                : "bg-subtle border-line text-accent"
            }`}>
              {m.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] rounded-xl p-3.5 ${
              m.role === "user"
                ? "bg-line text-ink border border-line-strong"
                : "bg-subtle text-ink border border-line font-sans"
            }`}>
              <div className="space-y-1">
                {renderMessageContent(m.content)}
              </div>
              <div className={`text-[9px] mt-2 font-mono text-faint ${m.role === "user" ? "text-right" : ""}`}>
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-subtle border border-line text-accent flex items-center justify-center shrink-0 animate-spin">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="bg-subtle p-3 rounded-xl text-[11px] text-muted border border-line">
              Consulting data schemas and building engineering response...
            </div>
          </div>
        )}

        {errorText && (
          <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl flex items-start gap-2 text-xs text-red-700 leading-relaxed font-mono">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
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
          className="flex-1 bg-subtle text-ink border border-line rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-accent transition-colors placeholder:text-faint"
        />
        <button
          id="btn-send-chat"
          type="submit"
          disabled={isLoading || !userInput.trim()}
          className={`p-3 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer ${
            isLoading || !userInput.trim()
              ? "bg-surface text-faint border border-line cursor-not-allowed"
              : "bg-accent hover:bg-accent-strong text-white hover:scale-102"
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
