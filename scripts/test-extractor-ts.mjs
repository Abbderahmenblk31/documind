import fs from "fs";
import { extractDocumentContent } from "../src/lib/extractor.ts";

async function test() {
  const buf = fs.readFileSync("C:\\Users\\abdra\\Downloads\\بالكتاب الأول.pdf");
  const res = await extractDocumentContent(buf, "بالكتاب الأول.pdf", "application/pdf");
  console.log("EXTRACTED TEXT:\n" + res.text.slice(0, 500));
}

test();
