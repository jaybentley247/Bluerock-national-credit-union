"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import { MessageCircle, X, Send } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "bot" | "admin";
  body: string;
  created_at: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [seenCount, setSeenCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = () => {
    api.get("/chat/messages").then((r) => setMessages(r.data)).catch(() => {});
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) setSeenCount(messages.length);
  }, [open, messages.length]);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const unread = !open ? Math.max(0, messages.length - seenCount) : 0;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || isSending) return;
    setIsSending(true);
    setDraft("");
    try {
      const { data } = await api.post("/chat/messages", { body });
      setMessages((prev) => [...prev, ...data]);
    } catch {
      // silent — the periodic poll will recover state
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40">
      {open && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-96 h-[28rem] bg-[#10102a] border border-white/[0.1] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-[#0E3DAA] px-4 py-3 flex items-center justify-between shrink-0">
            <div>
              <p className="text-white font-bold text-sm">Live Member Chat</p>
              <p className="text-red-100 text-xs">Our team usually replies almost instantly</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-slate-500 text-sm text-center mt-8">
                Send us a message below and our assistant will reply right away — we're genuinely happy to help.
              </p>
            )}
            {messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      isUser
                        ? "bg-[#0E3DAA] text-white rounded-br-sm"
                        : m.sender === "admin"
                        ? "bg-green-900/40 border border-green-700/30 text-green-100 rounded-bl-sm"
                        : "bg-white/[0.07] text-slate-200 rounded-bl-sm"
                    }`}
                  >
                    {m.sender !== "user" && (
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60">
                        {m.sender === "admin" ? "Advisor" : "Assistant"}
                      </p>
                    )}
                    {m.body}
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-white/[0.07] flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 bg-white/[0.05] border border-white/[0.1] text-white text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-red-500 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={isSending || !draft.trim()}
              className="bg-[#0E3DAA] hover:bg-red-800 disabled:opacity-40 text-white rounded-xl p-2.5 transition shrink-0"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-14 h-14 rounded-full bg-[#0E3DAA] hover:bg-red-800 shadow-2xl shadow-black/40 flex items-center justify-center text-white transition"
        aria-label="Live chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 border-2 border-[#0d0d1a]">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}
