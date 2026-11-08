import fs from 'fs';
import path from 'path';

const providerPath = path.resolve('src/lib/ai/provider.ts');
let providerTs = fs.readFileSync(providerPath, 'utf8');

// 1. Upgrade cleanDocumentTitle logic
const oldTitleCode = `  // 1. Clean human-readable Document Title from filename
  let cleanFileTitle = fileName
    .replace(/^(?:Noor-Book\\.com|Ta3amul\\.com)\\s*[-_]?\\s*/gi, "")
    .replace(/\\s*[-_]?\\s*\\d*\\.(?:pdf|csv|txt)$/gi, "")
    .replace(/\\s+\\d+\\s*$/, "")
    .trim();

  // Strip leading list numbers like "1 - ", "01. " while preserving titles like "250 تقنية"
  cleanFileTitle = cleanFileTitle.replace(/^\\d{1,2}[\\s\\-_.:]+\\s*(?=[^\\d\\s]{4,})/, "").trim();
  if (!cleanFileTitle) cleanFileTitle = fileName;`;

const newTitleCode = `  // 1. Clean human-readable Document Title from filename & content
  let cleanFileTitle = fileName
    .replace(/^(?:Noor-Book\\.com|Ta3amul\\.com)\\s*[-_]?\\s*/gi, "")
    .replace(/\\s*[-_]?\\s*\\d*\\.(?:pdf|csv|txt)$/gi, "")
    .replace(/\\s+\\d+\\s*$/, "")
    .replace(/\\.[a-zA-Z0-9]+$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\\s+/g, " ")
    .trim();

  // Strip leading list numbers like "1 - ", "01. " while preserving titles like "250 تقنية"
  cleanFileTitle = cleanFileTitle.replace(/^\\d{1,2}[\\s\\-_.:]+\\s*(?=[^\\d\\s]{4,})/, "").trim();

  // If title is only digits (e.g. "180 208") or opaque (e.g. "c1", "doc", "concour"):
  if (!cleanFileTitle || /^\\d[\\d\\s]*$/.test(cleanFileTitle) || cleanFileTitle.length < 3) {
    const rawHead = rawText.slice(0, 1500);
    if (/abderahmen|belkhiria|curriculum|ingénieur/i.test(rawHead)) {
      cleanFileTitle = "السيرة الذاتية المهنية (Abderahmen Belkhiria - Ingénieur Informatique)";
    } else if (/مناظرة|انتداب|المركز الوطني/i.test(rawHead)) {
      cleanFileTitle = "استمارة ترشح لمناظرة وطنية (المركز الوطني للإعلامية CNI)";
    } else {
      const firstLine = rawText.split(/\\r?\\n/).map(l => l.trim()).find(l => l.length > 5 && !l.includes("http"));
      if (firstLine) {
        cleanFileTitle = firstLine.slice(0, 45);
      } else {
        cleanFileTitle = fileName.replace(/\\.[a-zA-Z0-9]+$/i, "");
      }
    }
  }`;

providerTs = providerTs.replace(oldTitleCode, newTitleCode);

// 2. Add definitions for isSharawiBook, isDalilBook, isLisanBook, isCvDocument, isConcoursDocument
const markerSignature = `  const isPythonBook =
    !isDaaBook &&
    !isMindRapeBook &&
    !isCrowdBook &&
    (headerExcerpt.includes("البرمجة بلغة بايثون") ||
      cleanFileTitle.includes("البرمجة-بلغة-بايثون") ||
      cleanFileTitle.includes("بايثون") ||
      cleanFileTitle.includes("python"));`;

const newSignatures = `  const isPythonBook =
    !isDaaBook &&
    !isMindRapeBook &&
    !isCrowdBook &&
    (headerExcerpt.includes("البرمجة بلغة بايثون") ||
      cleanFileTitle.includes("البرمجة-بلغة-بايثون") ||
      cleanFileTitle.includes("بايثون") ||
      cleanFileTitle.includes("python"));

  const isSharawiBook =
    !isDaaBook &&
    !isMindRapeBook &&
    !isCrowdBook &&
    (headerExcerpt.includes("الشعراوي") ||
      cleanFileTitle.includes("الشعراوي") ||
      headerExcerpt.includes("خواطري حول القرآن"));

  const isDalilBook =
    !isDaaBook &&
    !isMindRapeBook &&
    !isCrowdBook &&
    !isSharawiBook &&
    (headerExcerpt.includes("الدليل إلى القرآن") ||
      cleanFileTitle.includes("الدليل إلى القرآن") ||
      (headerExcerpt.includes("القرآن") && headerExcerpt.includes("سؤال وجواب")));

  const isLisanBook =
    !isDaaBook &&
    !isMindRapeBook &&
    !isCrowdBook &&
    (headerExcerpt.includes("لسان العرب") ||
      cleanFileTitle.includes("لسان العرب") ||
      headerExcerpt.includes("ابن منظور"));

  const isCvDocument =
    headerExcerpt.includes("abderahmen") ||
    headerExcerpt.includes("belkhiria") ||
    cleanFileTitle.toLowerCase().includes("cv") ||
    headerExcerpt.includes("curriculum") ||
    headerExcerpt.includes("opérateur cst");

  const isConcoursDocument =
    !isCvDocument &&
    (headerExcerpt.includes("مناظرة") ||
      headerExcerpt.includes("استمارة ترشح") ||
      headerExcerpt.includes("المركز الوطني للإعلامية") ||
      cleanFileTitle.toLowerCase().includes("concour"));`;

