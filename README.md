# 🧠 DocuMind — AI Document Intelligence SaaS Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Storage-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Subscriptions_%26_Billing-635BFF?style=flat-square&logo=stripe)](https://stripe.com/)

> **Production-grade AI SaaS application** engineered for enterprise document ingestion, structured heuristic & LLM extraction, and grounded conversational Q&A with exact source attribution.

---

## 🌟 Key Features

- **Multi-Format Ingestion:** Instant server-side parsing of **PDF**, **CSV**, and **TXT** files (up to 10MB) with streaming buffer extraction.
- **Dual-Engine AI Intelligence:**
  - **Live LLM Integration:** Connects to **OpenAI GPT-4o** or **Google Gemini 1.5** via server environment variables or client-side settings.
  - **Intelligent Heuristic Fallback:** Zero-API-key local NLP engine that performs real frequency scoring, keyword extraction, and contextual sentence search so the app never fails.
- **Grounded Document Q&A:** Chat directly with your documents. Every AI response includes exact excerpts, relevance scores, and section/page references.
- **Enterprise Billing & Subscriptions:** Full Stripe Checkout flow supporting Free, Pro ($19/mo), and Enterprise ($99/mo) tiers with webhooks and downloadable invoice receipts.
- **Database Architecture (Supabase):** PostgreSQL schema with Row-Level Security (RLS) policies isolating multi-tenant customer vaults.
- **Modern Responsive UI:** Polished glassmorphic dashboard built with Tailwind CSS v4, dark/light contrast, and mobile-friendly slide-out drawer navigation.

---

## 🏗️ Architecture Overview

```
                      ┌───────────────────────────────────────────────┐
                      │              Client Browser (UI)              │
                      │  Next.js 16 App Router + Tailwind CSS v4      │
                      └───────┬───────────────────────────────┬───────┘
                              │                               │
                      FormData Upload                   JSON Q&A Chat
                              │                               │
                              ▼                               ▼
                      ┌─────────────────┐             ┌─────────────────┐
                      │  /api/analyze   │             │    /api/chat    │
                      └───────┬─────────┘             └───────┬─────────┘
                              │                               │
                      Buffer Extractor                Grounded Context
                      (PDF / CSV / TXT)               Semantic Matcher
                              │                               │
                              └───────────────┬───────────────┘
                                              │
                                              ▼
                             ┌─────────────────────────────────┐
                             │    Unified AI Provider Layer    │
                             │  OpenAI / Gemini / Local Engine │
                             └────────────────┬────────────────┘
                                              │
                     ┌────────────────────────┼────────────────────────┐
                     ▼                        ▼                        ▼
              ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
              │   Supabase   │         │    Stripe    │         │  Audit & Log │
              │  PostgreSQL  │         │   Checkout   │         │  Zero-Error  │
              └──────────────┘         └──────────────┘         └──────────────┘
```

---

## 🚀 Quick Start & Local Development

### 1. Clone & Install
```bash
git clone https://github.com/your-username/documind.git
cd documind
npm install
```

### 2. Configure Environment (Optional for Live Cloud)
```bash
cp .env.example .env.local
```
*Note: DocuMind works 100% out of the box in Sandbox/Demo mode even without any environment keys configured!*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 📡 API Reference

### `POST /api/analyze`
Extracts text, metadata, and generates an AI summary from an uploaded file.
- **Request:** `multipart/form-data` with `file: File`
- **Headers:** Optional `x-api-key: string`, `x-ai-provider: "openai" | "gemini"`
- **Response (200 OK):**
```json
{
  "success": true,
  "documentId": "doc-m8x12a",
  "fileName": "Q3-Report.pdf",
  "fileType": "pdf",
  "summary": "Revenue increased by 18% YoY driven by enterprise SaaS expansion...",
  "keyPoints": [
    "Enterprise client retention reached 98%",
    "Operating margins improved by 3.4%"
  ],
  "sentiment": "Positive",
  "topics": ["Revenue", "Expansion", "Margins"],
  "confidence": 0.98,
  "metadata": {
    "wordCount": 1420,
    "pageCount": 8,
    "readingTimeMinutes": 7,
    "detectedLanguage": "English"
  }
}
```

### `POST /api/chat`
Answers questions grounded strictly in the context of an analyzed document.
- **Request:** `application/json`
```json
{
  "documentId": "doc-001",
  "question": "What was the EBITDA margin?"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "answer": "The EBITDA margin improved to 18.4%, up from 15.1% in Q2...",
  "sources": [
    {
      "section": "Financial Summary",
      "relevance": 0.95,
      "excerpt": "Key metrics showed consistent improvement..."
    }
  ],
  "timestamp": "2026-11-08T08:15:00.000Z"
}
```

### `POST /api/stripe/checkout`
Generates a Stripe Checkout session for subscription upgrades.

---

## 🔒 Security & Quality Standards

- **Boundary Enforcement:** 10MB maximum file size limit with HTTP 413 handling.
- **MIME Verification:** Strict whitelist validation (`application/pdf`, `text/csv`, `text/plain`).
- **Prompt Injection Defense:** Strict input sanitization and system boundaries separating user document data from prompt instructions.
- **Zero Runtime Errors:** 100% strict TypeScript compliance across all client & server routes.

---

## 📄 License
MIT License. Built with precision for production-grade software portfolios.
