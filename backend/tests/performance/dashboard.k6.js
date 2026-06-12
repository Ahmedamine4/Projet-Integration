import { sleep } from 'k6';
import { buildOptions } from './config.js';
import {
  flowSuccess,
  getCookieHeader,
  getJson,
  patchJson,
  pickUnreadNotification,
  safeJson,
  setupStudentContext,
} from './utils.js';

export const options = buildOptions({
  testName: 'dashboard',
  latencyTargets: {
    smoke: { p95: 900, p99: 1400 },
    load: { p95: 1200, p99: 1800 },
    stress: { p95: 1900, p99: 2800, httpReqFailed: 0.03, checksRate: 0.97 },
    spike: { p95: 2200, p99: 3200, httpReqFailed: 0.04, checksRate: 0.96 },
    endurance: { p95: 1300, p99: 1900 },
  },
});

export function setup() {
  return setupStudentContext();
}

export default function dashboardFlow(data) {
  const headers = { Cookie: getCookieHeader(data.student.cookies) };

  const meRes = getJson('/api/auth/me', {
    headers,
    expectedStatus: 200,
    label: 'GET /api/auth/me',
    expectJsonSuccess: true,
  });

  const dashboardRes = getJson('/api/etudiant/dashboard', {
    headers,
    expectedStatus: 200,
    label: 'GET /api/etudiant/dashboard',
    expectJsonSuccess: true,
  });

  const validationsRes = getJson('/api/etudiant/validations?page=1', {
    headers,
    expectedStatus: 200,
    label: 'GET /api/etudiant/validations',
    expectJsonSuccess: true,
  });

  const notificationsRes = getJson('/api/notifications', {
    headers,
    expectedStatus: 200,
    label: 'GET /api/notifications',
    expectJsonSuccess: true,
  });

  getJson('/api/notifications/non-lues', {
    headers,
    expectedStatus: 200,
    label: 'GET /api/notifications/non-lues',
    expectJsonSuccess: true,
  });

  const notification = pickUnreadNotification(safeJson(notificationsRes));
  if (notification && __ENV.K6_ENABLE_NOTIFICATION_READ !== 'false') {
    patchJson(`/api/notifications/${notification.notification_id}/lire`, null, {
      headers,
      expectedStatus: 200,
      label: 'PATCH /api/notifications/:id/lire',
      expectJsonSuccess: true,
    });
  }

  const meBody = safeJson(meRes);
  const dashboardBody = safeJson(dashboardRes);
  const validationsBody = safeJson(validationsRes);

  flowSuccess.add(
    meBody?.user?.utilisateur_id === data.student.userId &&
    dashboardBody?.success === true &&
    dashboardBody?.data?.stats !== undefined &&
    validationsBody?.success === true
  );

  sleep(1);
}
