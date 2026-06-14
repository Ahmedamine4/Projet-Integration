import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '../..');

describe('notification.routes', () => {
  it('expose uniquement les routes montees dans le routeur', () => {
    const source = fs.readFileSync(
      path.join(backendRoot, 'src/routes/notification.routes.js'),
      'utf8'
    );

    expect(source).toContain('router.get("/", getMesNotifications);');
    expect(source).toContain('router.get("/non-lues", getMesNotificationsNonLues);');
    expect(source).toContain('router.patch("/:notificationId/lire", lireNotification);');
    expect(source).toContain('router.delete("/:notificationId", supprimerNotificationController);');
    expect(source).not.toContain('historique');
  });
});
