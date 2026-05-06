const { body } = require('express-validator');
const certificationService = require('../services/certificationService');
const asyncHandler = require('../utils/asyncHandler');
const prisma = require('../config/prisma');

// validation (c'est ce que je faisais dans middleware)
const validateAddCertification = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Le titre doit contenir entre 3 et 150 caractères'),

  body('issuingOrganization')
    .trim()
    .notEmpty()
    .withMessage("L'organisme émetteur est requis"),

  body('credentialUrl')
    .optional()
    .isURL()
    .withMessage("L'URL du certificat doit être valide"),

  body('issueDate')
    .optional()
    .isISO8601()
    .withMessage('La date doit être au format valide'),

  body('code')
    .optional()
    .trim(),
];


// add cerif
exports.addCertification = asyncHandler(async (req, res) => {
  const { 
    title, 
    issuingOrganization, 
    issueDate, 
    expiryDate, 
    credentialUrl, 
    description, 
    code 
  } = req.body;

  const etudiantId = req.user.etudiant_utilisateur_id || req.user.id;

  const certification = await certificationService.createCertification({
    etudiantId,
    title,
    issuingOrganization,
    issueDate,
    expiryDate,
    credentialUrl,
    description,
    code
  });

  res.status(201).json({
    success: true,
    message: "Certification ajoutée avec succès",
    data: certification
  });
});

// get certif
exports.getMyCertifications = asyncHandler(async (req, res) => {
  const etudiantId = req.user.etudiant_utilisateur_id || req.user.id;

  const certifications = await prisma.certification.findMany({
    where: {
      experience: {
        utilisateur_id: etudiantId
      }
    },
    include: {
      experience: true,
      validation: true
    },
    orderBy: {
      experience: { date_experience: 'desc' }
    }
  });

  res.json({ 
    success: true, 
    count: certifications.length,
    data: certifications 
  });
});

module.exports = {
  validateAddCertification,
  addCertification,
  getMyCertifications
};