import express from 'express';
import { getSocialMediaController, updateSocialMediaController } from '../controllers/social_media.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(authMiddleware);


router.get('/:userId/social', getSocialMediaController);

router.put('/:userId/social', updateSocialMediaController);

export default router;