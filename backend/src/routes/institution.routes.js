import express from 'express';
import { getInstitution } from '../controllers/institution.controller.js';

const router = express.Router();

router.get('/', getInstitution);
export default router;