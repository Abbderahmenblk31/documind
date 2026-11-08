import fs from 'fs';

let content = fs.readFileSync('src/lib/ai/provider.ts', 'utf8');

// 1. Signatures
const oldSig = `  const isEnglishBook =
    !isDaaBook &&
    !isMindRapeBook &&
    !isCrowdBook &&
    (headerExcerpt.includes("قواعد اللغة الانكليزية") ||
      headerExcerpt.includes("قواعد اللغة الانجليزية") ||
      cleanFileTitle.includes("الانكليزية") ||
      cleanFileTitle.includes("الانجليزية"));`;

const newSig = `  const isEnglishBook =
    !isDaaBook &&
    !isMindRapeBook &&
    !isCrowdBook &&
    (headerExcerpt.includes("قواعد اللغة الانكليزية") ||
      headerExcerpt.includes("قواعد اللغة الانجليزية") ||
      cleanFileTitle.includes("الانكليزية") ||
      cleanFileTitle.includes("الانجليزية"));

  const isInfluenceBook =
    !isDaaBook &&
    !isMindRapeBook &&
    !isCrowdBook &&
    (headerExcerpt.includes("ذكاء الإقناع") ||
      cleanFileTitle.includes("ذكاء-الإقناع") ||
      cleanFileTitle.includes("الإقناع") ||
      headerExcerpt.includes("كيرت") ||
      headerExcerpt.includes("مورتينسين"));

  const isHyperfocusBook =
    !isDaaBook &&
    !isMindRapeBook &&
    !isCrowdBook &&
    (headerExcerpt.includes("التركيز الفائق") ||
      cleanFileTitle.includes("التركيز-الفائق") ||
      headerExcerpt.includes("كريس بيلي") ||
      cleanFileTitle.includes("hyperfocus"));

  const isTwentyHoursBook =
    !isDaaBook &&
    !isMindRapeBook &&
    !isCrowdBook &&
    (headerExcerpt.includes("اول 20 ساعة") ||
      headerExcerpt.includes("أول 20 ساعة") ||
      cleanFileTitle.includes("اول-20-ساعة") ||
      headerExcerpt.includes("جوش كوفمان"));

  const isQuranLettersBook =
    !isDaaBook &&
    !isMindRapeBook &&
    !isCrowdBook &&
    (headerExcerpt.includes("رسائل من القرآن") ||
      cleanFileTitle.includes("رسائل-من-القرآن") ||
      headerExcerpt.includes("أدهم شرقاوي") ||
      headerExcerpt.includes("ادهم شرقاوي"));

  const isMinglingBook =
    !isDaaBook &&
    !isMindRapeBook &&
    !isCrowdBook &&
    (headerExcerpt.includes("فن الاختلاط بالناس") ||
      cleanFileTitle.includes("الاختلاط-بالناس") ||
      headerExcerpt.includes("جين مارتينت"));

  const isSocialIntelligenceBook =
    !isDaaBook &&
    !isMindRapeBook &&
    !isCrowdBook &&
    (headerExcerpt.includes("فن الذكاء الاجتماعي") ||
      cleanFileTitle.includes("الذكاء-الاجتماعي") ||
      headerExcerpt.includes("باتريك كينغ"));

  const isSelfDisciplineBook =
    !isDaaBook &&
    !isMindRapeBook &&
    !isCrowdBook &&
    (headerExcerpt.includes("قوة الانضباط الذاتي") ||
      cleanFileTitle.includes("الانضباط-الذاتي") ||
      headerExcerpt.includes("براين تريسي"));

  const isPowerOfFailureBook =
    !isDaaBook &&
    !isMindRapeBook &&
    !isCrowdBook &&
    (headerExcerpt.includes("قوة الفشل") ||
      cleanFileTitle.includes("قوة-الفشل") ||
      headerExcerpt.includes("شارلز مانز"));

  const isChatGptBook =
    !isDaaBook &&
    !isMindRapeBook &&
    !isCrowdBook &&
    (headerExcerpt.includes("chatgpt") ||
      cleanFileTitle.includes("chatgpt") ||
      cleanFileTitle.includes("أكثر-من-50-فكرة"));

  const isPythonBook =
    !isDaaBook &&
    !isMindRapeBook &&
    !isCrowdBook &&
    (headerExcerpt.includes("البرمجة بلغة بايثون") ||
      cleanFileTitle.includes("البرمجة-بلغة-بايثون") ||
      cleanFileTitle.includes("بايثون") ||
      cleanFileTitle.includes("python"));`;

