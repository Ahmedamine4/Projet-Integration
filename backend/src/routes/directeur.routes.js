import express from 'express';
import { addProfessor, getDashboard } from '../controllers/directeur.controller.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.DIRECTEUR));

router.get('/dashboard', getDashboard);
router.post('/professeurs', addProfessor);

export default router;
