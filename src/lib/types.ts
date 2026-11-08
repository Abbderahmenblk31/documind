// =============================================================================
// DocuMind - TypeScript Type Definitions
// Core types used throughout the application
// =============================================================================

/** Supported document file types */
export type DocumentType = "pdf" | "csv" | "txt";

/** Document processing status */
export type DocumentStatus = "pending" | "processing" | "analyzed";

/** User subscription plan */
export type PlanType = "free" | "pro";

/** Chat message sender role */
export type MessageRole = "user" | "assistant";

// -----------------------------------------------------------------------------
// Document
// -----------------------------------------------------------------------------
export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  /** File size in bytes */
  size: number;
  status: DocumentStatus;
  createdAt: string;
  summary?: string;
  keyPoints?: string[];
}

// -----------------------------------------------------------------------------
// User
// -----------------------------------------------------------------------------
export interface User {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
  documentsUsed: number;
  documentsLimit: number;
}

// -----------------------------------------------------------------------------
// Analysis Result (returned by /api/analyze)
// -----------------------------------------------------------------------------
export interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  metadata: Record<string, string | number>;
}

// -----------------------------------------------------------------------------
// Chat Message (used in document Q&A)
// -----------------------------------------------------------------------------
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}
