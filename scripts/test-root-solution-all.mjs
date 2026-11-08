import fs from 'fs';
import path from 'path';

async function runComprehensiveTests() {
  console.log('================================================================');
  console.log(' DocuMind Universal Root Solution - Comprehensive Audit');
  console.log(' Testing all books, scanned PDFs, CVs, and Concours documents');
  console.log('================================================================\n');

  const { analyzeDocumentText } = await import('../src/lib/ai/provider.js');

  const testSuite = [
    {
      name: 'التحدث أمام الناس في لحظة (60 Techniques, Keith Bailey)',
      fileName: 'Noor-Book.com  التحدث أمام الناس في لحظة 2 .pdf',
      text: 'ﻋ ﻠ ﻰ   و ﻗ ﺪ ر ﺗ ﻬ ﺎ   ا ﻟ ﻜ ﻠ ﻤ ﺎ ت   ﻗ ﻮ ة   إ ﻟ ﻰ Career Press جونز دويت بايلي كيث 1 الجمهور تحليل 2 للحديث تمهيدي مخطط إعداد',
      expectedBook: 'التحدث أمام الناس',
      expectedMinTech: 50,
      forbidden: ['180 208', 'ع ل ى', 'مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: '250 تقنية في التلاعب النفسي (لمى فياض)',
      fileName: 'Noor-Book.com  250 تقنية في التلاعب النفسي.pdf',
      text: 'كتاب 250 تقنية في التلاعب النفسي للباحثة لمى فياض',
      expectedBook: '250 تقنية',
      expectedMinTech: 200,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'الداء والدواء (ابن قيم الجوزية)',
      fileName: 'Noor-Book.com  الداء والدواء.pdf',
      text: 'الداء والدواء الجواب الكافي لمن سأل عن الدواء الشافي ابن قيم الجوزية',
      expectedBook: 'الداء والدواء',
      expectedMinTech: 12,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'اغتصاب العقل (يوست ميرلو - 457p Scanned PDF)',
      fileName: 'Noor-Book.com  اغتصاب العقل سيكولوجيا التحكم في الفكر وتشويه العقل وغسل الدماغ 3 .pdf',
      text: 'المستند اغتصاب العقل سيكولوجيا التحكم في الفكر وتشويه العقل وغسل الدماغ ملف مصور ضوئياً يوست ميرلو',
      expectedBook: 'اغتصاب العقل',
      expectedMinTech: 7,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'سيكولوجية الجماهير (غوستاف لوبون)',
      fileName: 'Noor-Book.com  سيكولوجية الجماهير.pdf',
      text: 'سيكولوجية الجماهير غوستاف لوبون العقل الجمعي تحريض الجماهير',
      expectedBook: 'سيكولوجية الجماهير',
      expectedMinTech: 6,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'تفسير القرطبي (الجامع لأحكام القرآن)',
      fileName: 'Noor-Book.com  الجامع لأحكام القرآن تفسير القرطبي 10 .pdf',
      text: 'الجامع لأحكام القرآن تفسير القرطبي الإمام أبو عبد الله القرطبي',
      expectedBook: 'القرطبي',
      expectedMinTech: 8,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'طرح الأسئلة المناسبة (فن طرح الأسئلة)',
      fileName: 'Noor-Book.com  طرح الأسئلة المناسبة.pdf',
      text: 'طرح الأسئلة المناسبة نيل براون ستيوارت كيللي التفكير النقدي',
      expectedBook: 'طرح الأسئلة',
      expectedMinTech: 11,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'ذكاء الإقناع (كيرت دبليو مورتينسين)',
      fileName: 'Ta3amul.com-ذكاء-الإقناع-كيرت-دبليو-مورتينسين.pdf',
      text: 'ذكاء الإقناع 12 قانوناً للتأثير الأقصى كيرت دبليو مورتينسين التنافر المعرفي',
      expectedBook: 'ذكاء الإقناع',
      expectedMinTech: 12,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'التركيز الفائق (كريس بيلي)',
      fileName: 'Ta3amul.com-التركيز-الفائق.pdf',
      text: 'التركيز الفائق كريس بيلي إدارة الانتباه التركيز المشتت',
      expectedBook: 'التركيز الفائق',
      expectedMinTech: 8,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'أول 20 ساعة (جوش كوفمان)',
      fileName: 'Ta3amul.com-اول-20-ساعة.pdf',
      text: 'أول 20 ساعة كيف تتعلم أي شيء بسرعة جوش كوفمان التفكيك المنهجي للمهارات',
      expectedBook: 'أول 20 ساعة',
      expectedMinTech: 8,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'رسائل من القرآن (أدهم شرقاوي)',
      fileName: 'Ta3amul.com-رسائل-من-القرآن.pdf',
      text: 'رسائل من القرآن أدهم شرقاوي التدبر الإيماني تزكية النفوس',
      expectedBook: 'رسائل من القرآن',
      expectedMinTech: 10,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'فن الاختلاط بالناس (جين مارتينت)',
      fileName: 'Ta3amul.com-فن-الاختلاط-بالناس-جين-مارتينت.pdf',
      text: 'فن الاختلاط بالناس جين مارتينت كسر الجليد التواصل الاجتماعي',
      expectedBook: 'فن الاختلاط بالناس',
      expectedMinTech: 8,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'فن الذكاء الاجتماعي (باتريك كينغ)',
      fileName: 'Ta3amul.com-فن-الذكاء-الاجتماعي-–-باتريك-كينغ.pdf',
      text: 'فن الذكاء الاجتماعي باتريك كينغ قراءة لغة الجسد والحضور الجذاب',
      expectedBook: 'فن الذكاء الاجتماعي',
      expectedMinTech: 8,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'قوة الانضباط الذاتي (براين تريسي)',
      fileName: 'Ta3amul.com-قوة-الانضباط-الذاتي.pdf',
      text: 'قوة الانضباط الذاتي لا أعذار براين تريسي الإرادة الصلبة والنجاح الشخصي',
      expectedBook: 'قوة الانضباط الذاتي',
      expectedMinTech: 9,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'قوة الفشل (شارلز مانز)',
      fileName: 'Ta3amul.com-قوة-الفشل-شارلز-مانز.pdf',
      text: 'قوة الفشل شارلز مانز التعلم من الأخطاء والمرونة النفسية',
      expectedBook: 'قوة الفشل',
      expectedMinTech: 8,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'ChatGPT خطوة خطوة (أكثر من 50 فكرة)',
      fileName: 'Ta3amul.com-ChatGPT-خطوة-خطوة-أكثر-من-50-فكرة.pdf',
      text: 'ChatGPT خطوة خطوة أكثر من 50 فكرة هندسة الأوامر Prompt Engineering',
      expectedBook: 'ChatGPT خطوة خطوة',
      expectedMinTech: 8,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'البرمجة بلغة بايثون',
      fileName: 'Ta3amul.com-البرمجة-بلغة-بايثون.pdf',
      text: 'البرمجة بلغة بايثون Python الدوال البرمجة كائنية التوجه OOP',
      expectedBook: 'البرمجة بلغة بايثون',
      expectedMinTech: 8,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'خواطري حول القرآن الكريم (تفسير الشعراوي)',
      fileName: 'Noor-Book.com  خواطري حول القرآن الكريم تفسير الشعراوي.pdf',
      text: 'خواطري حول القرآن الكريم فضيلة الشيخ محمد متولي الشعراوي الإعجاز البياني',
      expectedBook: 'تفسير الشعراوي',
      expectedMinTech: 10,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'الدليل إلى القرآن سؤال وجواب',
      fileName: 'Noor-Book.com  الدليل إلى القرآن سؤال وجواب 3 .pdf',
      text: 'الدليل إلى القرآن سؤال وجواب تدبر آيات التنزيل وأسباب النزول',
      expectedBook: 'الدليل إلى القرآن',
      expectedMinTech: 8,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'لسان العرب (ابن منظور)',
      fileName: 'Noor-Book.com  لسان العرب ط دار المعارف 2 .pdf',
      text: 'لسان العرب الإمام ابن منظور معجم لغوي أصول الاشتقاق شواهد التنزيل',
      expectedBook: 'لسان العرب',
      expectedMinTech: 8,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'فيشر يعلمك الشطرنج (Bobby Fischer)',
      fileName: 'Noor-Book.com  فيشر يعلمك الشطرنج 2 .pdf',
      text: 'فيشر يعلمك الشطرنج بوبي فيشر السيطرة على المركز وتكتيكات الشطرنج',
      expectedBook: 'الشطرنج',
      expectedMinTech: 8,
      forbidden: ['مؤشر أداء رئيسي', 'استخلاص وتوثيق'],
    },
    {
      name: 'السيرة الذاتية (Abderahmen BELKHIRIA_cv.pdf)',
      fileName: 'Abderahmen BELKHIRIA_cv.pdf',
      text: 'Abderahmen BELKHIRIA Opérateur CST Candidat Technicien Process Ingénieur en informatique',
      expectedBook: 'السيرة الذاتية',
      expectedMinTech: 6,
      forbidden: ['دراسة هيكلية معمقة لـ "180', 'مؤشر أداء رئيسي في خطتك التشغيلية', 'استخلاص وتوثيق'],
    },
    {
      name: 'استمارة ترشح لمناظرة وطنية (concours2025-2026.pdf)',
      fileName: 'concours2025-2026.pdf',
      text: 'مناظرة خارجية بعنوان سنة 2026/2025 استمارة ترشح المركز الوطني للإعلامية CNI الشهادة الوطنية لمهندس إعلامية',
      expectedBook: 'مناظرة',
      expectedMinTech: 5,
      forbidden: ['دراسة هيكلية معمقة لـ "180', 'مؤشر أداء رئيسي في خطتك التشغيلية', 'استخلاص وتوثيق'],
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const t of testSuite) {
    try {
      const res = await analyzeDocumentText(t.text, t.fileName);
      const techCount = res.techniques?.length || 0;
      const keyPointsCount = res.keyPoints?.length || 0;
      const allText = JSON.stringify(res);

      let hasForbidden = false;
      let matchedForbidden = '';
      for (const f of t.forbidden) {
        if (allText.includes(f)) {
          hasForbidden = true;
          matchedForbidden = f;
          break;
        }
      }

      const meetsTech = techCount >= t.expectedMinTech;
      const hasSummary = res.summary && res.summary.length > 30;
      const hasKeyPoints = keyPointsCount >= 4;

      if (meetsTech && hasSummary && hasKeyPoints && !hasForbidden) {
        console.log(`✅ PASS: ${t.name} -> ${techCount} Techniques | ${keyPointsCount} KeyPoints | 0 Forbidden`);
        passed++;
      } else {
        console.log(`❌ FAIL: ${t.name}`);
        if (!meetsTech) console.log(`   - Tech count: ${techCount} (expected >= ${t.expectedMinTech})`);
        if (!hasSummary) console.log(`   - Summary too short`);
        if (!hasKeyPoints) console.log(`   - KeyPoints: ${keyPointsCount}`);
        if (hasForbidden) console.log(`   - Found forbidden keyword: "${matchedForbidden}"`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ CRASH: ${t.name} -> ${err.message}`);
      failed++;
    }
  }

  console.log('\n================================================================');
  console.log(`TOTAL AUDIT RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');
  if (failed > 0) process.exit(1);
}

runComprehensiveTests();
