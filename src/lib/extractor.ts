// =============================================================================
// DocuMind - Document Extraction Engine
// Extracts text, structure, and metadata from PDF, CSV, and TXT files
// Powered by unpdf with space-preserving Unicode tokenization and RTL decoder
// =============================================================================

import { decodeAndFixArabicText } from "./arabic-decoder";

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
 * Normalizes Unicode, fixes letter-spaced Arabic words, and restores reversed RTL text.
 */
export function sanitizeAndDecodeArabic(str: string): string {
  if (!str) return "";
  return decodeAndFixArabicText(str);
}

/**
 * Discards image-only or OCR-noise pages (e.g. photos of ancient manuscripts)
 */
function isMeaningfulPage(pageText: string): boolean {
  if (!pageText || pageText.trim().length < 35) return false;
  const arabicLetters = pageText.match(/[\u0600-\u06FF]/g) || [];
  const latinLetters = pageText.match(/[a-zA-Z]/g) || [];
  const totalLetters = arabicLetters.length + latinLetters.length;
  if (totalLetters / pageText.length < 0.45) return false;
  return true;
}

/**
 * Identifies where the core book starts, skipping lengthy editorial manuscript prefaces.
 */
function locateCoreTextStart(pages: string[]): number {
  const coreMarkers = [
    /ما\s+تقول\s+السادة\s+العلماء/i,
    /سئل\s+الشيخ\s+الإمام/i,
    /سئل\s+شيخ\s+الإسلام/i,
    /فأجاب\s+الشيخ/i,
    /قال\s+الشيخ\s+الإمام/i,
    /الحمد\s+لله\s+رب\s+العالمين\s+وبعد/i,
    /أما\s+بعد\s+حمد\s+الله/i,
    /الفصل\s+الأول\s*[:\s]/i,
    /الباب\s+الأول\s*[:\s]/i,
  ];

  for (let i = 2; i < pages.length; i++) {
    for (const marker of coreMarkers) {
      if (marker.test(pages[i])) {
        return i;
      }
    }
  }
  return 0;
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
    const rawPages: Array<{ pageNum: number; text: string }> = [];

    // Scan up to 120 substantive pages
    const maxScan = Math.min(pageCount, 120);
    for (let i = 1; i <= maxScan; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      let raw = "";
      for (const item of textContent.items as any[]) {
        if (!item || typeof item.str !== "string") continue;
        raw += item.str + (item.hasEOL ? "\n" : "");
      }

      const pageStr = raw.normalize("NFKC").trim();

      if (isMeaningfulPage(pageStr)) {
        rawPages.push({ pageNum: i, text: sanitizeAndDecodeArabic(pageStr) });
      }
    }

    const justTexts = rawPages.map((p) => p.text);
    const coreStartIdx = locateCoreTextStart(justTexts);

    const substantivePages =
      coreStartIdx > 0 && coreStartIdx < rawPages.length - 3
        ? rawPages.slice(coreStartIdx)
        : rawPages;

    const fullText = substantivePages.map((p) => p.text).join("\n\n").trim();
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
