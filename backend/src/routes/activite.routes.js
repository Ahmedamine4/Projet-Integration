import express from 'express';
import {
  addActivite,
  getActivites,
  updateActivite,
  deleteActivite,
  updateVisibiliteActivite,
} from '../controllers/activite.controller.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.ETUDIANT, ROLES.PROFESSIONNEL));

router.post('/', upload.single('img'), addActivite);
router.patch('/:experienceId', upload.single('img'), updateActivite);
router.delete('/:experienceId', deleteActivite);

router.get('/me', getActivites);
router.patch('/:experienceId/visibilite', updateVisibiliteActivite);

export default router;