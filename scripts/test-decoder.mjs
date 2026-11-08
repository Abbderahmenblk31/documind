import fs from 'fs';
import { getDocumentProxy } from 'unpdf';

function decodeReversedArabic(str) {
  // 1. Normalize Arabic Presentation Forms (U+FB50 to U+FDFF and U+FE70 to U+FEFF)
  // normalize("NFKD") decomposes presentation forms into base Arabic letters!
  let normalized = str.normalize("NFKD");

  // 2. Check if this line or text is spaced Arabic letters:
  // e.g. sequences of single Arabic letter followed by a space
  const lines = normalized.split(/\r?\n/);
  const decodedLines = lines.map(line => {
    // If the line consists heavily of single Arabic letters separated by spaces
    const arabicLetters = line.match(/[\u0600-\u06FF]/g) || [];
    const spaces = line.match(/ /g) || [];
    
    // Check if space density indicates spaced letters
    if (arabicLetters.length > 5 && spaces.length >= arabicLetters.length * 0.4) {
      // Tokens separated by 2 or more spaces (or tabs) are distinct words!
      const wordTokens = line.split(/ {2,}|\t+/).filter(Boolean);
      const reconstructedWords = wordTokens.map(tok => {
        // Remove spaces inside the word token
        const stripped = tok.replace(/ (?=[\u0600-\u06FF])/g, '').trim();
        return stripped;
      }).filter(Boolean);

      // Check if words appear reversed (e.g. if punctuation is at start, or known reversed order)
      // Reverse word order back to RTL reading order
      return reconstructedWords.reverse().join(' ');
    }
    return line;
  });

  return decodedLines.join('\n');
}

async function testDecoder() {
  const filePath = 'C:/Users/abdra/OneDrive/Documents/Book/Noor-Book.com  التحدث أمام الناس في لحظة 2 .pdf';
  const buf = fs.readFileSync(filePath);
  const pdf = await getDocumentProxy(new Uint8Array(buf));

  for (let p of [7, 8, 10]) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    const rawJoined = tc.items.map(x => x.str).join(' ');
    console.log(`\n=== PAGE ${p} RAW ===`);
    console.log(rawJoined.slice(0, 180));
    console.log(`=== PAGE ${p} DECODED ===`);
    const decoded = decodeReversedArabic(rawJoined);
    console.log(decoded.slice(0, 180));
  }
}

testDecoder();
