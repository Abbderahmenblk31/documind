// =============================================================================
// DocuMind - Production Document Analysis API Route
// POST /api/analyze
// Accepts real File uploads (PDF, CSV, TXT), extracts text, and runs AI analysis
// =============================================================================

import { NextResponse } from "next/server";
import { extractDocumentContent } from "@/lib/extractor";
import { analyzeDocumentText } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";

// Maximum upload limit: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const clientApiKey = request.headers.get("x-api-key") || undefined;
    const clientProvider =
      (request.headers.get("x-ai-provider") as "openai" | "gemini" | undefined) ||
      undefined;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Please upload a document." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds the 50MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(1)}MB.` },
        { status: 413 }
      );
    }

    // Read file bytes into Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract real text and metadata
    const extracted = await extractDocumentContent(buffer, file.name, file.type);

    if (!extracted.text || extracted.text.length < 5) {
      return NextResponse.json(
        { error: "Could not extract readable text from the file. Please ensure the document is not an empty or password-protected file." },
        { status: 422 }
      );
    }

    // Run AI analysis
    const aiResult = await analyzeDocumentText(extracted.text, file.name, {
      apiKey: clientApiKey,
      provider: clientProvider,
    });

    return NextResponse.json(
      {
        success: true,
        documentId: `doc-${Date.now().toString(36)}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: extracted.metadata.fileType,
        summary: aiResult.summary,
        keyPoints: aiResult.keyPoints,
        sentiment: aiResult.sentiment,
        topics: aiResult.topics,
        confidence: aiResult.confidence,
        metadata: {
          ...extracted.metadata,
          sampleExcerpt: extracted.sampleExcerpt,
          processedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Analysis API Error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred during document processing.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
