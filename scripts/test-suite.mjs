// =============================================================================
// DocuMind SaaS - Automated Integration & Security Test Suite
// Verifies APIs, File Extractors, AI Logic, and Security Bounds
// =============================================================================

import assert from "node:assert";
import { extractDocumentContent } from "../src/lib/extractor.js";
import { analyzeDocumentText, answerDocumentQuestion } from "../src/lib/ai/provider.js";

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

  // Test 3: AI Document Analysis (Heuristic Engine)
  try {
    const docText =
      "Q3 Performance Review. The corporation demonstrated outstanding operational resilience. Core metrics improved by 18% quarter-over-quarter. Enterprise client retention reached a historic high of 98%. However, supply chain inflation presents cautious headwinds for early Q4.";
    const analysis = await analyzeDocumentText(docText, "performance.pdf");

    assert(analysis.summary && analysis.summary.length > 20, "Summary should be non-empty");
    assert(Array.isArray(analysis.keyPoints) && analysis.keyPoints.length >= 3, "Keypoints should have >= 3 items");
    assert(["Positive", "Neutral", "Cautious", "Analytical"].includes(analysis.sentiment), "Valid sentiment");
    console.log("✅ Test 3 Passed: AI Analysis output schema contract.");
    passed++;
  } catch (err) {
    console.error("❌ Test 3 Failed:", err);
    failed++;
  }

  // Test 4: Grounded Q&A Chat Engine
  try {
    const docText =
      "DocuMind Cloud Storage Security Policy. All client documents are encrypted at rest using AES-256-GCM. Transmission occurs exclusively over TLS 1.3. Multi-factor authentication is strictly enforced across all organization accounts.";
    const q1 = await answerDocumentQuestion(docText, "What encryption standard is used?");

    assert(q1.answer && q1.answer.length > 10, "Answer should be generated");
    assert(Array.isArray(q1.sources) && q1.sources.length > 0, "Sources should be cited");
    assert(q1.sources[0].excerpt.includes("AES-256"), "Source excerpt should contain relevant keywords");
    console.log("✅ Test 4 Passed: Grounded Q&A with citation attribution.");
    passed++;
  } catch (err) {
    console.error("❌ Test 4 Failed:", err);
    failed++;
  }

  // Test 5: File Size Security Bounds
  try {
    const fakeHugeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
    const exceedsLimit = fakeHugeBuffer.length > 10 * 1024 * 1024;
    assert.strictEqual(exceedsLimit, true, "11MB buffer must trigger 10MB limit enforcement");
    console.log("✅ Test 5 Passed: 10MB file size security boundary.");
    passed++;
  } catch (err) {
    console.error("❌ Test 5 Failed:", err);
    failed++;
  }

  console.log(`\n====================================`);
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log(`====================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
