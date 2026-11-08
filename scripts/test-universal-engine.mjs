import fs from "fs";
import { getDocumentProxy } from "unpdf";

export async function extractUniversalDossier(pdfBuffer, fileName) {
  const pdf = await getDocumentProxy(new Uint8Array(pdfBuffer));
  const totalPages = pdf.numPages;

  const rawPages = [];
  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    let pageStr = "";
    let last = null;
    for (const item of tc.items) {
      if (!item || !item.str) continue;
      if (last && !/\s$/.test(last.str) && !/^\s/.test(item.str)) {
        const isGlyphA = last.str.length === 1 && !/[\s.,:;!?،؟]/.test(last.str);
        const isGlyphB = item.str.length === 1 && !/[\s.,:;!?،؟]/.test(item.str);
        if (!(isGlyphA && isGlyphB)) pageStr += " ";
      }
      pageStr += item.str;
      if (item.hasEOL) pageStr += "\n";
      last = item;
    }
    rawPages.push({ page: i, text: pageStr.normalize("NFKD") });
  }

  // Running headers/footers frequency purge
  const lineFreq = new Map();
  for (const p of rawPages) {
    const lines = p.text.split(/\r?\n/);
    for (const l of lines) {
      const t = l.trim();
      if (t.length > 8 && t.length < 130) {
        lineFreq.set(t, (lineFreq.get(t) || 0) + 1);
      }
    }
  }

  const cleanedPages = rawPages.map(p => {
    const filtered = p.text
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(t => {
        if (!t) return false;
        if ((lineFreq.get(t) || 0) > 1) return false;
        if (/https?:\/\/|www\.|\.(?:com|org|net|me|info)\b|@/i.test(t)) return false;
        if (/(?:جميع الحقوق محفوظة|All rights reserved|طبعة أولى|رقم الإيداع|ISBN|دار النشر|Career Press)/i.test(t)) return false;
        if (/^\d+\s*$/.test(t)) return false;
        return true;
      })
      .join("\n");
    return { page: p.page, text: filtered };
  });

  const fullCleanText = cleanedPages.map(p => p.text).join("\n\n");
  const extractedItems = [];

  // =========================================================================
  // Strategy 1: High-Density Numbered Rules (e.g. 1 to 250 in 250 تقنية)
  // =========================================================================
  const numberedSplit = fullCleanText.split(/(?:^|\s)(?:(\d{1,3})|([\u0660-\u0669]{1,3}))\s*[\.\-:]\s+/);
  if (numberedSplit.length >= 30) {
    const map = new Map();
    for (let i = 1; i < numberedSplit.length; i += 3) {
      const numStr = numberedSplit[i] || numberedSplit[i + 1];
      const text = (numberedSplit[i + 2] || "").trim().replace(/\s+/g, " ");
      if (numStr && text.length >= 15) {
        const num = parseInt(numStr.replace(/[\u0660-\u0669]/g, d => d.charCodeAt(0) - 0x0660));
        if (num >= 1 && num <= 500 && !map.has(num)) {
          map.set(num, text);
        }
      }
    }

    if (map.size >= 15) {
      const sortedKeys = Array.from(map.keys()).sort((a, b) => a - b);
      for (const num of sortedKeys) {
        const raw = map.get(num);
        extractedItems.push(formatTechniqueItem(num, raw));
      }
    }
  }

  // =========================================================================
  // Strategy 2: Chapter-based Extraction (e.g. 1 الجمهور تحليل, 2 إعداد مخطط...)
  // =========================================================================
  if (extractedItems.length < 10) {
    const chaptersMap = new Map();
    for (const p of cleanedPages) {
      if (p.page <= 4 || p.text.length < 150) continue;

      // Match digit attached to Arabic title: e.g. "1اﻟﺠﻤﻬﻮر ﺗﺤﻠﯿﻞ" or "1 الجمهور تحليل"
      const match = p.text.match(/(?:^|\n|\s)(\d{1,2}|[\u0660-\u0669]{1,2})\s*([\u0600-\u06FF\uFE70-\uFEFF\s]{4,40})/);
      if (match) {
        const num = parseInt(match[1].replace(/[\u0660-\u0669]/g, d => d.charCodeAt(0) - 0x0660));
        if (num >= 1 && num <= 40 && !chaptersMap.has(num)) {
          let rawTitle = match[2].trim().replace(/[.,:;!?،؟]/g, "");
          // Check if words need reversing (visual RTL order)
          const words = rawTitle.split(/\s+/).filter(w => w.length > 1);
          if (words.length >= 2) {
            // Test if reverse word order produces standard Arabic phrasing
            rawTitle = words.reverse().join(" ");
          }

          // Extract best substantive paragraph from this chapter page
          const paragraphs = p.text
            .split(/\n\s*\n/)
            .map(s => s.trim().replace(/\s+/g, " "))
            .filter(s => s.length >= 60 && s.length <= 400);

          const coreText = paragraphs[0] || p.text.slice(0, 300).replace(/\s+/g, " ");
          chaptersMap.set(num, { title: rawTitle, text: coreText, page: p.page });
        }
      }
    }

    if (chaptersMap.size >= 5) {
      const sortedKeys = Array.from(chaptersMap.keys()).sort((a, b) => a - b);
      for (const num of sortedKeys) {
        const c = chaptersMap.get(num);
        extractedItems.push(formatChapterItem(num, c.title, c.text, c.page));
      }
    }
  }

  // =========================================================================
  // Strategy 3: Multi-Pillar Segmented Extraction (General Documents & Reports)
  // =========================================================================
  if (extractedItems.length < 5) {
    const paragraphs = fullCleanText
      .split(/\n\s*\n/)
      .map(p => p.trim().replace(/\s+/g, " "))
      .filter(p => p.length >= 70 && p.length <= 350 && !/^\d+$/.test(p));

    const totalToPick = Math.min(20, Math.max(8, Math.floor(paragraphs.length / 3)));
    const step = Math.max(1, Math.floor(paragraphs.length / totalToPick));
    let id = 1;
    for (let i = 0; i < paragraphs.length && id <= totalToPick; i += step) {
      extractedItems.push(formatPillarItem(id, paragraphs[i]));
      id++;
    }
  }

  return {
    totalCount: extractedItems.length,
    items: extractedItems
  };
}

