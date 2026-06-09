import express from 'express'
import { LinkInstitutionsToEtudiantController } from '../controllers/link_institutions_etudiant.controller.js'
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.ETUDIANT));
router.post('/', LinkInstitutionsToEtudiantController);
export default router;
