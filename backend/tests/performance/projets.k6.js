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
  testName: 'projets',
  thresholdOverrides: {
    smoke: { p95: 900, p99: 1400 },
    load: { p95: 1200, p99: 1800 },
    stress: { p95: 1800, p99: 2600, httpReqFailed: 0.03, checksRate: 0.97, flowSuccess: 0.94 },
    spike: { p95: 2200, p99: 3200, httpReqFailed: 0.04, checksRate: 0.96, flowSuccess: 0.92 },
    endurance: { p95: 1300, p99: 1900 },
  },
});

function buildCreatePayload() {
  const isAcademic = String(__ENV.PERF_PROJECT_TYPE || 'personnel').toLowerCase() === 'academique';
  const title = uniqueSuffix('k6-projet');

  const payload = {
    projectTitle: title,
    projectDate: __ENV.PERF_PROJECT_DATE || '2026-05-13',
    description: 'Projet de performance k6 aligne sur le flux creation -> lecture -> mise a jour.',
    projetType: isAcademic ? 'academique' : 'personnel',
    githubLink: __ENV.PERF_PROJECT_GITHUB_LINK || 'https://github.com/example/perf-project',
    technologies: JSON.stringify(['Node.js', 'Express', 'Prisma']),
    domains: JSON.stringify(['Web', 'Backend']),
    visibilite: false,
  };

  if (isAcademic) {
    payload.professorEmail = __ENV.PERF_VALIDATION_PROFESSOR_EMAIL;
  }

  return payload;
}

export default function projetsFlow() {
  const isAcademic = String(__ENV.PERF_PROJECT_TYPE || 'personnel').toLowerCase() === 'academique';
  if (isAcademic) {
    requireEnv(['PERF_VALIDATION_PROFESSOR_EMAIL']);
  }

  const session = getStudentSession();
  const createPayload = buildCreatePayload();
  let success = true;
  let experienceId = null;

  withGroup('projets-list-create-update', () => {
    const beforeRes = getJson('/api/projets', {
      cookies: session.cookies,
      expectedStatus: 200,
      label: 'GET /api/projets before create',
      expectBusinessSuccess: true,
    });

    const createRes = postJson('/api/add-projet', createPayload, {
      cookies: session.cookies,
      expectedStatus: 201,
      label: 'POST /api/add-projet',
      expectBusinessSuccess: true,
    });

    const createBody = safeJson(createRes);
    experienceId = findCreatedExperienceId(createBody);

    const updateRes = experienceId
      ? patchJson(`/api/projets/${experienceId}`, {
          description: `${createPayload.description} (updated)`,
          technologies: JSON.stringify(['Node.js', 'Express', 'Prisma', 'PostgreSQL']),
          domains: JSON.stringify(['Web', 'Backend', 'API']),
          githubLink: createPayload.githubLink,
        }, {
          cookies: session.cookies,
          expectedStatus: 200,
          label: 'PATCH /api/projets/:experienceId',
          expectBusinessSuccess: true,
        })
      : null;

    const afterRes = getJson('/api/projets', {
      cookies: session.cookies,
      expectedStatus: 200,
      label: 'GET /api/projets after create',
      expectBusinessSuccess: true,
    });

    success = success &&
      safeJson(beforeRes)?.success === true &&
      createBody?.success === true &&
      Boolean(experienceId) &&
      (!updateRes || safeJson(updateRes)?.success === true) &&
      Array.isArray(safeJson(afterRes)?.data);
  });

  withGroup('projets-visibility-delete', () => {
    if (!experienceId) {
      success = false;
      return;
    }

    if (!isAcademic) {
      const visibilityRes = patchJson(`/api/projets/${experienceId}/visibilite`, {
        visibilite: true,
      }, {
        cookies: session.cookies,
        expectedStatus: 200,
        label: 'PATCH /api/projets/:experienceId/visibilite',
        expectBusinessSuccess: true,
      });

      success = success && safeJson(visibilityRes)?.data?.visibilite === true;
    }

    if (__ENV.K6_KEEP_CREATED_DATA !== 'true') {
      const deleteRes = deleteJson(`/api/projets/${experienceId}`, {
        cookies: session.cookies,
        expectedStatus: 200,
        label: 'DELETE /api/projets/:experienceId',
        expectBusinessSuccess: true,
      });

      success = success && safeJson(deleteRes)?.success === true;
    }
  });

  markFlow(success);
  pause();
}
