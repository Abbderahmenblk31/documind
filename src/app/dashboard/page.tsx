import Link from "next/link";

/** Stat card data */
const stats = [
  { label: "Documents Analyzed", value: "24", icon: "📄", color: "bg-indigo-50 text-indigo-600" },
  { label: "Questions Asked", value: "156", icon: "🔍", color: "bg-emerald-50 text-emerald-600" },
  { label: "Credits Remaining", value: "430", icon: "⚡", color: "bg-amber-50 text-amber-600" },
];

/** Mock recent documents */
const recentDocs = [
  {
    id: "1",
    name: "Q3 Financial Report.pdf",
    date: "Nov 5, 2026",
    status: "Analyzed" as const,
  },
  {
    id: "2",
    name: "Customer Survey Results.csv",
    date: "Nov 3, 2026",
    status: "Processing" as const,
  },
  {
    id: "3",
    name: "Product Roadmap Notes.txt",
    date: "Oct 28, 2026",
    status: "Analyzed" as const,
  },
];

/** Status badge color map */
const statusColors: Record<string, string> = {
  Analyzed: "bg-emerald-100 text-emerald-700",
  Processing: "bg-amber-100 text-amber-700",
  Pending: "bg-gray-100 text-gray-600",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* ── Welcome header ──────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, John 👋
        </h1>
        <p className="mt-1 text-gray-500">
          Here&apos;s what&apos;s happening with your documents today.
        </p>
      </div>

      {/* ── Stats cards ─────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl ${s.color}`}
            >
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick upload CTA ────────────────────────────── */}
      <div className="flex items-center justify-between rounded-xl border border-dashed border-indigo-300 bg-indigo-50 p-6">
        <div>
          <h3 className="font-semibold text-indigo-900">
            Ready to analyze a new document?
          </h3>
          <p className="mt-1 text-sm text-indigo-700">
            Upload a PDF, CSV, or TXT file and let AI do the heavy lifting.
          </p>
        </div>
        <Link
          href="/dashboard/upload"
          className="shrink-0 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-indigo-700 transition-colors"
        >
          ⬆️ Upload Document
        </Link>
      </div>

      {/* ── Recent documents ────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Documents
          </h2>
          <Link
            href="/dashboard/documents"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            View all →
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 font-medium text-gray-500">Name</th>
                <th className="px-6 py-3 font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    📄 {doc.name}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{doc.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[doc.status]}`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/documents/${doc.id}`}
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
