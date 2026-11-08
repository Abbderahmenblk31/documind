"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Sidebar navigation items */
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/documents", label: "My Documents", icon: "📄" },
  { href: "/dashboard/upload", label: "Upload New", icon: "⬆️" },
  { href: "/dashboard/billing", label: "Billing & Plans", icon: "💳" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── Mobile overlay ─────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-900 text-white
          transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-gray-800 px-6">
          <span className="text-2xl">🧠</span>
          <span className="text-xl font-bold tracking-tight">DocuMind</span>
        </div>

        {/* Nav links */}
        <nav className="mt-6 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium
                  transition-colors
                  ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 w-full border-t border-gray-800 p-4">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 group hover:opacity-90 transition-opacity"
            title="View account settings"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white group-hover:ring-2 group-hover:ring-indigo-400 transition-all">
              JD
            </div>
            <div className="text-sm">
              <p className="font-medium text-white group-hover:text-indigo-300 transition-colors">John Doe</p>
              <p className="text-xs text-gray-400">Pro Plan • Settings</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-8">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            aria-label="Open sidebar"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-gray-500 sm:inline">
              Workspace
            </span>
            <span className="hidden text-gray-300 sm:inline">/</span>
            <span className="text-sm font-medium text-gray-900">
              Personal Vault
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-semibold text-gray-500 hover:text-gray-900"
            >
              Exit to Home
            </Link>
            <Link
              href="/dashboard/settings"
              title="Settings"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white hover:ring-2 hover:ring-indigo-400 transition-all"
            >
              JD
            </Link>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
