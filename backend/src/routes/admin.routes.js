import express from 'express';
import {
  ajoutDirecteur,
  validerProfessionnel,
  refuserProfessionnel,
  bloquerUtilisateurController,
  debloquerUtilisateurController,
  listProfessionnelsEnAttente,
  ajouterAdmin,
} from '../controllers/admin.controllers.js';
import {
  authMiddleware,
  authorizeRoles,
  ROLES,
} from '../middlewares/auth.middleware.js';
import { getAllUsers } from '../controllers/auth.controller.js';

const router = express.Router();
router.use(authMiddleware, authorizeRoles(ROLES.ADMIN));
router.post('/assigner-directeur', ajoutDirecteur);
router.post('/admins', ajouterAdmin);
router.get('/professionnels/en-attente', listProfessionnelsEnAttente);
router.get('/users',getAllUsers);
router.patch('/professionnels/:id/valider', validerProfessionnel);
router.patch('/professionnels/:id/refuser', refuserProfessionnel);
router.patch('/utilisateurs/:id/bloquer', bloquerUtilisateurController);
router.patch('/utilisateurs/:id/debloquer', debloquerUtilisateurController);
export default router;