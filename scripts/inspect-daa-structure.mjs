import fs from 'fs';
import { getDocumentProxy } from 'unpdf';

async function inspectDaa() {
  const filePath = 'C:/Users/abdra/OneDrive/Documents/Book/Noor-Book.com  الداء والدواء.pdf';
  const buf = fs.readFileSync(filePath);
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  console.log(`Total Pages: ${pdf.numPages}`);

  // Scan pages 10 to 60 to find where the actual book begins
  for (let p = 1; p <= 60; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    const str = tc.items.map(x => x.str).join(' ');
    if (str.includes('سئل') || str.includes('الجواب الكافي') || str.includes('ما تقول السادة') || str.includes('فصل')) {
      console.log(`\nPage ${p} has potential start:`);
      console.log(str.slice(0, 300));
    }
  }
}

inspectDaa();
