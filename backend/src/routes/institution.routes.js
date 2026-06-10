import express from 'express';
import {
  getInstitution,
  getAcademicInstitutionsController,
  getNonAcademicInstitutionsController,
  getInstitutionByEtudiant,
  getProfesseursParInstitution,
} from '../controllers/institution.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getInstitution);
router.get('/academiques', getAcademicInstitutionsController);
router.get('/autres', getNonAcademicInstitutionsController);
router.get('/me', authMiddleware, getInstitutionByEtudiant);
router.get('/:institutionId/professeurs', getProfesseursParInstitution);

export default router;