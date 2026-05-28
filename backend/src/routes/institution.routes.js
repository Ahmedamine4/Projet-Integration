import express from 'express';
import { getInstitution, getInstitutionByEtudiant} from '../controllers/institution.controller.js';

const router = express.Router();

router.get('/', getInstitution);
router.get('/me', getInstitutionByEtudiant);

export default router;
