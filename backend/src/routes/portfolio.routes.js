import express from 'express';
import { getAbout, updateAbout, getPortfolioEtudiantController, getExperienceByIdController } from '../controllers/portfolio.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:id/about', getAbout);

router.put('/:id/about', authMiddleware, updateAbout);
router.get('/portfolio/:etudiantId', authMiddleware, getPortfolioEtudiantController);
router.get('/portfolio/experience/:idexperience', authMiddleware, getExperienceByIdController);

export default router;
