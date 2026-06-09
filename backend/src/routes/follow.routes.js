import express from 'express';
import { follow, unfollow, listFollowers, listFollowing } from '../controllers/follow.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', follow);
router.delete('/:targetId', unfollow);
router.get('/:userId/followers', listFollowers);
router.get('/:userId/following', listFollowing);

export default router;