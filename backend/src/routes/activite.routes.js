import express from 'express';
import {
  addActivite,
  createActiviteAcademique,
  createActivitePersonnelle,
  getMesActivites,
  getActivitesPubliquesPortfolio,
  soumettreActiviteValidation,
  updateValidationActivite,
} from '../controllers/activite.controller.js';
import {
  authMiddleware,
  authorizeRoles,
  ROLES,
} from '../middlewares/auth.middleware.js';

const router = express.Router();

// Route principale d'ajout, calquee sur le style du module projet.
router.post(
  '/add-activite',
  authMiddleware,
  authorizeRoles(ROLES.ETUDIANT, ROLES.PROFESSIONNEL),
  addActivite
);

// Ajout d'une activite personnelle par un etudiant authentifie.
router.post(
  '/personnelle',
  authMiddleware,
  authorizeRoles(ROLES.ETUDIANT, ROLES.PROFESSIONNEL),
  createActivitePersonnelle
);

// Ajout d'une activite academique avec creation de la demande de validation.
router.post(
  '/academique',
  authMiddleware,
  authorizeRoles(ROLES.ETUDIANT),
  createActiviteAcademique
);

// Consultation des activites de l'etudiant connecte.
router.get(
  '/me',
  authMiddleware,
  authorizeRoles(ROLES.ETUDIANT, ROLES.PROFESSIONNEL),
  getMesActivites
);

// Soumission a validation d'une activite existante.
router.post(
  '/:id/soumettre',
  authMiddleware,
  authorizeRoles(ROLES.ETUDIANT),
  soumettreActiviteValidation
);

// Validation ou refus d'une activite par un administrateur.
router.patch(
  '/:id/validation',
  authMiddleware,
  authorizeRoles(ROLES.ADMIN),
  updateValidationActivite
);

// Affichage portfolio: seulement les activites publiques et validees.
router.get(
  '/portfolio/:etudiantId',
  getActivitesPubliquesPortfolio
);

export default router;
