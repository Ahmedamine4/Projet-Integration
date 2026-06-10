import express from 'express';
import {
  addRecommandation,
  toggleVisibiliteRecommandation,
  getMesRecommandations,
  getRecommandationsPortfolio,
} from '../controllers/interaction.controller.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.post('/recommandations/:portfolioId', authMiddleware, authorizeRoles(ROLES.PROFESSIONNEL, ROLES.PROFESSEUR), addRecommandation);


router.patch('/recommandations/:interactionId/visibilite', authMiddleware, authorizeRoles(ROLES.ETUDIANT), toggleVisibiliteRecommandation);


router.get('/recommandations/me', authMiddleware, authorizeRoles(ROLES.ETUDIANT), getMesRecommandations);


router.get('/recommandations/portfolio/:etudiantId', getRecommandationsPortfolio);

export default router;