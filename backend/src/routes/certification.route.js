//Done
import express from 'express';
import { authMiddleware, authorizeRoles } from '../middleware/auth.middleware.js';
import { ROLES } from '../middleware/auth.middleware.js';

import {
  validateAddCertification,
  addCertification,
  getMyCertifications,
} from '../controllers/certificationController.js';

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/me',
  authorizeRoles(ROLES.ETUDIANT),
  getMyCertifications
);

router.post(
  '/',
  authorizeRoles(ROLES.ETUDIANT),
  validateAddCertification,
  addCertification
);

router.get(
  '/:id',
  authorizeRoles(ROLES.ETUDIANT),
);

export default router;