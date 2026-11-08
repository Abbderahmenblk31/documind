"use client";

import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Download,
  Upload,
  Sparkles,
  BarChart3,
  Check,
  ArrowRight,
  Zap,
  Shield,
  Clock,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   DocuMind Landing Page — Server Component (no "use client" needed)
   ═══════════════════════════════════════════════════════════════════════ */

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Docu<span className="text-violet-600">Mind</span>
            </span>
          </Link>

          {/* Nav links — hidden on mobile */}
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-gray-600 transition-colors hover:text-violet-600">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 transition-colors hover:text-violet-600">
              How It Works
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 transition-colors hover:text-violet-600">
              Pricing
            </a>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-violet-600 sm:block"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-200 transition-all hover:shadow-lg hover:shadow-violet-300 hover:brightness-110"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        {/* Background gradient blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-100 opacity-60 blur-3xl" />
          <div className="absolute top-20 -left-40 h-[400px] w-[400px] rounded-full bg-indigo-100 opacity-50 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-purple-50 opacity-70 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700">
            <Sparkles className="h-4 w-4" />
            AI-Powered Document Intelligence
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up delay-100 mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
            Transform Your Documents Into{" "}
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Actionable Insights
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up delay-200 mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl">
            Upload PDFs and CSVs, then let AI analyze, summarize, and answer
            questions about your documents in seconds. No more manual reading.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up delay-300 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-200 transition-all hover:shadow-xl hover:shadow-violet-300 hover:brightness-110"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 shadow-sm transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            >
              See Demo
            </Link>
          </div>

          {/* Trust badges */}
          <div className="animate-fade-in-up delay-400 mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 sm:gap-8">
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-green-500" />
              End-to-end encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-500" />
              Results in seconds
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              No credit card required
            </span>
          </div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────────────────── */}
      <section id="features" className="scroll-mt-20 bg-gray-50/70 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section heading */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-wide text-violet-600 uppercase">
              Features
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything You Need to Understand Your Documents
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powerful AI tools that turn dense documents into clear, actionable
              knowledge.
            </p>
          </div>

          {/* Feature cards */}
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-md shadow-violet-200">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-gray-900">
                AI Document Analysis
              </h3>
              <p className="mt-3 leading-relaxed text-gray-600">
                Upload PDFs or CSVs and receive comprehensive AI-generated
                summaries, key takeaways, and structured data extraction
                automatically.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md shadow-purple-200">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-gray-900">
                Smart Q&A
              </h3>
              <p className="mt-3 leading-relaxed text-gray-600">
                Ask natural-language questions about your documents and get
                precise, cited answers instantly. Like having a research
                assistant on demand.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-100 sm:col-span-2 lg:col-span-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-200">
                <Download className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-gray-900">
                Export Insights
              </h3>
              <p className="mt-3 leading-relaxed text-gray-600">
                Download your analysis as polished reports in PDF, Markdown, or
                CSV format. Share insights with your team effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section heading */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-wide text-violet-600 uppercase">
              How It Works
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Three Simple Steps to Smarter Documents
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Go from raw document to actionable insight in under a minute.
            </p>
          </div>

          {/* Steps */}
          <div className="mt-16 grid gap-8 sm:gap-12 lg:grid-cols-3">
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                <Upload className="h-7 w-7" />
              </div>
              <span className="mt-4 inline-block rounded-full bg-violet-600 px-3 py-0.5 text-xs font-bold text-white">
                Step 1
              </span>
              <h3 className="mt-3 text-xl font-semibold text-gray-900">
                Upload Your Document
              </h3>
              <p className="mt-2 text-gray-600">
                Drag & drop your PDF or CSV file. We support documents up to
                50 MB with instant processing.
              </p>
              {/* Connector arrow (visible on large screens) */}
              <div className="pointer-events-none absolute top-8 -right-6 hidden text-violet-300 lg:block">
                <ArrowRight className="h-6 w-6" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
                <Sparkles className="h-7 w-7" />
              </div>
              <span className="mt-4 inline-block rounded-full bg-purple-600 px-3 py-0.5 text-xs font-bold text-white">
                Step 2
              </span>
              <h3 className="mt-3 text-xl font-semibold text-gray-900">
                AI Analyzes Content
              </h3>
              <p className="mt-2 text-gray-600">
                Our AI reads, understands, and structures every detail — from
                tables to paragraphs — in seconds.
              </p>
              <div className="pointer-events-none absolute top-8 -right-6 hidden text-purple-300 lg:block">
                <ArrowRight className="h-6 w-6" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <BarChart3 className="h-7 w-7" />
              </div>
              <span className="mt-4 inline-block rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-bold text-white">
                Step 3
              </span>
              <h3 className="mt-3 text-xl font-semibold text-gray-900">
                Get Insights
              </h3>
              <p className="mt-2 text-gray-600">
                Explore summaries, ask follow-up questions, and export polished
                reports to share with your team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing Section ───────────────────────────────────────────── */}
      <section id="pricing" className="scroll-mt-20 bg-gray-50/70 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section heading */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-wide text-violet-600 uppercase">
              Pricing
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start for free. Upgrade when you&apos;re ready.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-2">
            {/* Free Plan */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Free</h3>
              <p className="mt-1 text-sm text-gray-500">
                Perfect for trying things out
              </p>
              <div className="mt-6">
                <span className="text-5xl font-extrabold text-gray-900">$0</span>
                <span className="ml-1 text-gray-500">/month</span>
              </div>
              <ul className="mt-8 space-y-4">
                {[
                  "3 documents per month",
                  "AI summaries & key takeaways",
                  "Basic Q&A (10 questions/doc)",
                  "PDF export",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-gray-700">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 block rounded-xl border border-gray-200 py-3 text-center font-semibold text-gray-700 transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="relative rounded-2xl border-2 border-violet-600 bg-white p-8 shadow-xl shadow-violet-100">
              {/* Popular badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1 text-xs font-bold tracking-wide text-white uppercase">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Pro</h3>
              <p className="mt-1 text-sm text-gray-500">
                For power users and teams
              </p>
              <div className="mt-6">
                <span className="text-5xl font-extrabold text-gray-900">$9</span>
                <span className="ml-1 text-gray-500">/month</span>
              </div>
              <ul className="mt-8 space-y-4">
                {[
                  "Unlimited documents",
                  "Advanced AI analysis & insights",
                  "Unlimited Q&A with citations",
                  "PDF, Markdown & CSV export",
                  "Priority processing",
                  "API access",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-gray-700">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard/billing"
                className="mt-8 block rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-center font-semibold text-white shadow-md shadow-violet-200 transition-all hover:shadow-lg hover:shadow-violet-300 hover:brightness-110"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-8 py-16 text-center shadow-2xl sm:px-16">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -top-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />

            <h2 className="relative text-3xl font-bold text-white sm:text-4xl">
              Ready to Unlock Your Documents?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-violet-100">
              Join thousands of professionals who save hours every week with
              AI-powered document analysis.
            </p>
            <Link
              href="/register"
              className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-violet-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Start Analyzing for Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <a href="#" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Docu<span className="text-violet-600">Mind</span>
                </span>
              </a>
              <p className="mt-3 max-w-xs text-sm text-gray-500">
                AI-powered document analysis that turns your files into
                actionable insights.
              </p>
            </div>

            {/* Product links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Product</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-gray-500">
                <li><a href="#features" className="transition-colors hover:text-violet-600">Features</a></li>
                <li><a href="#pricing" className="transition-colors hover:text-violet-600">Pricing</a></li>
                <li><a href="#" className="transition-colors hover:text-violet-600">API Docs</a></li>
                <li><a href="#" className="transition-colors hover:text-violet-600">Changelog</a></li>
              </ul>
            </div>

            {/* Company links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Company</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-gray-500">
                <li><a href="#" className="transition-colors hover:text-violet-600">About</a></li>
                <li><a href="#" className="transition-colors hover:text-violet-600">Blog</a></li>
                <li><a href="#" className="transition-colors hover:text-violet-600">Careers</a></li>
                <li><a href="#" className="transition-colors hover:text-violet-600">Contact</a></li>
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Legal</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-gray-500">
                <li><a href="#" className="transition-colors hover:text-violet-600">Privacy Policy</a></li>
                <li><a href="#" className="transition-colors hover:text-violet-600">Terms of Service</a></li>
                <li><a href="#" className="transition-colors hover:text-violet-600">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} DocuMind. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 transition-colors hover:text-violet-600" aria-label="GitHub">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="text-gray-400 transition-colors hover:text-violet-600" aria-label="Twitter">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="text-gray-400 transition-colors hover:text-violet-600" aria-label="LinkedIn">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
