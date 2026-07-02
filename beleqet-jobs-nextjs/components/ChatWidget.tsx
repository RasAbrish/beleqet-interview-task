"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const GREETING: Message = {
  role: "assistant",
  content: "Hi 👋 I’m the Beleqet Assistant. How can I help you today?",
};

const SUGGESTIONS = ["How do I apply for a job?", "How do I post a vacancy?", "Find remote jobs"];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function sendText(text: string) {
    const clean = text.trim();
    if (!clean || loading) return;

    const next: Message[] = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-12) }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "Sorry, something went wrong." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I couldn’t reach the assistant. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  const showSuggestions = messages.length === 1 && !loading;

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brandGreen to-darkGreen text-white shadow-[0_10px_30px_-8px_rgba(0,101,59,0.6)] ring-4 ring-brandGreen/10 hover:scale-105 active:scale-95 transition-transform duration-200"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      <div
        className={`fixed bottom-24 right-5 z-50 flex h-[72vh] max-h-[560px] w-[92vw] max-w-[380px] flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_24px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-300 ease-out ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-brandGreen to-darkGreen px-5 py-4 text-white">
          <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Beleqet Assistant</p>
              <p className="flex items-center gap-1.5 text-[11px] text-white/80">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" /> Online now
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="ml-auto rounded-full p-1.5 text-white/80 hover:bg-white/15 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-pageBg to-white px-4 py-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brandGreen/10 text-brandGreen">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
              )}
              <div
                className={`max-w-[78%] px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "rounded-2xl rounded-br-md bg-gradient-to-br from-brandGreen to-darkGreen text-white"
                    : "rounded-2xl rounded-bl-md border border-border bg-white text-ink"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-end gap-2">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brandGreen/10 text-brandGreen">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-white px-4 py-3.5">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted/60"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {showSuggestions && (
            <div className="flex flex-wrap gap-2 pt-1 pl-9">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendText(s)}
                  className="rounded-full border border-brandGreen/30 bg-white px-3 py-1.5 text-xs font-medium text-brandGreen hover:bg-brandGreen/5 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendText(input);
          }}
          className="flex items-center gap-2 border-t border-border bg-white p-3"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message…"
            className="w-full rounded-full bg-pageBg px-4 py-2.5 text-sm text-ink placeholder:text-muted outline-none ring-1 ring-transparent focus:ring-brandGreen/30"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brandGreen to-darkGreen text-white shadow-sm hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:hover:scale-100"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  );
}
