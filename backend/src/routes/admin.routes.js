import express from 'express';
import {
  ajoutDirecteur,
  validerProfessionnel,
  refuserProfessionnel,
  bloquerUtilisateurController,
  debloquerUtilisateurController,
  listProfessionnelsEnAttente,
  listAdminInstitutions,
  createAdminInstitution,
  rechercherUtilisateursController,
  promouvoirUtilisateurProController,

} from '../controllers/admin.controllers.js';
import {
  authMiddleware,
  authorizeRoles,
  ROLES,
} from '../middlewares/auth.middleware.js';
import { getAllUsers } from '../controllers/auth.controller.js';

const router = express.Router();
router.use(authMiddleware, authorizeRoles(ROLES.ADMIN));
router.get('/institutions', listAdminInstitutions);
router.post('/institutions', createAdminInstitution);
router.post('/assigner-directeur', ajoutDirecteur);
router.get('/professionnels/en-attente', listProfessionnelsEnAttente);
router.get('/users', getAllUsers);
router.get('/users/search', rechercherUtilisateursController);
router.patch('/professionnels/:id/valider', validerProfessionnel);
router.patch('/professionnels/:id/refuser', refuserProfessionnel);
router.patch('/utilisateurs/:id/promote-pro', promouvoirUtilisateurProController);
router.patch('/utilisateurs/:id/bloquer', bloquerUtilisateurController);
router.patch('/utilisateurs/:id/debloquer', debloquerUtilisateurController);
export default router;
