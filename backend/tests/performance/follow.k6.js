import { sleep } from 'k6';
import { get, post, options } from './lib/common.js';

export { options };

const STUDENT_ID = __ENV.STUDENT_ID || __ENV.USER_ID;
const TARGET_USER_ID = __ENV.TARGET_USER_ID;

export default function () {
    if (!STUDENT_ID) {
        throw new Error('Variable obligatoire manquante: STUDENT_ID ou USER_ID');
    }

    get(`/api/follow/${STUDENT_ID}/following`, 200, 'STUDENT_TOKEN');

    if (TARGET_USER_ID) {
        post('/api/follow', { targetId: TARGET_USER_ID }, 201, 'STUDENT_TOKEN');
    }

    sleep(1);
}
