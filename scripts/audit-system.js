const http = require('http');

async function testEndpoint(path, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, raw: data.slice(0, 100) });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ status: 500, ok: false, error: err.message });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runAudit() {
  console.log("=== STARTING FULL SYSTEM API AUDIT ===");
  
  const endpoints = [
    { path: '/', method: 'GET' },
    { path: '/ideas', method: 'GET' },
    { path: '/commercial', method: 'GET' },
    { path: '/content', method: 'GET' },
    { path: '/publisher', method: 'GET' },
    { path: '/approvals', method: 'GET' },
    { path: '/analytics', method: 'GET' },
    { path: '/knowledge', method: 'GET' },
    { path: '/settings', method: 'GET' },
    { path: '/repurpose', method: 'GET' },
    { path: '/api/ai/ideas', method: 'GET' },
    { path: '/api/settings', method: 'GET' },
    { path: '/api/knowledge', method: 'GET' },
    { path: '/api/approvals', method: 'GET' },
    { path: '/api/workflows', method: 'GET' },
    { path: '/api/social/accounts', method: 'GET' }
  ];

  for (const ep of endpoints) {
    const res = await testEndpoint(ep.path, ep.method);
    console.log(`${ep.method} ${ep.path} -> Status: ${res.status} [${res.ok ? 'PASS' : 'FAIL'}]`);
    if (!res.ok) {
      console.error(`  Error details:`, res.error || res.raw || res.data);
    }
  }

  console.log("=== API AUDIT COMPLETE ===");
}

runAudit();
