import express from 'express';
import { getAbout, updateAbout } from '../controllers/portfolio.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:id/about', getAbout);

router.put('/:id/about', authMiddleware, updateAbout);

export default router;
