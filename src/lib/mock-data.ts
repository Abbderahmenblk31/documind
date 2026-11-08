// =============================================================================
// DocuMind - Mock Data
// Realistic sample data used for development and demo purposes
// =============================================================================

import { Document, User, AnalysisResult } from "./types";

// -----------------------------------------------------------------------------
// Mock Documents
// -----------------------------------------------------------------------------
export const mockDocuments: Document[] = [
  {
    id: "doc-001",
    name: "Q3-2024-Financial-Report.pdf",
    type: "pdf",
    size: 2_458_624,
    status: "analyzed",
    createdAt: "2024-10-15T09:30:00Z",
    summary:
      "Quarterly financial report showing 18% revenue growth YoY with improved operating margins across all business segments.",
    keyPoints: [
      "Revenue reached $4.2M, up 18% year-over-year",
      "Operating margin improved to 22.5% from 19.1%",
      "Customer acquisition cost decreased by 12%",
      "Net promoter score increased to 72",
    ],
  },
  {
    id: "doc-002",
    name: "Employee-Survey-Results.csv",
    type: "csv",
    size: 184_320,
    status: "analyzed",
    createdAt: "2024-10-12T14:15:00Z",
    summary:
      "Annual employee engagement survey with 847 responses covering satisfaction, work-life balance, and growth opportunities.",
    keyPoints: [
      "Overall satisfaction score: 4.2/5.0",
      "87% of employees feel aligned with company mission",
      "Remote work flexibility rated as top benefit",
      "Areas for improvement: career development pathways",
    ],
  },
  {
    id: "doc-003",
    name: "Product-Roadmap-2025.pdf",
    type: "pdf",
    size: 1_048_576,
    status: "processing",
    createdAt: "2024-10-18T11:00:00Z",
  },
  {
    id: "doc-004",
    name: "Customer-Feedback-Oct.txt",
    type: "txt",
    size: 52_480,
    status: "pending",
    createdAt: "2024-10-20T08:45:00Z",
  },
  {
    id: "doc-005",
    name: "Sales-Pipeline-Analysis.csv",
    type: "csv",
    size: 327_680,
    status: "analyzed",
    createdAt: "2024-10-08T16:30:00Z",
    summary:
      "Sales pipeline analysis for Q4 showing $12.8M in qualified opportunities with a 34% weighted close probability.",
    keyPoints: [
      "Total pipeline value: $12.8M across 156 opportunities",
      "Enterprise segment accounts for 62% of pipeline value",
      "Average deal cycle reduced to 45 days from 58 days",
      "Top-performing region: North America (48% of deals)",
    ],
  },
];

// -----------------------------------------------------------------------------
// Mock User
// -----------------------------------------------------------------------------
export const mockUser: User = {
  id: "user-001",
  name: "Alex Morgan",
  email: "alex@documind.ai",
  plan: "pro",
  documentsUsed: 23,
  documentsLimit: 100,
};

// -----------------------------------------------------------------------------
// Mock Analysis Results (for demo purposes)
// -----------------------------------------------------------------------------
export const mockAnalysisResult: AnalysisResult = {
  summary:
    "This document provides a comprehensive overview of market trends in the SaaS industry for 2024, highlighting key growth drivers, emerging technologies, and competitive dynamics. The analysis covers 150+ companies across 12 market segments.",
  keyPoints: [
    "AI-powered features are now table stakes — 78% of SaaS products integrate some form of AI",
    "Vertical SaaS solutions are outpacing horizontal platforms in growth rate (32% vs 18%)",
    "Customer retention remains the strongest predictor of long-term valuation",
    "Usage-based pricing adoption increased by 45% compared to 2023",
    "Security and compliance capabilities are the #1 enterprise buying criterion",
  ],
  metadata: {
    pageCount: 42,
    wordCount: 18_750,
    language: "English",
    processingTime: 3.2,
    confidenceScore: 0.94,
  },
};
