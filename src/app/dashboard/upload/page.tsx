"use client";

import React, { useState, useCallback } from "react";
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
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  /** Validate and set the selected file */
  const handleFile = useCallback((f: File) => {
    setErrorMessage(null);
    if (ACCEPTED_TYPES.includes(f.type) || f.name.match(/\.(pdf|csv|txt)$/i)) {
      if (f.size > 10 * 1024 * 1024) {
        setErrorMessage("File exceeds 10MB maximum limit.");
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
      const savedApiKey = typeof window !== "undefined" ? localStorage.getItem("documind_api_key") : null;
      const savedProvider = typeof window !== "undefined" ? localStorage.getItem("documind_ai_provider") : null;

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

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* ── Page header ─────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload & Analyze Document</h1>
        <p className="mt-1 text-gray-500">
          Upload any PDF, CSV, or TXT file to extract insights, key metrics, and ask questions.
        </p>
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
            Supports PDF, CSV, and TXT up to 10 MB
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
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <h2 className="text-lg font-bold text-gray-900">Analysis Summary</h2>
            </div>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
              {analysisResult.sentiment} Tone
            </span>
          </div>

          <p className="text-sm leading-relaxed text-gray-700">
            {analysisResult.summary}
          </p>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Key Extracted Takeaways:</h3>
            <ul className="space-y-2">
              {analysisResult.keyPoints?.map((kp: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{kp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 pt-2">
            {analysisResult.topics?.map((topic: string, i: number) => (
              <span key={i} className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                #{topic}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <Link
              href="/dashboard/documents/1"
              className="flex-1 text-center rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow hover:bg-violet-700 transition"
            >
              💬 Open Document Q&A Chat →
            </Link>
            <button
              onClick={() => {
                setFile(null);
                setComplete(false);
                setAnalysisResult(null);
              }}
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
