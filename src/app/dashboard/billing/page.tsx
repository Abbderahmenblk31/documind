"use client";

import React, { useState } from "react";
import {
  Check,
  Sparkles,
  Zap,
  ArrowRight,
  Download,
  CreditCard,
  ShieldCheck,
  FileText,
  Loader2,
  ExternalLink,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Mail,
  Receipt,
  Lock,
} from "lucide-react";

type PlanTier = "Free Tier" | "Pro Tier";
type BillingInterval = "monthly" | "annual";

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "Paid" | "Pending" | "Refunded";
  plan: string;
  period: string;
}

const mockInvoices: Invoice[] = [
  {
    id: "INV-2026-003",
    date: "Nov 01, 2026",
    amount: "$19.00",
    status: "Paid",
    plan: "Pro Plan (Monthly)",
    period: "Nov 1, 2026 - Dec 1, 2026",
  },
  {
    id: "INV-2026-002",
    date: "Oct 01, 2026",
    amount: "$19.00",
    status: "Paid",
    plan: "Pro Plan (Monthly)",
    period: "Oct 1, 2026 - Nov 1, 2026",
  },
  {
    id: "INV-2026-001",
    date: "Sep 01, 2026",
    amount: "$19.00",
    status: "Paid",
    plan: "Pro Plan (Monthly)",
    period: "Sep 1, 2026 - Oct 1, 2026",
  },
];

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState<PlanTier>("Free Tier");
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [salesSubmitted, setSalesSubmitted] = useState(false);

  // Show a temporary toast banner
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Real Stripe Checkout with Demo Fallback
  const handleUpgradeToPro = async () => {
    setIsUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "pro",
          billingCycle: interval === "monthly" ? "monthly" : "annual",
        }),
      });
      const data = await res.json();
      if (data.url && !data.mode) {
        window.location.href = data.url;
        return;
      }
      setCurrentPlan("Pro Tier");
      triggerToast("🎉 Upgrade successful! You are now subscribed to DocuMind Pro.");
    } catch {
      setCurrentPlan("Pro Tier");
      triggerToast("🎉 Upgrade processed successfully (Demo Mode).");
    } finally {
      setIsUpgrading(false);
    }
  };

  // Switch back to Free Tier (demo convenience)
  const handleDowngradeToFree = () => {
    setCurrentPlan("Free Tier");
    triggerToast("Switched back to Free Tier for demo review.");
  };

  // Simulate receipt download
  const handleDownloadInvoice = (invoice: Invoice) => {
    setDownloadingId(invoice.id);

    setTimeout(() => {
      const receiptContent = `================================================
               DOCUMIND INC.
            OFFICIAL PAYMENT RECEIPT
================================================
Invoice Number : ${invoice.id}
Issue Date     : ${invoice.date}
Billing Cycle  : ${invoice.period}
Customer       : John Doe (john.doe@example.com)
Account Tier   : ${invoice.plan}
Status         : ${invoice.status.toUpperCase()}
------------------------------------------------
Item                                     Amount
DocuMind Pro Subscription (1 Month)      ${invoice.amount}
Tax (0.00%)                               $0.00
------------------------------------------------
TOTAL PAID                               ${invoice.amount}
Payment Method : Visa ending in 4242
Processor      : Stripe Inc. (Mock Simulation)
================================================
Thank you for choosing DocuMind!
For support, contact support@documind.ai
`;

      const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `DocuMind-${invoice.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadingId(null);
      triggerToast(`Receipt for ${invoice.id} downloaded successfully.`);
    }, 800);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-16">
      {/* ── Toast Notification Banner ────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl border border-indigo-200 bg-white px-5 py-3.5 shadow-xl transition-all duration-300 animate-fade-in-up">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-gray-400 hover:text-gray-600"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Billing & Subscription
            </h1>
            {/* Current Plan Badge */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-xs ${
                currentPlan === "Pro Tier"
                  ? "border border-violet-200 bg-violet-50 text-violet-700"
                  : "border border-indigo-100 bg-indigo-50/80 text-indigo-700"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  currentPlan === "Pro Tier"
                    ? "bg-violet-600 animate-pulse"
                    : "bg-indigo-600"
                }`}
              />
              {currentPlan}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Manage your plan, check monthly AI usage quotas, and download invoices.
          </p>
        </div>

        {/* Demo Plan Switcher helper */}
        <div className="flex items-center gap-2 self-start rounded-lg border border-gray-200 bg-white p-1 text-xs font-medium text-gray-600 sm:self-auto shadow-xs">
          <span className="px-2 text-gray-400">View as:</span>
          <button
            onClick={() => setCurrentPlan("Free Tier")}
            className={`rounded-md px-2.5 py-1 transition-colors ${
              currentPlan === "Free Tier"
                ? "bg-indigo-600 font-semibold text-white shadow-xs"
                : "hover:text-gray-900"
            }`}
          >
            Free Tier
          </button>
          <button
            onClick={() => setCurrentPlan("Pro Tier")}
            className={`rounded-md px-2.5 py-1 transition-colors ${
              currentPlan === "Pro Tier"
                ? "bg-violet-600 font-semibold text-white shadow-xs"
                : "hover:text-gray-900"
            }`}
          >
            Pro Tier
          </button>
        </div>
      </div>

      {/* ── Active Plan Summary Card ────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/40 p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Active Subscription
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                Active
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              {currentPlan === "Pro Tier" ? "DocuMind Pro Plan" : "DocuMind Free Tier"}
            </h2>
            <p className="text-sm text-gray-600">
              {currentPlan === "Pro Tier"
                ? "Your next billing date is December 1, 2026 for $19.00/month."
                : "You are on the free starter plan. Upgrade anytime to unlock unlimited documents."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentPlan === "Free Tier" ? (
              <button
                onClick={handleUpgradeToPro}
                disabled={isUpgrading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:from-violet-700 hover:to-indigo-700 hover:shadow-lg disabled:opacity-70"
              >
                {isUpgrading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting to Stripe...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-violet-200" />
                    Upgrade to Pro ($19/mo)
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleDowngradeToFree}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Switch to Free Tier
              </button>
            )}
            <a
              href="#plans"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Compare all plans <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Usage Meters & Progress Bars ─────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Current Usage & Limits</h2>
            <p className="text-sm text-gray-500">
              Usage period: Nov 1, 2026 – Nov 30, 2026 · Resets in 23 days
            </p>
          </div>
          <span className="hidden text-xs text-gray-400 sm:inline">
            Updated a few moments ago
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 1. Documents Usage Meter */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs hover:border-indigo-200 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Documents Analyzed</h3>
                  <p className="text-xs text-gray-500">Monthly upload quota</p>
                </div>
              </div>
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
                {currentPlan === "Pro Tier" ? "Unlimited" : "60% used"}
              </span>
            </div>

            {/* Requirement: "3 / 5 Documents used this month" (60%) */}
            <div className="mt-5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-semibold text-gray-800">
                  3 / 5 Documents used this month
                </span>
                <span className="text-xs font-bold text-indigo-600">60%</span>
              </div>

              {/* Progress Bar */}
              <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-700"
                  style={{ width: "60%" }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>2 documents remaining</span>
                <span>Limit: 5 docs/mo</span>
              </div>
            </div>
          </div>

          {/* 2. AI Questions Asked Meter */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs hover:border-indigo-200 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Questions Asked</h3>
                  <p className="text-xs text-gray-500">Interactive chat & reasoning queries</p>
                </div>
              </div>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                {currentPlan === "Pro Tier" ? "Unlimited" : "45% used"}
              </span>
            </div>

            {/* Requirement: "45 / 100 AI Questions asked" */}
            <div className="mt-5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-semibold text-gray-800">
                  45 / 100 AI Questions asked
                </span>
                <span className="text-xs font-bold text-violet-600">45%</span>
              </div>

              {/* Progress Bar */}
              <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-700"
                  style={{ width: "45%" }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>55 questions remaining</span>
                <span>Limit: 100 questions/mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Banner for Free Tier users */}
        {currentPlan === "Free Tier" && (
          <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-violet-200/80 bg-gradient-to-r from-violet-50/80 via-indigo-50/50 to-white p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Approaching document limit?
                </p>
                <p className="text-xs text-gray-600">
                  Unlock unlimited uploads, GPT-4o deep synthesis, and high-speed processing with DocuMind Pro.
                </p>
              </div>
            </div>
            <button
              onClick={handleUpgradeToPro}
              disabled={isUpgrading}
              className="shrink-0 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-violet-700 transition-colors disabled:opacity-60"
            >
              {isUpgrading ? "Upgrading..." : "Unlock Unlimited"}
            </button>
          </div>
        )}
      </section>

      {/* ── Plan Comparison Cards ─────────────────────────────── */}
      <section id="plans" className="space-y-6 pt-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Flexible Plans for Every Need
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Scale your document intelligence as your workflow and team grow.
          </p>

          {/* Monthly / Annual toggle */}
          <div className="mt-5 inline-flex items-center rounded-full border border-gray-200 bg-gray-100 p-1 text-xs font-medium text-gray-700 shadow-inner">
            <button
              onClick={() => setInterval("monthly")}
              className={`rounded-full px-4 py-1.5 transition-all ${
                interval === "monthly"
                  ? "bg-white font-semibold text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setInterval("annual")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-all ${
                interval === "annual"
                  ? "bg-white font-semibold text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Annual Billing
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ──────────────────────────────────────────────────────── */}
          {/* Card 1: Free Plan ($0/month)                            */}
          {/* ──────────────────────────────────────────────────────── */}
          <div
            className={`flex flex-col justify-between rounded-2xl border bg-white p-7 transition-all ${
              currentPlan === "Free Tier"
                ? "border-indigo-400 ring-2 ring-indigo-500/20 shadow-md"
                : "border-gray-200 shadow-xs hover:border-gray-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Free Plan</h3>
                {currentPlan === "Free Tier" && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                    Current Plan
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Perfect for quick document checks and individual exploration.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                  $0
                </span>
                <span className="text-sm font-medium text-gray-500">/month</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">Free forever. No credit card required.</p>

              {/* Feature List */}
              <ul className="mt-8 space-y-3.5 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>
                    <strong className="font-semibold text-gray-800">5 docs/mo</strong> included
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>
                    <strong className="font-semibold text-gray-800">100 questions</strong> with AI
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>
                    <strong className="font-semibold text-gray-800">Basic summaries</strong> & bullet takeaways
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>PDF, CSV, and TXT parsing</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>Standard queue processing</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              {currentPlan === "Free Tier" ? (
                <button
                  disabled
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-center text-sm font-semibold text-gray-400 cursor-default"
                >
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={handleDowngradeToFree}
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Downgrade to Free
                </button>
              )}
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* Card 2: Pro Plan ($19/month) - FEATURED                 */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="relative flex flex-col justify-between rounded-2xl border-2 border-indigo-600 bg-white p-7 shadow-xl shadow-indigo-100/70 transition-all hover:shadow-2xl">
            {/* Highlight Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                <Sparkles className="h-3.5 w-3.5" /> Most Popular
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Pro Plan</h3>
                {currentPlan === "Pro Tier" && (
                  <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                    Current Plan
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                For researchers, executives, and power users who need deep analysis.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                  {interval === "annual" ? "$15" : "$19"}
                </span>
                <span className="text-sm font-medium text-gray-500">/month</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {interval === "annual" ? "Billed annually ($180/year)" : "Billed monthly. Cancel anytime."}
              </p>

              {/* Feature List */}
              <ul className="mt-8 space-y-3.5 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>
                    <strong className="font-semibold text-gray-900">Unlimited docs</strong> upload & indexing
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>
                    <strong className="font-semibold text-gray-900">GPT-4o deep analysis</strong> & reasoning
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>
                    <strong className="font-semibold text-gray-900">Priority processing</strong> queue (5x faster)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>
                    <strong className="font-semibold text-gray-900">Export to PDF & Excel</strong> reports
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>Unlimited AI questions & follow-up chat</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>Up to 50MB file size per document</span>
                </li>
              </ul>
            </div>

            {/* Upgrade Button */}
            <div className="mt-8">
              {currentPlan === "Pro Tier" ? (
                <button
                  disabled
                  className="w-full rounded-xl bg-violet-50 py-3 text-center text-sm font-semibold text-violet-700 cursor-default border border-violet-200"
                >
                  ✓ Current Plan Active
                </button>
              ) : (
                <button
                  onClick={handleUpgradeToPro}
                  disabled={isUpgrading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-center text-sm font-semibold text-white shadow-md shadow-indigo-300/50 transition-all hover:from-violet-700 hover:to-indigo-700 hover:shadow-lg disabled:opacity-70"
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecting to Stripe...
                    </>
                  ) : (
                    <>
                      Upgrade to Pro
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* Card 3: Enterprise ($99/month)                          */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-7 shadow-xs hover:border-gray-300 transition-all">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Enterprise</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  Custom
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Dedicated infrastructure, compliance, and custom LLM workflows.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                  {interval === "annual" ? "$79" : "$99"}
                </span>
                <span className="text-sm font-medium text-gray-500">/month</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">Starting price for teams up to 10 seats.</p>

              {/* Feature List */}
              <ul className="mt-8 space-y-3.5 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>
                    <strong className="font-semibold text-gray-800">Team access</strong> & shared collaborative workspaces
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>
                    <strong className="font-semibold text-gray-800">Dedicated API</strong> with high-throughput rate limits
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>
                    <strong className="font-semibold text-gray-800">Custom retention</strong> & auto-redaction rules
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>SOC2 Type II & HIPAA compliance reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>Dedicated Slack channel & 99.9% uptime SLA</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <button
                onClick={() => {
                  setSalesSubmitted(false);
                  setIsSalesModalOpen(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3 text-center text-sm font-semibold text-gray-800 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Building className="h-4 w-4 text-gray-500" />
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Payment Method & Invoicing Info ──────────────────── */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* Payment Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Payment Method</h3>
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <ShieldCheck className="h-4 w-4" /> Secure via Stripe
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-100 bg-gray-50/70 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-14 items-center justify-center rounded-md border border-gray-200 bg-white font-mono font-bold text-indigo-700 shadow-xs">
                VISA
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Visa ending in <span className="font-mono">4242</span>
                </p>
                <p className="text-xs text-gray-500">Expires 12/2028 · Primary billing card</p>
              </div>
            </div>

            <button
              onClick={() => triggerToast("Payment method update opened (Demo mode).")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Update card
            </button>
          </div>
        </div>

        {/* Billing Contact & Tax */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
          <h3 className="font-bold text-gray-900">Billing Address</h3>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            John Doe
            <br />
            Acme Corp Ltd.
            <br />
            100 Innovation Way, Suite 400
            <br />
            San Francisco, CA 94105
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500">
              Tax ID: <span className="font-mono text-gray-700">US-942810482</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Billing History Table ─────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Billing History</h2>
          <p className="text-sm text-gray-500">
            Download receipts and invoices for your accounting records.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75">
                  <th className="px-6 py-3.5 font-semibold text-gray-600">Invoice ID</th>
                  <th className="px-6 py-3.5 font-semibold text-gray-600">Date</th>
                  <th className="px-6 py-3.5 font-semibold text-gray-600">Amount</th>
                  <th className="px-6 py-3.5 font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-3.5 text-right font-semibold text-gray-600">
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-indigo-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-gray-400" />
                        {invoice.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{invoice.date}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {invoice.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(invoice)}
                        disabled={downloadingId === invoice.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-2xs hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors disabled:opacity-50"
                      >
                        {downloadingId === invoice.id ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-3.5 w-3.5 text-gray-500" />
                            <span>Download Invoice</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ or Trust Badges ───────────────────────────────── */}
      <section className="rounded-2xl border border-gray-100 bg-gray-50/70 p-6 text-xs text-gray-500">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-2.5">
            <Lock className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800">Bank-level 256-bit Security</p>
              <p className="mt-0.5">All transactions and card details are tokenized by Stripe.</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-violet-600 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800">Cancel Anytime</p>
              <p className="mt-0.5">No long-term contracts. Pause or cancel your subscription with one click.</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <HelpCircle className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800">Need Billing Assistance?</p>
              <p className="mt-0.5">Reach out to our finance desk at billing@documind.ai.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact Sales Modal ───────────────────────────────── */}
      {isSalesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">DocuMind Enterprise</h3>
                  <p className="text-xs text-gray-500">Talk with our solutions engineering team</p>
                </div>
              </div>
              <button
                onClick={() => setIsSalesModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {salesSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">Inquiry Received!</h4>
                <p className="text-sm text-gray-600 max-w-sm mx-auto">
                  Thank you! An enterprise account manager will contact you at{" "}
                  <span className="font-medium text-gray-900">john.doe@example.com</span> within 2 hours.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setIsSalesModalOpen(false)}
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSalesSubmitted(true);
                  triggerToast("Enterprise inquiry sent to sales team.");
                }}
                className="mt-5 space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Work Email</label>
                  <input
                    type="email"
                    defaultValue="john.doe@example.com"
                    required
                    className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Company Name</label>
                    <input
                      type="text"
                      defaultValue="Acme Corp"
                      required
                      className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Estimated Seats</label>
                    <select className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none">
                      <option>10 - 25 seats</option>
                      <option>26 - 100 seats</option>
                      <option>100+ enterprise seats</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Specific Requirements</label>
                  <textarea
                    rows={3}
                    placeholder="E.g., HIPAA compliance, on-prem VPC hosting, API access..."
                    className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSalesModalOpen(false)}
                    className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:from-violet-700 hover:to-indigo-700"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
