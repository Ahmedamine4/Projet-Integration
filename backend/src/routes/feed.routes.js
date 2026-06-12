import express from 'express';
import {getFeedTechnologiesAndDomaines, getOffresFeed, getSuggestionsFeed, getExperiencesFeed} from '../controllers/feed.controller.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/feed/tags', getFeedTechnologiesAndDomaines);
router.get('/feed/offres', getOffresFeed);
router.get('/feed/suggestions', getSuggestionsFeed);
router.get('/feed/experiences', getExperiencesFeed);

export default router;