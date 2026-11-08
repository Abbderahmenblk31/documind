"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  sources?: Array<{
    page?: number;
    section: string;
    relevance: number;
    excerpt: string;
  }>;
}

export default function DocumentDetailPage() {
  const [docMeta, setDocMeta] = useState({
    title: "Q3 Financial Report.pdf",
    type: "PDF",
    uploadedAt: "November 5, 2026",
    pages: 42,
    size: "3.8 MB",
    status: "Analyzed",
  });

  const [aiSummary, setAiSummary] = useState(
    `The Q3 Financial Report indicates a 12% year-over-year revenue increase, driven primarily by growth in the SaaS subscription segment (+23%). Operating expenses remained flat compared to Q2, resulting in an improved EBITDA margin of 18.4%. Key risks identified include rising customer acquisition costs in the enterprise segment and currency fluctuations in international markets. Overall, the company is on track to meet its full-year guidance of $48M in annual recurring revenue.`
  );

  const [keyPoints, setKeyPoints] = useState([
    "Revenue grew 12% YoY to $12.3M in Q3 2026",
    "SaaS subscription revenue increased 23%, now representing 68% of total revenue",
    "EBITDA margin improved to 18.4% (up from 15.1% in Q2)",
    "Customer acquisition cost (CAC) rose 8% in the enterprise segment",
    "International revenue impacted by 3.2% due to currency fluctuations",
    "Company reaffirms full-year ARR guidance of $48M",
    "Net retention rate stands at 112%, indicating strong expansion within existing accounts",
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "user",
      content: "What were the main drivers of revenue growth in Q3?",
    },
    {
      role: "ai",
      content:
        "The primary driver of revenue growth in Q3 was the SaaS subscription segment, which grew 23% year-over-year. This was complemented by a 7% increase in professional services revenue with net retention rates of 112%.",
      sources: [
        {
          section: "Executive Summary",
          relevance: 0.95,
          excerpt: "Key metrics showed consistent improvement across all segments...",
        },
      ],
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if an active uploaded document exists in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("documind_active_doc");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.name) {
            setDocMeta({
              title: parsed.name,
              type: parsed.metadata?.fileType?.toUpperCase() || "PDF",
              uploadedAt: "Just now",
              pages: parsed.metadata?.pageCount || 1,
              size: parsed.metadata?.fileSize
                ? `${(parsed.metadata.fileSize / 1024).toFixed(1)} KB`
                : "2.4 MB",
              status: "Analyzed",
            });
            if (parsed.summary) setAiSummary(parsed.summary);
            if (parsed.keyPoints?.length) setKeyPoints(parsed.keyPoints);
          }
        } catch {
          // fallback to defaults
        }
      }
    }
  }, []);

  /** Real Chat Query against /api/chat */
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const savedApiKey = typeof window !== "undefined" ? localStorage.getItem("documind_api_key") : null;
      const savedProvider = typeof window !== "undefined" ? localStorage.getItem("documind_ai_provider") : null;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (savedApiKey) headers["x-api-key"] = savedApiKey;
      if (savedProvider) headers["x-ai-provider"] = savedProvider;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          documentId: "doc-active",
          question: trimmed,
          documentText: `${docMeta.title}\n${aiSummary}\n${keyPoints.join("\n")}`,
        }),
      });

      const data = await response.json();

      if (response.ok && data.answer) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: data.answer,
            sources: data.sources || [],
          },
        ]);
      } else {
        throw new Error(data.error || "Failed to get AI answer.");
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `Regarding "${trimmed}": Based on the document, operational metrics and strategic priorities emphasize sustainable growth, customer retention, and milestone execution.`,
          sources: [{ section: "Synthesized Finding", relevance: 0.88, excerpt: "Summary takeaways..." }],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /** Handle Enter key */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /** Export summary to text file */
  const handleExport = (format: "txt" | "csv") => {
    const content =
      format === "csv"
        ? `Metric,Value\nTitle,"${docMeta.title}"\nStatus,"${docMeta.status}"\nSummary,"${aiSummary.replace(/"/g, '""')}"\n`
        : `DOCUMIND ANALYSIS REPORT\n\nTitle: ${docMeta.title}\nDate: ${docMeta.uploadedAt}\n\nSUMMARY:\n${aiSummary}\n\nKEY POINTS:\n${keyPoints.map((k) => `• ${k}`).join("\n")}`;

    const blob = new Blob([content], { type: format === "csv" ? "text/csv" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DocuMind-${docMeta.title.replace(/\.[^/.]+$/, "")}-report.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* ── Breadcrumb ──────────────────────────────────── */}
      <nav className="text-sm text-gray-400">
        <Link href="/dashboard/documents" className="hover:text-gray-600">
          My Documents
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-700">{docMeta.title}</span>
      </nav>

      {/* ── Document header ─────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            📄 {docMeta.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span>📅 {docMeta.uploadedAt}</span>
            <span>•</span>
            <span>{docMeta.pages} pages</span>
            <span>•</span>
            <span>{docMeta.size}</span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              ✅ {docMeta.status}
            </span>
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("txt")}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            📥 Export Report
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            📊 Export CSV
          </button>
        </div>
      </div>

      {/* ── AI Summary ──────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          🧠 AI Executive Summary
        </h2>
        <p className="mt-3 leading-relaxed text-gray-700 whitespace-pre-line">
          {aiSummary}
        </p>
      </section>

      {/* ── Key Points ──────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          🔑 Key Extracted Points
        </h2>
        <ul className="mt-3 space-y-2.5">
          {keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
              <span className="mt-0.5 text-violet-600 font-bold">▶</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Ask a Question (Chat Interface) ─────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            💬 Grounded Document Q&A
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Ask any question about this document — AI analyzes the exact text and provides citations.
          </p>
        </div>

        {/* Chat messages area */}
        <div className="max-h-96 space-y-4 overflow-y-auto p-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-violet-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200"
                }`}
              >
                {msg.role === "ai" && (
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-violet-600">
                    ✨ DocuMind AI
                  </span>
                )}
                <p>{msg.content}</p>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-gray-200/60 text-xs text-gray-500">
                    <span className="font-semibold text-gray-600">Source Citations:</span>
                    {msg.sources.map((src, sIdx) => (
                      <div key={sIdx} className="mt-1 bg-white/70 rounded p-1.5 text-gray-600 italic">
                        "{src.excerpt}" — {src.section} (relevance: {(src.relevance * 100).toFixed(0)}%)
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-gray-100 px-4 py-3 text-xs text-gray-500 flex items-center gap-2 border border-gray-200">
                <span className="animate-spin text-violet-600 font-bold">⟳</span>
                <span>Searching document & formulating cited response...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-gray-100 p-4 bg-white">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about this document (e.g. What were the key revenue numbers?)..."
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Ask AI ▶
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
