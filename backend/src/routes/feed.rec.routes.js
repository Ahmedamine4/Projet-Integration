import express from 'express';
import {
  getProfessionnelFeedTagsController,
  getProfessionnelFeedStudentsTopController,
  getProfessionnelFeedSuggestionsController,
  getProfessionnelFeedExperiencesController,
} from '../controllers/feed.rec.controller.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.PROFESSIONNEL));


router.get('/feed/tags', getProfessionnelFeedTagsController);

router.get('/feed/students-top', getProfessionnelFeedStudentsTopController);


router.get('/feed/suggestions', getProfessionnelFeedSuggestionsController);


router.get('/feed/experiences', getProfessionnelFeedExperiencesController);

export default router;