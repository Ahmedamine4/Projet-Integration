import express from 'express';
import { addActivite, getMesActivites, updateActivite, updateVisibiliteActivite } from '../controllers/activite.controller.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.ETUDIANT));

router.post('/', upload.single('img'), addActivite);
router.get('/me', getMesActivites);
router.patch('/:experienceId', upload.single('img'), updateActivite);
router.patch('/:experienceId/visibilite', updateVisibiliteActivite);

export default router;
