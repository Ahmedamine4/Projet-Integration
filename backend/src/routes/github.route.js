import express from 'express';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';

import {
  githubLogin,
  githubCallback,
  getMyRepositories,
  syncRepositories,
} from '../controllers/github.controller.js';

const router = express.Router();

router.get(
  '/login',
  authMiddleware,
  authorizeRoles(ROLES.ETUDIANT),
  githubLogin
);

router.get('/callback', githubCallback);

router.get(
  '/repositories',
  authMiddleware,
  authorizeRoles(ROLES.ETUDIANT),
  getMyRepositories
);

router.post(
  '/sync',
  authMiddleware,
  authorizeRoles(ROLES.ETUDIANT),
  syncRepositories
);

export default router;