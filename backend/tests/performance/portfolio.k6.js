import { sleep } from 'k6';
import { buildOptions } from './config.js';
import {
  flowSuccess,
  getCookieHeader,
  getJson,
  putJson,
  safeJson,
  setupStudentContext,
  uniqueSuffix,
} from './utils.js';

export const options = buildOptions({
  testName: 'portfolio',
  latencyTargets: {
    smoke: { p95: 1000, p99: 1500 },
    load: { p95: 1300, p99: 2000 },
    stress: { p95: 2000, p99: 3000, httpReqFailed: 0.03, checksRate: 0.97 },
    spike: { p95: 2300, p99: 3300, httpReqFailed: 0.04, checksRate: 0.96 },
    endurance: { p95: 1400, p99: 2100 },
  },
});

export function setup() {
  return setupStudentContext();
}

export default function portfolioFlow(data) {
  const headers = { Cookie: getCookieHeader(data.student.cookies) };

  const aboutRes = getJson(`/api/users/${data.student.userId}/about`, {
    expectedStatus: 200,
    label: 'GET /api/users/:id/about',
    expectJsonSuccess: true,
  });

  const updateRes = putJson(`/api/users/${data.student.userId}/about`, {
    a_propos: `Profil mis a jour par k6 ${uniqueSuffix()}`,
  }, {
    headers,
    expectedStatus: 200,
    label: 'PUT /api/users/:id/about',
    expectJsonSuccess: true,
  });

  const portfolioRes = getJson(`/api/users/portfolio/${data.student.userId}`, {
    headers,
    expectedStatus: 200,
    label: 'GET /api/users/portfolio/:id',
    expectJsonSuccess: true,
  });

  const historyRes = getJson(`/api/users/portfolio/${data.student.userId}/score-history`, {
    headers,
    expectedStatus: 200,
    label: 'GET /api/users/portfolio/:id/score-history',
    expectJsonSuccess: true,
  });

  if (__ENV.PERF_PORTFOLIO_EXPERIENCE_ID) {
    getJson(`/api/users/portfolio/experience/${__ENV.PERF_PORTFOLIO_EXPERIENCE_ID}`, {
      headers,
      expectedStatus: 200,
      label: 'GET /api/users/portfolio/experience/:id',
      expectJsonSuccess: true,
    });
  }

  const aboutBody = safeJson(aboutRes);
  const updateBody = safeJson(updateRes);
  const portfolioBody = safeJson(portfolioRes);
  const historyBody = safeJson(historyRes);

  flowSuccess.add(
    aboutBody?.success === true &&
    updateBody?.success === true &&
    portfolioBody?.data?.isOwner === true &&
    historyBody?.success === true
  );

  sleep(1);
}
