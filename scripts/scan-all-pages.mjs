import fs from 'fs';
import { getDocumentProxy } from 'unpdf';

async function scanAllPages() {
  const filePath = 'C:/Users/abdra/OneDrive/Documents/Book/Noor-Book.com  اغتصاب العقل سيكولوجيا التحكم في الفكر وتشويه العقل وغسل الدماغ 3 .pdf';
  const buf = fs.readFileSync(filePath);
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  console.log(`Scanning all ${pdf.numPages} pages...`);

  let pagesWithText = 0;
  let nonTelegramChars = 0;

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    const str = tc.items.map(x => x.str).join(' ').trim();
    const withoutTelegram = str.replace(/https?:\/\/t\.me\/\w+/gi, '').trim();
    if (withoutTelegram.length > 5) {
      pagesWithText++;
      nonTelegramChars += withoutTelegram.length;
      if (pagesWithText <= 5) {
        console.log(`Page ${p} has text: ${withoutTelegram.slice(0, 100)}`);
      }
    }
  }

  console.log(`Results: Pages with text (excluding telegram watermark): ${pagesWithText} / ${pdf.numPages}`);
  console.log(`Total non-telegram chars in whole PDF: ${nonTelegramChars}`);
}

scanAllPages();
