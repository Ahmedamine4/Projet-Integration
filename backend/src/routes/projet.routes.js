import express from 'express';
import { addProjet } from '../controllers/projet.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/addprojet', authMiddleware ,addProjet);

export default router;