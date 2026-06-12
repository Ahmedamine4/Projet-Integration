import http from 'k6/http';
import { check } from 'k6';
import { Rate } from 'k6/metrics';
import { BASE_URL } from './config.js';

export const flowSuccess = new Rate('flow_success');

export function requireEnv(names) {
  for (const name of names) {
    if (!__ENV[name]) {
      throw new Error(`Variable d'environnement obligatoire manquante: ${name}`);
    }
  }
}

export function safeJson(response) {
  try {
    return response.json();
  } catch (_) {
    return null;
  }
}

export function getCookieValue(response, name) {
  const cookie = response.cookies?.[name];
  return Array.isArray(cookie) && cookie[0] ? cookie[0].value : null;
}

export function getCookieHeader(cookies = {}) {
  return Object.entries(cookies)
    .filter(([, value]) => !!value)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

export function uniqueSuffix() {
  return `${__VU}-${__ITER}-${Date.now()}`;
}

function addCommonChecks(response, {
  expectedStatus,
  label,
  expectJsonSuccess = false,
}) {
  const body = safeJson(response);
  const assertions = {
    [`${label} status ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${label} no server error`]: (r) => r.status < 500,
  };

  if (expectJsonSuccess) {
    assertions[`${label} business success`] = () => body?.success === true;
  }

  return check(response, assertions);
}

function request(method, path, body, {
  headers = {},
  expectedStatus = 200,
  label = `${method.toUpperCase()} ${path}`,
  expectJsonSuccess = false,
} = {}) {
  const finalHeaders = {
    ...(body !== null && body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
  };

  const payload = body !== null && body !== undefined ? JSON.stringify(body) : null;
  const response = http.request(method, `${BASE_URL}${path}`, payload, { headers: finalHeaders });
  addCommonChecks(response, { expectedStatus, label, expectJsonSuccess });
  return response;
}

export function getJson(path, options = {}) {
  return request('GET', path, null, options);
}

export function postJson(path, body, options = {}) {
  return request('POST', path, body, options);
}

export function patchJson(path, body, options = {}) {
  return request('PATCH', path, body, options);
}

export function putJson(path, body, options = {}) {
  return request('PUT', path, body, options);
}

function login(email, password) {
  const response = postJson('/api/auth/login', { email, password }, {
    expectedStatus: 200,
    label: 'Setup login',
    expectJsonSuccess: true,
  });

  const body = safeJson(response);
  const cookies = {
    accessToken: getCookieValue(response, 'accessToken'),
    refreshToken: getCookieValue(response, 'refreshToken'),
    sessionToken: getCookieValue(response, 'sessionToken'),
  };

  if (!cookies.accessToken || !body?.user?.utilisateur_id) {
    throw new Error('Echec de login pendant setup k6');
  }

  return {
    userId: body.user.utilisateur_id,
    email: body.user.email,
    role: body.user.role,
    cookies,
    raw: body,
  };
}

export function setupStudentContext() {
  requireEnv(['PERF_STUDENT_EMAIL', 'PERF_STUDENT_PASSWORD']);

  return {
    student: login(__ENV.PERF_STUDENT_EMAIL, __ENV.PERF_STUDENT_PASSWORD),
  };
}

export function setupContexts({ student = true, professor = false } = {}) {
  const context = {};

  if (student) {
    requireEnv(['PERF_STUDENT_EMAIL', 'PERF_STUDENT_PASSWORD']);
    context.student = login(__ENV.PERF_STUDENT_EMAIL, __ENV.PERF_STUDENT_PASSWORD);
  }

  if (professor) {
    requireEnv(['PERF_PROF_EMAIL', 'PERF_PROF_PASSWORD']);
    context.professor = login(__ENV.PERF_PROF_EMAIL, __ENV.PERF_PROF_PASSWORD);
  }

  return context;
}

export function pickUnreadNotification(body) {
  const list = Array.isArray(body?.data) ? body.data : [];
  return list.find((item) => item?.lu === false) || null;
}

export function jsonBody(response) {
  return safeJson(response);
}