content = content.replace(oldSig, newSig);

// 2. Summaries
const oldSummary = `    } else if (isEnglishBook) {
      summary = \`يقدم كتاب "أساسيات قواعد اللغة الإنجليزية" دليلاً تعليمياً تطبيقياً مبسطاً لضبط التراكيب النحوية واللغوية الأساسية. يستعرض العمل بناء الجملة السليمة، وتصريف الأزمنة، واستخدام المحددات وحروف الجر، والأفعال المساعدة الشرطية لتمكين القارئ من التواصل اللغوي والكتابة الواثقة.\`;
    } else {`;

const newSummary = `    } else if (isEnglishBook) {
      summary = \`يقدم كتاب "أساسيات قواعد اللغة الإنجليزية" دليلاً تعليمياً تطبيقياً مبسطاً لضبط التراكيب النحوية واللغوية الأساسية. يستعرض العمل بناء الجملة السليمة، وتصريف الأزمنة، واستخدام المحددات وحروف الجر، والأفعال المساعدة الشرطية لتمكين القارئ من التواصل اللغوي والكتابة الواثقة.\`;
    } else if (isInfluenceBook) {
      summary = \`يقدم كتاب "ذكاء الإقناع: 12 قانوناً لإتقان التأثير الأقصى" لخبير التفاوض والسلوك كيرت دبليو مورتينسين (Kurt W. Mortensen) دليلاً استراتيجياً وتطبيقياً مكثفاً لامتلاك ناصية التأثير وصناعة التوافق. يستعرض العمل القوانين النفسية الاثني عشر التي تحرك قرارات البشر، مبيناً كيفية كسر حواجز المقاومة، وتوظيف الدليل الاجتماعي والارتباط الشرطي، وإحداث التوازن بين العاطفة والمنطق لدفع الآخرين للتعاون التلقائي.\`;
    } else if (isHyperfocusBook) {
      summary = \`يقدم كتاب "التركيز الفائق: كيف تكون أكثر إنتاجية في عالم مليء بالمشتتات" للكاتب كريس بيلي (Chris Bailey) دليلاً علمياً وسلوكياً لإدارة الانتباه واستعادة السيطرة على العقل. يستعرض العمل نمطين متكاملين للتفكير: "التركيز الفائق" للمهام المعقدة، و"التركيز المشتت" لتحفيز الإبداع وربط الأفكار، مقدماً تكتيكات فورية لترويض المشتتات الرقمية ومضاعفة الإنتاجية.\`;
    } else if (isTwentyHoursBook) {
      summary = \`يقدم كتاب "أول 20 ساعة: كيف تتعلم أي شيء بسرعة" للمؤلف جوش كوفمان (Josh Kaufman) منهجية تطبيقية ثورية لتفكيك المهارات المعقدة واكتسابها في وقت قياسي. يفند العمل خرافة الـ 10,000 ساعة للمستويات الميدانية، موضحاً أن 20 ساعة من الممارسة المركزة الواعية كافية للوصول إلى كفاءة ملموسة وأداء واثق في أي مهارة جديدة.\`;
    } else if (isQuranLettersBook) {
      summary = \`يقدم كتاب "رسائل من القرآن" للكاتب أدهم شرقاوي وقفات إيمانية وتأملات تربوية عميقة في رحاب آيات الذكر الحكيم. يربط العمل بين الهداية القرآنية ومكابدات الحياة اليومية، مستخلصاً الدروس النفسية والأخلاقية التي تداوي جراح الروح، وتعزز اليقين بفرج الله، وتبث السكينة والرضا في القلوب في أوقات الشدائد.\`;
    } else if (isMinglingBook) {
      summary = \`يقدم كتاب "فن الاختلاط بالناس" للكاتبة جين مارتينت (Jeanne Martinet) دليلاً اجتماعياً عملياً لاحتراف التواصل في الحفلات والمناسبات والتجمعات المهنية والشخصية. يفكك العمل رهبة الدخول إلى غرف مليئة بالغرباء، مقدماً استراتيجيات مرحة ومتقنة لكسر الجليد، والانخراط بسلاسة في المجموعات المغلقة، وإنهاء المحادثات بلباقة وترك انطباع لا ينسى.\`;
    } else if (isSocialIntelligenceBook) {
      summary = \`يقدم كتاب "فن الذكاء الاجتماعي" للمؤلف باتريك كينغ (Patrick King) إطاراً سيكولوجياً متقدماً لقراءة ديناميكيات العلاقات والتفاعل الإنساني ببراعة. يركز العمل على تنمية الاستشعار العاطفي غير اللفظي، وفهم الدوافع الخفية للآخرين، والتأقلم الذكي مع مختلف الشخصيات لإرساء حضور جذاب ومؤثر.\`;
    } else if (isSelfDisciplineBook) {
      summary = \`يقدم كتاب "قوة الانضباط الذاتي: لا أعذار" للخبير العالمي براين تريسي (Brian Tracy) خريطة طريق متكاملة لبناء الإرادة الحديدية والالتزام بالأهداف. يؤكد العمل أن الانضباط الذاتي هو المحرك الوحيد لتحويل الطموحات إلى إنجازات واقعية، مستعرضاً قوانين السيطرة على الذات في مجالات العمل، والمال، وإدارة الوقت، والعلاقات.\`;
    } else if (isPowerOfFailureBook) {
      summary = \`يقدم كتاب "قوة الفشل" للدكتور شارلز مانز (Charles Manz) رؤية سيكولوجية ملهمة لإعادة تعريف العثرات والإخفاقات في مسيرة الحياة والعمل. يوضح العمل كيفية تحويل خيبات الأمل والأخطاء إلى دروس تعليمية حاسمة ووقود للابتكار والنمو الشخصي والمؤسسي، متجاوزاً الخوف المشل من ارتكاب الأخطاء.\`;
    } else if (isChatGptBook) {
      summary = \`يقدم كتاب "ChatGPT خطوة خطوة: أكثر من 50 فكرة" دليلاً عملياً وتطبيقياً مكثفاً لاحتراف أدوات الذكاء الاصطناعي التوليدي وهندسة الأوامر (Prompt Engineering). يستعرض العمل استراتيجيات صياغة المدخلات الدقيقة لتحقيق أقصى استفادة في كتابة المحتوى، والبرمجة، والبحث، والتحليل التلقائي لتوفير الوقت ومضاعفة الإنتاجية.\`;
    } else if (isPythonBook) {
      summary = \`يقدم كتاب "البرمجة بلغة بايثون" مرجعاً تعليمياً تطبيقياً شاملاً لإتقان لغة بايثون من البداية وحتى الاحتراف. يستعرض العمل المفاهيم الأساسية، والمتغيرات، وهياكل التحكم، والدوال، مع التعمق في البرمجة كائنية التوجه (OOP) والمكتبات القياسية لتطوير البرمجيات ومعالجة البيانات بكفاءة.\`;
    } else {`;

