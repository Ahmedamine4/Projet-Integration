import express from 'express';
import { getDashboard, listMesDemandes } from '../controllers/etudiant.controller.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.ETUDIANT));

router.get('/dashboard', getDashboard);
router.get('/validations', listMesDemandes);

export default router;