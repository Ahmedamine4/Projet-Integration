import express from 'express';
import { upload } from '../middlewares/upload.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadProfilePhotoController, getProfilePhotoController } from '../controllers/photo.controller.js';

const router = express.Router();

router.post('/:id/photo', authMiddleware, upload.single('photo'), uploadProfilePhotoController);
router.get('/:id/photo', getProfilePhotoController);

export default router;
