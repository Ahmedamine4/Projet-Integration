import { sleep } from 'k6';
import { get, post, options } from './lib/common.js';

export { options };

export default function () {
  // Lecture
  get('/api/activites/me', 200, 'STUDENT_TOKEN');

  // Création — titre unique par VU et itération pour éviter les doublons
  post(
    '/api/activites',
    {
      titre: `k6-activite-${__VU}-${__ITER}-${Date.now()}`,
      date_experience: '2026-06-01',
      description: 'Charge k6 activite',
      typeActivite: 'competition',
      lieu: 'Campus',
      competences: '[]',
    },
    201,
    'STUDENT_TOKEN'
  );

  sleep(1);
}