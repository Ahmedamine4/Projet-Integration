import express from 'express';
import {
  createActivite,
  getMesActivites,
  getActivitesPubliquesPortfolio,
  updateValidationActivite,
} from '../controllers/activite.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Creation unique: personnelle ou academique selon typeActivite.
router.post('/', authMiddleware, createActivite);

// Liste des activites du compte connecte.
router.get('/me', authMiddleware, getMesActivites);

// Validation ou refus par un administrateur.
router.patch('/:id/validation', authMiddleware, updateValidationActivite);

// Affichage public du portfolio: uniquement les activites visibles et validees.
router.get('/portfolio/:etudiantId', getActivitesPubliquesPortfolio);

export default router;