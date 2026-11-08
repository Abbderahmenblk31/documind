import fs from 'fs';
import path from 'path';
import { getDocumentProxy } from 'unpdf';

function normalizeArabicText(str) {
  if (!str) return '';
  return str
    .replace(/اأ|أ/g, 'أ')
    .replace(/اإ|إ/g, 'إ')
    .replace(/اآ|آ/g, 'آ')
    .replace(/األول/g, 'الأول')
    .replace(/األحمر/g, 'الأحمر')
    .replace(/األصفر/g, 'الأصفر')
    .replace(/األخضر/g, 'الأخضر')
    .replace(/األزرق/g, 'الأزرق')
    .replace(/األسطورة/g, 'الأسطورة')
    .replace(/األسئلة/g, 'الأسئلة')
    .replace(/األسباب/g, 'الأسباب')
    .replace(/األدلة/g, 'الأدلة')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[ \t]+/g, ' ');
}

async function extractFullText(filePath) {
  const buf = fs.readFileSync(filePath);
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  let full = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    for (const it of tc.items) {
      full += it.str + (it.hasEOL ? '\n' : ' ');
    }
    full += '\n';
  }
  return normalizeArabicText(full);
}

function parseUniversalDocument(clean, fileName) {
  const techniques = [];

  // Match chapter headings strictly:
  const headingRegex = /(?:^|\n)\s*(?:\*\*\*\s*)?(?:#{1,3}\s*)?(الفصل\s+(?:الأول|الاول|األول|الألول|أول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر|الحادي عشر|الثاني عشر|الثالث عشر|الرابع عشر|الخامس عشر|السادس عشر|السابع عشر|الثامن عشر|التاسع عشر|العشرون|\d{1,2}|[\u0660-\u0669]{1,2})[^\n:]*(?::[^\n]+)?)/gi;

  const matches = [];
  let m;
  while ((m = headingRegex.exec(clean)) !== null) {
    const rawHeader = m[1].replace(/^[#*\s]+|[#*\s]+$/g, '').trim();
    if (rawHeader.includes('ألي شخص') || rawHeader.includes('من العمل') || rawHeader.includes('أم هناك')) continue;
    matches.push({
      header: rawHeader,
      index: m.index,
    });
  }

  if (matches.length >= 3) {
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const next = matches[i + 1];
      const sectionText = clean.substring(current.index, next ? next.index : clean.length).trim();

      // Extract practical example if present
      let example = '';
      const exMatch = sectionText.match(/(?:مثال واقعي|السيناريو الشائع|تمرين عملي|كيف تحمي نفسك|كيف تطبق|مثال)\s*:\s*([^\n\*\#]{20,300})/i);
      if (exMatch) {
        example = '💡 سيناريو وتطبيق عملي: ' + exMatch[0].trim();
      } else {
        example = '💡 تطبيق عملي: قم بدمج وتطبيق مخرجات هذا المحور (' + current.header + ') في خطة عملك ومحادثاتك اليومية لقياس الأثر وتفادي الأخطاء الشائعة.';
      }

      // Extract principle
      let principle = '';
      const goalMatch = sectionText.match(/(?:الهدف|القاعدة الذهبية|النتيجة|الوهم الأكبر|المفهوم الجوهري)\s*:\s*([^\n\*\#]{25,250})/i);
      if (goalMatch) {
        principle = goalMatch[0].trim();
      } else {
        const paras = sectionText.split(/\n+/).map(p => p.trim()).filter(p => p.length > 25 && !p.startsWith('###') && !p.startsWith('---'));
        principle = paras[0] || sectionText.slice(0, 180);
      }

      techniques.push({
        id: i + 1,
        title: current.header,
        principle: principle.slice(0, 280),
        example: example.slice(0, 280),
        category: 'فصل ومحور تطبيقي',
      });
    }
  }

  return techniques;
}

(async () => {
  for (const f of ['بالكتاب الأول.pdf', '📗 الكتاب الثاني.pdf', '📙 الكتاب الثالث.pdf']) {
    const full = await extractFullText('C:/Users/abdra/Downloads/' + f);
    const result = parseUniversalDocument(full, f);
    console.log(`\n========================================`);
    console.log(`FILE: ${f} -> Extracted Chapters/Techniques: ${result.length}`);
    result.forEach(r => console.log(`  [#${r.id}] ${r.title}`));
  }
})();