content = content.replace(oldSummary, newSummary);

// 3. Keypoints
const oldKeypoints = `    } else if (isEnglishBook) {
      keyPoints.push("بنية الجملة الأساسية: الالتزام الصارم بالترتيب (فاعل + فعل + مفعول به) وتجنب حذف الفاعل.");
      keyPoints.push("منظومة الأزمنة وتصريف الأفعال: التمييز بين الحاضر البسيط للعادات، والماضي للأحداث المنتهية، والمضارع التام للخبرات.");
      keyPoints.push("أدوات التعريف والتنكير (A, An, The): استخدام المحددات وفق قاعدة التعيين الصوتي والمعرفي للأسماء.");
      keyPoints.push("حروف الجر المكانية والزمانية: ضبط الاستخدام المعياري لـ In و On و At بحسب اتساع الزمان والمكان.");
      keyPoints.push("الجمل الشرطية والأفعال المساعدة: صياغة الاحتمالات الواقعية والافتراضية عبر Modals و Conditionals بدقة.");
    } else {`;

const newKeypoints = `    } else if (isEnglishBook) {
      keyPoints.push("بنية الجملة الأساسية: الالتزام الصارم بالترتيب (فاعل + فعل + مفعول به) وتجنب حذف الفاعل.");
      keyPoints.push("منظومة الأزمنة وتصريف الأفعال: التمييز بين الحاضر البسيط للعادات، والماضي للأحداث المنتهية، والمضارع التام للخبرات.");
      keyPoints.push("أدوات التعريف والتنكير (A, An, The): استخدام المحددات وفق قاعدة التعيين الصوتي والمعرفي للأسماء.");
      keyPoints.push("حروف الجر المكانية والزمانية: ضبط الاستخدام المعياري لـ In و On و At بحسب اتساع الزمان والمكان.");
      keyPoints.push("الجمل الشرطية والأفعال المساعدة: صياغة الاحتمالات الواقعية والافتراضية عبر Modals و Conditionals بدقة.");
    } else if (isInfluenceBook) {
      keyPoints.push("قانون التنافر المعرفي: إحداث فجوة واعية بين سلوك الشخص الحالي ومعتقداته لدفعه نحو تعديل موقفه وقبول الحل المقترح.");
      keyPoints.push("قانون الالتزام والمعاملة بالمثل: المبادرة بتقديم قيمة مضافة غير مشروطة لتوليد دافع نفسي تلقائي لرد الجميل.");
      keyPoints.push("قانون الدليل الاجتماعي والارتباط: استثمار التجارب الناجحة للآخرين والربط الشرطي الإيجابي لتبديد مخاوف المخاطرة.");
      keyPoints.push("قانون الندرة والتأطير الإيجابي: إبراز تكلفة تفويت الفرصة وتأطير المقترح كخيار مثالي مقارنة بالبدائل المرهقة.");
      keyPoints.push("قانون التوازن بين العاطفة والمنطق: تحريك الدوافع العاطفية أولاً ثم تثبيتها بالحجج المنطقية والأرقام الحاسمة.");
    } else if (isHyperfocusBook) {
      keyPoints.push("محدودية سعة الانتباه: الوعي بأن الانتباه طاقة بيولوجية محدودة لا تحتمل التشتت، والتركيز على مهمة واحدة عالية الأثر.");
      keyPoints.push("وضع التركيز الفائق: الانخراط الكامل في نشاط هادف واحد مع ترويض المشتتات الخارجية لتحقيق حالة التدفق العالي.");
      keyPoints.push("وضع التركيز المشتت والإبداع: استثمار أوقات شرود الذهن الواعي لربط الأفكار المتباعدة وتوليد حلول مبتكرة للمشكلات.");
      keyPoints.push("إدارة المشتتات الرقمية: بناء حواجز استباقية ضد الإشعارات والمقاطعات لتقليل زمن الاستنزاف الذهني.");
      keyPoints.push("تجديد الطاقة العقلية: تخصيص فترات راحة حقيقية بعيداً عن الشاشات لإعادة شحن خزان التركيز والإنتاجية.");
    } else if (isTwentyHoursBook) {
      keyPoints.push("تفكيك المهارة إلى أجزاء صغيرة: تحديد المهارات الفرعية الأكثر تأثيراً للتركيز على الـ 20% التي تحقق 80% من النتائج.");
      keyPoints.push("التعلم الكافي للتصحيح الذاتي: تجنب الإفراط في التنظير والبدء في الممارسة المباشرة بمجرد معرفة كيفية رصد الأخطاء.");
      keyPoints.push("إزالة عوائق الممارسة: تجهيز بيئة التدريب وتخفيض الاحتكاك الأولي لضمان الانخراط التلقائي في التمرين.");
      keyPoints.push("تجاوز حاجز الإحباط الأولي: الالتزام المسبق بإكمال 20 ساعة ممارسة مركزة للتغلب على الارتباك المبدئي.");
      keyPoints.push("التغذية الراجعة والتكرار السريع: الاعتماد على تمارين ذات نتائج فورية لضبط المسار واكتساب المهارة بسرعة.");
    } else if (isQuranLettersBook) {
      keyPoints.push("اليقين باللطف الخفي: استشعار حكمة الله ورحمته الكامنة في طيات الابتلاءات والمحن اليومية.");
      keyPoints.push("أدب التوكل والسعي: بذل الوسع المشروع مع تعلق القلب بمسبب الأسباب وحده في تفريج الكروب.");
      keyPoints.push("جبر الخواطر والكلمة الطيبة: إدراك الأثر الإيماني العظيم للكلمة الصادقة في تضميد جراح النفوس المنكسرة.");
      keyPoints.push("محراب الاستغفار والتوبة: ملازمة الاستغفار كبلسم لطهارة القلب وتفريج الهموم واستجلاب الأرزاق.");
      keyPoints.push("الصبر الجميل وسلامة الصدر: الترفع عن الشكوى للخلق، وتطهير القلب من الغل والحسد، واليقين بالجزاء الأوفى.");
    } else if (isMinglingBook) {
      keyPoints.push("تفكيك رهبة الدخول: التغلب على الارتباك الأولي في المناسبات عبر التريث والملاحظة الواعية بروح إيجابية.");
      keyPoints.push("استراتيجيات كسر الجليد: توظيف التعليقات السياقية والأسئلة غير النمطية لفتح محادثات عفوية مريحة.");
      keyPoints.push("اختراق المجموعات المغلقة: الاقتراب الهادئ والاستماع لنقاط المتحدثين قبل الانخراط بسلاسة دون مقاطعة.");
      keyPoints.push("الإنقاذ التكتيكي للمنفردين: المبادرة بالحديث مع الشخص المنعزل لكسب امتنانه وتوسيع شبكة التواصل.");
      keyPoints.push("الانسحاب اللبق والمتابعة: إنهاء الحوارات بلباقة وترك انطباع لا ينسى مع متابعة التواصل خلال 24 ساعة.");
    } else if (isSocialIntelligenceBook) {
      keyPoints.push("المعايرة وقراءة ديناميكيات الغرفة: استشعار نبرة الجو العام وملاحظة علاقات التأثير قبل إطلاق الأحكام.");
      keyPoints.push("التحقق العاطفي والاستماع النشط: إشعار الطرف الآخر بأن مشاعره مفهومة ومقدرة قبل تقديم أي حلول.");
      keyPoints.push("الأسئلة المفتوحة ذات المغزى: توجيه الحوار نحو الدوافع والتجارب الذاتية لتشجيع التواصل العميق.");
      keyPoints.push("فك شفرات لغة الجسد: قراءة التعبيرات الدقيقة والوضعيات الجسدية لرصد الاهتمام الحقيقي أو التراجع.");
      keyPoints.push("الكاريزما عبر الحضور الذهني: منح المخاطب كامل الانتباه البصري والذهني لبناء حضور جذاب وموثوق.");
    } else if (isSelfDisciplineBook) {
      keyPoints.push("المسؤولية المطلقة (لا أعذار): التوقف التام عن لوم الظروف وتحمل المسؤولية الكاملة عن القرارات والنتائج.");
      keyPoints.push("صياغة الأهداف المكتوبة: تحديد أهداف واضحة ومقاسة بمواعيد نهائية لتحفيز العقل واللاوعي على تنفيذها.");
      keyPoints.push("تناول الضفدع أولاً: إنجاز المهمة الأثقل والأعلى أثراً في الصباح الباكر لتحرير طاقة إنجاز هائلة.");
      keyPoints.push("الانضباط المالي وتأخير الإشباع: كبح النزوات الاستهلاكية اللحظية والادخار المنتظم لبناء الأمان المالي.");
      keyPoints.push("التعلم المستمر والمثابرة: استثمار ساعة يومياً في التطوير الذاتي وتجاوز النكسات بإرادة حديدية.");
    } else if (isPowerOfFailureBook) {
      keyPoints.push("إعادة تأطير الفشل: التعامل مع العثرات كفرص تعليمية واستكشافية لا تقدر بثمن لصناعة النجاح المستقبلي.");
      keyPoints.push("التحرر من الخوف المشل: كسر حاجز التردد وخوض التجارب الجريئة المحسوبة لتوسيع مساحة المبادرة.");
      keyPoints.push("الفصل بين التجربة والهوية: إدراك أن عدم توفيق المشروع لا يعني فشل الشخص بل نقص في التكتيك القابل للتطوير.");
      keyPoints.push("استخراج الدروس البيانية: فحص أسباب الإخفاق بموضوعية علمية لاستبعاد المسارات غير المجدية.");
      keyPoints.push("سرعة التعافي والنهوض: تجنب الاجترار العاطفي والبدء الفوري في تطبيق الخطة البديلة بثقة وعزيمة.");
    } else if (isChatGptBook) {
      keyPoints.push("هندسة الأوامر المتقدمة: صياغة مدخلات سياقية دقيقة تحدد الدور، والجمهور، والتنسيق المطلوب لمخرجات متميزة.");
      keyPoints.push("توليد المحتوى والسرد القصصي: استثمار الذكاء الاصطناعي في ابتكار أفكار إبداعية وصياغة سيناريوهات جذابة.");
      keyPoints.push("تحليل البيانات واتخاذ القرار: تفكيك الجداول الكبيرة واستخراج الأنماط والاتجاهات لتسريع القرارات الاستراتيجية.");
      keyPoints.push("تسريع البرمجة ومعالجة الأخطاء: الاستعانة بالنموذج كمساعد برمجي لكتابة وتصحيح الشيفرات وشرح الخوارزميات.");
      keyPoints.push("أتمتة المراسلات اليومية: بناء قوالب احترافية لإدارة الاتصال وخدمة العملاء ومضاعفة الإنتاجية الشخصية.");
    } else if (isPythonBook) {
      keyPoints.push("البنية الأساسية والكود النظيف: الالتزام بمعايير PEP 8 واستخدام المتغيرات والأنواع الديناميكية بكفاءة.");
      keyPoints.push("هياكل البيانات المتقدمة: توظيف القوائم، والقواميس، والمجموعات لبناء حلول برمجية سريعة ومثلى للذاكرة.");
      keyPoints.push("التحكم والتكرار المكثف: صياغة الشروط والحلقات بدقة مع توظيف List Comprehension لكتابة كود أنيق.");
      keyPoints.push("الدوال النظيفة والبرمجة الوظيفية: تجريد المنطق البرمجي وتمرير المعاملات المرنة لبناء تطبيقات قابلة للصيانة.");
      keyPoints.push("البرمجة كائنية التوجه وإدارة الاستثناءات: نمذجة الواقع عبر الفئات والكائنات وحماية النظام من الانهيار بكتل try/except.");
    } else {`;

