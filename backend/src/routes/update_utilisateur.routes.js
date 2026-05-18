import express from 'express';
import { updatePersonalInformationsController } from '../controllers/update_utilisateur.controller.js';

const router = express.Router();

router.patch('/update-profile/:userId', updatePersonalInformationsController);

export default router;