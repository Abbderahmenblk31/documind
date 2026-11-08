// =============================================================================
// DocuMind - Production Document Analysis API Route
// POST /api/analyze
// Accepts real File uploads (FormData) OR pre-extracted client JSON payloads
// Bypasses Vercel Serverless 4.5MB payload limits seamlessly
// =============================================================================

import { NextResponse } from "next/server";
import { extractDocumentContent } from "@/lib/extractor";
import { analyzeDocumentText } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";

// Maximum upload limit: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const clientApiKey = request.headers.get("x-api-key") || undefined;
    const clientProvider =
      (request.headers.get("x-ai-provider") as "openai" | "gemini" | undefined) ||
      undefined;

    const contentType = request.headers.get("content-type") || "";

    let text = "";
    let fileName = "document";
    let fileSize = 0;
    let fileType: "pdf" | "csv" | "txt" = "pdf";
    let pageCount: number | undefined;
    let wordCount = 0;
    let sampleExcerpt = "";

    // ── CASE 1: Pre-extracted JSON Payload from Browser (Files up to 50MB) ───
    if (contentType.includes("application/json")) {
      const body = await request.json();
      text = body.text || "";
      fileName = body.fileName || "document.pdf";
      fileSize = body.fileSize || text.length;
      fileType = body.fileType || "pdf";
      pageCount = body.pageCount;
      wordCount = body.wordCount || text.split(/\s+/).filter(Boolean).length;
      sampleExcerpt = text.slice(0, 400);

      if (!text || text.length < 5) {
        return NextResponse.json(
          {
            error:
              "Could not extract readable text from the document. Please ensure the document contains a readable text layer.",
          },
          { status: 422 }
        );
      }
    } else {
      // ── CASE 2: Multipart Form-Data (Direct File Stream) ─────────────────
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided. Please upload a document." },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File size exceeds the 50MB limit. Current size: ${(
              file.size /
              (1024 * 1024)
            ).toFixed(1)}MB.`,
          },
          { status: 413 }
        );
      }

      fileName = file.name;
      fileSize = file.size;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const extracted = await extractDocumentContent(buffer, file.name, file.type);
      text = extracted.text;
      fileType = extracted.metadata.fileType;
      pageCount = extracted.metadata.pageCount;
      wordCount = extracted.metadata.wordCount;
      sampleExcerpt = extracted.sampleExcerpt;

      if (!text || text.length < 5) {
        return NextResponse.json(
          {
            error:
              "Could not extract readable text from the file. Please ensure the document is not an empty or password-protected file.",
          },
          { status: 422 }
        );
      }
    }

    // Run AI analysis (Gemini / OpenAI / Unified Heuristic)
    const aiResult = await analyzeDocumentText(text, fileName, {
      apiKey: clientApiKey,
      provider: clientProvider,
    });

    return NextResponse.json(
      {
        success: true,
        documentId: `doc-${Date.now().toString(36)}`,
        fileName,
        fileSize,
        fileType,
        summary: aiResult.summary,
        keyPoints: aiResult.keyPoints,
        sentiment: aiResult.sentiment,
        topics: aiResult.topics,
        confidence: aiResult.confidence,
        totalTechniquesCount: aiResult.totalTechniquesCount,
        techniques: aiResult.techniques,
        metadata: {
          fileName,
          fileSize,
          fileType,
          pageCount,
          wordCount,
          readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
          detectedLanguage: /[\u0600-\u06FF]/.test(text.slice(0, 1000))
            ? "Arabic"
            : "English",
          sampleExcerpt,
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
