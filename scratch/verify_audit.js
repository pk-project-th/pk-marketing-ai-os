// End-to-end Verification Script for PK Marketing AI OS v1.0
const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("==================================================");
  console.log("STARTING LIVE END-TO-END CODEBASE AUDIT VERIFICATION");
  console.log("Target Server: " + BASE_URL);
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = "") {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} -> ${details}`);
      failed++;
    }
  }

  // TEST 1: Settings API & Secret Masking
  try {
    const res = await fetch(`${BASE_URL}/api/settings`);
    const data = await res.json();
    assert(res.ok && data.success, "GET /api/settings returns 200 OK");
    assert(typeof data.settings === "object", "Settings object exists");
    assert(!data.settings.gemini_api_key || data.settings.gemini_api_key.startsWith("••••••••"), "Gemini API key is properly masked");
  } catch (e) {
    assert(false, "GET /api/settings", e.message);
  }

  // TEST 2: Settings Protection against empty overwrite
  try {
    const res = await fetch(`${BASE_URL}/api/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gemini_model: "gemini-3.8-flash",
        gemini_api_key: "••••••••1234" // masked
      })
    });
    const data = await res.json();
    assert(res.ok && data.success, "POST /api/settings handles masked key without error");
  } catch (e) {
    assert(false, "POST /api/settings", e.message);
  }

  // TEST 3: Knowledge Base API (GET & POST)
  try {
    const resGet = await fetch(`${BASE_URL}/api/knowledge`);
    const dataGet = await resGet.json();
    assert(resGet.ok && Array.isArray(dataGet.documents), "GET /api/knowledge returns documents array");

    const resPost = await fetch(`${BASE_URL}/api/knowledge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "PRODUCT",
        title: "Test Specification PK Sedan Z",
        content: "# PK Sedan Z Specification\n- 0-100 km/h in 5.8s\n- Fuel: 28 km/L",
        tags: ["Test", "Sedan Z", "Speed"]
      })
    });
    const dataPost = await resPost.json();
    assert(resPost.ok && dataPost.success && dataPost.document.id, "POST /api/knowledge creates verified document");
  } catch (e) {
    assert(false, "Knowledge Base API test", e.message);
  }

  // TEST 4: Creative Studio AI Prompt & Approval Queue
  let creativeApprovalId = null;
  try {
    const res = await fetch(`${BASE_URL}/api/ai/creative`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: "PK Super EV Concept 2026",
        environment: "Futuristic highway in neon city",
        aspectRatio: "16:9",
        sendToApproval: true
      })
    });
    const data = await res.json();
    assert(res.ok && data.success, "POST /api/ai/creative generates prompt response");
    assert(data.data && data.data.prompt && data.data.prompt.includes("PK Super EV Concept"), "Prompt includes custom subject");
    assert(data.approval && data.approval.id, "Creative prompt successfully queued to Approval Center");
    creativeApprovalId = data.approval?.id;
  } catch (e) {
    assert(false, "Creative Studio API test", e.message);
  }

  // TEST 5: Flow A - Idea Generation Agent
  let createdIdea = null;
  try {
    const res = await fetch(`${BASE_URL}/api/ai/ideas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productModel: "PK Sedan X",
        targetAudience: "Young Tech Professionals",
        contentPillar: "Human-Centric Innovation",
        platform: "tiktok",
        objective: "Awareness & Test Drive Bookings",
        count: 2
      })
    });
    const data = await res.json();
    assert(res.ok && data.success, "POST /api/ai/ideas returns success");
    assert(Array.isArray(data.ideas) && data.ideas.length >= 1, "Returned generated ideas array");
    createdIdea = data.ideas[0];
  } catch (e) {
    assert(false, "Idea Agent test", e.message);
  }

  // TEST 6: Flow B - Production Agent (Script & Copy generation)
  let assetId = null;
  try {
    const ideaToUse = createdIdea || {
      id: "idea-demo-01",
      title: "PK Sedan X Efficiency Test",
      concept: "Fuel challenge Bangkok to Chiang Mai",
      hook: "น้ำมันถังเดียวไปถึงเชียงใหม่จริงไหม?",
      platform: "tiktok",
      format: "Short Video"
    };

    const res = await fetch(`${BASE_URL}/api/ai/produce`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idea: ideaToUse,
        framework: "PAS"
      })
    });
    const data = await res.json();
    assert(res.ok && data.success, "POST /api/ai/produce returns success");
    assert(data.asset && data.asset.caption_short && data.asset.video_scenes, "Production Agent returns copy and multi-scene video script");
    assetId = data.asset?.id;
  } catch (e) {
    assert(false, "Production Agent test", e.message);
  }

  // TEST 7: Flow C - Repurposing Agent (Multi-platform transformation)
  try {
    const res = await fetch(`${BASE_URL}/api/ai/repurpose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceText: "PK Sedan X รถยนต์ไฮบริดรุ่นใหม่ ประหยัดน้ำมัน 26.5 กม./ลิตร มั่นใจด้วยการรับประกันแบตเตอรี่ 8 ปี",
        platforms: ["facebook", "tiktok", "linkedin", "x"]
      })
    });
    const data = await res.json();
    assert(res.ok && data.success, "POST /api/ai/repurpose returns success");
    assert(data.repurposed && data.repurposed.outputs && data.repurposed.outputs.facebook, "Repurposing Agent transforms into Facebook format");
    assert(data.repurposed.outputs.tiktok, "Repurposing Agent transforms into TikTok format");
  } catch (e) {
    assert(false, "Repurposing Agent test", e.message);
  }

  // TEST 8: Flow D - Document-to-Form Mapping Agent
  try {
    const res = await fetch(`${BASE_URL}/api/ai/document`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: "test_drive_registration_policy.txt",
        fileType: "TXT",
        rawContent: "เอกสารนโยบายการลงทะเบียนทดลองขับ: ชื่อนามสกุลผู้ลงทะเบียน, เบอร์โทรศัพท์, อีเมล, วันที่สะดวก, รุ่นรถที่สนใจ PK Sedan X"
      })
    });
    const data = await res.json();
    assert(res.ok && data.success, "POST /api/ai/document extracts schema fields");
    assert(data.document && Array.isArray(data.document.fields) && data.document.fields.length > 0, "Document Agent extracted field mappings");
  } catch (e) {
    assert(false, "Document Agent test", e.message);
  }

  // TEST 9: Flow E - Marketing Analytics Agent
  try {
    const res = await fetch(`${BASE_URL}/api/ai/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Q3 Automotive Campaign Performance",
        period: "August 2026",
        dataSource: "MANUAL",
        metrics: {
          reach: 180000,
          impressions: 420000,
          engagement: 14500,
          engagement_rate: 3.45,
          ctr: 2.1,
          views: 65000,
          watch_time_hours: 1200,
          conversions: 85,
          leads: 42,
          cost: 45000,
          roas: 4.8,
          cpc: 8.5,
          cpm: 107
        }
      })
    });
    const data = await res.json();
    assert(res.ok && data.success, "POST /api/ai/analytics analyzes campaign data");
    assert(data.report && (data.report.what_performed_well || data.report.recommendations), "Analytics Agent returns 9-point diagnostic analysis");
  } catch (e) {
    assert(false, "Analytics Agent test", e.message);
  }

  // TEST 10: State Machine Transitions & Guards in Approvals Center
  try {
    const testItemId = creativeApprovalId || "app-001";

    // Subtest 10.1: Attempt to EXECUTE when not yet approved -> MUST FAIL with status 400!
    const resPrematureExec = await fetch(`${BASE_URL}/api/approvals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: testItemId,
        action: "EXECUTE",
        reviewer: "Marketing Lead"
      })
    });
    const dataPremature = await resPrematureExec.json();
    assert(
      resPrematureExec.status === 400 && dataPremature.success === false,
      "Approval Guard: EXECUTE on unapproved item rejected with 400 Bad Request",
      dataPremature.error
    );

    // Subtest 10.2: Human Edit
    const resEdit = await fetch(`${BASE_URL}/api/approvals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: testItemId,
        action: "EDIT",
        title: "[EDITED] Verified Automotive Campaign Asset",
        content_preview: "Verified and reviewed copy ready for executive approval"
      })
    });
    const dataEdit = await resEdit.json();
    assert(resEdit.ok && dataEdit.success && dataEdit.approval.title.includes("[EDITED]"), "Human Edit: Content successfully modified in approval queue");

    // Subtest 10.3: Approve the item
    const resApprove = await fetch(`${BASE_URL}/api/approvals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: testItemId,
        action: "APPROVE",
        reviewer: "Lead Architect"
      })
    });
    const dataApprove = await resApprove.json();
    assert(resApprove.ok && dataApprove.approval.status === "APPROVED", "State Transition: Item marked APPROVED");

    // Subtest 10.4: Execute the now approved item -> MUST SUCCEED
    const resExec = await fetch(`${BASE_URL}/api/approvals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: testItemId,
        action: "EXECUTE",
        reviewer: "Lead Architect"
      })
    });
    const dataExec = await resExec.json();
    assert(resExec.ok && dataExec.approval.status === "EXECUTED", "State Transition: Approved item marked EXECUTED");
  } catch (e) {
    assert(false, "Approval State Machine test", e.message);
  }

  // TEST 11: Workflows Triggering & Logging
  try {
    const res = await fetch(`${BASE_URL}/api/workflows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflowId: "wf-001",
        payload: { triggered_by: "Verification Script" }
      })
    });
    const data = await res.json();
    assert(res.ok && data.success, "POST /api/workflows executes and logs workflow run");
    assert(data.run && data.run.status, "Workflow run record created");
  } catch (e) {
    assert(false, "Workflow execution test", e.message);
  }

  console.log("\n==================================================");
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
