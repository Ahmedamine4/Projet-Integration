const DEFAULT_PROFILE = ((__ENV.K6_PROFILE || __ENV.PROFILE || 'smoke') + '').toLowerCase();

export const PROFILE = DEFAULT_PROFILE;
export const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:3000';

const PROFILE_SCENARIOS = {
  smoke: {
    executor: 'shared-iterations',
    vus: Number(__ENV.K6_VUS || 1),
    iterations: Number(__ENV.K6_ITERATIONS || 3),
    maxDuration: __ENV.K6_MAX_DURATION || '1m',
  },
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: __ENV.K6_STAGE_1_DURATION || '20s', target: Number(__ENV.K6_STAGE_1_TARGET || 3) },
      { duration: __ENV.K6_STAGE_2_DURATION || '40s', target: Number(__ENV.K6_STAGE_2_TARGET || 3) },
      { duration: __ENV.K6_STAGE_3_DURATION || '20s', target: Number(__ENV.K6_STAGE_3_TARGET || 0) },
    ],
      gracefulRampDown: '15s',
  },
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: __ENV.K6_STAGE_1_DURATION || '20s', target: Number(__ENV.K6_STAGE_1_TARGET || 5) },
      { duration: __ENV.K6_STAGE_2_DURATION || '40s', target: Number(__ENV.K6_STAGE_2_TARGET || 10) },
      { duration: __ENV.K6_STAGE_3_DURATION || '20s', target: Number(__ENV.K6_STAGE_3_TARGET || 0) },
    ],
    gracefulRampDown: '20s',
  },
  spike: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: __ENV.K6_STAGE_1_DURATION || '10s', target: Number(__ENV.K6_STAGE_1_TARGET || 3) },
      { duration: __ENV.K6_STAGE_2_DURATION || '10s', target: Number(__ENV.K6_STAGE_2_TARGET || 15) },
      { duration: __ENV.K6_STAGE_3_DURATION || '20s', target: Number(__ENV.K6_STAGE_3_TARGET || 15) },
      { duration: __ENV.K6_STAGE_4_DURATION || '10s', target: Number(__ENV.K6_STAGE_4_TARGET || 0) },
    ],
    gracefulRampDown: '15s',
  },
  endurance: {
    executor: 'constant-vus',
    vus: Number(__ENV.K6_VUS || 3),
    duration: __ENV.K6_DURATION || '5m',
    gracefulStop: '20s',
  },
  'read-heavy': {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: __ENV.K6_STAGE_1_DURATION || '2m', target: Number(__ENV.K6_STAGE_1_TARGET || 100) },
      { duration: __ENV.K6_STAGE_2_DURATION || '2m', target: Number(__ENV.K6_STAGE_2_TARGET || 500) },
      { duration: __ENV.K6_STAGE_3_DURATION || '2m', target: Number(__ENV.K6_STAGE_3_TARGET || 1000) },
      { duration: __ENV.K6_STAGE_4_DURATION || '2m', target: Number(__ENV.K6_STAGE_4_TARGET || 0) },
    ],
    gracefulRampDown: '30s',
  },
  'write-heavy': {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: __ENV.K6_STAGE_1_DURATION || '1m', target: Number(__ENV.K6_STAGE_1_TARGET || 10) },
      { duration: __ENV.K6_STAGE_2_DURATION || '1m', target: Number(__ENV.K6_STAGE_2_TARGET || 25) },
      { duration: __ENV.K6_STAGE_3_DURATION || '1m', target: Number(__ENV.K6_STAGE_3_TARGET || 50) },
      { duration: __ENV.K6_STAGE_4_DURATION || '1m', target: Number(__ENV.K6_STAGE_4_TARGET || 100) },
      { duration: __ENV.K6_STAGE_5_DURATION || '1m', target: Number(__ENV.K6_STAGE_5_TARGET || 0) },
    ],
    gracefulRampDown: '30s',
  },
};

const DEFAULT_LATENCY_TARGETS = {
  smoke: { p95: 800, p99: 1200, httpReqFailed: 0.01, checksRate: 0.99 },
  load: { p95: 1000, p99: 1600, httpReqFailed: 0.01, checksRate: 0.99 },
  stress: { p95: 1800, p99: 2600, httpReqFailed: 0.03, checksRate: 0.97 },
  spike: { p95: 2200, p99: 3200, httpReqFailed: 0.04, checksRate: 0.96 },
  endurance: { p95: 1200, p99: 1800, httpReqFailed: 0.01, checksRate: 0.99 },
  'read-heavy': { p95: 2000, p99: 3500, httpReqFailed: 0.02, checksRate: 0.98 },
  'write-heavy': { p95: 3000, p99: 5000, httpReqFailed: 0.05, checksRate: 0.95 },
};

export function createScenario(exec, overrides = {}) {
  return {
    ...PROFILE_SCENARIOS[PROFILE],
    exec,
    tags: {
      profile: PROFILE,
      ...(overrides.tags || {}),
    },
    ...overrides,
  };
}

export function buildThresholds(latencyTargets = {}, extraThresholds = {}) {
  const active = {
    ...DEFAULT_LATENCY_TARGETS[PROFILE],
    ...(latencyTargets[PROFILE] || {}),
  };

  return {
    http_req_failed: [`rate<${active.httpReqFailed}`],
    checks: [`rate>${active.checksRate}`],
    http_req_duration: [`p(95)<${active.p95}`, `p(99)<${active.p99}`],
    flow_success: ['rate>0.99'],
    ...extraThresholds,
  };
}

export function buildOptions({
  testName,
  exec = 'default',
  scenarios,
  latencyTargets = {},
  extraThresholds = {},
} = {}) {
  return {
    scenarios: scenarios || {
      main: createScenario(exec, {
        tags: {
          test_name: testName || exec,
        },
      }),
    },
    thresholds: buildThresholds(latencyTargets, extraThresholds),
    summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
    insecureSkipTLSVerify: (__ENV.K6_INSECURE_TLS || 'false') === 'true',
    userAgent: __ENV.K6_USER_AGENT || `k6-${testName || 'backend'}-${PROFILE}`,
  };
}
