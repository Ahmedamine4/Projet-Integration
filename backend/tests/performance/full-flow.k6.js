import { buildOptions } from './config.js';
import {
  envBool,
  findCreatedExperienceId,
  findValidationByTitle,
  getJson,
  getProfessorSession,
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

const professorValidationRequested = String(
  __ENV.PERF_ENABLE_PROF_VALIDATION ||
  __ENV.K6_ENABLE_PROF_VALIDATION ||
  'false'
).toLowerCase() === 'true';
const strictProfessorValidation = envBool('K6_STRICT_PROF_VALIDATION', false);

export const options = buildOptions({
  testName: 'full-flow',
  thresholdOverrides: {
    smoke: { p95: 1200, p99: 1800 },
    load: { p95: 1500, p99: 2300 },
    stress: { p95: 2300, p99: 3400, httpReqFailed: 0.03, checksRate: 0.97, flowSuccess: 0.93 },
    spike: { p95: 2700, p99: 3800, httpReqFailed: 0.05, checksRate: 0.95, flowSuccess: 0.9 },
    endurance: { p95: 1700, p99: 2500 },
  },
});

function buildProjectPayload(professorValidationEnabled) {
  const title = uniqueSuffix('full-projet');
  return {
    title,
    body: {
      projectTitle: title,
      projectDate: __ENV.PERF_PROJECT_DATE || '2026-05-13',
      description: 'Projet full-flow k6 aligne sur la logique de validation.',
      projetType: professorValidationEnabled ? 'academique' : 'personnel',
      professorEmail: professorValidationEnabled ? __ENV.PERF_VALIDATION_PROFESSOR_EMAIL : undefined,
      githubLink: __ENV.PERF_PROJECT_GITHUB_LINK || 'https://github.com/example/full-project',
      technologies: JSON.stringify(['Node.js', 'Express', 'Prisma']),
      domains: JSON.stringify(['Web', 'Backend']),
    },
  };
}

function buildStagePayload(professorValidationEnabled) {
  const title = uniqueSuffix('full-stage');
  return {
    title,
    body: {
      titre: title,
      description: 'Stage full-flow k6 aligne sur la logique de validation.',
      missions_realisees: 'Developpement backend et automatisation.',
      date_debut: __ENV.PERF_STAGE_START || '2026-06-01',
      date_fin: __ENV.PERF_STAGE_END || '2026-06-15',
      is_academique: professorValidationEnabled ? 'true' : 'false',
      email_professeur: professorValidationEnabled ? __ENV.PERF_VALIDATION_PROFESSOR_EMAIL : undefined,
      technologies: JSON.stringify(['Node.js', 'Prisma']),
      domaines: JSON.stringify(['Backend', 'API']),
    },
  };
}

function assertValidationTargetExists(body, type, title) {
  return Boolean(findValidationByTitle(body, type, title));
}

export default function fullFlow() {
  if (professorValidationRequested) {
    requireEnv([
      'PERF_PROF_EMAIL',
      'PERF_PROF_PASSWORD',
      'PERF_VALIDATION_PROFESSOR_EMAIL',
    ]);
  }

  const student = getStudentSession();
  let professor = null;
  let professorValidationEnabled = false;

  if (professorValidationRequested) {
    try {
      professor = getProfessorSession();
      professorValidationEnabled = true;
    } catch (error) {
      if (strictProfessorValidation) {
        throw error;
      }
    }
  }

  const projectPayload = buildProjectPayload(professorValidationEnabled);
  const stagePayload = buildStagePayload(professorValidationEnabled);

  let success = true;
  let createdProjectId = null;
  let createdStageId = null;

  withGroup('student-auth-and-create', () => {
    const meRes = getJson('/api/auth/me', {
      cookies: student.cookies,
      expectedStatus: 200,
      label: 'GET /api/auth/me',
      expectBusinessSuccess: true,
    });

    const projectRes = postJson('/api/add-projet', projectPayload.body, {
      cookies: student.cookies,
      expectedStatus: 201,
      label: 'POST /api/add-projet',
      expectBusinessSuccess: true,
    });

    const stageRes = postJson('/api/stages/add-stage', stagePayload.body, {
      cookies: student.cookies,
      expectedStatus: 201,
      label: 'POST /api/stages/add-stage',
      expectBusinessSuccess: true,
    });

    createdProjectId = findCreatedExperienceId(safeJson(projectRes));
    createdStageId = findCreatedExperienceId(safeJson(stageRes));

    success = success &&
      safeJson(meRes)?.user?.utilisateur_id === student.userId &&
      Boolean(createdProjectId) &&
      Boolean(createdStageId);
  });

  withGroup('student-read-models', () => {
    const projetsRes = getJson('/api/projets', {
      cookies: student.cookies,
      expectedStatus: 200,
      label: 'GET /api/projets',
      expectBusinessSuccess: true,
    });

    const stagesRes = getJson('/api/stages/stages', {
      cookies: student.cookies,
      expectedStatus: 200,
      label: 'GET /api/stages/stages',
      expectBusinessSuccess: true,
    });

    const portfolioRes = getJson(`/api/users/portfolio/${student.userId}`, {
      cookies: student.cookies,
      expectedStatus: 200,
      label: 'GET /api/users/portfolio/:etudiantId',
      expectBusinessSuccess: true,
    });

    const dashboardRes = getJson('/api/etudiant/dashboard', {
      cookies: student.cookies,
      expectedStatus: 200,
      label: 'GET /api/etudiant/dashboard',
      expectBusinessSuccess: true,
    });

    const notificationsRes = getJson('/api/notifications', {
      cookies: student.cookies,
      expectedStatus: 200,
      label: 'GET /api/notifications',
      expectBusinessSuccess: true,
    });

    success = success &&
      Array.isArray(safeJson(projetsRes)?.data) &&
      Array.isArray(safeJson(stagesRes)?.data) &&
      safeJson(portfolioRes)?.data?.isOwner === true &&
      safeJson(dashboardRes)?.data?.stats !== undefined &&
      Array.isArray(safeJson(notificationsRes)?.data);
  });

  if (professorValidationEnabled && professor) {
    withGroup('professor-validation', () => {
      const listRes = getJson('/api/professeur/validations', {
        cookies: professor.cookies,
        expectedStatus: 200,
        label: 'GET /api/professeur/validations',
        expectBusinessSuccess: true,
      });

      const listBody = safeJson(listRes);
      const stageValidation = findValidationByTitle(listBody, 'stage', stagePayload.title);
      const projectValidation = findValidationByTitle(listBody, 'projet', projectPayload.title);

      let stageOk = assertValidationTargetExists(listBody, 'stage', stagePayload.title);
      let projectOk = assertValidationTargetExists(listBody, 'projet', projectPayload.title);

      if (stageValidation?.experience_id) {
        const detailRes = getJson(`/api/professeur/validations/stages/${stageValidation.experience_id}`, {
          cookies: professor.cookies,
          expectedStatus: 200,
          label: 'GET /api/professeur/validations/stages/:experienceId',
          expectBusinessSuccess: true,
        });

        const validateRes = patchJson(`/api/professeur/validations/stages/${stageValidation.experience_id}`, {
          statut: 'valide',
        }, {
          cookies: professor.cookies,
          expectedStatus: 200,
          label: 'PATCH /api/professeur/validations/stages/:experienceId',
          expectBusinessSuccess: true,
        });

        stageOk = stageOk &&
          safeJson(detailRes)?.data?.experience_id === stageValidation.experience_id &&
          safeJson(validateRes)?.data?.statut === 'valide';
      }

      if (projectValidation?.experience_id) {
        const detailRes = getJson(`/api/professeur/validations/projets/${projectValidation.experience_id}`, {
          cookies: professor.cookies,
          expectedStatus: 200,
          label: 'GET /api/professeur/validations/projets/:experienceId',
          expectBusinessSuccess: true,
        });

        const validateRes = patchJson(`/api/professeur/validations/projets/${projectValidation.experience_id}`, {
          statut: 'valide',
        }, {
          cookies: professor.cookies,
          expectedStatus: 200,
          label: 'PATCH /api/professeur/validations/projets/:experienceId',
          expectBusinessSuccess: true,
        });

        projectOk = projectOk &&
          safeJson(detailRes)?.data?.experience_id === projectValidation.experience_id &&
          safeJson(validateRes)?.data?.statut === 'valide';
      }

      success = success && stageOk && projectOk;
    });

    withGroup('student-after-validation', () => {
      const validationsRes = getJson('/api/etudiant/validations?page=1', {
        cookies: student.cookies,
        expectedStatus: 200,
        label: 'GET /api/etudiant/validations after professor',
        expectBusinessSuccess: true,
      });

      const notificationsRes = getJson('/api/notifications/non-lues', {
        cookies: student.cookies,
        expectedStatus: 200,
        label: 'GET /api/notifications/non-lues after professor',
        expectBusinessSuccess: true,
      });

      success = success &&
        Array.isArray(safeJson(validationsRes)?.data) &&
        Array.isArray(safeJson(notificationsRes)?.data);
    });
  }

  markFlow(success);
  pause();
}
