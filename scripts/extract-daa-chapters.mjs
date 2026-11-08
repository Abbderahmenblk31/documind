import fs from 'fs';
import { getDocumentProxy } from 'unpdf';
import { sanitizeAndDecodeArabic, isMeaningfulPage } from './test-unified-intelligence.mjs';

async function extractDaaChapters() {
  const filePath = 'C:/Users/abdra/OneDrive/Documents/Book/Noor-Book.com  الداء والدواء.pdf';
  const buf = fs.readFileSync(filePath);
  const pdf = await getDocumentProxy(new Uint8Array(buf));

  // Extract from page 76 to 250 (the core body of Ibn al-Qayyim's text)
  const fullBodyPages = [];
  for (let p = 76; p <= 200; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    const raw = tc.items.map(x => x.str).join(' ');
    if (isMeaningfulPage(raw)) {
      fullBodyPages.push(sanitizeAndDecodeArabic(raw));
    }
  }

  const fullText = fullBodyPages.join('\n\n');

  // Let's match all "فصل" headings
  const faslRegex = /(?:^|\n)\s*(فصل\s*(?:[:\-]|\s+في\s+|\s+ومن\s+|\s+والدعاء\s+|\s+وإذا\s+|\s+وكثيرا\s+|\s+والأدعية\s+|\s+والأمر\s+|\s+فإن\s+|\s+وكثير\s+|\s+فقد\s+|\s+ومما\s+|\s+وللمعاصي\s+|\s+ومنها\s+)[^\n.]{10,90})/g;

  const matches = [];
  let m;
  while ((m = faslRegex.exec(fullText)) !== null) {
    const title = m[1].replace(/^[#*\s]+|[#*\s]+$/g, '').replace(/\s+/g, ' ').trim();
    if (title.length >= 10 && !title.includes('فهرس') && !title.includes('رقم الإيداع')) {
      matches.push({ title, index: m.index });
    }
  }

  console.log(`Extracted ${matches.length} substantive chapters from Ibn al-Qayyim's text!`);
  for (let i = 0; i < Math.min(10, matches.length); i++) {
    const curr = matches[i];
    const next = matches[i + 1];
    const body = fullText.slice(curr.index, next ? next.index : curr.index + 500).trim();
    console.log(`\n[#${i + 1}] ${curr.title}`);
    console.log(`   Sample text: ${body.slice(0, 150)}...`);
  }
}

extractDaaChapters();
