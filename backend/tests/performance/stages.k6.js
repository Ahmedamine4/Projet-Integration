import { buildOptions } from './config.js';
import {
  deleteJson,
  findCreatedExperienceId,
  getJson,
  getStudentSession,
  markFlow,
  patchJson,
  pause,
  postJson,
  requireEnv,
  safeJson,
  uniqueSuffix,
  withGroup,
} from './utils.js';

export const options = buildOptions({
  testName: 'stages',
  thresholdOverrides: {
    smoke: { p95: 950, p99: 1450 },
    load: { p95: 1250, p99: 1850 },
    stress: { p95: 1900, p99: 2800, httpReqFailed: 0.03, checksRate: 0.97, flowSuccess: 0.94 },
    spike: { p95: 2300, p99: 3300, httpReqFailed: 0.04, checksRate: 0.96, flowSuccess: 0.92 },
    endurance: { p95: 1350, p99: 2000 },
  },
});

function buildCreatePayload() {
  const isAcademic = String(__ENV.PERF_STAGE_IS_ACADEMIQUE || 'false').toLowerCase() === 'true';
  const title = uniqueSuffix('k6-stage');

  const payload = {
    titre: title,
    description: 'Stage de performance k6 aligne sur le flux creation -> lecture -> mise a jour.',
    missions_realisees: 'Developpement backend, tests et automatisation.',
    date_debut: __ENV.PERF_STAGE_START || '2026-06-01',
    date_fin: __ENV.PERF_STAGE_END || '2026-06-15',
    is_academique: isAcademic ? 'true' : 'false',
    technologies: JSON.stringify(['Node.js', 'Express', 'Prisma']),
    domaines: JSON.stringify(['Backend', 'Web']),
    visibilite: false,
  };

  if (isAcademic) {
    payload.email_professeur = __ENV.PERF_VALIDATION_PROFESSOR_EMAIL;
  }

  return payload;
}

export default function stagesFlow() {
  const isAcademic = String(__ENV.PERF_STAGE_IS_ACADEMIQUE || 'false').toLowerCase() === 'true';
  if (isAcademic) {
    requireEnv(['PERF_VALIDATION_PROFESSOR_EMAIL']);
  }

  const session = getStudentSession();
  const createPayload = buildCreatePayload();
  let success = true;
  let experienceId = null;

  withGroup('stages-list-create-update', () => {
    const beforeRes = getJson('/api/stages/stages', {
      cookies: session.cookies,
      expectedStatus: 200,
      label: 'GET /api/stages/stages before create',
      expectBusinessSuccess: true,
    });

    const createRes = postJson('/api/stages/add-stage', createPayload, {
      cookies: session.cookies,
      expectedStatus: 201,
      label: 'POST /api/stages/add-stage',
      expectBusinessSuccess: true,
    });

    const createBody = safeJson(createRes);
    experienceId = findCreatedExperienceId(createBody);

    const updateRes = experienceId
      ? patchJson(`/api/stages/stages/${experienceId}`, {
          titre: createPayload.titre,
          description: `${createPayload.description} (updated)`,
          date_debut: createPayload.date_debut,
          date_fin: __ENV.PERF_STAGE_UPDATED_END || '2026-06-18',
          missions_realisees: 'Developpement backend, tests et observabilite.',
          technologies: JSON.stringify(['Node.js', 'Express', 'Prisma', 'PostgreSQL']),
          domaines: JSON.stringify(['Backend', 'Web', 'API']),
        }, {
          cookies: session.cookies,
          expectedStatus: 200,
          label: 'PATCH /api/stages/stages/:experienceId',
          expectBusinessSuccess: true,
        })
      : null;

    const afterRes = getJson('/api/stages/stages', {
      cookies: session.cookies,
      expectedStatus: 200,
      label: 'GET /api/stages/stages after create',
      expectBusinessSuccess: true,
    });

    success = success &&
      safeJson(beforeRes)?.success === true &&
      createBody?.success === true &&
      Boolean(experienceId) &&
      (!updateRes || safeJson(updateRes)?.success === true) &&
      Array.isArray(safeJson(afterRes)?.data);
  });

  withGroup('stages-visibility-delete', () => {
    if (!experienceId) {
      success = false;
      return;
    }

    if (!isAcademic) {
      const visibilityRes = patchJson(`/api/stages/stages/${experienceId}/visibilite`, {
        visibilite: true,
      }, {
        cookies: session.cookies,
        expectedStatus: 200,
        label: 'PATCH /api/stages/stages/:experienceId/visibilite',
        expectBusinessSuccess: true,
      });

      success = success && safeJson(visibilityRes)?.data?.visibilite === true;
    }

    if (__ENV.K6_KEEP_CREATED_DATA !== 'true') {
      const deleteRes = deleteJson(`/api/stages/stages/${experienceId}`, {
        cookies: session.cookies,
        expectedStatus: 200,
        label: 'DELETE /api/stages/stages/:experienceId',
        expectBusinessSuccess: true,
      });

      success = success && safeJson(deleteRes)?.success === true;
    }
  });

  markFlow(success);
  pause();
}
