import express from 'express';
import {
  addRecommandation,
  toggleVisibiliteRecommandation,
  getMesRecommandations,
  getRecommandationsPortfolio,
} from '../controllers/interaction.controller.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(authMiddleware);


router.post('/recommandations/:portfolioId', authorizeRoles(ROLES.PROFESSEUR, ROLES.PROFESSIONNEL), addRecommandation);


router.patch('/recommandations/:interactionId/visibilite', authorizeRoles(ROLES.ETUDIANT), toggleVisibiliteRecommandation);


router.get('/recommandations/me', getMesRecommandations);


router.get('/recommandations/portfolio/:etudiantId', getRecommandationsPortfolio);

export default router;