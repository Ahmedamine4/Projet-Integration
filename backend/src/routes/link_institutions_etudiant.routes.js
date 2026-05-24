import express from 'express'
import * as middlewares from '../middlewares/auth.middleware.js';
import { LinkInstitutionsToEtudiantController } from '../controllers/link_institutions_etudiant.controller.js'

const router = express.Router();

router.use(middlewares.authMiddleware);

router.post('/select-institutions', middlewares.authorizeRoles(middlewares.ROLES.ETUDIANT) ,LinkInstitutionsToEtudiantController);
export default router;