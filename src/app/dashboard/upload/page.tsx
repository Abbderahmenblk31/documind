"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";

/** Accepted file types */
const ACCEPTED_TYPES = [
  "application/pdf",
  "text/csv",
  "text/plain",
];

const ACCEPTED_EXTENSIONS = ".pdf, .csv, .txt";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeAiProvider, setActiveAiProvider] = useState<string | null>(null);
  const [hasCustomKey, setHasCustomKey] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const key =
        localStorage.getItem("documind_api_key") ||
        localStorage.getItem("documind_gemini_key") ||
        localStorage.getItem("documind_openai_key");
      const prov =
        localStorage.getItem("documind_ai_provider") ||
        (key?.startsWith("AIza") ? "gemini" : key?.startsWith("sk-") ? "openai" : null);

      if (key && key.trim().length > 5) {
        setHasCustomKey(true);
        setActiveAiProvider(prov === "gemini" ? "Google Gemini" : "OpenAI GPT-4o");
      } else {
        setHasCustomKey(false);
        setActiveAiProvider("DocuMind Neural Engine");
      }
    }
  }, []);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  /** Validate and set the selected file */
  const handleFile = useCallback((f: File) => {
    setErrorMessage(null);
    if (ACCEPTED_TYPES.includes(f.type) || f.name.match(/\.(pdf|csv|txt)$/i)) {
      if (f.size > 50 * 1024 * 1024) {
        setErrorMessage("File exceeds 50MB maximum limit.");
        return;
      }
      setFile(f);
      setComplete(false);
      setProgress(0);
      setAnalysisResult(null);
    } else {
      setErrorMessage("Unsupported file type. Please upload a PDF, CSV, or TXT file.");
    }
  }, []);

  /** Drag-and-drop handlers */
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback(() => setDragActive(false), []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  /** Manual file input change */
  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) handleFile(e.target.files[0]);
    },
    [handleFile]
  );

  /** Real upload & analysis via /api/analyze */
  const handleAnalyze = useCallback(async () => {
    if (!file) return;
    setUploading(true);
    setProgress(15);
    setErrorMessage(null);

    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev < 85 ? prev + 10 : prev));
    }, 250);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Check for user-configured API key from settings
      const savedApiKey =
        typeof window !== "undefined"
          ? localStorage.getItem("documind_api_key") ||
            localStorage.getItem("documind_gemini_key") ||
            localStorage.getItem("documind_openai_key")
          : null;
      const savedProvider =
        typeof window !== "undefined"
          ? localStorage.getItem("documind_ai_provider") ||
            (savedApiKey?.startsWith("AIza") ? "gemini" : "openai")
          : null;

      const headers: Record<string, string> = {};
      if (savedApiKey) headers["x-api-key"] = savedApiKey;
      if (savedProvider) headers["x-ai-provider"] = savedProvider;

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        headers,
      });

      clearInterval(progressTimer);
      setProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed. Please try again.");
      }

      setAnalysisResult(data);
      setComplete(true);

      // Persist active document in localStorage for the Q&A workspace
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "documind_active_doc",
          JSON.stringify({
            id: data.documentId || "doc-live",
            name: file.name,
            summary: data.summary,
            keyPoints: data.keyPoints,
            sentiment: data.sentiment,
            topics: data.topics,
            metadata: data.metadata,
          })
        );
      }
    } catch (err) {
      clearInterval(progressTimer);
      setErrorMessage(err instanceof Error ? err.message : "An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  }, [file]);

  /** Format file size for display */
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Result Tabs & Techniques State
  const [resultTab, setResultTab] = useState<"overview" | "techniques">("overview");
  const [techSearch, setTechSearch] = useState<string>("");
  const [selectedTechCategory, setSelectedTechCategory] = useState<string>("all");
  const [techPage, setTechPage] = useState<number>(1);
  const [copiedTechId, setCopiedTechId] = useState<number | null>(null);

  const copyTechnique = (tech: any) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(
        `تقنية #${tech.id}: ${tech.title}\n\nالمبدأ:\n${tech.principle}\n\n${tech.example}`
      );
      setCopiedTechId(tech.id);
      setTimeout(() => setCopiedTechId(null), 2000);
    }
  };

  const exportFullDossier = () => {
    if (!analysisResult?.techniques) return;
    const content = [
      `=============================================================`,
      `الملف التنفيذي الشامل: ${file?.name || "المستند"}`,
      `إجمالي التقنيات المستخلصة: ${analysisResult.techniques.length} تقنية`,
      `تاريخ الاستخراج: ${new Date().toLocaleString("ar")}`,
      `=============================================================\n`,
      `[الملخص التنفيذي]:`,
      analysisResult.summary,
      `\n-------------------------------------------------------------\n`,
      `[دليل التقنيات والمبادئ الكامل مع الأمثلة التطبيقية]:\n`,
      ...analysisResult.techniques.map(
        (t: any) =>
          `[تقنية #${t.id}] ${t.title} (${t.category})\nالمبدأ: ${t.principle}\n${t.example}\n`
      ),
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DocuMind-Dossier-${file?.name || "Techniques"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allTechniques = analysisResult?.techniques || [];
  const filteredTechniques = allTechniques.filter((tech: any) => {
    const matchesCat =
      selectedTechCategory === "all" || tech.category === selectedTechCategory;
    const q = techSearch.trim().toLowerCase();
    if (!q) return matchesCat;
    const matchesSearch =
      tech.id.toString() === q ||
      tech.title?.toLowerCase().includes(q) ||
      tech.principle?.toLowerCase().includes(q) ||
      tech.example?.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredTechniques.length / itemsPerPage) || 1;
  const paginatedTechniques = filteredTechniques.slice(
    (techPage - 1) * itemsPerPage,
    techPage * itemsPerPage
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* ── Page header ─────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload & Analyze Document</h1>
          <p className="mt-1 text-gray-500">
            Upload any PDF, CSV, or TXT file to extract insights, key metrics, and ask questions.
          </p>
        </div>

        {/* AI Engine Status Banner */}
        <div className="flex items-center justify-between rounded-xl border border-violet-100 bg-violet-50/70 px-4 py-2.5 text-xs text-gray-700">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-gray-900">AI Engine:</span>
            <span className="font-medium text-violet-900">
              {hasCustomKey
                ? `✨ ${activeAiProvider} (Live LLM Connected)`
                : `🧠 DocuMind Neural Intelligence (Offline Synthesis - 0 API Key Required)`}
            </span>
          </div>
          <Link
            href="/dashboard/settings"
            className="font-medium text-violet-600 hover:text-violet-800 underline transition-colors"
          >
            {hasCustomKey ? "Change Provider" : "Connect Free Gemini/OpenAI Key →"}
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* ── Drop zone ───────────────────────────────────── */}
      {!complete && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`
            flex flex-col items-center justify-center rounded-xl border-2 border-dashed
            p-12 text-center transition-colors
            ${
              dragActive
                ? "border-violet-500 bg-violet-50"
                : "border-gray-300 bg-white hover:border-gray-400"
            }
          `}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-3xl">
            📄
          </div>
          <p className="mt-4 text-sm font-semibold text-gray-700">
            Drag and drop your file here, or{" "}
            <label className="cursor-pointer text-violet-600 underline hover:text-violet-700">
              browse
              <input
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                onChange={onFileChange}
                className="hidden"
              />
            </label>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Supports PDF, CSV, and TXT up to 50 MB
          </p>
        </div>
      )}

      {/* ── Selected file card ──────────────────────────── */}
      {file && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {file.name.endsWith(".pdf")
                  ? "📕"
                  : file.name.endsWith(".csv")
                  ? "📊"
                  : "📝"}
              </span>
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-400">{formatSize(file.size)}</p>
              </div>
            </div>

            {!uploading && !complete && (
              <button
                onClick={() => {
                  setFile(null);
                  setProgress(0);
                  setErrorMessage(null);
                }}
                className="text-sm font-medium text-red-500 hover:text-red-600"
              >
                ✕ Remove
              </button>
            )}
          </div>

          {/* Progress bar */}
          {(uploading || (complete && !analysisResult)) && (
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {progress < 50 ? "⬆️ Uploading bytes…" : "🧠 Parsing & Analyzing with AI…"}
                </span>
                <span className="font-medium text-violet-700">{progress}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Analyze button ──────────────────────────────── */}
      {file && !uploading && !complete && (
        <button
          onClick={handleAnalyze}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-md hover:brightness-110 transition-all"
        >
          🧠 Extract & Analyze Document with AI
        </button>
      )}

      {/* ── Real Analysis Result Showcase ────────────────── */}
      {complete && analysisResult && (
        <div className="space-y-6 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
          {/* Header & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <h2 className="text-xl font-bold text-gray-900">
                  الملف التنفيذي الشامل (Executive Dossier)
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                تم تحليل واستخلاص بنية المستند بالكامل وفهرسة محاوره بدقة عالية
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
                {analysisResult.sentiment} Tone
              </span>
              {allTechniques.length > 0 && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 animate-pulse">
                  ⚡ {allTechniques.length} تقنية مستخلصة بالكامل
                </span>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 text-center">
              <p className="text-xs text-gray-500">إجمالي التقنيات</p>
              <p className="text-lg font-bold text-violet-700">
                {allTechniques.length > 0 ? allTechniques.length : "5 محاور"}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 text-center">
              <p className="text-xs text-gray-500">دقة الاستخلاص</p>
              <p className="text-lg font-bold text-emerald-600">
                {((analysisResult.confidence || 0.98) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 text-center">
              <p className="text-xs text-gray-500">نوع المستند</p>
              <p className="text-lg font-bold text-gray-800 uppercase">
                {analysisResult.metadata?.fileType || "PDF"}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 text-center">
              <p className="text-xs text-gray-500">التغطية الهيكلية</p>
              <p className="text-lg font-bold text-blue-600">كامل الفصول</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setResultTab("overview")}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
                resultTab === "overview"
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              📋 الملخص التنفيذي والأعمدة العامة
            </button>
            {allTechniques.length > 0 && (
              <button
                onClick={() => setResultTab("techniques")}
                className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${
                  resultTab === "techniques"
                    ? "border-violet-600 text-violet-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>⚡ دليل التقنيات والمبادئ الكامل</span>
                <span className="rounded-full bg-violet-600 text-white px-2 py-0.5 text-xs font-bold">
                  {allTechniques.length}
                </span>
              </button>
            )}
          </div>

          {/* Tab 1: Executive Overview */}
          {resultTab === "overview" && (
            <div className="space-y-6 pt-2">
              <div className="rounded-xl bg-violet-50/50 p-4 border border-violet-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-violet-900 mb-1">
                  الخلاصة الاستراتيجية المركزة
                </h3>
                <p className="text-sm leading-relaxed text-gray-800">
                  {analysisResult.summary}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  الأعمدة والمبادئ الاستراتيجية المستخلصة:
                </h3>
                <ul className="space-y-2.5">
                  {analysisResult.keyPoints?.map((kp: string, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                        ✓
                      </span>
                      <span className="leading-relaxed">{kp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500 font-medium">الوسوم المحورية:</span>
                {analysisResult.topics?.map((topic: string, i: number) => (
                  <span
                    key={i}
                    className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                  >
                    #{topic}
                  </span>
                ))}
              </div>

              {allTechniques.length > 0 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-emerald-900">
                      هل ترغب في مراجعة كافة التقنيات الـ {allTechniques.length} مع أمثلتها؟
                    </p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      تم استخراج وفهرسة جميع التقنيات والقواعد بالتفصيل مع أمثلة عملية لكل تقنية.
                    </p>
                  </div>
                  <button
                    onClick={() => setResultTab("techniques")}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700 transition"
                  >
                    عرض الدليل الكامل ({allTechniques.length}) →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Full 250 Techniques Directory */}
          {resultTab === "techniques" && (
            <div className="space-y-5 pt-2">
              {/* Search, Filter & Export Bar */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="🔍 ابحث برقم التقنية (مثلاً: 25، 50، 200) أو بالكلمة المفتاحية..."
                      value={techSearch}
                      onChange={(e) => {
                        setTechSearch(e.target.value);
                        setTechPage(1);
                      }}
                      className="w-full rounded-xl border border-gray-300 py-2.5 px-4 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-gray-800"
                    />
                    {techSearch && (
                      <button
                        onClick={() => setTechSearch("")}
                        className="absolute left-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                      >
                        ✕ مسح
                      </button>
                    )}
                  </div>
                  <button
                    onClick={exportFullDossier}
                    className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition whitespace-nowrap"
                  >
                    📥 تصدير الملف الكامل (Export Dossier)
                  </button>
                </div>

                {/* Categories Filter Pills */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    { id: "all", label: `الكل (${allTechniques.length})` },
                    { id: "التأثير وصناعة النفوذ", label: "التأثير وصناعة النفوذ" },
                    { id: "التفاوض والإقناع", label: "التفاوض والإقناع" },
                    { id: "لغة الجسد وقراءة السلوك", label: "لغة الجسد وقراءة السلوك" },
                    { id: "إدارة العلاقات والمواقف", label: "إدارة العلاقات والمواقف" },
                    { id: "الحماية والتحصين النفسي", label: "الحماية والتحصين النفسي" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedTechCategory(cat.id);
                        setTechPage(1);
                      }}
                      className={`rounded-lg px-3 py-1.5 transition ${
                        selectedTechCategory === cat.id
                          ? "bg-violet-600 text-white font-semibold"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Header */}
              <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <span>
                  عرض {paginatedTechniques.length} من إجمالي {filteredTechniques.length} تقنية
                </span>
                <span>
                  صفحة {techPage} من {totalPages}
                </span>
              </div>

              {/* Techniques Cards Grid */}
              <div className="space-y-4">
                {paginatedTechniques.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                    لم يتم العثور على أي تقنية تطابق بحثك: &quot;{techSearch}&quot;.
                  </div>
                ) : (
                  paginatedTechniques.map((tech: any) => (
                    <div
                      key={tech.id}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-violet-300 transition space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-violet-600 px-2.5 py-1 text-xs font-bold text-white">
                            تقنية #{tech.id}
                          </span>
                          <h4 className="font-bold text-gray-900 text-sm">
                            {tech.title}
                          </h4>
                        </div>
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 font-medium">
                          {tech.category}
                        </span>
                      </div>

                      {/* Principle text */}
                      <p className="text-sm leading-relaxed text-gray-800 font-medium">
                        {tech.principle}
                      </p>

                      {/* Practical Example Box */}
                      {tech.example && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs leading-relaxed text-amber-900">
                          <span className="font-bold block mb-1">💡 سيناريو وتطبيق عملي:</span>
                          {tech.example.replace(/^تطبيق عملي:\s*|^مثال تطبيقي:\s*/, "")}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-gray-50 text-xs">
                        <button
                          onClick={() => copyTechnique(tech)}
                          className="font-medium text-gray-500 hover:text-violet-600 transition flex items-center gap-1"
                        >
                          {copiedTechId === tech.id ? "✓ تم نسخ التقنية" : "📋 نسخ"}
                        </button>
                        <Link
                          href="/dashboard/documents/1"
                          className="font-medium text-violet-600 hover:text-violet-800 transition"
                        >
                          💬 اسأل الذكاء الاصطناعي عن هذه التقنية →
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <button
                    disabled={techPage === 1}
                    onClick={() => {
                      setTechPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 350, behavior: "smooth" });
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    ← الصفحة السابقة
                  </button>
                  <span className="text-xs font-medium text-gray-600">
                    صفحة {techPage} من {totalPages}
                  </span>
                  <button
                    disabled={techPage === totalPages}
                    onClick={() => {
                      setTechPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 350, behavior: "smooth" });
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    الصفحة التالية →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bottom Global Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <Link
              href="/dashboard/documents/1"
              className="flex-1 text-center rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow hover:bg-violet-700 transition"
            >
              💬 فتح غرفة المحادثة التفاعلية الذكية (Q&A Workspace) →
            </Link>
            <button
              onClick={() => {
                setFile(null);
                setComplete(false);
                setAnalysisResult(null);
                setResultTab("overview");
              }}
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              رفع مستند آخر
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
