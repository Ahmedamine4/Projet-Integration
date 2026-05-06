import express from 'express'
import { LinkInstitutionsToEtudiantController } from '../controllers/link_institutions_etudiant.controller.js'

const router = express.Router();

router.post('/', LinkInstitutionsToEtudiantController);
export default router;