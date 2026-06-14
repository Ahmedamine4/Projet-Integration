import { sleep } from 'k6';
import { get } from './lib/common.js';

export const options = {
    vus: 5,
    duration: '30s',
    thresholds: {
        http_req_failed: ['rate<0.05'],
        http_req_duration: ['p(95)<3000'],
    },
};

export default function () {
    get('/api/github/repositories', 200, 'STUDENT_TOKEN');
    sleep(2);
}
