// Done
import express from 'express';
import { authMiddleware, authorizeRoles } from '../middleware/auth.middleware.js';
import { ROLES } from '../middleware/auth.middleware.js';

import {
  githubLogin,
  githubCallback,
  getMyRepositories,
  syncRepositories,
} from '../controllers/githubController.js';

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/login',
  authorizeRoles(ROLES.ETUDIANT),
  githubLogin
);

router.get('/callback', githubCallback);

router.get(
  '/repositories',
  authorizeRoles(ROLES.ETUDIANT),
  getMyRepositories
);

router.post(
  '/sync',
  authorizeRoles(ROLES.ETUDIANT),
  syncRepositories
);

export default router;