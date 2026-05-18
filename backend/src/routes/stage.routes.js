import express from 'express';
import {
  addStage,
  getStages,
  editStage,
  getDemandesValidation,
  traiterValidation,
} from '../controllers/stage.controller.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.use(authMiddleware);

//etudiant
router.post('/add-stage', authorizeRoles(ROLES.ETUDIANT), upload.single('photo'), addStage);
router.get('/stages', authorizeRoles(ROLES.ETUDIANT), getStages);
router.put('/stages/:experienceId', authorizeRoles(ROLES.ETUDIANT), upload.single('photo'), editStage);

//prof
router.get('/validations', authorizeRoles(ROLES.PROFESSEUR), getDemandesValidation);
router.patch('/validations/:experienceId', authorizeRoles(ROLES.PROFESSEUR), traiterValidation);

export default router;