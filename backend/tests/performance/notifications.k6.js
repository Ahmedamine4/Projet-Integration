import { sleep } from 'k6';
import { get, patch, options } from './lib/common.js';

export { options };

export default function () {
  // Récupérer les notifications
  const res = get('/api/notifications', 200, 'STUDENT_TOKEN');

  // Récupérer l'ID de la première notification non lue dynamiquement
  // évite la dépendance à __ENV.NOTIFICATION_ID qui serait statique
  const payload = res.json();
  const body = Array.isArray(payload) ? payload : payload?.data;
  if (Array.isArray(body) && body.length > 0) {
    const notifNonLue = body.find((n) => n.lu === false);
    if (notifNonLue) {
      patch(
        `/api/notifications/${notifNonLue.notification_id}/lire`,
        {},
        200,
        'STUDENT_TOKEN'
      );
    }
  }

  // Historique d'activité
  get('/api/notifications/historique', 200, 'STUDENT_TOKEN');

  sleep(1);
}