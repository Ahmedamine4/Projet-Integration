// Done 


import { body } from 'express-validator';
import * as certificationService from '../services/certification.service.js';
import asyncHandler from '../utils/asyncHandler.js';
// apres des discussions avec le developpeur backend Yahya, il m'a proposé d'enlever la fonction "validateaddcertif" 
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