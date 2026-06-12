import { sleep } from 'k6';
import { buildOptions } from './config.js';
import {
  flowSuccess,
  getCookieHeader,
  getJson,
  patchJson,
  postJson,
  requireEnv,
  safeJson,
  setupStudentContext,
  uniqueSuffix,
} from './utils.js';

export const options = buildOptions({
  testName: 'projets',
  latencyTargets: {
    smoke: { p95: 900, p99: 1400 },
    load: { p95: 1200, p99: 1800 },
    stress: { p95: 1900, p99: 2800, httpReqFailed: 0.03, checksRate: 0.97 },
    spike: { p95: 2300, p99: 3300, httpReqFailed: 0.04, checksRate: 0.96 },
    endurance: { p95: 1300, p99: 1900 },
  },
});

export function setup() {
  if ((__ENV.PERF_PROJECT_TYPE || 'personnel') === 'academique') {
    requireEnv(['PERF_VALIDATION_PROFESSOR_EMAIL']);
  }

  return setupStudentContext();
}

function buildProjectPayload() {
  const projectType = __ENV.PERF_PROJECT_TYPE || 'personnel';
  const payload = {
    projectTitle: `k6-projet-${uniqueSuffix()}`,
    projectDate: __ENV.PERF_PROJECT_DATE || '2026-05-13',
    description: 'Projet de charge k6 aligne sur le backend Node/Express/Prisma',
    projetType: projectType,
    githubLink: __ENV.PERF_PROJECT_GITHUB_LINK || 'https://github.com/example/perf-project',
    technologies: JSON.stringify(['Node.js', 'Express', 'Prisma']),
    domains: JSON.stringify(['Web', 'Backend']),
  };

  if (projectType === 'academique') {
    payload.professorEmail = __ENV.PERF_VALIDATION_PROFESSOR_EMAIL;
  }

  return payload;
}

export default function projetsFlow(data) {
  const headers = { Cookie: getCookieHeader(data.student.cookies) };
  const projectType = __ENV.PERF_PROJECT_TYPE || 'personnel';

  const beforeRes = getJson('/api/projets', {
    headers,
    expectedStatus: 200,
    label: 'GET /api/projets',
    expectJsonSuccess: true,
  });

  const createRes = postJson('/api/add-projet', buildProjectPayload(), {
    headers,
    expectedStatus: 201,
    label: 'POST /api/add-projet',
    expectJsonSuccess: true,
  });

  const createBody = safeJson(createRes);
  const experienceId = createBody?.data?.experience_id;

  const afterRes = getJson('/api/projets', {
    headers,
    expectedStatus: 200,
    label: 'GET /api/projets after create',
    expectJsonSuccess: true,
  });

  let visibilityOk = true;
  if (experienceId && projectType !== 'academique') {
    const visibilityRes = patchJson(`/api/projets/${experienceId}/visibilite`, {
      visibilite: true,
    }, {
      headers,
      expectedStatus: 200,
      label: 'PATCH /api/projets/:id/visibilite',
      expectJsonSuccess: true,
    });

    visibilityOk = safeJson(visibilityRes)?.success === true;
  }

  flowSuccess.add(
    safeJson(beforeRes)?.success === true &&
    createBody?.success === true &&
    safeJson(afterRes)?.success === true &&
    visibilityOk
  );

  sleep(1);
}
