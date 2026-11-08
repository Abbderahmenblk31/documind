import React, { Suspense } from "react";
import DashboardShell from "@/components/DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading Dashboard...</div>}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
