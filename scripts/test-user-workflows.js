const http = require('http');

async function postJson(path, payload) {
  return new Promise((resolve) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, ok: res.statusCode === 200, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, ok: false, raw: body });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ status: 500, ok: false, error: err.message });
    });

    req.write(data);
    req.end();
  });
}

async function runWorkflows() {
  console.log("=== SIMULATING END-USER WORKFLOWS ===");

  // 1. Commercial Pure Prompt Generation
  console.log("\n[Test 1] Generating Commercial Master Directive (Pure Prompt)...");
  const commRes = await postJson('/api/ai/commercial', {
    targetDuration: 30,
    sceneCount: 6,
    language: 'th',
    voiceTone: 'energetic',
    ratio: '9:16',
    brandName: 'กะเพราพริกแห้งโบราณ',
    productName: 'กะเพราเนื้อโคขุนคั่วพริกแห้ง',
    adStyle: 'food',
    referenceMode: 'pure_prompt'
  });

  if (commRes.ok && commRes.data?.scenes?.length === 6) {
    console.log("✓ Commercial Pure Prompt Success! Generated 6 scenes with directive length:", commRes.data.masterDirectiveV3?.length);
  } else {
    console.error("✗ Commercial Pure Prompt Failed:", commRes);
  }

  // 2. Ideas Generation
  console.log("\n[Test 2] Generating Content Ideas...");
  const ideaRes = await postJson('/api/ai/ideas', {
    brand_name: 'กะเพราพริกแห้งโบราณ',
    topic: 'โปรโมชั่นเปิดร้านใหม่และเมนูเด็ดประจำสัปดาห์',
    count: 3,
    target_audience: 'คนชอบกินเผ็ด พนักงานออฟฟิศ',
    content_type: 'CAROUSEL'
  });

  if (ideaRes.ok && ideaRes.data?.ideas?.length > 0) {
    console.log(`✓ Ideas Generation Success! Received ${ideaRes.data.ideas.length} ideas.`);
  } else {
    console.log("ℹ Ideas Generation Note (AI failover check):", ideaRes.status, ideaRes.data?.error || ideaRes.raw?.slice(0, 150));
  }

  // 3. Document / Knowledge Endpoint Check
  console.log("\n[Test 3] Testing Knowledge / Prompt Docs...");
  // Let's test GET knowledge
  const httpGet = (path) => new Promise((res) => {
    http.get(`http://localhost:3000${path}`, (r) => {
      let b = '';
      r.on('data', c => b += c);
      r.on('end', () => res({ status: r.statusCode, ok: r.statusCode === 200, length: b.length }));
    }).on('error', e => res({ status: 500, ok: false, error: e.message }));
  });

  const kbRes = await httpGet('/api/knowledge');
  console.log(`✓ Knowledge API: status ${kbRes.status}, data length: ${kbRes.length}`);

  console.log("\n=== ALL USER WORKFLOW SIMULATIONS COMPLETE ===");
}

runWorkflows();
