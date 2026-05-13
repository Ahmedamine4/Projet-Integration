//Done

import { body } from 'express-validator';
import * as certificationService from '../services/certification.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const addCertification = asyncHandler(async (req, res) => {
  const { 
    title, 
    issueDate, 
    credentialUrl, 
    description, 
    code 
  } = req.body;

  const userId =  req.user.utilisateur_id ;

  const result = await certificationService.createCertification({
    title,
    issuingOrganization,
    issueDate,
    credentialUrl,
    description,
    code
  }, userId);

  res.status(201).json({
    success: true,
    message: "Certification ajoutée avec succès",
    data: result
  });
});

export const getMyCertifications = asyncHandler(async (req, res) => {
  const userId = req.user.etudiant_utilisateur_id || req.user.utilisateur_id || req.user.id;

  const certifications = await certificationService.getMyCertifications(userId);

  res.json({
    success: true,
    count: certifications.length,
    data: certifications
  });
});