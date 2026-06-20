import express from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  LinkInstitutionsToEtudiantController,
  updateValidEtudiantDescriptionController,
} from '../controllers/link_institutions_etudiant.controller.js'

const router = express.Router();

router.post('/', LinkInstitutionsToEtudiantController);
router.patch('/description', authMiddleware, updateValidEtudiantDescriptionController);
export default router;