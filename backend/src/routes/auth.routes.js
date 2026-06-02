import express from 'express';
import {
  getAllUsers,
  getProfile,
  googleAuth,
  login,
  register,
  refreshAccessToken,
  logout
} from '../controllers/auth.controller.js';
import {
  authMiddleware,
  authorizeRoles,
  ROLES
} from '../middlewares/auth.middleware.js';
import { getMesSessions, getAdminSessions } from '../controllers/session.controller.js';

const router = express.Router();

// Routes publiques.
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', authMiddleware, logout);

router.get('/me/sessions', authMiddleware, getMesSessions);
router.get('/admin/sessions', authMiddleware, authorizeRoles(ROLES.ADMIN), getAdminSessions);

// Routes protegees par le middleware hybride.
router.get('/me', authMiddleware, getProfile);
router.get('/profile', authMiddleware, getProfile);
router.get('/users', authMiddleware, authorizeRoles(ROLES.ADMIN), getAllUsers);

export default router;