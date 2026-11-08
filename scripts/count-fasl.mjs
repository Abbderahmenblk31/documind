import fs from 'fs';
import { getDocumentProxy } from 'unpdf';

async function countFasl() {
  const filePath = 'C:/Users/abdra/OneDrive/Documents/Book/Noor-Book.com  الداء والدواء.pdf';
  const buf = fs.readFileSync(filePath);
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  console.log(`Scanning 751 pages for 'فصل'...`);

  let faslCount = 0;
  const sampleFasls = [];

  for (let p = 76; p <= Math.min(250, pdf.numPages); p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    const str = tc.items.map(x => x.str).join(' ');
    const matches = str.match(/فصل\s*[:\s][^\n.]{10,80}/g);
    if (matches) {
      for (const m of matches) {
        faslCount++;
        if (sampleFasls.length < 15) sampleFasls.push(`[Page ${p}] ${m.trim()}`);
      }
    }
  }

  console.log(`Found ${faslCount} 'فصل' in pages 76-250!`);
  console.log(`Samples:\n`, sampleFasls.join('\n'));
}

countFasl();
