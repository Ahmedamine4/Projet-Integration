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
  testName: 'stages',
  latencyTargets: {
    smoke: { p95: 900, p99: 1400 },
    load: { p95: 1200, p99: 1800 },
    stress: { p95: 1900, p99: 2800, httpReqFailed: 0.03, checksRate: 0.97 },
    spike: { p95: 2300, p99: 3300, httpReqFailed: 0.04, checksRate: 0.96 },
    endurance: { p95: 1300, p99: 1900 },
  },
});

export function setup() {
  if ((__ENV.PERF_STAGE_IS_ACADEMIQUE || 'false') === 'true') {
    requireEnv(['PERF_VALIDATION_PROFESSOR_EMAIL']);
  }

  return setupStudentContext();
}

function buildStagePayload() {
  const isAcademique = __ENV.PERF_STAGE_IS_ACADEMIQUE || 'false';
  const payload = {
    titre: `k6-stage-${uniqueSuffix()}`,
    description: 'Stage de charge k6 aligne sur le backend Node/Express/Prisma',
    missions_realisees: 'Developpement backend et integration',
    date_debut: __ENV.PERF_STAGE_START || '2026-06-01',
    date_fin: __ENV.PERF_STAGE_END || '2026-06-15',
    is_academique: isAcademique,
    technologies: JSON.stringify(['Node.js', 'Express']),
    domaines: JSON.stringify(['Backend', 'Web']),
  };

  if (isAcademique === 'true') {
    payload.email_professeur = __ENV.PERF_VALIDATION_PROFESSOR_EMAIL;
  }

  return payload;
}

export default function stagesFlow(data) {
  const headers = { Cookie: getCookieHeader(data.student.cookies) };
  const isAcademique = (__ENV.PERF_STAGE_IS_ACADEMIQUE || 'false') === 'true';

  const beforeRes = getJson('/api/stages/stages', {
    headers,
    expectedStatus: 200,
    label: 'GET /api/stages/stages',
    expectJsonSuccess: true,
  });

  const createRes = postJson('/api/stages/add-stage', buildStagePayload(), {
    headers,
    expectedStatus: 201,
    label: 'POST /api/stages/add-stage',
    expectJsonSuccess: true,
  });

  const createBody = safeJson(createRes);
  const experienceId = createBody?.data?.experience_id;

  const afterRes = getJson('/api/stages/stages', {
    headers,
    expectedStatus: 200,
    label: 'GET /api/stages/stages after create',
    expectJsonSuccess: true,
  });

  let visibilityOk = true;
  if (experienceId && !isAcademique) {
    const visibilityRes = patchJson(`/api/stages/stages/${experienceId}/visibilite`, {
      visibilite: true,
    }, {
      headers,
      expectedStatus: 200,
      label: 'PATCH /api/stages/stages/:id/visibilite',
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
