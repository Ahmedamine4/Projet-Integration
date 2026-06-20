import express from 'express';
import { 
  getStats, 
  getMembers, 
  getRequests, 
  addProfessor, 
  traiterInscription, 
  traiterActivite 
} from '../controllers/directeur.controller.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.DIRECTEUR));

router.get('/dashboard/stats', getStats);
router.get('/membres', getMembers);
router.get('/demandes', getRequests);

// Routes d'écriture (POST / PUT)
router.post('/professeurs', addProfessor);
router.put('/demandes/inscription', traiterInscription);
router.put('/demandes/activite', traiterActivite);

export default router;