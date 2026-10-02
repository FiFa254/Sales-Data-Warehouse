import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, AlertCircle } from "lucide-react";
import { ChatMessage } from "../types";
import { api } from "../api";

export default function WebChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      content: "Hello there! Welcome to the Sales Data Warehouse learning platform and PHP + MySQL schema builder.\n\nI am your Data Engineering Co-Pilot ready to answer all your technical questions, covering:\n- Designing clean **Star Schema** architectures (Fact and Dimension models)\n- Writing automated **ETL (Extract, Transform, Load)** pipelines with PHP scripts\n- Formulating complex SQL queries for buyer analytics (**RFM Spending Tiers** or regional grouping performance)\n- Debugging MySQL database connections or raw PDO instance configurations\n\nAsk me anything below to begin your training sessions!",
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
    if (scrollRef.current && messages.length > 1) {
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
      if (line.startsWith("```")) {
        return null;
      }

      const trimmed = line.trim();
      const isBullet = trimmed.startsWith("-") || trimmed.startsWith("* ");
      const body = isBullet ? trimmed.replace(/^(-|\*)\s*/, "") : line;
      const formattedLine: React.ReactNode = body.includes("**")
        ? body.split("**").map((part, pIdx) =>
            pIdx % 2 === 1 ? <strong key={pIdx} className="font-semibold text-ink">{part}</strong> : part
          )
        : body;

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-2 pl-1 text-sm leading-relaxed text-ink">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
            <span>{formattedLine}</span>
          </div>
        );
      }

      if (trimmed.startsWith("SELECT") || trimmed.startsWith("INSERT") || trimmed.startsWith("CREATE TABLE")) {
        return (
          <pre key={idx} className="rounded-xl bg-[#14161d] text-[#e6e8ef] p-3 font-mono text-xs overflow-x-auto my-1 whitespace-pre leading-relaxed">
            {line}
          </pre>
        );
      }

      return (
        <p key={idx} className="text-sm text-ink leading-relaxed">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <section className="rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)] p-5 flex flex-col h-[600px] lg:sticky lg:top-24">
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-line">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-[#7b5cf0] text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold text-ink">Warehouse assistant</h2>
            <p className="text-sm text-muted mt-0.5">Star schema, ETL and SQL questions.</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-subtle px-2.5 py-1 text-xs font-medium text-ink shrink-0">
          <span aria-hidden="true" className={`w-2 h-2 rounded-full ${offline ? "bg-faint" : "bg-emerald-500"}`} />
          {offline ? "Offline Answers" : "Gemini"}
        </span>
      </div>

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 custom-scrollbar"
      >
        {messages.map((m, idx) =>
          m.role === "user" ? (
            <div key={idx} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-accent text-white px-4 py-3">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                <p className="text-[11px] mt-1.5 text-white/70 text-right">{m.timestamp}</p>
              </div>
            </div>
          ) : (
            <div key={idx} className="flex items-start gap-2.5">
              <span className="w-7 h-7 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
              <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-subtle px-4 py-3">
                <div className="space-y-1.5">{renderMessageContent(m.content)}</div>
                <p className="text-[11px] mt-1.5 text-faint">{m.timestamp}</p>
              </div>
            </div>
          )
        )}

        {isLoading && (
          <div className="flex items-center gap-2.5" role="status">
            <span className="w-7 h-7 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
            <div className="rounded-2xl rounded-tl-md bg-subtle px-4 py-3 flex items-center gap-1" aria-label="Assistant is typing">
              <span className="w-1.5 h-1.5 rounded-full bg-faint animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-faint animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-faint animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {errorText && (
          <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-start gap-2 text-sm text-red-800 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{errorText}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 rounded-full bg-subtle border border-transparent focus-within:border-accent p-1.5 pl-4 transition-colors">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask about database connections, Star Schema modeling, or PHP ETL loops..."
          aria-label="Message the assistant"
          disabled={isLoading}
          className="flex-1 min-w-0 bg-transparent text-ink text-sm outline-none placeholder:text-faint"
        />
        <button
          id="btn-send-chat"
          type="submit"
          aria-label="Send message"
          disabled={isLoading || !userInput.trim()}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-accent hover:bg-accent-strong text-white disabled:bg-line disabled:text-faint disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
