const PROFILE = String(__ENV.K6_PROFILE || __ENV.PROFILE || 'smoke').toLowerCase();

export { PROFILE };

export const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:3000';

const PROFILE_SCENARIOS = {
  smoke: {
    executor: 'ramping-vus',
    startVUs: 1,
    stages: [
      { duration: __ENV.K6_STAGE_1_DURATION || '10s', target: Number(__ENV.K6_STAGE_1_TARGET || 1) },
      { duration: __ENV.K6_STAGE_2_DURATION || '15s', target: Number(__ENV.K6_STAGE_2_TARGET || 2) },
      { duration: __ENV.K6_STAGE_3_DURATION || '15s', target: Number(__ENV.K6_STAGE_3_TARGET || 3) },
      { duration: __ENV.K6_STAGE_4_DURATION || '10s', target: Number(__ENV.K6_STAGE_4_TARGET || 0) },
    ],
    gracefulRampDown: '10s',
  },
  load: {
    executor: 'ramping-vus',
    startVUs: 1,
    stages: [
      { duration: __ENV.K6_STAGE_1_DURATION || '20s', target: Number(__ENV.K6_STAGE_1_TARGET || 3) },
      { duration: __ENV.K6_STAGE_2_DURATION || '20s', target: Number(__ENV.K6_STAGE_2_TARGET || 6) },
      { duration: __ENV.K6_STAGE_3_DURATION || '20s', target: Number(__ENV.K6_STAGE_3_TARGET || 10) },
      { duration: __ENV.K6_STAGE_4_DURATION || '20s', target: Number(__ENV.K6_STAGE_4_TARGET || 10) },
      { duration: __ENV.K6_STAGE_5_DURATION || '20s', target: Number(__ENV.K6_STAGE_5_TARGET || 0) },
    ],
    gracefulRampDown: '20s',
  },
  stress: {
    executor: 'ramping-vus',
    startVUs: 1,
    stages: [
      { duration: __ENV.K6_STAGE_1_DURATION || '20s', target: Number(__ENV.K6_STAGE_1_TARGET || 5) },
      { duration: __ENV.K6_STAGE_2_DURATION || '20s', target: Number(__ENV.K6_STAGE_2_TARGET || 10) },
      { duration: __ENV.K6_STAGE_3_DURATION || '20s', target: Number(__ENV.K6_STAGE_3_TARGET || 18) },
      { duration: __ENV.K6_STAGE_4_DURATION || '20s', target: Number(__ENV.K6_STAGE_4_TARGET || 25) },
      { duration: __ENV.K6_STAGE_5_DURATION || '20s', target: Number(__ENV.K6_STAGE_5_TARGET || 25) },
      { duration: __ENV.K6_STAGE_6_DURATION || '20s', target: Number(__ENV.K6_STAGE_6_TARGET || 0) },
    ],
    gracefulRampDown: '25s',
  },
  spike: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: __ENV.K6_STAGE_1_DURATION || '10s', target: Number(__ENV.K6_STAGE_1_TARGET || 3) },
      { duration: __ENV.K6_STAGE_2_DURATION || '10s', target: Number(__ENV.K6_STAGE_2_TARGET || 8) },
      { duration: __ENV.K6_STAGE_3_DURATION || '10s', target: Number(__ENV.K6_STAGE_3_TARGET || 20) },
      { duration: __ENV.K6_STAGE_4_DURATION || '10s', target: Number(__ENV.K6_STAGE_4_TARGET || 35) },
      { duration: __ENV.K6_STAGE_5_DURATION || '20s', target: Number(__ENV.K6_STAGE_5_TARGET || 35) },
      { duration: __ENV.K6_STAGE_6_DURATION || '15s', target: Number(__ENV.K6_STAGE_6_TARGET || 0) },
    ],
    gracefulRampDown: '15s',
  },
  endurance: {
    executor: 'ramping-vus',
    startVUs: 1,
    stages: [
      { duration: __ENV.K6_STAGE_1_DURATION || '1m', target: Number(__ENV.K6_STAGE_1_TARGET || 2) },
      { duration: __ENV.K6_STAGE_2_DURATION || '1m', target: Number(__ENV.K6_STAGE_2_TARGET || 4) },
      { duration: __ENV.K6_STAGE_3_DURATION || '6m', target: Number(__ENV.K6_STAGE_3_TARGET || 5) },
      { duration: __ENV.K6_STAGE_4_DURATION || '1m', target: Number(__ENV.K6_STAGE_4_TARGET || 3) },
      { duration: __ENV.K6_STAGE_5_DURATION || '1m', target: Number(__ENV.K6_STAGE_5_TARGET || 0) },
    ],
    gracefulStop: '30s',
    gracefulRampDown: '30s',
  },
};

const DEFAULT_TARGETS = {
  smoke: { p95: 800, p99: 1200, httpReqFailed: 0.01, checksRate: 0.99, flowSuccess: 0.99 },
  load: { p95: 1200, p99: 1800, httpReqFailed: 0.01, checksRate: 0.99, flowSuccess: 0.98 },
  stress: { p95: 2000, p99: 3000, httpReqFailed: 0.03, checksRate: 0.97, flowSuccess: 0.95 },
  spike: { p95: 2500, p99: 3500, httpReqFailed: 0.05, checksRate: 0.95, flowSuccess: 0.93 },
  endurance: { p95: 1500, p99: 2200, httpReqFailed: 0.02, checksRate: 0.98, flowSuccess: 0.97 },
};

export function createScenario(exec, extra = {}) {
  return {
    ...PROFILE_SCENARIOS[PROFILE],
    exec,
    tags: {
      profile: PROFILE,
      ...(extra.tags || {}),
    },
    ...extra,
  };
}

export function buildThresholds(overrides = {}, extraThresholds = {}) {
  const active = {
    ...DEFAULT_TARGETS[PROFILE],
    ...(overrides[PROFILE] || {}),
  };

  return {
    http_req_failed: [`rate<${active.httpReqFailed}`],
    checks: [`rate>${active.checksRate}`],
    http_req_duration: [`p(95)<${active.p95}`, `p(99)<${active.p99}`],
    flow_success: [`rate>${active.flowSuccess}`],
    ...extraThresholds,
  };
}

export function buildOptions({
  testName,
  exec = 'default',
  scenarios,
  thresholdOverrides = {},
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
    thresholds: buildThresholds(thresholdOverrides, extraThresholds),
    summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
    userAgent: __ENV.K6_USER_AGENT || `k6-backend-${testName || exec}-${PROFILE}`,
    insecureSkipTLSVerify: String(__ENV.K6_INSECURE_TLS || 'false') === 'true',
  };
}
