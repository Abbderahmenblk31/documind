// =============================================================================
// DocuMind - Production Document Q&A Chat API Route
// POST /api/chat
// Answers questions grounded in the context of an analyzed document
// =============================================================================

import { NextResponse } from "next/server";
import { answerDocumentQuestion } from "@/lib/ai/provider";
import { mockDocuments } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { documentId, question, documentText } = body as {
      documentId?: string;
      question?: string;
      documentText?: string;
    };
    const clientApiKey = request.headers.get("x-api-key") || undefined;
    const clientProvider =
      (request.headers.get("x-ai-provider") as "openai" | "gemini" | undefined) ||
      undefined;

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: "A valid question is required." },
        { status: 400 }
      );
    }

    // Determine document context
    let contextText = documentText;

    if (!contextText && documentId) {
      const found = mockDocuments.find((d) => d.id === documentId || d.id === `doc-${documentId}`);
      if (found) {
        contextText = `${found.name}\n\n${found.summary || ""}\n\nKey Highlights:\n${(found.keyPoints || []).join("\n")}`;
      }
    }

    if (!contextText) {
      contextText =
        "Q3 Financial Report. Revenue reached $12.3M, up 12% YoY. SaaS subscription revenue increased 23%, representing 68% of total revenue. EBITDA margin improved to 18.4%. Customer acquisition cost in enterprise segment rose 8%.";
    }

    // Call AI Q&A engine
    const result = await answerDocumentQuestion(contextText, question.trim(), {
      apiKey: clientApiKey,
      provider: clientProvider,
    });

    return NextResponse.json(
      {
        success: true,
        answer: result.answer,
        sources: result.sources,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred while processing your question.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
