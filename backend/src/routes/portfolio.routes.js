import express from 'express';
import { getAbout, updateAbout, getPortfolioEtudiantController, getPortfolioScoreHistoryController, getExperienceByIdController } from '../controllers/portfolio.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:id/about', getAbout);

router.put('/:id/about', authMiddleware, updateAbout);
router.get('/portfolio/experience/:idexperience', authMiddleware, getExperienceByIdController);
router.get('/portfolio/:etudiantId/score-history', authMiddleware, getPortfolioScoreHistoryController);
router.get('/portfolio/:etudiantId', authMiddleware, getPortfolioEtudiantController);

export default router;
