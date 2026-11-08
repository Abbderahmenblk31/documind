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
    isScannedOrImageOnly?: boolean;
  };
  sampleExcerpt: string;
}

/**
 * Checks if a string contains raw unparsed PDF binary syntax
 */
function isRawPdfSyntax(str: string): boolean {
  if (!str) return false;
  const markers = [
    "%PDF-",
    "/FontDescriptor",
    "/FlateDecode",
    "endobj",
    "/Structelem",
    "endstream",
    "/MediaBox",
  ];
  let count = 0;
  for (const m of markers) {
    if (str.includes(m)) count++;
  }
  return count >= 2;
}

/**
 * Extracts plain text from PDF Buffer using pdf-parse v2 (PDFParse class)
 * or legacy function fallback without ever dumping raw binary stream tokens.
 */
async function extractPdfText(
  buffer: Buffer
): Promise<{ text: string; pageCount: number; isScanned: boolean }> {
  try {
    const mod = await import("pdf-parse");
    const PDFParseClass = mod.PDFParse || (mod as any).default?.PDFParse;

    if (typeof PDFParseClass === "function") {
      const parser = new PDFParseClass({ data: buffer });
      const res = await parser.getText();
      const pageCount = res.total || res.pages?.length || 1;
      await parser.destroy?.();

      let cleaned = (res.text || "")
        .replace(/-- \d+ of \d+ --/g, "")
        .replace(/\u0000/g, "")
        .trim();

      if (cleaned.length >= 10 && !isRawPdfSyntax(cleaned)) {
        return { text: cleaned, pageCount, isScanned: false };
      }
    } else {
      const legacyFn =
        typeof mod === "function" ? mod : (mod as any).default;
      if (typeof legacyFn === "function") {
        const data = await legacyFn(buffer);
        const cleaned = (data.text || "").replace(/\u0000/g, "").trim();
        if (cleaned.length >= 10 && !isRawPdfSyntax(cleaned)) {
          return {
            text: cleaned,
            pageCount: data.numpages || 1,
            isScanned: false,
          };
        }
      }
    }
  } catch (err) {
    console.error("PDF parsing execution failed:", err);
  }

  // Scanned or non-selectable PDF: NEVER dump raw PostScript/latin1 binary stream
  return { text: "", pageCount: 1, isScanned: true };
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
  let isScannedOrImageOnly = false;

  if (fileType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
    normalizedType = "pdf";
    const pdfResult = await extractPdfText(buffer);
    pageCount = pdfResult.pageCount;
    isScannedOrImageOnly = pdfResult.isScanned;

    if (!pdfResult.isScanned && pdfResult.text.length > 0) {
      text = pdfResult.text;
    } else {
      // Clean, human-readable notification for scanned or image-only PDFs
      const isArabic = /[\u0600-\u06FF]/.test(fileName);
      if (isArabic) {
        text = `المستند "${fileName}" يحتوي على صفحات مصورة أو ممسوحة ضوئياً (Scanned Images) بدون طبقة نصوص رقمية قابلة للاستخراج المباشر. يرجى استخدام ملف PDF يحتوي على نصوص قابلة للتحديد (Selectable Text)، أو تصدير المستند عبر تقنية التعرف الضوئي على الحروف (OCR) لتحليله بالذكاء الاصطناعي بدقة عالية.`;
      } else {
        text = `The document "${fileName}" appears to be a scanned image or contains vector graphics without an embedded selectable text layer. To enable full AI intelligence and grounded Q&A, please upload a searchable PDF or convert it using OCR.`;
      }
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

  // Language detection
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
      isScannedOrImageOnly,
    },
    sampleExcerpt: cleanText.slice(0, 400) + (cleanText.length > 400 ? "..." : ""),
  };
}
