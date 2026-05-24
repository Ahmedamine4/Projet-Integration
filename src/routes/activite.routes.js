import express from 'express';
import {
  createActivite,
  getMesActivites,
  getActivitesPubliquesPortfolio,
  updateValidationActivite,
} from '../controllers/activite.controller.js';
<<<<<<< HEAD
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';
=======
import { authMiddleware } from '../middlewares/auth.middleware.js';
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

// Creation unique: personnelle ou academique selon typeActivite,
// avec image optionnelle envoyee dans le champ form-data "img".
router.post('/', authMiddleware, upload.single('img'), createActivite);

// Liste des activites du compte connecte.
router.get('/me', authMiddleware, getMesActivites);

// Validation ou refus par un administrateur.
<<<<<<< HEAD
router.patch(
  '/:id/validation',
  authMiddleware,
  authorizeRoles(ROLES.ADMIN),
  updateValidationActivite
);
=======
router.patch('/:id/validation', authMiddleware, updateValidationActivite);
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)

// Affichage public du portfolio:
// activites personnelles visibles + activites academiques validees.
router.get('/portfolio/:etudiantId', getActivitesPubliquesPortfolio);

export default router;
