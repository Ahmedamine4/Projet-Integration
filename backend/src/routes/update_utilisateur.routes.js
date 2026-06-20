import express from 'express';
import { updatePersonalInformationsController,
    requestProfessionnelStatusController,
    deleteAccountController
} from '../controllers/update_utilisateur.controller.js';
import { authMiddleware, authorizeRoles, ROLES } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.patch('/update-profile/:userId', updatePersonalInformationsController);
router.post(
    '/request-professionnel', 
    authMiddleware, 
    authorizeRoles(ROLES.ETUDIANT), 
    requestProfessionnelStatusController
);

router.delete('/delete-account', authMiddleware, deleteAccountController);

export default router;