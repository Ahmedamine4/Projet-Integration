import express from 'express';
import { getAbout, updateAbout, getPortfolioEtudiantController } from '../controllers/portfolio.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:id/about', getAbout);

router.put('/:id/about', authMiddleware, updateAbout);
router.get('/portfolio/:etudiantId', authMiddleware, getPortfolioEtudiantController);

export default router;
