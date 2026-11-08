import fs from 'fs';
import { getDocumentProxy } from 'unpdf';

// ── 1. Robust Arabic Text Sanitizer & Decoder ──────────────────────────────
export function sanitizeAndDecodeArabic(str) {
  if (!str) return '';

  // Step A: Normalize Unicode
  let text = str.normalize('NFKD');

  // Step B: Detect and fix spaced Arabic letters / reversed lines
  // If the text contains lots of single Arabic characters separated by spaces:
  // e.g. "ا ل ج م ه و ر   ت ح ل ي ل"
  const lines = text.split(/\r?\n/);
  const fixedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';

    // Count Arabic letters and single spaces
    const arabicLetters = trimmed.match(/[\u0600-\u06FF]/g) || [];
    if (arabicLetters.length < 4) return trimmed;

    // Detect spaced glyph pattern: single arabic letters separated by space
    const spacedPattern = /(?:[\u0600-\u06FF]\s){3,}[\u0600-\u06FF]/;
    if (spacedPattern.test(trimmed)) {
      // Split on 2+ spaces to separate words
      const wordClusters = trimmed.split(/ {2,}|\t+/).filter(Boolean);
      const cleanedWords = wordClusters.map(cluster => {
        // Strip spaces between individual Arabic characters
        return cluster.replace(/ (?=[\u0600-\u06FF])/g, '').trim();
      }).filter(Boolean);

      // Check if words in this line are in reverse visual order (RTL printed as LTR)
      // Reverse word array to restore logical reading order
      return cleanedWords.reverse().join(' ');
    }

    return trimmed;
  });

  let result = fixedLines.join('\n');

  // Step C: Normalize standard Arabic letter variants in NFC
  result = result
    .normalize('NFC')
    .replace(/اأ|أ/g, 'أ')
    .replace(/اإ|إ/g, 'إ')
    .replace(/اآ|آ/g, 'آ')
    .replace(/األول/g, 'الأول')
    .replace(/الاول/g, 'الأول')
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove tashkeel for indexing
    .replace(/[ \t]+/g, ' ');

  return result;
}

// ── 2. Filter Garbage / Manuscript Photo Pages ───────────────────────────────
export function isMeaningfulPage(pageText) {
  if (!pageText || pageText.trim().length < 40) return false;
  const arabicLetters = pageText.match(/[\u0600-\u06FF]/g) || [];
  const latinLetters = pageText.match(/[a-zA-Z]/g) || [];
  const totalLetters = arabicLetters.length + latinLetters.length;
  // If letters make up less than 45% of characters (e.g. photos with OCR noise like '!*/?!.,-')
  if (totalLetters / pageText.length < 0.45) return false;
  return true;
}

// ── 3. Find Core Text Start (Skip مقدمة التحقيق / Manuscript descriptions) ───
export function locateCoreTextStart(pages) {
  // Common markers where the actual book begins after the editor's preface
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

  for (let i = 0; i < pages.length; i++) {
    // Only search after page 3 to avoid early table of contents or introductory quotes
    if (i >= 2) {
      for (const marker of coreMarkers) {
        if (marker.test(pages[i])) {
          return i; // Return 0-indexed page where core book begins
        }
      }
    }
  }

  return 0; // Default to beginning if no marker found
}

async function testIntelligence() {
  const filePath = 'C:/Users/abdra/OneDrive/Documents/Book/Noor-Book.com  الداء والدواء.pdf';
  const buf = fs.readFileSync(filePath);
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  console.log(`Testing with ${pdf.numPages} pages...`);

  // Scan first 120 pages
  const pages = [];
  for (let p = 1; p <= Math.min(120, pdf.numPages); p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    const raw = tc.items.map(x => x.str).join(' ');
    if (isMeaningfulPage(raw)) {
      pages.push({ pageNum: p, text: sanitizeAndDecodeArabic(raw) });
    }
  }

  console.log(`Meaningful text pages retained: ${pages.length}`);
  const pageTextsOnly = pages.map(p => p.text);
  const startIdx = locateCoreTextStart(pageTextsOnly);
  console.log(`Core book identified at page: ${pages[startIdx].pageNum}!`);
  console.log(`Core book opening text:\n${pages[startIdx].text.slice(0, 300)}`);
}

testIntelligence();
