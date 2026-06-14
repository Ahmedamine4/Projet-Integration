import http from 'k6/http';
import { check, group } from 'k6';
import { Rate } from 'k6/metrics';
import { sleep } from 'k6';
import { BASE_URL } from './config.js';

export const flowSuccess = new Rate('flow_success');

const sessionCache = {};
const DEFAULT_STUDENT_EMAIL = __ENV.PERF_STUDENT_EMAIL || __ENV.K6_STUDENT_EMAIL || 'k6.student@example.test';
const DEFAULT_STUDENT_PASSWORD = __ENV.PERF_STUDENT_PASSWORD || __ENV.PERF_DEFAULT_PASSWORD || 'StrongPass123!';
const EXPLICIT_STUDENT_CREDENTIALS = Boolean(__ENV.PERF_STUDENT_EMAIL && __ENV.PERF_STUDENT_PASSWORD);

export function requireEnv(names) {
  for (const name of names) {
    if (!__ENV[name]) {
      throw new Error(`Variable d'environnement obligatoire manquante: ${name}`);
    }
  }
}

export function envBool(name, defaultValue = false) {
  const raw = __ENV[name];
  if (raw === undefined) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(String(raw).toLowerCase());
}

export function pause(seconds = Number(__ENV.K6_SLEEP_SECONDS || 1)) {
  sleep(seconds);
}

export function safeJson(response) {
  try {
    return response.json();
  } catch (_) {
    return null;
  }
}

export function uniqueSuffix(prefix = 'perf') {
  return `${prefix}-${__VU}-${__ITER}-${Date.now()}`;
}