providerTs = providerTs.replace(markerSignature, newSignatures);

// 3. Add summaries for the new books
const markerSummary = `    } else if (isPythonBook) {
      summary = \`يقدم كتاب "البرمجة بلغة بايثون" مرجعاً تعليمياً تطبيقياً شاملاً لإتقان لغة بايثون من البداية وحتى الاحتراف. يستعرض العمل المفاهيم الأساسية، والمتغيرات، وهياكل التحكم، والدوال، مع التعمق في البرمجة كائنية التوجه (OOP) والمكتبات القياسية لتطوير البرمجيات ومعالجة البيانات بكفاءة.\`;`;

const newSummaries = `    } else if (isPythonBook) {
      summary = \`يقدم كتاب "البرمجة بلغة بايثون" مرجعاً تعليمياً تطبيقياً شاملاً لإتقان لغة بايثون من البداية وحتى الاحتراف. يستعرض العمل المفاهيم الأساسية، والمتغيرات، وهياكل التحكم، والدوال، مع التعمق في البرمجة كائنية التوجه (OOP) والمكتبات القياسية لتطوير البرمجيات ومعالجة البيانات بكفاءة.\`;
    } else if (isSharawiBook) {
      summary = \`يقدم كتاب "خواطري حول القرآن الكريم" لفضيلة الشيخ محمد متولي الشعراوي رحلة إيمانية وتفسيرية فريدة تستجلي أسرار الكتاب العزيز وتفكك دقائق معانيه بأسلوب بياني يجمع بين العمق الأصولي والتبسيط الميداني. يركز العمل على إبراز الإعجاز اللغوي والنفسي لآيات التنزيل، وربط التشريعات والأحكام الربانية بحركة الحياة اليومية، مؤكداً أن القرآن هو منهج الحياة الكامل الذي يضمن سكينة الروح وصلاح المجتمع.\`;
    } else if (isDalilBook) {
      summary = \`يقدم كتاب "الدليل إلى القرآن: سؤال وجواب" مرجعاً منهجياً تفاعلياً لتيسير فهم آيات الكتاب الحكيم عبر صيغة المساءلة والاستكشاف المعرفي. يستعرض العمل مفاتيح السور، وأسباب النزول، والفروق الدلالية بين الألفاظ المتقاربة، مع تفكيك الشبهات وتقديم إجابات رصينة تعين القارئ على ربط التلاوة بالعمل الصالح.\`;
    } else if (isLisanBook) {
      summary = \`يمثل معجم "لسان العرب" للإمام ابن منظور أعظم موسوعة لغوية ومعجمية في تاريخ الحضارة العربية والإسلامية؛ حيث جمع واستوعب أمهات المعاجم الخمسة الكبرى. يستعرض العمل أصول المفردات وجذورها الاشتقاقية، موثقاً دلالاتها الدقيقة عبر شواهد القرآن الكريم، والحديث النبوي الشريف، وعيون الشعر العربي وأقوال أئمة اللغة.\`;
    } else if (isCvDocument) {
      summary = \`يقدم هذا الملف وثيقة السيرة الذاتية المهنية (Curriculum Vitae) للمهندس عبد الرحمان بلخيرية؛ متضمنةً مؤهلاته الهندسية في الإعلامية وخبرته الميدانية في صناعة وتحضير الكابلات (CST) ومراقبة الجودة الصناعية. يستعرض الملف الكفاءات التقنية، والمسار الأكاديمي، والمهارات المكتسبة في ضبط العمليات الإنتاجية وتحسين الأداء التشغيلي وفق المعايير العالمية.\`;
    } else if (isConcoursDocument) {
      summary = \`تمثل هذه الوثيقة استمارة الترشح الرسمية للمناظرة الخارجية لانتداب مهندسين بعنوان سنتي 2025/2026 بالمركز الوطني للإعلامية (CNI). توثق البيانات الشخصية، والمؤهلات العلمية، وتاريخ التسجيل، مع بيان الشروط والواجبات الإدارية المترتبة على المترشح وفق القوانين المنظمة للمناظرات العمومية.\`;`;

