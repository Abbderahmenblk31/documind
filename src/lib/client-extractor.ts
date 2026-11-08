// =============================================================================
// DocuMind - Client-Side Extraction Engine
// Extracts text in the browser to bypass Vercel's 4.5MB Serverless Payload limit
// =============================================================================

export interface ClientExtractedResult {
  text: string;
  pageCount: number;
  wordCount: number;
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

    // Determine which pages to scan:
    // If <= 100 pages, scan every single page.
    // If > 100 pages, scan up to 100 substantive pages (first 50, middle 30, last 20)
    const pagesToScan: number[] = [];
    if (pageCount <= 100) {
      for (let i = 1; i <= pageCount; i++) pagesToScan.push(i);
    } else {
      for (let i = 1; i <= 50; i++) pagesToScan.push(i);
      const mid = Math.floor(pageCount / 2) - 15;
      for (let i = mid; i < mid + 30; i++) pagesToScan.push(i);
      for (let i = pageCount - 20; i <= pageCount; i++) pagesToScan.push(i);
    }

    const pageTexts: string[] = [];
    for (let idx = 0; idx < pagesToScan.length; idx++) {
      const pageNum = pagesToScan[idx];
      const page = await pdf.getPage(pageNum);
      const tc = await page.getTextContent();
      const pageStr = tc.items
        .map((it: any) => it.str)
        .join(" ")
        .replace(/[ \t]+/g, " ")
        .trim();
      if (pageStr) pageTexts.push(pageStr);

      if (onProgress) {
        onProgress(Math.round(((idx + 1) / pagesToScan.length) * 50));
      }
    }

    const fullText = pageTexts.join("\n\n");
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
