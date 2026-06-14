import { sleep } from 'k6';
import { get, post, options } from './lib/common.js';

export { options };

export default function () {
  get('/api/certifications/me', 200, 'STUDENT_TOKEN');

  post(
    '/api/certifications',
    {
      titre: `k6-certification-${__VU}-${__ITER}-${Date.now()}`,
      date: '2026-06-01',
      description: 'Charge k6 certification',
      credentialUrl: 'https://example.com/cert',
      code: `K6-${__VU}-${__ITER}-${Date.now()}`,
      competences: '[]',
    },
    201,
    'STUDENT_TOKEN'
  );

  sleep(1);
}