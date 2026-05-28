import express from 'express';
import {
  listDemandes,
  listStages,
  listProjets,
  getStageDetail,
  getProjetDetail,
  validerProjet,
  validerStage,
} from '../controllers/professeur.controller.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.PROFESSEUR));

router.get('/validations', listDemandes);
router.get('/validations/stages', listStages);
router.get('/validations/projets', listProjets);
router.get('/validations/stages/:experienceId', getStageDetail);
router.get('/validations/projets/:experienceId', getProjetDetail);
router.patch('/validations/projets/:experienceId', validerProjet);
router.patch('/validations/stages/:experienceId', validerStage);

export default router;