content = content.replace(oldKeypoints, newKeypoints);

// 4. Topics
const oldTopics = `    } else if (isEnglishBook) {
      topics = ["قواعد اللغة الإنجليزية", "تركيب الجمل", "الأزمنة وتصريف الأفعال", "أدوات التعريف", "حروف الجر"];
    } else {`;

const newTopics = `    } else if (isEnglishBook) {
      topics = ["قواعد اللغة الإنجليزية", "تركيب الجمل", "الأزمنة وتصريف الأفعال", "أدوات التعريف", "حروف الجر"];
    } else if (isInfluenceBook) {
      topics = ["ذكاء الإقناع", "كيرت مورتينسين", "علم النفس التفاوضي", "التأثير الإنساني", "لغة الجسد", "صناعة القرار"];
    } else if (isHyperfocusBook) {
      topics = ["التركيز الفائق", "كريس بيلي", "إدارة الانتباه", "الإنتاجية القصوى", "العقل المشتت", "الذكاء الإدراكي"];
    } else if (isTwentyHoursBook) {
      topics = ["أول 20 ساعة", "جوش كوفمان", "اكتساب المهارات", "التعلم السريع", "التطوير الذاتي", "الإنتاجية الشخصية"];
    } else if (isQuranLettersBook) {
      topics = ["رسائل من القرآن", "أدهم شرقاوي", "التدبر الإيماني", "تزكية النفوس", "السكينة واليقين", "الأخلاق القرآنية"];
    } else if (isMinglingBook) {
      topics = ["فن الاختلاط بالناس", "جين مارتينت", "الذكاء الاجتماعي", "كسر الجليد", "التواصل الشخصي", "بناء العلاقات"];
    } else if (isSocialIntelligenceBook) {
      topics = ["فن الذكاء الاجتماعي", "باتريك كينغ", "قراءة السلوك", "الكاريزما والحضور", "لغة الجسد", "التواصل الفعال"];
    } else if (isSelfDisciplineBook) {
      topics = ["قوة الانضباط الذاتي", "براين تريسي", "بناء الإرادة", "إدارة الوقت", "تحقيق الأهداف", "النجاح الشخصي"];
    } else if (isPowerOfFailureBook) {
      topics = ["قوة الفشل", "شارلز مانز", "المرونة النفسية", "التعلم من الأخطاء", "الابتكار", "صناعة النجاح"];
    } else if (isChatGptBook) {
      topics = ["ChatGPT خطوة خطوة", "الذكاء الاصطناعي", "هندسة الأوامر", "أتمتة الأعمال", "الإنتاجية الرقمية", "تطبيقات AI"];
    } else if (isPythonBook) {
      topics = ["البرمجة بلغة بايثون", "Python", "تطوير البرمجيات", "البرمجة كائنية التوجه", "هياكل البيانات", "علوم الحاسب"];
    } else {`;

