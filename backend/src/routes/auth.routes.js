import express from 'express';
import {
  getAllUsers,
  getProfile,
  googleAuth,
  login,
  register,
  refreshAccessToken,
} from '../controllers/auth.controller.js';
import {
  authMiddleware,
  authorizeRoles,
  ROLES
} from '../middlewares/auth.middleware.js';

const router = express.Router();

// Routes publiques.
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/refresh-token', refreshAccessToken);

// Routes protegees par le middleware hybride.
router.get('/me', authMiddleware, getProfile);
router.get('/profile', authMiddleware, getProfile);
router.get(
  '/users',
  authMiddleware,
  authorizeRoles(ROLES.ADMIN),
  getAllUsers);

export default router;