import express from 'express';
import { addStage, getStages } from '../controllers/stage.controller.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.ETUDIANT));

router.post('/', upload.single('photo'), addStage);
router.get('/', getStages);

export default router;