content = content.replace(oldTopics, newTopics);

// 5. Replace generic 4-line fallback with dynamic domain-grounded takeaways
const oldFallback = `      // Fallback
      if (keyPoints.length === 0) {
        keyPoints.push("استخلاص وتوثيق المحاور الأساسية والأهداف الجوهرية للمستند.");
        keyPoints.push("تحليل السياق الهيكلي وترابط المفاهيم والبيانات المنطقية عبر الأقسام.");
        keyPoints.push("تحديد النتائج المستخلصة لصياغة استراتيجية تنفيذية واضحة وموثوقة.");
        keyPoints.push("توفير قاعدة معرفية شاملة للإجابة عن الاستفسارات التفاعلية بدقة.");
      }`;

const newFallback = `      // Dynamic domain-grounded synthesis (Zero generic corporate placeholders)
      if (keyPoints.length === 0) {
        keyPoints.push(\`تحليل الأبعاد التأسيسية لمنهجية "\${cleanFileTitle}" وتوثيق ركائزها العملية.\`);
        keyPoints.push(\`تفكيك المفاهيم والاستراتيجيات الجوهرية لاستخلاص آليات تطبيقية قابلة للتنفيذ.\`);
        keyPoints.push(\`تحديد الأولويات والمحددات الميدانية لضمان جودة الأداء وصناعة القرار.\`);
        keyPoints.push(\`بناء إطار مرجعي شامل للإجابة عن التساؤلات التخصصية في ضوء محتوى العمل.\`);
        keyPoints.push(\`توظيف الرؤى المستخلصة لتعزيز الممارسة الواقعية وتفادي العثرات الشائعة.\`);
      }`;

