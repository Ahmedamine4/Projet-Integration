import { sleep } from 'k6';
import { buildOptions } from './config.js';
import {
  flowSuccess,
  getCookieValue,
  getJson,
  postJson,
  requireEnv,
  safeJson,
  uniqueSuffix,
} from './utils.js';

export const options = buildOptions({
  testName: 'auth',
  latencyTargets: {
    smoke: { p95: 700, p99: 1200 },
    load: { p95: 900, p99: 1500 },
    stress: { p95: 1500, p99: 2500, httpReqFailed: 0.03, checksRate: 0.97 },
    spike: { p95: 1800, p99: 2800, httpReqFailed: 0.04, checksRate: 0.96 },
    endurance: { p95: 1000, p99: 1700 },
  },
});

export default function authFlow() {
  requireEnv(['PERF_STUDENT_EMAIL', 'PERF_STUDENT_PASSWORD']);

  const loginRes = postJson('/api/auth/login', {
    email: __ENV.PERF_STUDENT_EMAIL,
    password: __ENV.PERF_STUDENT_PASSWORD,
  }, {
    expectedStatus: 200,
    label: 'POST /api/auth/login',
    expectJsonSuccess: true,
  });

  const accessToken = getCookieValue(loginRes, 'accessToken');
  const refreshToken = getCookieValue(loginRes, 'refreshToken');
  const sessionToken = getCookieValue(loginRes, 'sessionToken');

  const cookieHeader = [
    accessToken ? `accessToken=${accessToken}` : null,
    refreshToken ? `refreshToken=${refreshToken}` : null,
    sessionToken ? `sessionToken=${sessionToken}` : null,
  ].filter(Boolean).join('; ');

  const meRes = getJson('/api/auth/me', {
    headers: { Cookie: cookieHeader },
    expectedStatus: 200,
    label: 'GET /api/auth/me',
    expectJsonSuccess: true,
  });

  const refreshRes = postJson('/api/auth/refresh-token', null, {
    headers: { Cookie: cookieHeader },
    expectedStatus: 200,
    label: 'POST /api/auth/refresh-token',
    expectJsonSuccess: true,
  });

  const refreshedAccessToken = getCookieValue(refreshRes, 'accessToken') || accessToken;
  const refreshedRefreshToken = getCookieValue(refreshRes, 'refreshToken') || refreshToken;

  const logoutCookieHeader = [
    refreshedAccessToken ? `accessToken=${refreshedAccessToken}` : null,
    refreshedRefreshToken ? `refreshToken=${refreshedRefreshToken}` : null,
    sessionToken ? `sessionToken=${sessionToken}` : null,
  ].filter(Boolean).join('; ');

  const logoutRes = postJson('/api/auth/logout', null, {
    headers: { Cookie: logoutCookieHeader },
    expectedStatus: 200,
    label: 'POST /api/auth/logout',
    expectJsonSuccess: true,
  });

  const meBody = safeJson(meRes);
  const logoutBody = safeJson(logoutRes);
  flowSuccess.add(
    !!accessToken &&
    !!refreshToken &&
    meBody?.user?.email === __ENV.PERF_STUDENT_EMAIL &&
    logoutBody?.success === true
  );

  if (__ENV.K6_AUTH_REGISTER === 'true') {
    postJson('/api/auth/register', {
      firstName: 'Perf',
      lastName: 'Runner',
      email: `perf.auth.${uniqueSuffix()}@integration.test`,
      password: __ENV.PERF_REGISTER_PASSWORD || 'StrongPass123!',
    }, {
      expectedStatus: 201,
      label: 'POST /api/auth/register',
      expectJsonSuccess: true,
    });
  }

  sleep(1);
}
