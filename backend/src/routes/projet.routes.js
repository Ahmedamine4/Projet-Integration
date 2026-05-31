import express from 'express';
import { addProjet, getProjets, updateProjet, updateVisibiliteProjet } from '../controllers/projet.controller.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.ETUDIANT));

router.post('/add-projet', upload.single('img'), addProjet);
router.get('/projets', getProjets);
router.patch('/projets/:experienceId', upload.single('img'), updateProjet);
router.patch('/projets/:experienceId/visibilite', updateVisibiliteProjet);

export default router;