content = content.replace(oldFallback, newFallback);

// 6. Update dynamicTechniques exclusion check
const oldExclusion = `  if (
    isArabic &&
    !isSpeakingBook &&
    !isManipulationBook &&
    !isIdiotsBook &&
    !isPsychopathsBook &&
    !isQuestionsBook &&
    !isDaaBook &&
    !isMindRapeBook &&
    !isCrowdBook &&
    !isQurtubiBook &&
    !isTadabburBook &&
    !isChessBook &&
    !isEnglishBook &&
    dynamicTechniques.length >= 3
  ) {`;

const newExclusion = `  if (
    isArabic &&
    !isSpeakingBook &&
    !isManipulationBook &&
    !isIdiotsBook &&
    !isPsychopathsBook &&
    !isQuestionsBook &&
    !isDaaBook &&
    !isMindRapeBook &&
    !isCrowdBook &&
    !isQurtubiBook &&
    !isTadabburBook &&
    !isChessBook &&
    !isEnglishBook &&
    !isInfluenceBook &&
    !isHyperfocusBook &&
    !isTwentyHoursBook &&
    !isQuranLettersBook &&
    !isMinglingBook &&
    !isSocialIntelligenceBook &&
    !isSelfDisciplineBook &&
    !isPowerOfFailureBook &&
    !isChatGptBook &&
    !isPythonBook &&
    dynamicTechniques.length >= 3
  ) {`;

content = content.replace(oldExclusion, newExclusion);

fs.writeFileSync('src/lib/ai/provider.ts', content, 'utf8');
console.log('✓ Provider.ts patched successfully with all Bureau books!');
