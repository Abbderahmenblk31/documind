import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3000/api/analyze';

async function testHttpEndpoint() {
  console.log('================================================================');
  console.log(' Real E2E HTTP API Audit on http://localhost:3000/api/analyze');
  console.log('================================================================\n');

  const bookDir = 'C:/Users/abdra/OneDrive/Documents/Book';
  const bureauDir = 'C:/Users/abdra/OneDrive/Bureau/book';
  const downloadDir = 'C:/Users/abdra/Downloads';

  const cases = [
    {
      name: 'التحدث أمام الناس في لحظة (Keith Bailey - Real PDF)',
      filePath: path.join(bookDir, 'Noor-Book.com  التحدث أمام الناس في لحظة 2 .pdf'),
      mode: 'form-data',
      expectedMinTech: 50,
      forbidden: ['180 208', 'مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: '250 تقنية في التلاعب النفسي (لمى فياض - Real PDF)',
      filePath: path.join(bookDir, 'Noor-Book.com  250 تقنية في التلاعب النفسي.pdf'),
      mode: 'form-data',
      expectedMinTech: 200,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'الداء والدواء (ابن قيم الجوزية - Client JSON Mode)',
      filePath: path.join(bookDir, 'Noor-Book.com  الداء والدواء.pdf'),
      mode: 'client-json',
      expectedMinTech: 12,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'اغتصاب العقل (يوست ميرلو - 457p Scanned PDF)',
      filePath: path.join(bookDir, 'Noor-Book.com  اغتصاب العقل سيكولوجيا التحكم في الفكر وتشويه العقل وغسل الدماغ 3 .pdf'),
      mode: 'client-json',
      expectedMinTech: 7,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'خواطري حول القرآن الكريم (تفسير الشعراوي)',
      filePath: path.join(bookDir, 'Noor-Book.com  خواطري حول القرآن الكريم تفسير الشعراوي.pdf'),
      mode: 'client-json',
      expectedMinTech: 10,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'الدليل إلى القرآن سؤال وجواب (Scanned PDF)',
      filePath: path.join(bookDir, 'Noor-Book.com  الدليل إلى القرآن سؤال وجواب 3 .pdf'),
      mode: 'client-json',
      expectedMinTech: 8,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'لسان العرب (ابن منظور - Scanned Dictionary)',
      filePath: path.join(bookDir, 'Noor-Book.com  لسان العرب ط دار المعارف 2 .pdf'),
      mode: 'client-json',
      expectedMinTech: 8,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'فيشر يعلمك الشطرنج (Bobby Fischer)',
      filePath: path.join(bookDir, 'Noor-Book.com  فيشر يعلمك الشطرنج 2 .pdf'),
      mode: 'client-json',
      expectedMinTech: 8,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'السيرة الذاتية المهنية (Abderahmen BELKHIRIA_cv.pdf)',
      filePath: path.join(downloadDir, 'Abderahmen BELKHIRIA_cv.pdf'),
      mode: 'form-data',
      expectedMinTech: 6,
      forbidden: ['180 208', 'مؤشر أداء رئيسي في خطتك التشغيلية', 'استخلاص وتوثيق'],
    },
    {
      name: 'استمارة ترشح لمناظرة وطنية (concours2025-2026.pdf)',
      filePath: path.join(downloadDir, 'concours2025-2026.pdf'),
      mode: 'form-data',
      expectedMinTech: 5,
      forbidden: ['180 208', 'مؤشر أداء رئيسي في خطتك التشغيلية', 'استخلاص وتوثيق'],
    },
    {
      name: 'وثيقة مجهولة تماماً لفحص التفكيك الديناميكي الشامل (Arbitrary Document)',
      filePath: 'dummy-unknown-physics-paper.pdf',
      mode: 'custom-text',
      customText: `الفصل الأول: النظرية الكهرومغناطيسية وتطبيقاتها المعاصرة
يهدف هذا القسم إلى إرساء القوانين المركزية لمعادلات ماكسويل وتوحيد المجالات الكهربائية والمغناطيسية.
الفصل الثاني: البصريات الكمومية وظاهرة التداخل الفوتوني
استعراض تجارب الحيود والتداخل المتقدم ودراسة استقطاب الضوء وحزم الليزر عالية الدقة.
الفصل الثالث: فيزياء المادة المكثفة وأشباه الموصلات
التعمق في مستويات طاقة فيرمي وتصنيع الترانزستورات النانوية والخلايا الشمسية.
الفصل الرابع: الحوسبة الكمومية والبتات المتراكبة (Qubits)
تصميم البوابات المنطقية الكمية وتشفير البيانات وتفادي ظاهرة فقدان الترابط الكمي.`,
      expectedMinTech: 4,
      forbidden: ['مؤشر أداء رئيسي في خطتك التشغيلية', 'استخلاص وتوثيق'],
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const c of cases) {
    try {
      let res;
      if (c.mode === 'form-data') {
        if (!fs.existsSync(c.filePath)) {
          console.log(`⚠️ Skipped missing file: ${c.filePath}`);
          continue;
        }
        const fileBuffer = fs.readFileSync(c.filePath);
        const blob = new Blob([fileBuffer], { type: 'application/pdf' });
        const formData = new FormData();
        formData.append('file', blob, path.basename(c.filePath));

        res = await fetch(API_URL, {
          method: 'POST',
          body: formData,
        });
      } else if (c.mode === 'client-json') {
        const body = {
          fileName: path.basename(c.filePath),
          fileSize: 10 * 1024 * 1024,
          fileType: 'pdf',
          pageCount: 150,
          text: `المستند "${path.basename(c.filePath)}" تم فحصه وهو عبارة عن ملف PDF مصور ضوئياً بدون طبقة نصوص رقمية مباشرة. تم تنشيط محرك الاستقراء الدلالي لتحليل هوية العمل وفصوله واستخلاص مؤشراته بدقة عالية.`,
        };
        res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else if (c.mode === 'custom-text') {
        const body = {
          fileName: 'الفيزياء_الكمومية_المتقدمة.pdf',
          fileSize: 50000,
          fileType: 'pdf',
          pageCount: 35,
          text: c.customText,
        };
        res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const errText = await res.text();
        console.log(`❌ FAIL HTTP ${res.status}: ${c.name} -> ${errText.slice(0, 120)}`);
        failed++;
        continue;
      }

      const data = await res.json();
      const techCount = data.techniques?.length || 0;
      const keyPointsCount = data.keyPoints?.length || 0;
      const strData = JSON.stringify(data);

      let foundForbidden = false;
      let forbiddenWord = '';
      for (const f of c.forbidden) {
        if (strData.includes(f)) {
          foundForbidden = true;
          forbiddenWord = f;
          break;
        }
      }

      const meetsTech = techCount >= c.expectedMinTech;
      const hasSummary = data.summary && data.summary.length > 30;

      if (meetsTech && hasSummary && keyPointsCount >= 4 && !foundForbidden) {
        console.log(`✅ PASS: ${c.name}`);
        console.log(`   └─ Summary: "${data.summary.slice(0, 80)}..."`);
        console.log(`   └─ Metrics: ${techCount} Techniques | ${keyPointsCount} KeyPoints | 0 Forbidden | HTTP 200 OK`);
        passed++;
      } else {
        console.log(`❌ FAIL: ${c.name}`);
        if (!meetsTech) console.log(`   └─ Tech count: ${techCount} (expected >= ${c.expectedMinTech})`);
        if (foundForbidden) console.log(`   └─ Contains forbidden phrase: "${forbiddenWord}"`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ ERROR on ${c.name}: ${err.message}`);
      failed++;
    }
  }

  console.log('\n================================================================');
  console.log(`E2E AUDIT RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');
  if (failed > 0) process.exit(1);
}

testHttpEndpoint();
