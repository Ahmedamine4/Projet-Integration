import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://localhost';

// ── Profils exportés ─────────────────────────────────────────────

export const options = {
  vus: 20,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export const loadOptions = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export const stressOptions = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

export const responseOptions = {
  vus: 1,
  iterations: 50,
  thresholds: {
    http_req_failed: ['rate<0.001'],
    http_req_duration: ['p(99)<300'],
  },
};

// ── Helpers ──────────────────────────────────────────────────────

export function getBaseUrl() {
  return BASE_URL;
}

export function jsonHeaders(tokenEnvName = 'STUDENT_TOKEN') {
  const token = __ENV[tokenEnvName];
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Cookie = `accessToken=${token}`;
  return headers;
}

export function assertStandardChecks(response, expectedStatus, name) {
  check(response, {
    [`${name} status ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${name} no 500`]: (r) => r.status < 500,
    [`${name} duration < 500ms`]: (r) => r.timings.duration < 500,
  });
}

export function get(path, expectedStatus, tokenEnvName) {
  const res = http.get(`${BASE_URL}${path}`, {
    headers: jsonHeaders(tokenEnvName),
  });
  assertStandardChecks(res, expectedStatus, `GET ${path}`);
  return res;
}

export function post(path, body, expectedStatus, tokenEnvName) {
  const res = http.post(`${BASE_URL}${path}`, JSON.stringify(body), {
    headers: jsonHeaders(tokenEnvName),
  });
  assertStandardChecks(res, expectedStatus, `POST ${path}`);
  return res;
}

export function patch(path, body, expectedStatus, tokenEnvName) {
  const res = http.patch(`${BASE_URL}${path}`, JSON.stringify(body), {
    headers: jsonHeaders(tokenEnvName),
  });
  assertStandardChecks(res, expectedStatus, `PATCH ${path}`);
  return res;
}

export function put(path, body, expectedStatus, tokenEnvName) {
  const res = http.put(`${BASE_URL}${path}`, JSON.stringify(body), {
    headers: jsonHeaders(tokenEnvName),
  });
  assertStandardChecks(res, expectedStatus, `PUT ${path}`);
  return res;
}