import fs from 'fs';
import { getDocumentProxy } from 'unpdf';

async function testSpeakingText() {
  const filePath = 'C:/Users/abdra/OneDrive/Documents/Book/Noor-Book.com  التحدث أمام الناس في لحظة 2 .pdf';
  const buf = fs.readFileSync(filePath);
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  console.log(`Pages: ${pdf.numPages}`);

  for (let p = 5; p <= 10; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    const rawJoined = tc.items.map(x => x.str).join(' ');
    console.log(`\nPage ${p} raw items length: ${tc.items.length}`);
    console.log(`Sample: ${rawJoined.slice(0, 250)}`);
  }
}

testSpeakingText();
