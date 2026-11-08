// =============================================================================
// DocuMind - Client-Side Extraction Engine
// Extracts and decodes text in the browser to bypass Vercel's 4.5MB Serverless Payload limit
// Handles reversed Arabic glyphs, skips manuscript photo pages, and pinpoints core content
// =============================================================================

export interface ClientExtractedResult {
  text: string;
  pageCount: number;
  wordCount: number;
}

/**
 * Normalizes Unicode, fixes letter-spaced Arabic words, and restores reversed RTL text.
 */
export function sanitizeAndDecodeArabicClient(str: string): string {
  if (!str) return "";

  // Step A: Normalize Unicode decomposition
  let text = str.normalize("NFKD");

  // Step B: Fix letter-spaced Arabic words and reversed lines
  const lines = text.split(/\r?\n/);
  const fixedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return "";

    const arabicLetters = trimmed.match(/[\u0600-\u06FF]/g) || [];
    if (arabicLetters.length < 4) return trimmed;

    // Detect spaced glyph pattern: single Arabic letters separated by spaces
    // e.g. "ا ل ج م ه و ر   ت ح ل ي ل"
    const spacedPattern = /(?:[\u0600-\u06FF]\s){3,}[\u0600-\u06FF]/;
    if (spacedPattern.test(trimmed)) {
      const wordClusters = trimmed.split(/ {2,}|\t+/).filter(Boolean);
      const cleanedWords = wordClusters
        .map((cluster) => cluster.replace(/ (?=[\u0600-\u06FF])/g, "").trim())
        .filter(Boolean);

      // Restore logical RTL reading order
      return cleanedWords.reverse().join(" ");
    }

    return trimmed;
  });

  let result = fixedLines.join("\n");

  // Step C: Normalize standard Arabic letter variants in NFC
  result = result
    .normalize("NFC")
    .replace(/اأ|أ/g, "أ")
    .replace(/اإ|إ/g, "إ")
    .replace(/اآ|آ/g, "آ")
    .replace(/األول/g, "الأول")
    .replace(/الاول/g, "الأول")
    .replace(/[\u064B-\u065F\u0670]/g, "") // remove tashkeel for resilient matching
    .replace(/[ \t]+/g, " ");

  return result;
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
 * Extracts plain text directly inside the browser using unpdf.
 * Enables zero-lag uploads for documents up to 50MB without hitting HTTP 413.
 */
export async function extractTextInBrowser(
  file: File,
  onProgress?: (pct: number) => void
): Promise<ClientExtractedResult> {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const isCsv =
    file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");

  if (isCsv || file.type.startsWith("text/")) {
    const text = await file.text();
    const words = text.split(/\s+/).filter(Boolean).length;
    return { text, pageCount: 1, wordCount: words };
  }

  if (isPdf) {
    const arrayBuffer = await file.arrayBuffer();
    const { getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
    const pageCount = pdf.numPages || 1;

    // Scan up to 120 substantive pages across the document
    const rawPages: Array<{ pageNum: number; text: string }> = [];

    // First scan early pages to detect structure
    const initialScanCount = Math.min(pageCount, pageCount <= 80 ? pageCount : 80);
    for (let i = 1; i <= initialScanCount; i++) {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent();
      const pageStr = tc.items
        .map((it: any) => it.str)
        .join(" ")
        .replace(/[ \t]+/g, " ")
        .trim();

      if (isMeaningfulPage(pageStr)) {
        rawPages.push({ pageNum: i, text: sanitizeAndDecodeArabicClient(pageStr) });
      }

      if (onProgress) {
        onProgress(Math.round((i / initialScanCount) * 35));
      }
    }

    // Check if a classic core book start marker was found
    const justTexts = rawPages.map((p) => p.text);
    const coreStartIdx = locateCoreTextStart(justTexts);

    // If large document (> 80 pages), continue scanning substantive pages after core start
    if (pageCount > 80) {
      const startPageNum = rawPages[coreStartIdx]?.pageNum || 1;
      const additionalPagesToScan: number[] = [];

      // Scan 40 pages immediately following the core start
      for (let p = startPageNum; p <= Math.min(pageCount, startPageNum + 50); p++) {
        if (!rawPages.some((r) => r.pageNum === p)) {
          additionalPagesToScan.push(p);
        }
      }

      // Middle 20 pages
      const mid = Math.floor(pageCount / 2);
      for (let p = mid; p <= Math.min(pageCount, mid + 20); p++) {
        if (!rawPages.some((r) => r.pageNum === p)) {
          additionalPagesToScan.push(p);
        }
      }

      // Final 15 pages
      for (let p = Math.max(1, pageCount - 15); p <= pageCount; p++) {
        if (!rawPages.some((r) => r.pageNum === p)) {
          additionalPagesToScan.push(p);
        }
      }

      for (let j = 0; j < additionalPagesToScan.length; j++) {
        const pNum = additionalPagesToScan[j];
        const page = await pdf.getPage(pNum);
        const tc = await page.getTextContent();
        const pageStr = tc.items
          .map((it: any) => it.str)
          .join(" ")
          .replace(/[ \t]+/g, " ")
          .trim();

        if (isMeaningfulPage(pageStr)) {
          rawPages.push({ pageNum: pNum, text: sanitizeAndDecodeArabicClient(pageStr) });
        }

        if (onProgress) {
          onProgress(35 + Math.round(((j + 1) / additionalPagesToScan.length) * 35));
        }
      }
    }

    // Sort pages in ascending page order
    rawPages.sort((a, b) => a.pageNum - b.pageNum);

    // If core start was located, slice from core start forward so LLM and extractors
    // process the authentic author content rather than manuscript preface
    const substantivePages =
      coreStartIdx > 0 && coreStartIdx < rawPages.length - 3
        ? rawPages.slice(coreStartIdx)
        : rawPages;

    const fullText = substantivePages.map((p) => p.text).join("\n\n");
    const words = fullText.split(/\s+/).filter(Boolean).length;
    return { text: fullText, pageCount, wordCount: words };
  }

  const text = await file.text();
  return {
    text,
    pageCount: 1,
    wordCount: text.split(/\s+/).filter(Boolean).length,
  };
}