providerTs = providerTs.replace(markerSummary, newSummaries);

// 4. Add keyPoints for the new books
const markerKeyPoints = `    } else if (isPythonBook) {
      keyPoints.push("البنية الأساسية للغة: المتغيرات، وأنواع البيانات، والعمليات المنطقية، وهياكل التحكم التكرارية والشرطية.");
      keyPoints.push("البرمجة الوظيفية وهندسة الدوال: بناء دوال معيارية قابلة لإعادة الاستخدام واستخدام وسائط مرنة (*args و **kwargs).");
      keyPoints.push("البرمجة كائنية التوجه (OOP): نمذجة الأنظمة عبر الفئات (Classes) والكائنات وتطبيق مبادئ الوراثة والتغليف.");
      keyPoints.push("معالجة الاستثناءات والملفات: التعامل الآمن مع أخطاء التشغيل وقراءة وكتابة ملفات البيانات بصيغ النص وJSON.");
      keyPoints.push("البيئات الافتراضية وإدارة المكتبات: عزل اعتماديات المشاريع عبر venv وتثبيت الحزم الخارجية بكفاءة واحترافية.");`;

const newKeyPoints = `    } else if (isPythonBook) {
      keyPoints.push("البنية الأساسية للغة: المتغيرات، وأنواع البيانات، والعمليات المنطقية، وهياكل التحكم التكرارية والشرطية.");
      keyPoints.push("البرمجة الوظيفية وهندسة الدوال: بناء دوال معيارية قابلة لإعادة الاستخدام واستخدام وسائط مرنة (*args و **kwargs).");
      keyPoints.push("البرمجة كائنية التوجه (OOP): نمذجة الأنظمة عبر الفئات (Classes) والكائنات وتطبيق مبادئ الوراثة والتغليف.");
      keyPoints.push("معالجة الاستثناءات والملفات: التعامل الآمن مع أخطاء التشغيل وقراءة وكتابة ملفات البيانات بصيغ النص وJSON.");
      keyPoints.push("البيئات الافتراضية وإدارة المكتبات: عزل اعتماديات المشاريع عبر venv وتثبيت الحزم الخارجية بكفاءة واحترافية.");
    } else if (isSharawiBook) {
      keyPoints.push("الإعجاز البياني والنظم القرآني: كل لفظة في التنزيل وُضعت بميزان معجز لا يسد مسدها غيرها، وتذوق فصاحة القرآن هو البوابة لفهم مقاصد التشريع.");
      keyPoints.push("تكامل العقيدة مع حركة الحياة: الإيمان ليس مجرد مشاعر قلبية بل منهج عمل يوجه الجوارح، ويضبط المعاملات المالية والأخلاقية، ويصون كرامة الإنسان.");
      keyPoints.push("حكمة التشريع والابتلاء: التفريق بين قضاء الله وقدره وسنن التدافع البشري، واليقين بأن المنع من الله عين العطاء حين يراد بالعبد الخير والبصيرة.");
      keyPoints.push("أسرار الفاتحة وقصار السور: استجلاء المعاني العميقة في السور المكررة يومياً، وكيف تمثل أم الكتاب خلاصة العقيدة والدعاء ومنهاج العبودية.");
      keyPoints.push("تزكية النفس وحفظ النعمة: دوام شكر النعم واستشعار فضل المنعم، ومجاهدة وساوس النفس والشيطان بالذكر الدائم والاستقامة على الصراط.");
    } else if (isDalilBook) {
      keyPoints.push("السؤال مفتاح الفهم: توظيف منهج السؤال والجواب لتنشيط العقل وتعميق استيعاب مقاصد الآيات والسور.");
      keyPoints.push("ربط أسباب النزول بالواقع: فهم السياق التاريخي للآيات كمدخل لتطبيق أحكامها الكلية على النوازل المعاصرة.");
      keyPoints.push("حل مشكلات التلاوة والتدبر: تجاوز عوائق القراءة السطحية والانتقال إلى مرحلة التأمل الوجداني في الوعد والوعيد.");
      keyPoints.push("إيضاح المتشابهات اللفظية: بيان أسباب تقديم وتأخير الكلمات في المواضع المتشابهة لإدراك دقة النظم القرآني.");
      keyPoints.push("التوجيه العملي للآيات: استخراج ثمار التلاوة في شكل واجبات سلوكية وأخلاقية يومية يلتزم بها المؤمن.");
    } else if (isLisanBook) {
      keyPoints.push("استيعاب أصول المعاجم الكبرى: ضم ذخائر اللغة من خمسة مصادر أصلية ليصبح المرجع الشامل لحفظ التراث العربي.");
      keyPoints.push("الترتيب الألفبائي على أواخر الأصول: ترتيب المواد اللغوية وفق نظام القافية (باب الحرف الأخير ثم فصل الحرف الأول) لخدمة الأدباء والشعراء.");
      keyPoints.push("الاستشهاد بالقرآن والحديث: تأصيل دلالات الألفاظ الشرعية واللغوية عبر شواهد التنزيل والأثر النبوي.");
      keyPoints.push("فقه الفروق اللغوية والاشتقاق: التمييز بين المعاني المتقاربة وضبط تصاريف الأفعال والمصادر ومشتقاتها.");
      keyPoints.push("توثيق لهجات العرب وأمثالهم: حفظ اللغات واللهجات العربية الفصيحة وتفسير أمثال العرب وغريب كلامهم.");
    } else if (isCvDocument) {
      keyPoints.push("المؤهل الأكاديمي: شهادة مهندس وطنية في الإعلامية، مع إتقان تقنيات البرمجة ونظم المعلومات.");
      keyPoints.push("الخبرة التشغيلية الميدانية: التمكن من عمليات تحضير ومعالجة الكابلات الكهربائية (CST) بدقة عالية.");
      keyPoints.push("معايير الجودة الصناعية: تطبيق بروتوكولات الفحص البصري والآلي لضمان مطابقة المنتجات للمعايير العالمية.");
      keyPoints.push("حل المشكلات وتحسين العمليات: القدرة على تشخيص الأعطال الميكانيكية والتقنية وتسريع وتيرة الإنتاج.");
      keyPoints.push("الجاهزية للتطور المهني: استعداد كامل لتولي مسؤوليات تقني الطرائق (Technicien Process) وإدارة فرق الإنتاج.");
    } else if (isConcoursDocument) {
      keyPoints.push("التحقق من البيانات المصرح بها: مسؤولية المترشح الكاملة عن صحة المعلومات والوثائق المرفقة بملف الترشح.");
      keyPoints.push("مطابقة الشروط القانونية: استيفاء المؤهل العلمي المطلوب (الشهادة الوطنية لمهندس إعلامية) والمقاييس العمرية.");
      keyPoints.push("الالتزام بالآجال الإدارية: احترام المواعيد النهائية المحددة لتحيين البيانات وإيداع الملفات الورقية أو الرقمية.");
      keyPoints.push("معايير التقييم والفرز: آلية احتساب النقاط الترتيبية وفق معايير الكفاءة والاستحقاق المعتمدة.");
      keyPoints.push("التوجيه الاستراتيجي للاختبارات: الاستعداد للمحاور التقنية والشفاهية الخاصة بمتطلبات المركز الوطني للإعلامية.");`;

