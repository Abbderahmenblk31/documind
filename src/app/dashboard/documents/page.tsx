"use client";

import React, { useState } from "react";
import Link from "next/link";

/** Type for a document entry */
interface Doc {
  id: string;
  name: string;
  type: string;
  date: string;
  status: "Analyzed" | "Processing" | "Pending";
}

/** Mock documents */
const initialDocs: Doc[] = [
  { id: "1", name: "Q3 Financial Report.pdf", type: "PDF", date: "Nov 5, 2026", status: "Analyzed" },
  { id: "2", name: "Customer Survey Results.csv", type: "CSV", date: "Nov 3, 2026", status: "Processing" },
  { id: "3", name: "Product Roadmap Notes.txt", type: "TXT", date: "Oct 28, 2026", status: "Analyzed" },
  { id: "4", name: "Employee Handbook v2.pdf", type: "PDF", date: "Oct 20, 2026", status: "Analyzed" },
  { id: "5", name: "Sales Data Q2.csv", type: "CSV", date: "Oct 15, 2026", status: "Pending" },
];

/** Status badge styles */
const statusStyles: Record<string, string> = {
  Analyzed: "bg-emerald-100 text-emerald-700",
  Processing: "bg-amber-100 text-amber-700",
  Pending: "bg-gray-100 text-gray-600",
};

/** File-type icon map */
const typeIcon: Record<string, string> = {
  PDF: "📕",
  CSV: "📊",
  TXT: "📝",
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>(initialDocs);

  /** Delete a document by id (client-side only) */
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      setDocs((prev) => prev.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="mt-1 text-gray-500">
            Manage and view all your uploaded documents.
          </p>
        </div>
        <Link
          href="/dashboard/upload"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-indigo-700 transition-colors"
        >
          ⬆️ Upload New
        </Link>
      </div>

      {/* ── Documents table ─────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 font-medium text-gray-500">Type</th>
              <th className="px-6 py-3 font-medium text-gray-500">Date</th>
              <th className="px-6 py-3 font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {docs.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                {/* Name */}
                <td className="px-6 py-4 font-medium text-gray-900">
                  <span className="mr-2">{typeIcon[doc.type] ?? "📄"}</span>
                  {doc.name}
                </td>

                {/* Type */}
                <td className="px-6 py-4 text-gray-500">{doc.type}</td>

                {/* Date */}
                <td className="px-6 py-4 text-gray-500">{doc.date}</td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[doc.status]}`}
                  >
                    {doc.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/dashboard/documents/${doc.id}`}
                      className="rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
                    >
                      🔍 View
                    </Link>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {docs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  No documents yet.{" "}
                  <Link
                    href="/dashboard/upload"
                    className="text-indigo-600 hover:underline"
                  >
                    Upload your first document →
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
