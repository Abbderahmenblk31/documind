// =============================================================================
// DocuMind - Document Extraction Engine
// Extracts text, structure, and metadata from PDF, CSV, and TXT files
// Powered by unpdf with space-preserving Unicode tokenization
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
 * Extracts plain text from PDF Buffer using unpdf with space-preserving reconstruction.
 */
async function extractPdfText(
  buffer: Buffer
): Promise<{ text: string; pageCount: number; isScanned: boolean }> {
  try {
    const { getDocumentProxy } = await import("unpdf");
    const uint8 = new Uint8Array(buffer);
    const pdf = await getDocumentProxy(uint8);
    const pageCount = pdf.numPages || 1;
    const pageTexts: string[] = [];

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      let lastItem: any = null;
      const lineChunks: string[] = [];

      for (const item of textContent.items as any[]) {
        if (!item || typeof item.str !== "string") continue;
        const str = item.str;
        if (!str) continue;

        if (lastItem) {
          const prevEnded = /\s$/.test(lastItem.str);
          const currStarts = /^\s/.test(str);
          if (!prevEnded && !currStarts && !item.hasEOL) {
            lineChunks.push(" ");
          }
        }
        lineChunks.push(str);
        if (item.hasEOL) lineChunks.push("\n");
        lastItem = item;
      }

      const pageStr = lineChunks.join("").replace(/[ \t]+/g, " ").trim();
      if (pageStr) {
        pageTexts.push(pageStr);
      }
    }

    const fullText = pageTexts.join("\n\n").trim();
    if (fullText.length >= 20 && !isRawPdfSyntax(fullText)) {
      return { text: fullText, pageCount, isScanned: false };
    }
  } catch (err) {
    console.error("PDF text extraction error:", err);
  }

  // Only if truly no text layer could be recovered (scanned / image-only PDF):
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
