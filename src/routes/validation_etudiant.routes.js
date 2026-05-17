import express from 'express';
import { listPendingController, validateStudentController } from '../controllers/validation_etudiant.controller.js';

const router = express.Router();

// GET /api/validation/pending/institution_1
router.get('/pending/:institutionId', listPendingController);

// PATCH /api/validation/decide/id1/institution_1
router.patch('/decide/:etudiantId/:institutionId', validateStudentController);

export default router;