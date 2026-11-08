import fs from "fs";
import { getDocumentProxy } from "unpdf";

async function inspect(filePath, name) {
  console.log(`\n========================================`);
  console.log(`INSPECTING: ${name}`);
  console.log(`Path: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.log("FILE DOES NOT EXIST!");
    return;
  }
  const buf = fs.readFileSync(filePath);
  console.log(`Size: ${(buf.length / 1024).toFixed(1)} KB`);
  try {
    const pdf = await getDocumentProxy(new Uint8Array(buf));
    console.log(`NumPages: ${pdf.numPages}`);
    const p1 = await pdf.getPage(1);
    const tc1 = await p1.getTextContent();
    const str1 = tc1.items.map((i) => i.str).join(" ");
    console.log(`Page 1 text (len ${str1.length}):\n${str1.slice(0, 300)}`);

    let totalChars = 0;
    for (let p = 1; p <= Math.min(5, pdf.numPages); p++) {
      const page = await pdf.getPage(p);
      const tc = await page.getTextContent();
      const s = tc.items.map((i) => i.str).join(" ");
      totalChars += s.length;
    }
    console.log(`Total chars across first 5 pages: ${totalChars}`);
  } catch (err) {
    console.error("Error reading PDF:", err.message);
  }
}

async function run() {
  await inspect("C:\\Users\\abdra\\Downloads\\بالكتاب الأول.pdf", "بالكتاب الأول");
  await inspect("C:\\Users\\abdra\\Downloads\\📗 الكتاب الثاني.pdf", "الكتاب الثاني");
  await inspect("C:\\Users\\abdra\\Downloads\\📙 الكتاب الثالث.pdf", "الكتاب الثالث");
  await inspect("C:\\Users\\abdra\\OneDrive\\Documents\\Book\\Noor-Book.com  التحدث أمام الناس في لحظة 2 .pdf", "التحدث أمام الناس");
  await inspect("C:\\Users\\abdra\\OneDrive\\Documents\\Book\\Noor-Book.com  الداء والدواء.pdf", "الداء والدواء");
}

run();
