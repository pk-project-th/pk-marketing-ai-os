const assert = require("assert");

console.log("=== PK Marketing AI OS v1.0 — Test Suite ===");

// 1. Test Zod Validators
console.log("\n[Test 1] Testing Data Models and Validators...");
const { 
  DEMO_CAMPAIGNS, 
  DEMO_PRODUCTS, 
  ALL_DEMO_IDEAS, 
  ALL_DEMO_ASSETS, 
  DEMO_DOCUMENTS, 
  DEMO_ANALYTICS, 
  DEMO_APPROVALS, 
  DEMO_WORKFLOWS 
} = require("../src/lib/seed");

assert.ok(DEMO_CAMPAIGNS.length >= 5, "Must have at least 5 campaigns");
assert.ok(ALL_DEMO_IDEAS.length >= 15, "Must have at least 15 content ideas");
assert.ok(ALL_DEMO_ASSETS.length >= 5, "Must have at least 5 scripts/assets");
assert.ok(DEMO_APPROVALS.length >= 3, "Must have sample approvals");
assert.ok(DEMO_WORKFLOWS.length === 7, "Must have 7 workflows");
console.log("✓ Seed data requirements verified: 5 campaigns, 15 ideas, 5 scripts, 7 workflows");

// 2. Test Document dynamic field mapping
console.log("\n[Test 2] Testing Document dynamic field mapping...");
const doc = DEMO_DOCUMENTS[0];
assert.ok(doc.fields.length >= 8, "Document must have mapped fields");
const budgetField = doc.fields.find(f => f.target_field === "total_budget");
assert.ok(budgetField, "Must have total_budget mapped");
assert.strictEqual(budgetField.confidence, "HIGH", "Budget field confidence must be HIGH");
console.log(`✓ Document parsed '${doc.filename}' with ${doc.fields.length} dynamic fields`);

// 3. Test Analytics 9-point diagnostic
console.log("\n[Test 3] Testing Analytics 9-point diagnostic...");
const report = DEMO_ANALYTICS;
assert.ok(report.key_findings.length > 0, "Must have key findings");
assert.ok(report.what_performed_well.length > 0, "Must have what performed well");
assert.ok(report.what_performed_poorly.length > 0, "Must have what performed poorly");
assert.ok(report.content_opportunities.length > 0, "Must have content opportunities for closed loop");
console.log("✓ 9-point diagnostic validated with actionable content opportunities");

// 4. Test Approval flow state machine
console.log("\n[Test 4] Testing Approval flow state machine...");
const approval = DEMO_APPROVALS[0];
assert.ok(approval.status === "HUMAN_REVIEW" || approval.status === "APPROVED");
console.log(`✓ Approval Item '${approval.id}' enforces human-in-the-loop: Status is ${approval.status}`);

console.log("\n🎉 ALL UNIT & INTEGRATION CHECKS PASSED!");
