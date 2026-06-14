import { buildOptions } from './config.js';
import {
  findUnreadNotification,
  getJson,
  getStudentSession,
  markFlow,
  patchJson,
  pause,
  safeJson,
  withGroup,
} from './utils.js';

export const options = buildOptions({
  testName: 'dashboard',
  thresholdOverrides: {
    smoke: { p95: 1000, p99: 1500 },
    load: { p95: 1300, p99: 1900 },
    stress: { p95: 1900, p99: 2800, httpReqFailed: 0.03, checksRate: 0.97, flowSuccess: 0.95 },
    spike: { p95: 2300, p99: 3300, httpReqFailed: 0.04, checksRate: 0.96, flowSuccess: 0.93 },
    endurance: { p95: 1400, p99: 2100 },
  },
});

export default function dashboardFlow() {
  const session = getStudentSession();
  let success = true;

  withGroup('dashboard-core', () => {
    const meRes = getJson('/api/auth/me', {
      cookies: session.cookies,
      expectedStatus: 200,
      label: 'GET /api/auth/me',
      expectBusinessSuccess: true,
    });

    const sessionsRes = getJson('/api/auth/me/sessions', {
      cookies: session.cookies,
      expectedStatus: 200,
      label: 'GET /api/auth/me/sessions',
      expectBusinessSuccess: true,
    });

    const dashboardRes = getJson('/api/etudiant/dashboard', {
      cookies: session.cookies,
      expectedStatus: 200,
      label: 'GET /api/etudiant/dashboard',
      expectBusinessSuccess: true,
    });

    const validationsRes = getJson('/api/etudiant/validations?page=1', {
      cookies: session.cookies,
      expectedStatus: 200,
      label: 'GET /api/etudiant/validations',
      expectBusinessSuccess: true,
    });

    const meBody = safeJson(meRes);
    const sessionsBody = safeJson(sessionsRes);
    const dashboardBody = safeJson(dashboardRes);
    const validationsBody = safeJson(validationsRes);

    success = success &&
      meBody?.user?.utilisateur_id === session.userId &&
      Array.isArray(sessionsBody?.data) &&
      dashboardBody?.data?.stats !== undefined &&
      Array.isArray(validationsBody?.data);
  });

  withGroup('dashboard-notifications', () => {
    const notificationsRes = getJson('/api/notifications', {
      cookies: session.cookies,
      expectedStatus: 200,
      label: 'GET /api/notifications',
      expectBusinessSuccess: true,
    });

    const unreadRes = getJson('/api/notifications/non-lues', {
      cookies: session.cookies,
      expectedStatus: 200,
      label: 'GET /api/notifications/non-lues',
      expectBusinessSuccess: true,
    });

    const notification = findUnreadNotification(safeJson(notificationsRes));
    let readOk = true;

    if (notification && __ENV.K6_ENABLE_NOTIFICATION_READ !== 'false') {
      const readRes = patchJson(`/api/notifications/${notification.notification_id}/lire`, undefined, {
        cookies: session.cookies,
        expectedStatus: 200,
        label: 'PATCH /api/notifications/:notificationId/lire',
        expectBusinessSuccess: true,
      });

      readOk = safeJson(readRes)?.data?.lu === true;
    }

    success = success &&
      Array.isArray(safeJson(unreadRes)?.data) &&
      readOk;
  });

  markFlow(success);
  pause();
}
