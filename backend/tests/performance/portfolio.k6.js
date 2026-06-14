import { buildOptions } from './config.js';
import {
  getJson,
  getStudentSession,
  markFlow,
  pause,
  putJson,
  safeJson,
  uniqueSuffix,
  withGroup,
} from './utils.js';

export const options = buildOptions({
  testName: 'portfolio',
  thresholdOverrides: {
    smoke: { p95: 1100, p99: 1600 },
    load: { p95: 1400, p99: 2200 },
    stress: { p95: 2200, p99: 3200, httpReqFailed: 0.03, checksRate: 0.97, flowSuccess: 0.94 },
    spike: { p95: 2600, p99: 3600, httpReqFailed: 0.04, checksRate: 0.96, flowSuccess: 0.92 },
    endurance: { p95: 1600, p99: 2400 },
  },
});

export default function portfolioFlow() {
  const session = getStudentSession();
  let success = true;
  let firstExperienceId = __ENV.PERF_PORTFOLIO_EXPERIENCE_ID || null;

  withGroup('portfolio-about', () => {
    const aboutRes = getJson(`/api/users/${session.userId}/about`, {
      expectedStatus: 200,
      label: 'GET /api/users/:id/about',
      expectBusinessSuccess: true,
    });

    const updateRes = putJson(`/api/users/${session.userId}/about`, {
      a_propos: `Profil performance ${uniqueSuffix('about')}`,
    }, {
      cookies: session.cookies,
      expectedStatus: 200,
      label: 'PUT /api/users/:id/about',
      expectBusinessSuccess: true,
    });

    success = success &&
      safeJson(aboutRes)?.success === true &&
      safeJson(updateRes)?.updated?.utilisateur_id === session.userId;
  });

  withGroup('portfolio-read-model', () => {
    const portfolioRes = getJson(`/api/users/portfolio/${session.userId}`, {
      cookies: session.cookies,
      expectedStatus: 200,
      label: 'GET /api/users/portfolio/:etudiantId',
      expectBusinessSuccess: true,
    });

    const filteredPortfolioRes = getJson(
      `/api/users/portfolio/${session.userId}?technologies=Node.js&domaines=Backend`,
      {
        cookies: session.cookies,
        expectedStatus: 200,
        label: 'GET /api/users/portfolio/:etudiantId filtered',
        expectBusinessSuccess: true,
      }
    );

    const historyRes = getJson(`/api/users/portfolio/${session.userId}/score-history`, {
      cookies: session.cookies,
      expectedStatus: 200,
      label: 'GET /api/users/portfolio/:etudiantId/score-history',
      expectBusinessSuccess: true,
    });

    const portfolioBody = safeJson(portfolioRes);
    const filteredBody = safeJson(filteredPortfolioRes);
    const historyBody = safeJson(historyRes);

    const projets = Array.isArray(portfolioBody?.data?.projets) ? portfolioBody.data.projets : [];
    const stages = Array.isArray(portfolioBody?.data?.stages) ? portfolioBody.data.stages : [];
    firstExperienceId = firstExperienceId || projets[0]?.experience_id || stages[0]?.experience_id || null;

    success = success &&
      portfolioBody?.data?.isOwner === true &&
      filteredBody?.success === true &&
      Array.isArray(historyBody?.history);
  });

  if (firstExperienceId) {
    withGroup('portfolio-experience-detail', () => {
      const experienceRes = getJson(`/api/users/portfolio/experience/${firstExperienceId}`, {
        cookies: session.cookies,
        expectedStatus: 200,
        label: 'GET /api/users/portfolio/experience/:idexperience',
        expectBusinessSuccess: true,
      });

      success = success && safeJson(experienceRes)?.data?.experience_id === firstExperienceId;
    });
  }

  markFlow(success);
  pause();
}
