import express from 'express';
import { getFeed, getFeedTechnologiesAndDomaines } from '../controllers/feed.controller.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/feed', authorizeRoles(ROLES.ETUDIANT), getFeed);
router.get('/feed/tags', authorizeRoles(ROLES.ETUDIANT), getFeedTechnologiesAndDomaines);

export default router;