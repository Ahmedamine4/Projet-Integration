import express from 'express';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';

import {
  githubLogin,
  githubCallback,
  getMyRepositories,
  getMyContributions,
  getUserContributions,
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

router.get(
  '/contributions',
  authMiddleware,
  authorizeRoles(ROLES.ETUDIANT),
  getMyContributions
);

router.get(
  '/contributions/:userId',
  authMiddleware,
  getUserContributions
);

router.post(
  '/sync',
  authMiddleware,
  authorizeRoles(ROLES.ETUDIANT),
  syncRepositories
);

export default router;
