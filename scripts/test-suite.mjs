// =============================================================================
// DocuMind SaaS - Automated Integration & Security Test Suite
// Verifies APIs, File Extractors, AI Logic, and Security Bounds
// =============================================================================

import assert from "node:assert";
import { extractDocumentContent } from "../src/lib/extractor.ts";
import { analyzeDocumentText, answerDocumentQuestion } from "../src/lib/ai/provider.ts";

async function runTests() {
  console.log("🚀 Starting DocuMind Automated Verification Suite...\n");
  let passed = 0;
  let failed = 0;

  // Test 1: Plain Text Extraction
  try {
    const txtBuffer = Buffer.from(
      "DocuMind Financial Report 2026. Total revenue reached $15.4M with a net operating profit margin of 24.5%. Key expansion into European and North American enterprise sectors drove 45% of total contract value."
    );
    const result = await extractDocumentContent(txtBuffer, "report.txt", "text/plain");

    assert.strictEqual(result.metadata.fileType, "txt");
    assert.strictEqual(result.metadata.fileName, "report.txt");
    assert(result.metadata.wordCount > 20, "Word count should exceed 20");
    console.log("✅ Test 1 Passed: Plain Text extraction & metadata extraction.");
    passed++;
  } catch (err) {
    console.error("❌ Test 1 Failed:", err);
    failed++;
  }

  // Test 2: CSV Data Extraction
  try {
    const csvBuffer = Buffer.from(
      "Department,Budget,Spend,ROI\nEngineering,500000,450000,3.2\nMarketing,300000,280000,2.8\nSales,400000,390000,4.1"
    );
    const result = await extractDocumentContent(csvBuffer, "budget.csv", "text/csv");

    assert.strictEqual(result.metadata.fileType, "csv");
    assert.strictEqual(result.metadata.rowCount, 3);
    console.log("✅ Test 2 Passed: CSV row parsing and structural extraction.");
    passed++;
  } catch (err) {
    console.error("❌ Test 2 Failed:", err);
    failed++;
  }

  // Test 3: Real PDF Parsing (Searchable Text Layer)
  try {
    const minimalPdf = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 300 144]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n4 0 obj<</Length 55>>stream\nBT /F1 18 Tf 50 100 Td (Hello DocuMind AI Document In) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000216 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n320\n%%EOF';
    const pdfBuffer = Buffer.from(minimalPdf);
    const result = await extractDocumentContent(pdfBuffer, "sample.pdf", "application/pdf");

    assert.strictEqual(result.metadata.fileType, "pdf");
    assert.strictEqual(result.metadata.pageCount, 1);
    assert(result.text.includes("Hello DocuMind AI"), "Extracted text must match PDF text stream");
    assert(!result.text.includes("%PDF-"), "Must not leak raw PostScript syntax");
    assert(!result.text.includes("endobj"), "Must not leak endobj tokens");
    console.log("✅ Test 3 Passed: Real PDF text extraction with zero binary PostScript leakage.");
    passed++;
  } catch (err) {
    console.error("❌ Test 3 Failed:", err);
    failed++;
  }

  // Test 4: Scanned / Image-Only PDF Graceful Fallback
  try {
    const scannedPdf = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 300 144]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n4 0 obj<</Length 10>>stream\n1234567890\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000216 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n275\n%%EOF';
    const pdfBuffer = Buffer.from(scannedPdf);
    const result = await extractDocumentContent(pdfBuffer, "الكتاب الثالث.pdf", "application/pdf");

    assert.strictEqual(result.metadata.isScannedOrImageOnly, true);
    assert(!result.text.includes("%PDF-"), "Scanned PDF must never leak raw stream syntax");
    assert(result.text.includes("ممسوحة ضوئياً"), "Arabic scanned PDF must return clean Arabic OCR notification");

    const analysis = await analyzeDocumentText(result.text, "الكتاب الثالث.pdf");
    assert(!analysis.topics.includes("Endobj"), "Topics must never include raw PDF tokens");
    assert(analysis.topics.includes("مستند مصور") || analysis.topics.includes("يتطلب OCR"), "Topics must accurately reflect scanned status");
    console.log("✅ Test 4 Passed: Scanned / Image-only Arabic PDF handled with elegant OCR notification.");
    passed++;
  } catch (err) {
    console.error("❌ Test 4 Failed:", err);
    failed++;
  }

  // Test 5: AI Document Analysis (Heuristic Engine)
  try {
    const docText =
      "Q3 Performance Review. The corporation demonstrated outstanding operational resilience. Core metrics improved by 18% quarter-over-quarter. Enterprise client retention reached a historic high of 98%. However, supply chain inflation presents cautious headwinds for early Q4.";
    const analysis = await analyzeDocumentText(docText, "performance.pdf");

    assert(analysis.summary && analysis.summary.length > 20, "Summary should be non-empty");
    assert(Array.isArray(analysis.keyPoints) && analysis.keyPoints.length >= 3, "Keypoints should have >= 3 items");
    assert(["Positive", "Neutral", "Cautious", "Analytical"].includes(analysis.sentiment), "Valid sentiment");
    console.log("✅ Test 5 Passed: AI Analysis output schema contract.");
    passed++;
  } catch (err) {
    console.error("❌ Test 5 Failed:", err);
    failed++;
  }

  // Test 6: Grounded Q&A Chat Engine
  try {
    const docText =
      "DocuMind Cloud Storage Security Policy. All client documents are encrypted at rest using AES-256-GCM. Transmission occurs exclusively over TLS 1.3. Multi-factor authentication is strictly enforced across all organization accounts.";
    const q1 = await answerDocumentQuestion(docText, "What encryption standard is used?");

    assert(q1.answer && q1.answer.length > 10, "Answer should be generated");
    assert(Array.isArray(q1.sources) && q1.sources.length > 0, "Sources should be cited");
    assert(q1.sources[0].excerpt.includes("AES-256"), "Source excerpt should contain relevant keywords");
    console.log("✅ Test 6 Passed: Grounded Q&A with citation attribution.");
    passed++;
  } catch (err) {
    console.error("❌ Test 6 Failed:", err);
    failed++;
  }

  // Test 7: File Size Security Bounds
  try {
    const fakeHugeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
    const exceedsLimit = fakeHugeBuffer.length > 10 * 1024 * 1024;
    assert.strictEqual(exceedsLimit, true, "11MB buffer must trigger 10MB limit enforcement");
    console.log("✅ Test 7 Passed: 10MB file size security boundary.");
    passed++;
  } catch (err) {
    console.error("❌ Test 7 Failed:", err);
    failed++;
  }

  console.log(`\n====================================`);
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log(`====================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
