import express from 'express';
import {
  addStage,
  getStages,
  updateStage,
  updateVisibiliteStage
} from '../controllers/stage.controller.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.ETUDIANT));

//etudiant
router.post('/add-stage', upload.single('photo'), addStage);
router.get('/stages', getStages);
router.patch('/stages/:experienceId', upload.single('photo'), updateStage);
router.patch('/stages/:experienceId/visibilite', updateVisibiliteStage);

export default router;