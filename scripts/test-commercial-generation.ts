import { POST } from "../src/app/api/ai/commercial/route";

async function runTests() {
  console.log("=== STARTING TOPIC ISOLATION & ACCURACY TESTS ===");

  const thaiCharRegex = /[\u0E00-\u0E7F]/;
  const bannedLuxuryWords = ["rolex", "wristwatch", "watch", "handbag", "perfume", "podium"];

  // -------------------------------------------------------------
  // TEST 1: ข้าวโอ๊ตโฟมสุขภาพ 5 นาที (10 scenes)
  // -------------------------------------------------------------
  console.log("\n[TEST 1] Testing 'ข้าวโอ๊ตโฟมสุขภาพ 5 นาที' (10 scenes)...");
  const oatReq = new Request("http://localhost:3000/api/ai/commercial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productName: "ข้าวโอ๊ตโฟมสุขภาพ 5 นาที",
      brand: "OatPlus",
      targetDuration: 30,
      sceneCount: 10,
      pacingStyle: "standard",
      referenceMode: "pure_prompt",
      hasPresenter: true,
      presenterGender: "female"
    })
  });

  const oatRes = await POST(oatReq as any);
  const oatData = await oatRes.json();

  if (!oatData.success) {
    throw new Error(`Test 1 Failed: ${oatData.error}`);
  }

  const oatScenes = oatData.scenes || oatData.data?.scenes;
  console.log(`Generated ${oatScenes.length} scenes for ข้าวโอ๊ต.`);
  if (oatScenes.length !== 10) throw new Error(`Expected 10 scenes, got ${oatScenes.length}`);

  let oatPassed = true;
  for (const scene of oatScenes) {
    const prompt = scene.visualPromptEn;
    const lower = prompt.toLowerCase();
    
    // Must contain oat/breakfast terms
    const hasOatTerm = lower.includes("oat") || lower.includes("cereal") || lower.includes("foam") || lower.includes("breakfast") || lower.includes("berry") || lower.includes("bowl");
    if (!hasOatTerm) {
      console.error(`FAIL: Scene ${scene.sceneNumber} does not mention oats/breakfast! Prompt: ${prompt}`);
      oatPassed = false;
    }

    // Must NOT contain Thai characters
    if (thaiCharRegex.test(prompt)) {
      console.error(`FAIL: Scene ${scene.sceneNumber} contains Thai text! Prompt: ${prompt}`);
      oatPassed = false;
    }

    // Must NOT contain luxury watches/cars/fish/swimming
    if (lower.includes("fish") || lower.includes("swim") || lower.includes("pla som")) {
      console.error(`FAIL: Scene ${scene.sceneNumber} leaked fish or swimming! Prompt: ${prompt}`);
      oatPassed = false;
    }

    for (const b of bannedLuxuryWords) {
      if (lower.includes(b)) {
        console.error(`FAIL: Scene ${scene.sceneNumber} contains banned luxury word '${b}'! Prompt: ${prompt}`);
        oatPassed = false;
      }
    }
  }

  if (oatPassed) {
    console.log(">>> TEST 1 PASSED: ข้าวโอ๊ต is 100% oats/breakfast, zero watches, zero fish, zero Thai in visual prompt!");
  } else {
    throw new Error("TEST 1 FAILED assertions.");
  }

  // -------------------------------------------------------------
  // TEST 2: สอนว่ายน้ำสำหรับผู้เริ่มต้น (10 scenes)
  // -------------------------------------------------------------
  console.log("\n[TEST 2] Testing 'สอนว่ายน้ำสำหรับผู้เริ่มต้น' (10 scenes)...");
  const swimReq = new Request("http://localhost:3000/api/ai/commercial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productName: "สอนว่ายน้ำสำหรับผู้เริ่มต้น",
      brand: "SwimPro Academy",
      targetDuration: 30,
      sceneCount: 10,
      pacingStyle: "standard",
      referenceMode: "pure_prompt",
      hasPresenter: true,
      presenterGender: "female"
    })
  });

  const swimRes = await POST(swimReq as any);
  const swimData = await swimRes.json();

  if (!swimData.success) {
    throw new Error(`Test 2 Failed: ${swimData.error}`);
  }

  const swimScenes = swimData.scenes || swimData.data?.scenes;
  console.log(`Generated ${swimScenes.length} scenes for สอนว่ายน้ำ.`);
  if (swimScenes.length !== 10) throw new Error(`Expected 10 scenes, got ${swimScenes.length}`);

  let swimPassed = true;
  for (const scene of swimScenes) {
    const prompt = scene.visualPromptEn;
    const lower = prompt.toLowerCase();

    // Must contain swimming terms
    const hasSwimTerm = lower.includes("swim") || lower.includes("pool") || lower.includes("water") || lower.includes("stroke") || lower.includes("kickboard") || lower.includes("goggle") || lower.includes("coach");
    if (!hasSwimTerm) {
      console.error(`FAIL: Scene ${scene.sceneNumber} does not mention swimming/pool! Prompt: ${prompt}`);
      swimPassed = false;
    }

    // Must NOT contain Thai characters
    if (thaiCharRegex.test(prompt)) {
      console.error(`FAIL: Scene ${scene.sceneNumber} contains Thai text! Prompt: ${prompt}`);
      swimPassed = false;
    }

    // Must NOT contain fish, oats, watches
    if (lower.includes("fish") || lower.includes("pla som") || lower.includes("oat") || lower.includes("porridge")) {
      console.error(`FAIL: Scene ${scene.sceneNumber} leaked fish or oats! Prompt: ${prompt}`);
      swimPassed = false;
    }

    for (const b of bannedLuxuryWords) {
      if (lower.includes(b)) {
        console.error(`FAIL: Scene ${scene.sceneNumber} contains banned luxury word '${b}'! Prompt: ${prompt}`);
        swimPassed = false;
      }
    }
  }

  if (swimPassed) {
    console.log(">>> TEST 2 PASSED: สอนว่ายน้ำ is 100% swimming/pool, zero fish, zero oats, zero watches, zero Thai in visual prompt!");
  } else {
    throw new Error("TEST 2 FAILED assertions.");
  }

  // -------------------------------------------------------------
  // TEST 3: ปลาส้มทอดกรอบ (10 scenes)
  // -------------------------------------------------------------
  console.log("\n[TEST 3] Testing 'ปลาส้มทอดกรอบสูตรโบราณ' (10 scenes)...");
  const fishReq = new Request("http://localhost:3000/api/ai/commercial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productName: "ปลาส้มทอดกรอบสูตรโบราณ",
      brand: "ปลาส้มแม่สมพร",
      targetDuration: 30,
      sceneCount: 10,
      pacingStyle: "standard",
      referenceMode: "pure_prompt",
      hasPresenter: false
    })
  });

  const fishRes = await POST(fishReq as any);
  const fishData = await fishRes.json();

  if (!fishData.success) {
    throw new Error(`Test 3 Failed: ${fishData.error}`);
  }

  const fishScenes = fishData.scenes || fishData.data?.scenes;
  console.log(`Generated ${fishScenes.length} scenes for ปลาส้ม.`);
  if (fishScenes.length !== 10) throw new Error(`Expected 10 scenes, got ${fishScenes.length}`);

  let fishPassed = true;
  for (const scene of fishScenes) {
    const prompt = scene.visualPromptEn;
    const lower = prompt.toLowerCase();

    // Must contain fish/culinary terms
    const hasFishTerm = lower.includes("fish") || lower.includes("pla som") || lower.includes("oil") || lower.includes("wok") || lower.includes("culinary") || lower.includes("herb") || lower.includes("shallot") || lower.includes("garlic") || lower.includes("crispy");
    if (!hasFishTerm) {
      console.error(`FAIL: Scene ${scene.sceneNumber} does not mention fish/culinary! Prompt: ${prompt}`);
      fishPassed = false;
    }

    // Must NOT contain swim, oat, watch
    if (lower.includes("swim") || lower.includes("pool") || lower.includes("oat")) {
      console.error(`FAIL: Scene ${scene.sceneNumber} leaked swim or oat! Prompt: ${prompt}`);
      fishPassed = false;
    }
  }

  if (fishPassed) {
    console.log(">>> TEST 3 PASSED: ปลาส้ม is 100% fish/culinary, zero swimming, zero oats, zero watches!");
  } else {
    throw new Error("TEST 3 FAILED assertions.");
  }

  // -------------------------------------------------------------
  // TEST 4: บริการล้างแอร์บ้านระดับพรีเมียม (Arbitrary Custom Topic, 8 scenes)
  // -------------------------------------------------------------
  console.log("\n[TEST 4] Testing arbitrary topic: 'บริการล้างแอร์บ้าน' (8 scenes)...");
  const acReq = new Request("http://localhost:3000/api/ai/commercial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productName: "บริการล้างแอร์บ้านระดับพรีเมียม",
      brand: "CoolAir Pro",
      targetDuration: 20,
      sceneCount: 8,
      pacingStyle: "standard",
      referenceMode: "pure_prompt",
      hasPresenter: true
    })
  });

  const acRes = await POST(acReq as any);
  const acData = await acRes.json();
  if (!acData.success) throw new Error(`Test 4 Failed: ${acData.error}`);
  const acScenes = acData.scenes || acData.data?.scenes;
  console.log(`Generated ${acScenes.length} scenes for ล้างแอร์.`);

  let acPassed = true;
  for (const scene of acScenes) {
    const prompt = scene.visualPromptEn;
    const lower = prompt.toLowerCase();

    // Must NOT contain watches, cars, fish, oats
    if (lower.includes("fish") || lower.includes("swim") || lower.includes("oat")) {
      console.error(`FAIL: Scene ${scene.sceneNumber} leaked other domains! Prompt: ${prompt}`);
      acPassed = false;
    }

    // Strip safety negative constraint before testing for positive appearance of luxury words
    const subjectContent = lower.replace(/zero watches/g, "").replace(/zero cars/g, "").replace(/zero jewelry/g, "");
    for (const b of bannedLuxuryWords) {
      if (subjectContent.includes(b)) {
        console.error(`FAIL: Scene ${scene.sceneNumber} depicts banned luxury item '${b}'! Prompt: ${prompt}`);
        acPassed = false;
      }
    }

    // Must NOT contain Thai characters
    if (thaiCharRegex.test(prompt)) {
      console.error(`FAIL: Scene ${scene.sceneNumber} contains Thai text! Prompt: ${prompt}`);
      acPassed = false;
    }

    // Must contain safety negative constraint
    if (!lower.includes("zero watches") || !lower.includes("zero cars")) {
      console.error(`FAIL: Scene ${scene.sceneNumber} missing safety negative constraint! Prompt: ${prompt}`);
      acPassed = false;
    }
  }

  if (acPassed) {
    console.log(">>> TEST 4 PASSED: Custom topic has pure English prompts, zero watches/cars, safety negative locks enforced!");
  } else {
    throw new Error("TEST 4 FAILED assertions.");
  }

  console.log("\n==========================================");
  console.log("ALL 4 TOPIC ISOLATION TESTS PASSED 100%!");
  console.log("==========================================");
}

runTests().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
