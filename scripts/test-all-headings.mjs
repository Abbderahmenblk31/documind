import fs from 'fs';
import { extractDocumentContent } from '../src/lib/extractor.ts';
import { extractUniversalTechniques } from '../src/lib/ai/universal-extractor.ts';

async function testHeadings() {
  const books = [
    { path: 'C:/Users/abdra/Downloads/📙 الكتاب الثالث.pdf', name: 'الكتاب الثالث.pdf' },
    { path: 'C:/Users/abdra/Downloads/📗 الكتاب الثاني.pdf', name: 'الكتاب الثاني.pdf' },
    { path: 'C:/Users/abdra/Downloads/بالكتاب الأول.pdf', name: 'بالكتاب الأول.pdf' },
  ];

  for (const b of books) {
    const buf = fs.readFileSync(b.path);
    const doc = await extractDocumentContent(buf, b.name, 'application/pdf');
    const techs = extractUniversalTechniques(doc.text, b.name);
    console.log(`\n${b.name}: Extracted ${techs.length} items!`);
    if (techs.length > 0) {
      console.log(`Item 1: [${techs[0].id}] ${techs[0].title}`);
      console.log(`   Principle: ${techs[0].principle.slice(0, 80)}...`);
      console.log(`   Example: ${techs[0].example.slice(0, 80)}...`);
    }
  }
}

testHeadings();