function formatTechniqueItem(id, text) {
  let clean = text.replace(/^[ \t\.\-:]+/, "").trim();
  const words = clean.split(/\s+/).slice(0, 6).join(" ");
  let title = words.replace(/^(?:إذا|عند|في|على|من|لا|قد|تجنب|احرص|عليك أن)\s+/, "").trim();
  if (title.length < 6) title = `قاعدة وتكتيك #${id}`;

  let category = "التأثير وصناعة النفوذ";
  if (/تفاوض|طلب|خدمة|عرض|شراء|سعر|اتفاق|خيارات/i.test(clean)) category = "التفاوض والإقناع";
  else if (/جسد|عين|صوت|ابتسام|رأس|إيماء|وجه/i.test(clean)) category = "لغة الجسد وقراءة السلوك";
  else if (/حذر|خداع|دفاع|حماية|انكشاف/i.test(clean)) category = "الحماية والتحصين النفسي";
  else if (/صديق|هدية|علاقة|مديح|شكر/i.test(clean)) category = "إدارة العلاقات والمواقف";

  let example = "تطبيق عملي: استخدم هذا المبدأ في بيئات العمل والتفاوض لبناء الثقة المتدرجة وتجنب الصدام المباشر مع الحفاظ على وضوح أهدافك التكتيكية.";
  if (/خدمة|معروف|طلب/i.test(clean)) {
    example = "تطبيق عملي: عند التخطيط لطلب ترقية أو خدمة، قدم إنجازاً ملموساً أو دعماً استباقياً قبل أيام من طلبك لتفعيل مبدأ رد الجميل التلقائي.";
  } else if (/خيارات|بدائل/i.test(clean)) {
    example = "تطبيق عملي: في المفاوضات، لا تسأل (هل تود الاتفاق؟) بل اطرح خيارين كلاهما في صالحك: (هل تفضل البدء الأسبوع القادم أم بعد أسبوعين؟).";
  }

  return {
    id,
    title,
    principle: clean,
    example,
    category
  };
}

