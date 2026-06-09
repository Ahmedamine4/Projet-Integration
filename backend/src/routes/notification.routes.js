import express from 'express';
import {
    getHistorique,
    getMesNotifications,
<<<<<<< Updated upstream
=======
    getNotificationsByUserId,
>>>>>>> Stashed changes
    lireNotification,
} from '../controllers/notification.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getMesNotifications);
<<<<<<< Updated upstream
=======
router.get('/user/:userId', getNotificationsByUserId);
>>>>>>> Stashed changes
router.get('/historique', getHistorique);
router.patch('/:notificationId/lire', lireNotification);

export default router;
