import fs from 'fs';
import path from 'path';
import { getDocumentProxy } from 'unpdf';

const bookDir = 'C:/Users/abdra/OneDrive/Documents/Book';

async function scanAllBooks() {
  const files = fs.readdirSync(bookDir).filter(f => f.endsWith('.pdf'));
  console.log(`Found ${files.length} PDFs in ${bookDir}:`);

  for (const f of files) {
    const fullPath = path.join(bookDir, f);
    const stat = fs.statSync(fullPath);
    const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);
    try {
      const buf = fs.readFileSync(fullPath);
      const pdf = await getDocumentProxy(new Uint8Array(buf.slice(0, Math.min(buf.length, 5 * 1024 * 1024))));
      let chars = 0;
      for (let p = 1; p <= Math.min(5, pdf.numPages); p++) {
        const page = await pdf.getPage(p);
        const tc = await page.getTextContent();
        const str = tc.items.map(x => x.str).join(' ').trim();
        const clean = str.replace(/https?:\/\/\S+/g, '').trim();
        chars += clean.length;
      }
      console.log(`[${chars > 50 ? 'TEXT ' : 'SCAN '}] ${sizeMb} MB | Pgs: ${pdf.numPages} | Chars(p1-5): ${chars} | ${f.slice(0, 50)}`);
    } catch (err) {
      console.log(`[ERROR] ${sizeMb} MB | ${f.slice(0, 50)} | Error: ${err.message}`);
    }
  }
}

scanAllBooks();
