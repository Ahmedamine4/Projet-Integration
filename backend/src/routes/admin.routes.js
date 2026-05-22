import express from 'express';
import {
  ajoutDirecteur,
  validerProfessionnel,
  refuserProfessionnel,
  bloquerUtilisateurController,
  debloquerUtilisateurController,
  listProfessionnelsEnAttente,
} from '../controllers/admin.controllers.js';
import {
  authMiddleware,
  authorizeRoles,
} from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(authMiddleware, authorizeRoles(ROLES.ADMIN));
router.post('/assigner-directeur', ajoutDirecteur);
router.get('/professionnels/en-attente', listProfessionnelsEnAttente);
router.patch('/professionnels/:id/valider', validerProfessionnel);
router.patch('/professionnels/:id/refuser', refuserProfessionnel);
router.patch('/utilisateurs/:id/bloquer', bloquerUtilisateurController);
router.patch('/utilisateurs/:id/debloquer', debloquerUtilisateurController);
export default router;