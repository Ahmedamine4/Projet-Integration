//done
import express from 'express';
import { authMiddleware, authorizeRoles } from '../middleware/auth.middleware.js';
import { ROLES } from '../middleware/auth.middleware.js';
import {
  addCertification,
  getMyCertifications,
} from '../controllers/certification.controller.js';

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/',
  authorizeRoles(ROLES.ETUDIANT),
  validateAddCertification,
  addCertification
);

router.get(
  '/me',
  authorizeRoles(ROLES.ETUDIANT),
  getMyCertifications
);

export default router;