import fs from "fs";
import { getDocumentProxy } from "unpdf";

async function test() {
  const filePath = "C:\\Users\\abdra\\Downloads\\📙 الكتاب الثالث.pdf";
  const buf = fs.readFileSync(filePath);
  const uint8 = new Uint8Array(buf);
  const pdf = await getDocumentProxy(uint8);
  console.log("Pages:", pdf.numPages);
  
  // Let's test the exact logic in extractor.ts
  const pageTexts = [];
  for (let i = 1; i <= pdf.numPages; i++) {
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
    const pageStr = lineChunks.join("").replace(/[ \t]+/g, " ").normalize("NFC").trim();
    if (pageStr) pageTexts.push(pageStr);
  }
  const fullText = pageTexts.join("\n\n").trim();
  console.log("FullText length:", fullText.length);
  console.log("First 300 chars:", fullText.slice(0, 300));
}

test();
