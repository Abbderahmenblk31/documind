import fs from 'fs';
import { getDocumentProxy } from 'unpdf';

async function checkPages() {
  const filePath = 'C:/Users/abdra/OneDrive/Documents/Book/Noor-Book.com  الداء والدواء.pdf';
  const buf = fs.readFileSync(filePath);
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  for (let p = 58; p <= 66; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    const str = tc.items.map(x => x.str).join(' ');
    console.log(`\n=== PAGE ${p} ===`);
    console.log(str.slice(0, 400));
  }
}

checkPages();
