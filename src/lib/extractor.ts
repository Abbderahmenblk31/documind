// =============================================================================
// DocuMind - Document Extraction Engine
// Extracts text, structure, and metadata from PDF, CSV, and TXT files
// =============================================================================

export interface ExtractedDocument {
  text: string;
  metadata: {
    fileName: string;
    fileSize: number;
    fileType: "pdf" | "csv" | "txt";
    pageCount?: number;
    rowCount?: number;
    wordCount: number;
    readingTimeMinutes: number;
    detectedLanguage: string;
  };
  sampleExcerpt: string;
}

let cachedPdfParser: any = null;

async function getPdfParser() {
  if (!cachedPdfParser) {
    try {
      const mod = await import("pdf-parse");
      cachedPdfParser = (mod as any).default || mod;
    } catch {
      // Fallback require
      cachedPdfParser = eval("require")("pdf-parse");
    }
  }
  return cachedPdfParser;
}

/**
 * Extracts plain text and metadata from an uploaded file Buffer.
 */
export async function extractDocumentContent(
  buffer: Buffer,
  fileName: string,
  fileType: string
): Promise<ExtractedDocument> {
  let text = "";
  let pageCount: number | undefined;
  let rowCount: number | undefined;
  let normalizedType: "pdf" | "csv" | "txt" = "txt";

  if (fileType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
    normalizedType = "pdf";
    try {
      const parser = await getPdfParser();
      const pdfData = await parser(buffer);
      text = pdfData.text || "";
      pageCount = pdfData.numpages || 1;
    } catch (err) {
      console.warn("pdf-parse fallback scan:", err);
      // Fallback: extract readable strings from PDF stream
      text = buffer.toString("latin1").replace(/[^\x20-\x7E\n\r\t]/g, " ").trim();
      pageCount = 1;
    }
  } else if (
    fileType === "text/csv" ||
    fileName.toLowerCase().endsWith(".csv")
  ) {
    normalizedType = "csv";
    const rawContent = buffer.toString("utf-8");
    const lines = rawContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
    rowCount = Math.max(0, lines.length - 1);
    text = rawContent;
  } else {
    normalizedType = "txt";
    text = buffer.toString("utf-8");
  }

  // Sanitize text
  const cleanText = text
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();

  // Basic word count & metrics
  const words = cleanText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Language detection heuristic
  const arabicRegex = /[\u0600-\u06FF]/;
  const detectedLanguage = arabicRegex.test(cleanText.slice(0, 1000))
    ? "Arabic"
    : "English";

  return {
    text: cleanText,
    metadata: {
      fileName,
      fileSize: buffer.length,
      fileType: normalizedType,
      pageCount,
      rowCount,
      wordCount,
      readingTimeMinutes,
      detectedLanguage,
    },
    sampleExcerpt: cleanText.slice(0, 400) + (cleanText.length > 400 ? "..." : ""),
  };
}
