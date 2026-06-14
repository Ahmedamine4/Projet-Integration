import { buildOptions } from './config.js';
import {
  getCookieValue,
  getStudentSession,
  getJson,
  markFlow,
  pause,
  postJson,
  refreshSession,
  safeJson,
  uniqueSuffix,
  withGroup,
} from './utils.js';

export const options = buildOptions({
  testName: 'auth',
  thresholdOverrides: {
    smoke: { p95: 700, p99: 1100 },
    load: { p95: 900, p99: 1400 },
    stress: { p95: 1500, p99: 2200, httpReqFailed: 0.03, checksRate: 0.97, flowSuccess: 0.95 },
    spike: { p95: 1800, p99: 2600, httpReqFailed: 0.04, checksRate: 0.96, flowSuccess: 0.93 },
    endurance: { p95: 1000, p99: 1600 },
  },
});

export default function authFlow() {
  let success = true;
  const session = getStudentSession(true);

  withGroup('auth-login-profile-refresh', () => {
    const meRes = getJson('/api/auth/me', {
      cookies: session.cookies,
      expectedStatus: 200,
      label: 'GET /api/auth/me',
      expectBusinessSuccess: true,
    });

    const profileRes = getJson('/api/auth/profile', {
      cookies: session.cookies,
      expectedStatus: 200,
      label: 'GET /api/auth/profile',
      expectBusinessSuccess: true,
    });

    const sessionsRes = getJson('/api/auth/me/sessions', {
      cookies: session.cookies,
      expectedStatus: 200,
      label: 'GET /api/auth/me/sessions',
      expectBusinessSuccess: true,
    });

    refreshSession(session, 'student');

    const meBody = safeJson(meRes);
    const profileBody = safeJson(profileRes);
    const sessionsBody = safeJson(sessionsRes);

    success = success &&
      meBody?.user?.email === session.email &&
      profileBody?.user?.utilisateur_id === session.userId &&
      Array.isArray(sessionsBody?.data);
  });

  if (__ENV.K6_AUTH_REGISTER === 'true') {
    withGroup('auth-register-optional', () => {
      const password = __ENV.PERF_REGISTER_PASSWORD || 'StrongPass123!';
      const registerRes = postJson('/api/auth/register', {
        firstName: 'Perf',
        lastName: 'Auth',
        email: `${uniqueSuffix('auth')}@test.integration.local`,
        password,
      }, {
        expectedStatus: 201,
        label: 'POST /api/auth/register',
        expectBusinessSuccess: true,
      });

      success = success &&
        !!getCookieValue(registerRes, 'accessToken') &&
        !!getCookieValue(registerRes, 'refreshToken');
    });
  }

  if (__ENV.K6_AUTH_LOGOUT === 'true') {
    withGroup('auth-logout-optional', () => {
      const logoutRes = postJson('/api/auth/logout', undefined, {
        cookies: session.cookies,
        expectedStatus: 200,
        label: 'POST /api/auth/logout',
        expectBusinessSuccess: true,
      });

      success = success && safeJson(logoutRes)?.success === true;
    });
  }

  markFlow(success);
  pause();
}
