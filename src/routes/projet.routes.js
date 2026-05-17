import express from 'express';
import { addProjet } from '../controllers/projet.controller.js';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post('/add-projet', authMiddleware, authorizeRoles('professionnel','etudiant'),upload.single('img'), addProjet);

export default router;