function normalizeBool(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function autoProvisionStudentEnabled() {
  return normalizeBool(__ENV.K6_AUTO_PROVISION_STUDENT, true);
}

function studentCredentialsForCurrentVu() {
  if (EXPLICIT_STUDENT_CREDENTIALS) {
    return {
      email: __ENV.PERF_STUDENT_EMAIL,
      password: __ENV.PERF_STUDENT_PASSWORD,
    };
  }

  return {
    email: DEFAULT_STUDENT_EMAIL,
    password: DEFAULT_STUDENT_PASSWORD,
  };
}

export function cookieHeader(cookies = {}) {
  return Object.entries(cookies)
    .filter(([, value]) => Boolean(value))
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

export function getCookieValue(response, name) {
  const cookie = response.cookies?.[name];
  return Array.isArray(cookie) && cookie[0] ? cookie[0].value : null;
}

function buildSessionFromResponse(response, email) {
  const body = safeJson(response);

  return {
    email,
    userId: body?.user?.utilisateur_id,
    role: body?.user?.role,
    cookies: {
      accessToken: getCookieValue(response, 'accessToken'),
      refreshToken: getCookieValue(response, 'refreshToken'),
      sessionToken: getCookieValue(response, 'sessionToken'),
    },
  };
}

function performChecks(response, label, expectedStatus, expectBusinessSuccess) {
  const body = safeJson(response);
  return check(response, {
    [`${label} status ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${label} status is not 5xx`]: (r) => r.status < 500,
    ...(expectBusinessSuccess
      ? {
        [`${label} body.success true`]: () => body?.success === true,
      }
      : {}),
  });
}

export function requestJson(method, path, {
  body,
  cookies,
  headers = {},
  expectedStatus = 200,
  label,
  expectBusinessSuccess = true,
  tags,
} = {}) {
  const finalHeaders = { Accept: 'application/json', ...headers };
  if (cookies) {
    finalHeaders.Cookie = cookieHeader(cookies);
  }

  let payload = null;
  if (body !== undefined) {
    payload = JSON.stringify(body);
    finalHeaders['Content-Type'] = 'application/json';
  }

  const response = http.request(method, `${BASE_URL}${path}`, payload, {
    headers: finalHeaders,
    tags,
  });

  performChecks(response, label || `${method.toUpperCase()} ${path}`, expectedStatus, expectBusinessSuccess);
  return response;
}

export function getJson(path, options = {}) {
  return requestJson('GET', path, options);
}

export function postJson(path, body, options = {}) {
  return requestJson('POST', path, { ...options, body });
}

export function putJson(path, body, options = {}) {
  return requestJson('PUT', path, { ...options, body });
}

export function patchJson(path, body, options = {}) {
  return requestJson('PATCH', path, { ...options, body });
}

export function deleteJson(path, options = {}) {
  return requestJson('DELETE', path, options);
}

export function login(email, password, cacheKey = email) {
  const response = postJson('/api/auth/login', { email, password }, {
    expectedStatus: 200,
    label: `POST /api/auth/login (${cacheKey})`,
    expectBusinessSuccess: true,
  });

  const session = buildSessionFromResponse(response, email);

  if (!session.userId || !session.cookies.accessToken || !session.cookies.refreshToken) {
    throw new Error(`Login k6 invalide pour ${cacheKey}`);
  }

  sessionCache[cacheKey] = session;
  return session;
}

function tryLogin(email, password, cacheKey = email) {
  const response = postJson('/api/auth/login', { email, password }, {
    expectedStatus: 200,
    label: `POST /api/auth/login (${cacheKey})`,
    expectBusinessSuccess: true,
  });

  const session = buildSessionFromResponse(response, email);
  const ok = Boolean(session.userId && session.cookies.accessToken && session.cookies.refreshToken);

  return {
    ok,
    response,
    session,
    body: safeJson(response),
  };
}

function registerStudent(email, password, cacheKey = 'student-bootstrap') {
  return postJson('/api/auth/register', {
    firstName: 'K6',
    lastName: 'Performance',
    email,
    password,
  }, {
    expectedStatus: 201,
    label: `POST /api/auth/register (${cacheKey})`,
    expectBusinessSuccess: true,
  });
}

function isDuplicateEmailError(registerBody) {
  const message = String(registerBody?.error || registerBody?.message || '').toLowerCase();
  return message.includes('email') && (message.includes('deja') || message.includes('utilis'));
}

function bootstrapStudentSession(cacheKey) {
  const credentials = studentCredentialsForCurrentVu();
  let loginAttempt = tryLogin(credentials.email, credentials.password, cacheKey);

  if (loginAttempt.ok) {
    sessionCache[cacheKey] = loginAttempt.session;
    return loginAttempt.session;
  }

  if (!autoProvisionStudentEnabled()) {
    throw new Error(
      `Login k6 invalide pour ${cacheKey}. Fournissez PERF_STUDENT_EMAIL/PERF_STUDENT_PASSWORD valides ou activez K6_AUTO_PROVISION_STUDENT=true.`
    );
  }


  const shouldFallbackToManagedStudent = EXPLICIT_STUDENT_CREDENTIALS &&
    (credentials.email !== DEFAULT_STUDENT_EMAIL || credentials.password !== DEFAULT_STUDENT_PASSWORD);

  const managedCredentials = shouldFallbackToManagedStudent
    ? { email: DEFAULT_STUDENT_EMAIL, password: DEFAULT_STUDENT_PASSWORD }
    : credentials;

  if (shouldFallbackToManagedStudent) {
    loginAttempt = tryLogin(managedCredentials.email, managedCredentials.password, cacheKey);
    if (loginAttempt.ok) {
      sessionCache[cacheKey] = loginAttempt.session;
      return loginAttempt.session;
    }
  }

  const registerResponse = registerStudent(managedCredentials.email, managedCredentials.password, cacheKey);
  const registerBody = safeJson(registerResponse);

  // Un autre VU peut avoir cree le compte entre-temps. Dans ce cas on retente simplement le login.
  if (!(registerResponse.status === 201 && registerBody?.success === true) && !isDuplicateEmailError(registerBody)) {
    throw new Error(`Creation du compte k6 impossible pour ${cacheKey}: ${registerBody?.error || registerResponse.status}`);
  }

  const retryAttempt = tryLogin(managedCredentials.email, managedCredentials.password, cacheKey);
  if (!retryAttempt.ok) {
    throw new Error(
      `Login k6 invalide pour ${cacheKey} apres bootstrap (${managedCredentials.email}). Verifiez /api/auth/login et les cookies de session.`
    );
  }

  sessionCache[cacheKey] = retryAttempt.session;
  return retryAttempt.session;
}

export function getStudentSession(force = false) {
  const key = 'student';
  if (!force && sessionCache[key]?.cookies?.accessToken) {
    return sessionCache[key];
  }
  return bootstrapStudentSession(key);
}

export function getProfessorSession(force = false) {
  requireEnv(['PERF_PROF_EMAIL', 'PERF_PROF_PASSWORD']);
  const key = 'professor';
  if (!force && sessionCache[key]?.cookies?.accessToken) {
    return sessionCache[key];
  }
  return login(__ENV.PERF_PROF_EMAIL, __ENV.PERF_PROF_PASSWORD, key);
}

export function refreshSession(session, cacheKey = 'session') {
  const response = postJson('/api/auth/refresh-token', undefined, {
    cookies: session.cookies,
    expectedStatus: 200,
    label: `POST /api/auth/refresh-token (${cacheKey})`,
    expectBusinessSuccess: true,
  });

  session.cookies.accessToken = getCookieValue(response, 'accessToken') || session.cookies.accessToken;
  session.cookies.refreshToken = getCookieValue(response, 'refreshToken') || session.cookies.refreshToken;
  sessionCache[cacheKey] = session;
  return session;
}

export function getSessionHeaders(session) {
  return {
    Cookie: cookieHeader(session.cookies),
  };
}

export function findCreatedExperienceId(body) {
  return (
    body?.data?.experience?.experience_id ||
    body?.data?.experience_id ||
    body?.data?.experienceId ||
    body?.data?.experience?.id ||
    null
  );
}

export function findUnreadNotification(body) {
  const items = Array.isArray(body?.data) ? body.data : [];
  return items.find((item) => item?.lu === false) || null;
}

export function findValidationByTitle(body, type, title) {
  const items = Array.isArray(body?.data)
    ? body.data
    : Array.isArray(body?.data?.validations)
      ? body.data.validations
      : [];

  return items.find((item) => item?.type === type && item?.titre === title) || null;
}

export function markFlow(result) {
  flowSuccess.add(Boolean(result));
}

export function withGroup(name, fn) {
  return group(name, fn);
}
