import fs from 'fs';

const API_URL = 'http://localhost:3000/api/analyze';
const filePath = 'C:/Users/abdra/OneDrive/Documents/Book/Noor-Book.com  الداء والدواء.pdf';

async function testDaa() {
  const fileBytes = fs.readFileSync(filePath);
  const blob = new Blob([fileBytes], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('file', blob, 'Noor-Book.com  الداء والدواء.pdf');

  console.log(`Testing الداء والدواء (${(fileBytes.length / (1024*1024)).toFixed(1)} MB)...`);
  const t0 = Date.now();
  const res = await fetch(API_URL, {
    method: 'POST',
    body: formData,
  });

  console.log(`Status: ${res.status} (took ${Date.now() - t0}ms)`);
  if (!res.ok) {
    console.log("Error:", await res.text());
    return;
  }

  const data = await res.json();
  console.log(`Summary: ${data.summary}`);
  console.log(`KeyPoints:`, data.keyPoints);
  console.log(`Total Techniques: ${data.totalTechniquesCount}`);
  if (data.techniques) {
    console.log(`First 3 items:`);
    for (let i = 0; i < Math.min(5, data.techniques.length); i++) {
      console.log(`[#${data.techniques[i].id}] ${data.techniques[i].title}`);
      console.log(`   Principle: ${data.techniques[i].principle.slice(0, 100)}`);
      console.log(`   Example: ${data.techniques[i].example.slice(0, 100)}`);
    }
  }
}

testDaa();
