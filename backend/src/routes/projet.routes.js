import express from 'express';
import { addProjet } from '../controllers/projet.controller.js';

const router = express.Router();

router.post('/addprojet' ,addProjet);

export default router;