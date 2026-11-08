import fs from 'fs';
import path from 'path';
import { getDocumentProxy } from 'unpdf';

const downloadDir = 'C:/Users/abdra/Downloads';
const testFiles = [
  '📙 الكتاب الثالث.pdf',
  '📗 الكتاب الثاني.pdf',
  'بالكتاب الأول.pdf',
  'Noor-Book.com  محاط بالحمقى.pdf',
  'Noor-Book.com  الأمير 2 .pdf',
  'Noor-Book.com  لغة الجسد.pdf',
];

for (const file of testFiles) {
  const filePath = path.join(downloadDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`[SKIP] Not found: ${file}`);
    continue;
  }
  const buf = fs.readFileSync(filePath);
  console.log(`\n========================================`);
  console.log(`FILE: ${file} (${(buf.length / 1024).toFixed(1)} KB)`);
  try {
    const pdf = await getDocumentProxy(new Uint8Array(buf));
    console.log(`Pages: ${pdf.numPages}`);
    let text = '';
    const samplePages = Math.min(5, pdf.numPages);
    for (let p = 1; p <= samplePages; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      const pageText = content.items.map(it => it.str).join(' ');
      text += pageText + ' ';
    }
    console.log(`Sample text length (first ${samplePages} pages): ${text.length}`);
    const nonSpace = text.replace(/\s+/g, '').length;
    console.log(`Non-space chars: ${nonSpace}`);
    if (nonSpace > 50) {
      console.log(`Preview: ${text.slice(0, 200)}...`);
    } else {
      console.log(`WARNING: Likely SCANNED or image-only! Only ${nonSpace} chars`);
    }
  } catch (err) {
    console.error(`ERROR: ${err.message}`);
  }
}
