import express from 'express';
import * as UpdateUserController from '../controllers/update_utilisateur.controller.js';
import * as Middlewares from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(Middlewares.authMiddleware);

router.patch('/update-profile', UpdateUserController.updatePersonalInformationsController);

router.post('/logout-all', UpdateUserController.LogoutFromAllDevicesController);

router.delete('/delete-account', UpdateUserController.deleteaccountController);

export default router;