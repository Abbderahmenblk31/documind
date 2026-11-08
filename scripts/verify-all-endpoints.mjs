import fs from 'fs';

const API_URL = 'http://localhost:3000/api/analyze';

const testFiles = [
  { path: 'C:/Users/abdra/Downloads/📙 الكتاب الثالث.pdf', name: '📙 الكتاب الثالث.pdf', expectedCount: 18 },
  { path: 'C:/Users/abdra/Downloads/📗 الكتاب الثاني.pdf', name: '📗 الكتاب الثاني.pdf', expectedCount: 10 },
  { path: 'C:/Users/abdra/Downloads/بالكتاب الأول.pdf', name: 'بالكتاب الأول.pdf', expectedCount: 9 },
  { path: 'C:/Users/abdra/OneDrive/Documents/Book/Noor-Book.com  التحدث أمام الناس في لحظة 2 .pdf', name: 'Noor-Book.com 2 التحدث أمام الناس في لحظة 2 .pdf', expectedCount: 60 },
  { path: 'C:/Users/abdra/OneDrive/Documents/Book/Noor-Book.com  250 تقنية في التلاعب النفسي.pdf', name: 'Noor-Book.com 250 تقنية في التلاعب النفسي.pdf', expectedCount: 250 }
];

async function testFileUpload(item) {
  if (!fs.existsSync(item.path)) {
    console.log(`[SKIP] File not found: ${item.path}`);
    return;
  }

  const fileBytes = fs.readFileSync(item.path);
  const blob = new Blob([fileBytes], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('file', blob, item.name);

  console.log(`\n======================================================`);
  console.log(`TESTING LIVE API: ${item.name} (${(fileBytes.length / 1024).toFixed(1)} KB)`);

  const t0 = Date.now();
  const res = await fetch(API_URL, {
    method: 'POST',
    body: formData,
  });

  const duration = Date.now() - t0;
  console.log(`HTTP Status: ${res.status} (took ${duration}ms)`);

  if (!res.ok) {
    const errText = await res.text();
    console.error(`ERROR Response:`, errText);
    return;
  }

  const data = await res.json();
  console.log(`Total Techniques/Chapters: ${data.totalTechniquesCount || 0}`);
  console.log(`Techniques Array Length: ${data.techniques?.length || 0}`);
  console.log(`Summary Preview: ${data.summary?.slice(0, 160)}...`);
  console.log(`Key Points Count: ${data.keyPoints?.length || 0}`);
  console.log(`Key Point 1: ${data.keyPoints?.[0]}`);
  console.log(`Topics: ${JSON.stringify(data.topics)}`);
  
  if (data.techniques && data.techniques.length > 0) {
    console.log(`Sample Item 1: [#${data.techniques[0].id}] ${data.techniques[0].title}`);
    console.log(`   Principle: ${data.techniques[0].principle?.slice(0, 90)}...`);
    console.log(`   Example: ${data.techniques[0].example?.slice(0, 90)}...`);
  }

  const pass = (data.techniques?.length || 0) >= item.expectedCount;
  console.log(`RESULT: ${pass ? 'PASSED ✅' : 'FAILED ❌'} (Expected >= ${item.expectedCount}, Got ${data.techniques?.length || 0})`);
}

(async () => {
  for (const item of testFiles) {
    await testFileUpload(item);
  }
})();
