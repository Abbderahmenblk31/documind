import fs from 'fs';
import { getDocumentProxy } from 'unpdf';

async function testMindRape() {
  const filePath = 'C:/Users/abdra/OneDrive/Documents/Book/Noor-Book.com  اغتصاب العقل سيكولوجيا التحكم في الفكر وتشويه العقل وغسل الدماغ 3 .pdf';
  console.log(`Checking: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.log("File not found!");
    return;
  }
  const buf = fs.readFileSync(filePath);
  console.log(`Size: ${(buf.length / (1024*1024)).toFixed(2)} MB`);

  try {
    const pdf = await getDocumentProxy(new Uint8Array(buf));
    console.log(`Pages: ${pdf.numPages}`);
    for (let p = 1; p <= Math.min(10, pdf.numPages); p++) {
      const page = await pdf.getPage(p);
      const tc = await page.getTextContent();
      const str = tc.items.map(x => x.str).join(' ').trim();
      console.log(`Page ${p}: items=${tc.items.length}, text length=${str.length}`);
      if (str.length > 0) {
        console.log(`   Sample: ${str.slice(0, 150)}`);
      }
    }
  } catch (err) {
    console.error("PDF parse error:", err);
  }
}

testMindRape();
