// routes/certificationRoutes.js
const express = require('express');
const router = express.Router();

// Middlewares
const { protect } = require('../middleware/authMiddleware');           // Ton middleware d'auth JWT
const { validateAddCertification } = require('../middleware/certificationMiddleware');

// Controller
const certificationController = require('../controllers/certificationController');


router.get(
  '/me', 
  protect, 
  certificationController.getMyCertifications
);

router.get(
  '/:id', 
  protect, 
  certificationController.getCertificationById
);

module.exports = router;