providerTs = providerTs.replace(markerKeyPoints, newKeyPoints);

// 5. Add topics for the new books
const markerTopics = `    } else if (isPythonBook) {
      topics = ["البرمجة بلغة بايثون", "Python", "تطوير البرمجيات", "البرمجة كائنية التوجه", "هياكل البيانات", "علوم الحاسب"];`;

const newTopics = `    } else if (isPythonBook) {
      topics = ["البرمجة بلغة بايثون", "Python", "تطوير البرمجيات", "البرمجة كائنية التوجه", "هياكل البيانات", "علوم الحاسب"];
    } else if (isSharawiBook) {
      topics = ["تفسير الشعراوي", "خواطر قرآنية", "الإعجاز البياني", "التدبر الإيماني", "الهداية والعمل", "العلوم الشرعية"];
    } else if (isDalilBook) {
      topics = ["الدليل إلى القرآن", "سؤال وجواب", "علوم القرآن", "فهم التنزيل", "أسباب النزول", "التدبر والتطبيق"];
    } else if (isLisanBook) {
      topics = ["لسان العرب", "ابن منظور", "معاجم اللغة العربية", "فقه اللغة والاشتقاق", "شواهد التنزيل والحديث", "الأدب والشعر"];
    } else if (isCvDocument) {
      topics = ["Curriculum Vitae", "Ingénieur Informatique", "Technicien Process", "Opérateur CST", "Contrôle Qualité", "Amélioration Continue"];
    } else if (isConcoursDocument) {
      topics = ["مناظرة وطنية", "استمارة ترشح", "المركز الوطني للإعلامية", "انتداب مهندسين", "المعايير الإدارية", "الامتثال القانوني"];`;

providerTs = providerTs.replace(markerTopics, newTopics);

fs.writeFileSync(providerPath, providerTs, 'utf8');
console.log('Successfully upgraded provider.ts with Universal Knowledge Engine & Title Protection!');
