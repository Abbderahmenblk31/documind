import fs from "fs";
import { getDocumentProxy } from "unpdf";

async function testExtractor(filePath) {
  const buf = fs.readFileSync(filePath);
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  console.log(`Pages: ${pdf.numPages}`);
  for (let i = 1; i <= Math.min(3, pdf.numPages); i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    console.log(`\n--- PAGE ${i} (${textContent.items.length} items) ---`);
    console.log(textContent.items.slice(0, 10).map(x => JSON.stringify(x.str)).join(", "));
  }
}

testExtractor("C:\\Users\\abdra\\Downloads\\بالكتاب الأول.pdf");
