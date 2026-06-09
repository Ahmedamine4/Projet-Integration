import express from 'express';
import { listPendingController, validateStudentController } from '../controllers/validation_etudiant.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/pending/:institutionId', listPendingController);
router.patch('/decide/:etudiantId/:institutionId', validateStudentController);

export default router;
