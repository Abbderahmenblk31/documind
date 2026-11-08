import fs from 'fs';

export function fixSpacedArabic(text) {
  if (!text) return "";
  // Step 1: Normalize Unicode NFKC to map Presentation Forms into standard Arabic
  let s = text.normalize("NFKC");

  // Step 2: In Noor-Book and Cairo-font PDFs, words are separated by double/triple spaces or tabs,
  // while intra-word letters are separated by single spaces.
  // Split lines first
  const lines = s.split(/\r?\n/);
  const fixedLines = lines.map(line => {
    // If the line has very few arabic chars, leave as is
    if (!/[\u0600-\u06FF]/.test(line)) return line;

    // Detect if this line is dominated by single-letter Arabic tokens:
    const tokens = line.trim().split(/\s+/);
    const singleLetterTokens = tokens.filter(t => t.length === 1 && /[\u0600-\u06FF]/.test(t));
    const ratio = singleLetterTokens.length / Math.max(1, tokens.length);

    if (ratio > 0.4) {
      // The line is spaced out!
      // In these lines, words are separated by 2 or more spaces, or punctuation
      const chunks = line.split(/(\s{2,}|\t+|[،,.:;!؟?()\[\]"]+)/);
      const reconstructed = chunks.map(chunk => {
        // If delimiter, return as is
        if (/^(\s{2,}|\t+|[،,.:;!؟?()\[\]"]+)$/.test(chunk)) return chunk;
        // If word chunk contains single letters with 1 space between them, collapse the spaces
        const subTokens = chunk.trim().split(/\s+/);
        if (subTokens.length >= 2 && subTokens.every(st => st.length === 1 && /[\u0600-\u06FF\u064B-\u065F]/.test(st))) {
          return subTokens.join('');
        }
        // Also handle mixed chunks
        return chunk.replace(/(?:(?<=^|\s)[\u0600-\u06FF]\s+){1,}[\u0600-\u06FF](?=$|\s)/g, m => {
          return m.replace(/\s+/g, '');
        });
      });
      return reconstructed.join(' ');
    }

    // Normal line with occasional spaced sequence
    return line.replace(/(?:(?<=^|\s)[\u0600-\u06FF]\s+){2,}[\u0600-\u06FF](?=$|\s)/g, m => {
      return m.replace(/\s+/g, '');
    });
  });

  return fixedLines
    .join('\n')
    .replace(/\s+([\u064B-\u0652])/g, '$1') // Re-attach tanween and harakat
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

const sample1 = "ﻋ ﻠ ﻰ   و ﻗ ﺪ ر ﺗ ﻬ ﺎ   ا ﻟ ﻜ ﻠ ﻤ ﺎ ت   ﻗ ﻮ ة   إ ﻟ ﻰ";
const sample2 = "ﺑ ﺎ ر ﻋ ًﺎ   ﻣ ﺘ ﺤ ﺪ ﺛ ًﺎ   ﻛ ﻮ ﻧ ﻪ   ﻟ ﻤ ﺠ ﺮ د   ﻟ ﯿ ﺲ   ﺟ ﻮ ﻧ ﺰ   د و ﯾ ﺖ   إ ﻟ ﻰ";
const sample3 = "أ ﺻ ﺒ ﺢ   أ ن   ﻓ ﻲ   ﻟ ﻤ ﺴ ﺎ ﻋ ﺪ ﺗ ﻲ   د و ﻣ ًﺎ   ا ﻟ ﻮ ﻗ ﺖ   ﻟ ﺘ ﺨ ﺼ ﯿ ﺼ ﻪ";
const sample4 = "Career Press ﻓ ﻲ   ا ﻟ ﻌ ﺎ ﻣ ﻠ ﯿ ﻦ   و ﺟ ﻤ ﯿ ﻊ   ،   ﻛ ﺎ ر ﻧ ﯿ ﺴ ﯿ ﻠ ﻠ ﻲ   ﻣ ﺎ ﺛ ﯿ ﻮ";
const normalArabic = "هذا نص عربي عادي وطبيعي جدا لا يجب أن تلتصق كلماته أبدا بل تبقى المسافات سليمة تماما.";

console.log("Fixed 1:", fixSpacedArabic(sample1));
console.log("Fixed 2:", fixSpacedArabic(sample2));
console.log("Fixed 3:", fixSpacedArabic(sample3));
console.log("Fixed 4:", fixSpacedArabic(sample4));
console.log("Normal:", fixSpacedArabic(normalArabic));
