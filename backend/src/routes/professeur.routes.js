import express from 'express';
import {
  listDemandes,
  getLettre,
  traiterDemandeLettre,
  getStageDetail,
  getProjetDetail,
  validerProjet,
  validerStage,
} from '../controllers/professeur.controller.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';
import { uploadPdf } from '../middlewares/upload.pdf.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.PROFESSEUR));

router.get('/validations', listDemandes);

router.get('/validations/recommandations/:etudiantId', getLettre);
router.patch('/validations/recommandations/:etudiantId', uploadPdf.single('fichier'), traiterDemandeLettre);

router.get('/validations/stages/:experienceId', getStageDetail);
router.patch('/validations/stages/:experienceId', validerStage);

router.get('/validations/projets/:experienceId', getProjetDetail);
router.patch('/validations/projets/:experienceId', validerProjet);

export default router;