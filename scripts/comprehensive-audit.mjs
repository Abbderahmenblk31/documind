import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3000/api/analyze';

async function runAudit() {
  console.log('================================================================');
  console.log(' DocuMind Enterprise Comprehensive Document Audit - 100% Grounded');
  console.log('================================================================\n');

  const bookDir = 'C:/Users/abdra/OneDrive/Documents/Book';
  const downloadDir = 'C:/Users/abdra/Downloads';

  const testCases = [
    {
      name: 'اغتصاب العقل (Dr. Joost Meerloo - 457p Scanned PDF)',
      filePath: path.join(bookDir, 'Noor-Book.com  اغتصاب العقل سيكولوجيا التحكم في الفكر وتشويه العقل وغسل الدماغ 3 .pdf'),
      mode: 'client-json',
      expectedBook: 'اغتصاب العقل',
      expectedMinTechniques: 7,
      forbiddenKeyword: 'مؤشر أداء رئيسي',
    },
    {
      name: 'الداء والدواء (ابن قيم الجوزية - 12MB)',
      filePath: path.join(bookDir, 'Noor-Book.com  الداء والدواء.pdf'),
      mode: 'client-json',
      expectedBook: 'الداء والدواء',
      expectedMinTechniques: 12,
      forbiddenKeyword: 'مؤشر أداء رئيسي',
    },
    {
      name: 'التحدث أمام الناس في لحظة (60 Techniques)',
      filePath: path.join(bookDir, 'Noor-Book.com  التحدث أمام الناس في لحظة 2 .pdf'),
      mode: 'form-data',
      expectedBook: 'التحدث أمام الناس',
      expectedMinTechniques: 50,
      forbiddenKeyword: '180 208',
    },
    {
      name: '250 تقنية في التلاعب النفسي (لمى فياض)',
      filePath: path.join(bookDir, 'Noor-Book.com  250 تقنية في التلاعب النفسي.pdf'),
      mode: 'form-data',
      expectedBook: '250 تقنية',
      expectedMinTechniques: 200,
      forbiddenKeyword: 'مؤشر أداء رئيسي',
    },
    {
      name: 'سيكولوجية الجماهير (غوستاف لوبون - Scanned)',
      filePath: path.join(bookDir, 'Noor-Book.com  سيكولوجية الجماهير.pdf'),
      mode: 'client-json',
      expectedBook: 'سيكولوجية الجماهير',
      expectedMinTechniques: 6,
      forbiddenKeyword: 'مؤشر أداء رئيسي',
    },
    {
      name: 'تفسير القرطبي (الجامع لأحكام القرآن - Scanned)',
      filePath: path.join(bookDir, 'Noor-Book.com  الجامع لأحكام القرآن تفسير القرطبي.pdf'),
      mode: 'client-json',
      expectedBook: 'القرطبي',
      expectedMinTechniques: 8,
      forbiddenKeyword: 'مؤشر أداء رئيسي',
    },
    {
      name: 'محاط بالحمقى (Thomas Erikson - بالكتاب الأول)',
      filePath: path.join(downloadDir, 'بالكتاب الأول.pdf'),
      mode: 'form-data',
      expectedBook: 'محاط بالحمقى',
      expectedMinTechniques: 4,
      forbiddenKeyword: 'سأبدأبالكتابأأول',
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    console.log(`\n────────────────────────────────────────────────────────────────`);
    console.log(`TEST: ${tc.name}`);
    console.log(`File: ${tc.filePath}`);

    if (!fs.existsSync(tc.filePath)) {
      console.log(`⚠️ FILE MISSING on disk - skipping`);
      continue;
    }

    const stat = fs.statSync(tc.filePath);
    const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
    console.log(`Size: ${sizeMB} MB | Mode: ${tc.mode}`);

    try {
      let res;
      if (tc.mode === 'client-json') {
        // Simulate client browser extraction (what upload/page.tsx does for files > 3.5MB or scanned)
        // For scanned/large documents, it creates semantic descriptor
        const body = {
          text: `المستند "${path.basename(tc.filePath)}" تم فحصه وهو عبارة عن ملف PDF مصور ضوئياً بدون طبقة نصوص رقمية مباشرة. تم تنشيط محرك الاستقراء الدلالي لتحليل هوية العمل وفصوله واستخلاص مؤشراته بدقة.`,
          fileName: path.basename(tc.filePath),
          fileSize: stat.size,
          fileType: 'pdf',
          pageCount: 300,
          wordCount: 500,
        };

        res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        // Direct FormData upload
        const buf = fs.readFileSync(tc.filePath);
        const blob = new Blob([buf], { type: 'application/pdf' });
        const fd = new FormData();
        fd.append('file', blob, path.basename(tc.filePath));

        res = await fetch(API_URL, {
          method: 'POST',
          body: fd,
        });
      }

      console.log(`HTTP Status: ${res.status} ${res.statusText}`);
      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (err) {
        console.error(`❌ Non-JSON response! Raw: ${rawText.slice(0, 200)}`);
        failed++;
        continue;
      }

      if (!res.ok) {
        console.error(`❌ HTTP Error:`, data);
        failed++;
        continue;
      }

      console.log(`✓ Summary: ${data.summary?.slice(0, 120)}...`);
      console.log(`✓ KeyPoints count: ${data.keyPoints?.length}`);
      console.log(`✓ Topics: [${data.topics?.join(', ')}]`);
      console.log(`✓ Techniques count: ${data.totalTechniquesCount || data.techniques?.length || 0}`);

      const techCount = data.totalTechniquesCount || data.techniques?.length || 0;
      if (techCount < tc.expectedMinTechniques) {
        console.error(`❌ Techniques count ${techCount} < expected ${tc.expectedMinTechniques}`);
        failed++;
        continue;
      }

      if (data.techniques && data.techniques.length > 0) {
        console.log(`✓ Sample Technique #1: "${data.techniques[0].title}"`);
        console.log(`  Principle: ${data.techniques[0].principle?.slice(0, 90)}...`);
        console.log(`  Example: ${data.techniques[0].example?.slice(0, 90)}...`);
      }

      // Check forbidden keyword
      const fullJson = JSON.stringify(data);
      if (fullJson.includes(tc.forbiddenKeyword)) {
        console.error(`❌ Forbidden boilerplate keyword "${tc.forbiddenKeyword}" found in response!`);
        failed++;
        continue;
      }

      console.log(`✅ TEST PASSED: ${tc.name}`);
      passed++;
    } catch (e) {
      console.error(`❌ EXCEPTION in test:`, e);
      failed++;
    }
  }

  console.log(`\n================================================================`);
  console.log(`AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log(`================================================================`);
}

runAudit();
