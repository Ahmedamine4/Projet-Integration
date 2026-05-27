import express from 'express';
import { demanderRecommandation, getMesRecommandations } from '../controllers/lettre_recommandation.controller.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.ETUDIANT));

router.post('/', demanderRecommandation);
router.get('/me', getMesRecommandations);

export default router;