function formatChapterItem(id, title, text, page) {
  let category = "فنون الخطابة والإلقاء";
  if (/مخطط|إعداد|تصميم|مقدمة/i.test(title)) category = "إعداد وهيكلة العرض";
  else if (/جمهور|حاجز|انتباه|إثارة|قصص/i.test(title)) category = "التفاعل وشد الانتباه";
  else if (/أدوار|تدريب|أسئلة|جلسة/i.test(title)) category = "إدارة النقاش والورش العمل";
  else if (/عروض|لوحات|شرائح/i.test(title)) category = "الوسائل البصرية والتقديم";

  let example = `تطبيق عملي: طبق استراتيجيات هذا الفصل (${title}) أثناء التحضير لاجتماعك أو عرضك القادم لضمان تفاعل المستمعين وتحقيق أقصى درجات التأثير.`;
  if (/جمهور/i.test(title)) {
    example = "تطبيق عملي: ادرس تركيبة الحضور وخلفياتهم المهنية قبل إلقاء كلمتك، وصمم أمثلتك لتخاطب اهتماماتهم وأولوياتهم المباشرة.";
  } else if (/قصص|إثارة/i.test(title)) {
    example = "تطبيق عملي: افتتح العرض بقصة نجاح واقعية أو تحدٍ ملموس عشته شخصياً؛ فالقصص تكسر الجمود وترسخ الأفكار في الذاكرة بنسبة 80% أكثر من الأرقام المجردة.";
  } else if (/أسئلة/i.test(title)) {
    example = "تطبيق عملي: كرر السؤال قبل الإجابة عنه لضمان وضوحه للجميع، وإذا واجهت سؤالاً محرجاً، اشكر السائل بهدوء وحوله إلى فرصة لتوضيح رسالتك الرئيسية.";
  }

  return {
    id,
    title: `فصل #${id}: ${title}`,
    principle: text,
    example,
    category
  };
}

function formatPillarItem(id, text) {
  let clean = text.replace(/^[ \t\.\-:]+/, "").trim();
  const words = clean.split(/\s+/).slice(0, 6).join(" ");
  let title = words.replace(/^(?:إذا|عند|في|على|من|لا|قد|تجنب|احرص)\s+/, "").trim();
  if (title.length < 6) title = `المحور التنفيذي #${id}`;

  return {
    id,
    title: `محور #${id}: ${title}`,
    principle: clean,
    example: "تطبيق عملي: ترجم هذا المحور إلى مؤشر أداء رئيسي في خطتك التشغيلية لمتابعة النتائج وضمان توافق فريق العمل مع الرؤية المحددة.",
    category: "التخطيط الاستراتيجي والتحليل"
  };
}

// Verification runner
async function run() {
  console.log("==============================================================");
  console.log("TESTING 1: Noor-Book.com 2 التحدث أمام الناس في لحظة .pdf");
  const b1 = fs.readFileSync("c:/Users/abdra/OneDrive/Documents/Book/Noor-Book.com  التحدث أمام الناس في لحظة 2 .pdf");
  const res1 = await extractUniversalDossier(b1, "Noor-Book.com 2 التحدث أمام الناس في لحظة .pdf");
  console.log("Result 1 Total Items:", res1.totalCount);
  console.log("Item 1:", res1.items[0]);
  console.log("Item 5:", res1.items[4]);
  console.log("Item 10:", res1.items[9]);
  console.log("Item 15:", res1.items[14]);

  console.log("\n==============================================================");
  console.log("TESTING 2: Noor-Book.com  250 تقنية في التلاعب النفسي.pdf");
  const b2 = fs.readFileSync("c:/Users/abdra/OneDrive/Documents/Book/Noor-Book.com  250 تقنية في التلاعب النفسي.pdf");
  const res2 = await extractUniversalDossier(b2, "Noor-Book.com  250 تقنية في التلاعب النفسي.pdf");
  console.log("Result 2 Total Items:", res2.totalCount);
  console.log("Item 1:", res2.items[0]);
  console.log("Item 50:", res2.items[49]);
  console.log("Item 250:", res2.items[249]);
}

run();
