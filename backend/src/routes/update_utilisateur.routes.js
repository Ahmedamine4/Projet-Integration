import express from 'express';
import { updatePersonalInformationsController } from '../controllers/update_utilisateur.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.patch('/update-profile/:userId', updatePersonalInformationsController);

export default router;
