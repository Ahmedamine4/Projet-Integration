import { linkEtudiantToInstitutionController } from '../controllers/link_etudiant_institutions.controller.js';
import express from 'express';

const router = express.Router();

router.post('/', linkEtudiantToInstitutionController);
export default router;