import express from 'express';
import { getMesNotifications, lireNotification } from '../controllers/notification.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getMesNotifications);
router.patch('/:notificationId/lire', lireNotification);

export default router;