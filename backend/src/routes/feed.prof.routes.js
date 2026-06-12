import express from 'express';
import {
  getProfFeedTagsController,
  getProfFeedStudentsTopController,
  getProfFeedSuggestionsController,
  getProfFeedExperiencesController,
} from '../controllers/feed.prof.controller.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.use(authMiddleware);
router.use(authorizeRoles(ROLES.PROFESSEUR));


router.get('/feed/students-top', getProfFeedStudentsTopController);

router.get('/feed/suggestions', getProfFeedSuggestionsController);


router.get('/feed/experiences', getProfFeedExperiencesController);

export default router;