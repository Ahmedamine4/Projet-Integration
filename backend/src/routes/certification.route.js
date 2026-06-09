import express from 'express';
import {
  addCertification,
  getMesCertifications,
  updateCertification,
  deleteCertification,
  updateVisibiliteCertification,
} from '../controllers/certification.controller.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.ETUDIANT));

router.post('/', upload.single('photo'), addCertification);
router.get('/me', getMesCertifications);
router.patch('/:experienceId', upload.single('photo'), updateCertification);
router.delete('/:experienceId', deleteCertification);
router.patch('/:experienceId/visibilite', updateVisibiliteCertification);

export default router;