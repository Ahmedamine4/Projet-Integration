import express from 'express';
import {predictTechnologiesAndDomains} from '../controllers/ai.controller.js';
import {authMiddleware} from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/predict', authMiddleware, predictTechnologiesAndDomains);

export default router;