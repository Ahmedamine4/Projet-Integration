import { sleep } from 'k6';
import { buildOptions, createScenario } from './config.js';
import {
  flowSuccess,
  getCookieHeader,
  getJson,
  patchJson,
  postJson,
  requireEnv,
  safeJson,
  setupContexts,
  uniqueSuffix,
} from './utils.js';

const professorValidationEnabled = (__ENV.K6_ENABLE_PROF_VALIDATION || 'false') === 'true';

const scenarios = {
  student_journey: createScenario('studentJourney', {
    tags: { test_name: 'full-flow-student' },
  }),
};

if (professorValidationEnabled) {
  scenarios.professor_validation = createScenario('professorJourney', {
    startTime: __ENV.K6_PROFESSOR_START || '10s',
    tags: { test_name: 'full-flow-professor' },
  });
}

export const options = buildOptions({
  testName: 'full-flow',
  scenarios,
  latencyTargets: {
    smoke: { p95: 1100, p99: 1600 },
    load: { p95: 1400, p99: 2200 },
    stress: { p95: 2200, p99: 3200, httpReqFailed: 0.03, checksRate: 0.97 },
    spike: { p95: 2600, p99: 3600, httpReqFailed: 0.04, checksRate: 0.96 },
    endurance: { p95: 1600, p99: 2400 },
  },
});

export function setup() {
  if (professorValidationEnabled) {
    requireEnv([
      'PERF_PROF_EMAIL',
      'PERF_PROF_PASSWORD',
      'PERF_VALIDATION_PROFESSOR_EMAIL',
    ]);
  }

  return setupContexts({
    student: true,
    professor: professorValidationEnabled,
  });
}

function buildProjectPayload() {
  const academic = professorValidationEnabled;

  return {
    projectTitle: `k6-projet-${uniqueSuffix()}`,
    projectDate: __ENV.PERF_PROJECT_DATE || '2026-05-13',
    description: 'Projet de performance k6 base sur la logique backend reelle',
    projetType: academic ? 'academique' : (__ENV.PERF_PROJECT_TYPE || 'personnel'),
    professorEmail: academic ? __ENV.PERF_VALIDATION_PROFESSOR_EMAIL : undefined,
    githubLink: __ENV.PERF_PROJECT_GITHUB_LINK || 'https://github.com/example/perf-project',
    technologies: JSON.stringify(['Node.js', 'Express']),
    domains: JSON.stringify(['Web', 'Backend']),
  };
}

function buildStagePayload() {
  const academic = professorValidationEnabled;

  return {
    titre: `k6-stage-${uniqueSuffix()}`,
    description: 'Stage de performance k6 base sur la logique backend reelle',
    missions_realisees: 'API backend, qualite, automatisation',
    date_debut: __ENV.PERF_STAGE_START || '2026-06-01',
    date_fin: __ENV.PERF_STAGE_END || '2026-06-15',
    is_academique: academic ? 'true' : (__ENV.PERF_STAGE_IS_ACADEMIQUE || 'false'),
    email_professeur: academic ? __ENV.PERF_VALIDATION_PROFESSOR_EMAIL : undefined,
    technologies: JSON.stringify(['Node.js', 'Prisma']),
    domaines: JSON.stringify(['Backend', 'Web']),
  };
}

export function studentJourney(data) {
  const headers = { Cookie: getCookieHeader(data.student.cookies) };

  getJson('/api/auth/me', {
    headers,
    expectedStatus: 200,
    label: 'GET /api/auth/me',
    expectJsonSuccess: true,
  });

  const projectRes = postJson('/api/add-projet', buildProjectPayload(), {
    headers,
    expectedStatus: 201,
    label: 'POST /api/add-projet',
    expectJsonSuccess: true,
  });

  getJson('/api/projets', {
    headers,
    expectedStatus: 200,
    label: 'GET /api/projets',
    expectJsonSuccess: true,
  });

  const stageRes = postJson('/api/stages/add-stage', buildStagePayload(), {
    headers,
    expectedStatus: 201,
    label: 'POST /api/stages/add-stage',
    expectJsonSuccess: true,
  });

  getJson('/api/stages/stages', {
    headers,
    expectedStatus: 200,
    label: 'GET /api/stages/stages',
    expectJsonSuccess: true,
  });

  getJson(`/api/users/portfolio/${data.student.userId}`, {
    headers,
    expectedStatus: 200,
    label: 'GET /api/users/portfolio/:id',
    expectJsonSuccess: true,
  });

  getJson('/api/etudiant/dashboard', {
    headers,
    expectedStatus: 200,
    label: 'GET /api/etudiant/dashboard',
    expectJsonSuccess: true,
  });

  getJson('/api/notifications', {
    headers,
    expectedStatus: 200,
    label: 'GET /api/notifications',
    expectJsonSuccess: true,
  });

  const projectBody = safeJson(projectRes);
  const stageBody = safeJson(stageRes);
  flowSuccess.add(projectBody?.success === true && stageBody?.success === true);

  sleep(1);
}

function findPendingValidation(items, type) {
  return items.find((item) => item?.type === type && item?.statut === 'en_attente');
}

export function professorJourney(data) {
  const headers = { Cookie: getCookieHeader(data.professor.cookies) };

  const listRes = getJson('/api/professeur/validations', {
    headers,
    expectedStatus: 200,
    label: 'GET /api/professeur/validations',
    expectJsonSuccess: true,
  });

  const body = safeJson(listRes);
  const validations = Array.isArray(body?.data) ? body.data : body?.data?.validations || body?.data || [];
  const pendingStage = findPendingValidation(validations, 'stage');
  const pendingProject = findPendingValidation(validations, 'projet');
  const target = pendingStage || pendingProject;

  let validated = false;

  if (target?.experience_id && target.type === 'stage') {
    getJson(`/api/professeur/validations/stages/${target.experience_id}`, {
      headers,
      expectedStatus: 200,
      label: 'GET /api/professeur/validations/stages/:id',
      expectJsonSuccess: true,
    });

    const patchRes = patchJson(`/api/professeur/validations/stages/${target.experience_id}`, {
      statut: 'valide',
    }, {
      headers,
      expectedStatus: 200,
      label: 'PATCH /api/professeur/validations/stages/:id',
      expectJsonSuccess: true,
    });
    validated = safeJson(patchRes)?.success === true;
  } else if (target?.experience_id && target.type === 'projet') {
    getJson(`/api/professeur/validations/projets/${target.experience_id}`, {
      headers,
      expectedStatus: 200,
      label: 'GET /api/professeur/validations/projets/:id',
      expectJsonSuccess: true,
    });

    const patchRes = patchJson(`/api/professeur/validations/projets/${target.experience_id}`, {
      statut: 'valide',
    }, {
      headers,
      expectedStatus: 200,
      label: 'PATCH /api/professeur/validations/projets/:id',
      expectJsonSuccess: true,
    });
    validated = safeJson(patchRes)?.success === true;
  }

  flowSuccess.add(validated);
  sleep(1);
}
