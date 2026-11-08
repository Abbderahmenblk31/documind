import fs from "fs";
import { getDocumentProxy } from "unpdf";

async function extractPdfTextLogic(buffer) {
  const { getDocumentProxy } = await import("unpdf");
  const uint8 = new Uint8Array(buffer);
  const pdf = await getDocumentProxy(uint8);
  const pageCount = pdf.numPages || 1;
  const pageTexts = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    let lastItem = null;
    const lineChunks = [];

    for (const item of textContent.items) {
      if (!item || typeof item.str !== "string") continue;
      const str = item.str;
      if (!str) continue;

      if (lastItem) {
        const prevEnded = /\s$/.test(lastItem.str);
        const currStarts = /^\s/.test(str);
        if (!prevEnded && !currStarts && !item.hasEOL) {
          const isGlyphA =
            lastItem.str.length === 1 && !/[\s.,:;!?،؟]/.test(lastItem.str);
          const isGlyphB =
            str.length === 1 && !/[\s.,:;!?،؟]/.test(str);
          if (!(isGlyphA && isGlyphB)) {
            lineChunks.push(" ");
          }
        }
      }
      lineChunks.push(str);
      if (item.hasEOL) lineChunks.push("\n");
      lastItem = item;
    }

    const pageStr = lineChunks
      .join("")
      .replace(/[ \t]+/g, " ")
      .normalize("NFC")
      .trim();
    if (pageStr) {
      pageTexts.push(pageStr);
    }
  }

  return pageTexts.join("\n\n").trim();
}

async function run() {
  const buf = fs.readFileSync("C:\\Users\\abdra\\Downloads\\بالكتاب الأول.pdf");
  const res = await extractPdfTextLogic(buf);
  console.log("EXTRACTED RESULT:\n" + res.slice(0, 400));
}

run();
