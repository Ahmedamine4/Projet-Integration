// Done 


import { body } from 'express-validator';
import * as certificationService from '../services/certification.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const validateAddCertification = [
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
    .withMessage('La date doit être au format ISO valide'),

  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('La date d\'expiration doit être au format ISO valide'),

  body('code')
    .optional()
    .trim(),

  body('description')
    .optional()
    .trim(),
];

export const addCertification = asyncHandler(async (req, res) => {
  const { 
    title, 
    issuingOrganization, 
    issueDate, 
    expiryDate, 
    credentialUrl, 
    description, 
    code 
  } = req.body;

// recuperation depuis token
  const etudiantId = req.user.utilisateur_id ;

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

export const getMyCertifications = asyncHandler(async (req, res) => {
  const etudiantId = req.user.utilisateur_id ;

  const certifications = await certificationService.getCertificationsByEtudiantId(etudiantId);

  res.json({
    success: true,
    count: certifications.length,
    data: certifications
  });
});