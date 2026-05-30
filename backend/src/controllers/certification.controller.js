//Done

import { body } from 'express-validator';
import * as certificationService from '../services/certification.service.js';

export const addCertification = async (req, res) => {
  try {
    const { 
      title, 
      issueDate, 
      credentialUrl, 
      description, 
      code 
    } = req.body;

    const userId = req.user.utilisateur_id;
    if (!title || !issueDate || !credentialUrl || !description || !code)
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });

    const result = await certificationService.createCertification(req.body, userId);

    res.status(201).json({
      success: true,
      message: "Certification ajoutée avec succès",
      data: result
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Erreur lors de l\'ajout de la certification'
    });
  }
};

export const getMyCertifications = async (req, res) => {
  try {
    const userId = req.user.utilisateur_id ;

    const certifications = await certificationService.getMyCertifications(userId);

    res.json({
      success: true,
      count: certifications.length,
      data: certifications
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des certifications'
    });
  }
};
