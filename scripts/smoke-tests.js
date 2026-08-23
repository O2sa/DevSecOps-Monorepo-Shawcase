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

const TEST_USER = {
  username: `smoke_test_${Date.now().toString().slice(-6)}`,
  email: `smoketest_${Date.now().toString().slice(-6)}@devsecops.local`,
  password: 'SmokeTestSecurePassword123!',
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
  try {
    const regRes = await fetch(`${BASE_URLS.identity}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER),
      signal: AbortSignal.timeout(10000),
    });

    if (regRes.status === 201) {
      const regData = await regRes.json();
      token = regData.tokens ? regData.tokens.access : regData.access;
      console.log(
        `  ✅ [PASS] User Registration (${TEST_USER.username}) -> HTTP 201 (JWT Acquired)`
      );
      passedCount++;
    } else if (regRes.status === 400) {
      // User already exists, fallback to login
      const loginRes = await fetch(`${BASE_URLS.identity}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: TEST_USER.username,
          password: TEST_USER.password,
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (loginRes.status === 200) {
        const loginData = await loginRes.json();
        token = loginData.tokens ? loginData.tokens.access : loginData.access;
        console.log(
          `  ✅ [PASS] User Login Fallback (${TEST_USER.username}) -> HTTP 200 (JWT Acquired)`
        );
        passedCount++;
      } else {
        console.error(
          `  ❌ [FAIL] Registration/Login fallback failed -> HTTP ${regRes.status} / ${loginRes.status}`
        );
        failedCount++;
      }
    } else {
      console.error(`  ❌ [FAIL] User Registration failed -> HTTP ${regRes.status}`);
      failedCount++;
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
    await checkEndpoint('Orders API (Authenticated)', `${BASE_URLS.orders}/api/orders`, {
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
