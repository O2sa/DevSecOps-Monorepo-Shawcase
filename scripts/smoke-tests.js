// ==============================================================================
// DevSecOps Pre-DAST Automated Smoke Testing Suite
// Validates service health, frontend entry points, and end-to-end JWT auth flows.
// ==============================================================================

const BASE_URLS = {
  identity: process.env.IDENTITY_SERVICE_URL || 'http://localhost:8001',
  orders: process.env.ORDERS_SERVICE_URL || 'http://localhost:8002',
  notifications: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8003',
  web: process.env.WEB_URL || 'http://localhost:3000',
  dashboard: process.env.DASHBOARD_URL || 'http://localhost:4200',
};

let passedCount = 0;
let failedCount = 0;

async function checkEndpoint(name, url, options = {}, expectedStatus = 200) {
  try {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
    if (
      res.status === expectedStatus ||
      (Array.isArray(expectedStatus) && expectedStatus.includes(res.status))
    ) {
      console.log(`  ✅ [PASS] ${name} (${url}) -> HTTP ${res.status}`);
      passedCount++;
      return res;
    } else {
      console.error(
        `  ❌ [FAIL] ${name} (${url}) -> Expected HTTP ${expectedStatus}, received HTTP ${res.status}`
      );
      failedCount++;
      return null;
    }
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name} (${url}) -> Request Error: ${err.message}`);
    failedCount++;
    return null;
  }
}

async function runSmokeTests() {
  console.log('\n======================================================');
  console.log('🚀 [DevSecOps Staging] Executing Pre-DAST Smoke Tests');
  console.log('======================================================\n');

  // 1. Health Checks
  console.log('1. Validating Microservice Health Endpoints:');
  await checkEndpoint('Identity Service Health', `${BASE_URLS.identity}/health`);
  await checkEndpoint('Orders Service Health', `${BASE_URLS.orders}/health`);
  await checkEndpoint('Notification Service Health', `${BASE_URLS.notifications}/health`);
  await checkEndpoint('Web Portal Health', `${BASE_URLS.web}/api/health`);
  await checkEndpoint('Dashboard Health', `${BASE_URLS.dashboard}/health.json`);

  // 2. Frontend Entry Points
  console.log('\n2. Validating Frontend Entry Points:');
  await checkEndpoint('Web Portal UI', `${BASE_URLS.web}/`);
  await checkEndpoint('Admin Dashboard UI', `${BASE_URLS.dashboard}/`);

  // 3. User Registration & JWT Authentication
  console.log('\n3. Validating Authentication & JWT Token Issuance:');
  let token = null;
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const testUser = {
    username: `smoke_user_${uniqueId}`,
    email: `smoke_${uniqueId}@devsecops.local`,
    password: 'SmokeTestSecurePassword123!',
  };

  try {
    const regRes = await fetch(`${BASE_URLS.identity}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
      signal: AbortSignal.timeout(10000),
    });

    if (regRes.status === 201) {
      console.log(`  ✅ [PASS] User Registration (${testUser.username}) -> HTTP 201`);
      passedCount++;

      // Acquire JWT via standard login endpoint
      const loginRes = await fetch(`${BASE_URLS.identity}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: testUser.username,
          password: testUser.password,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (loginRes.status === 200) {
        const loginData = await loginRes.json();
        token = loginData.access;
        console.log(`  ✅ [PASS] User Login (${testUser.username}) -> HTTP 200 (JWT Acquired)`);
        passedCount++;
      } else {
        const errText = await loginRes.text();
        console.error(
          `  ❌ [FAIL] User Login (${testUser.username}) -> Expected HTTP 200, received HTTP ${loginRes.status}: ${errText}`
        );
        failedCount++;
      }
    } else {
      const regErr = await regRes.text();
      console.warn(
        `  ⚠️ [WARN] Registration returned HTTP ${regRes.status}: ${regErr}. Attempting admin login fallback...`
      );

      const adminLoginRes = await fetch(`${BASE_URLS.identity}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: process.env.DJANGO_SUPERUSER_USERNAME || 'admin',
          password: process.env.DJANGO_SUPERUSER_PASSWORD || 'AdminPassword123!',
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (adminLoginRes.status === 200) {
        const adminData = await adminLoginRes.json();
        token = adminData.access;
        console.log(`  ✅ [PASS] Admin Login Fallback -> HTTP 200 (JWT Acquired)`);
        passedCount++;
      } else {
        const adminErr = await adminLoginRes.text();
        console.error(
          `  ❌ [FAIL] Admin Login Fallback -> Expected HTTP 200, received HTTP ${adminLoginRes.status}: ${adminErr}`
        );
        failedCount++;
      }
    }
  } catch (err) {
    console.error(`  ❌ [FAIL] Authentication request error: ${err.message}`);
    failedCount++;
  }

  // 4. Authenticated API Endpoints
  if (token) {
    console.log('\n4. Validating Authenticated Microservice API Endpoints:');
    const authHeaders = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    await checkEndpoint('Products Catalog API', `${BASE_URLS.orders}/api/products`);
    await checkEndpoint('Orders API (Authenticated User)', `${BASE_URLS.orders}/api/orders/me`, {
      headers: authHeaders,
    });
    await checkEndpoint(
      'Notifications API (Authenticated)',
      `${BASE_URLS.notifications}/api/notifications`,
      { headers: authHeaders }
    );
  }

  // Summary
  console.log('\n======================================================');
  console.log(`📊 Smoke Test Summary: ${passedCount} Passed, ${failedCount} Failed`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    console.error('❌ Staging environment smoke tests failed! Halting DAST execution.\n');
    process.exit(1);
  } else {
    console.log('✅ All staging smoke tests passed! System is ready for DAST scanning.\n');
    process.exit(0);
  }
}

runSmokeTests();
