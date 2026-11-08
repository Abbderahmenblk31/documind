import fs from 'fs';
import { getDocumentProxy } from 'unpdf';
import { sanitizeAndDecodeArabic, isMeaningfulPage } from './test-unified-intelligence.mjs';

async function testFaslInline() {
  const filePath = 'C:/Users/abdra/OneDrive/Documents/Book/Noor-Book.com  الداء والدواء.pdf';
  const buf = fs.readFileSync(filePath);
  const pdf = await getDocumentProxy(new Uint8Array(buf));

  const fullBodyPages = [];
  for (let p = 76; p <= 160; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    const raw = tc.items.map(x => x.str).join(' ');
    if (isMeaningfulPage(raw)) {
      fullBodyPages.push(sanitizeAndDecodeArabic(raw));
    }
  }

  const fullText = fullBodyPages.join('\n\n');

  // Match فصل preceded by start, newline, or sentence end
  const faslRegex = /(?:^|\n|[.!?؟]\s*)\s*(فصل\s*(?:[:\s\-]|في\b)[^.!?؟\n]{8,90})/g;

  const matches = [];
  let m;
  while ((m = faslRegex.exec(fullText)) !== null) {
    const rawHeader = m[1].replace(/^[#*\s.]+|[#*\s.]+$/g, '').trim();
    if (rawHeader.length >= 10 && !rawHeader.includes('فهرس')) {
      matches.push({ title: rawHeader, index: m.index });
    }
  }

  console.log(`Found ${matches.length} chapters!`);
  for (let i = 0; i < Math.min(15, matches.length); i++) {
    console.log(`[#${i + 1}] ${matches[i].title}`);
  }
}

testFaslInline();
