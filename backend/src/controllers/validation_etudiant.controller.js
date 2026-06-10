import { getPendingValidations, updateValidationStatus } from '../services/validation_etudiant.service.js';

export const listPendingController = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const list = await getPendingValidations(institutionId);
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({
      error: 'Erreur lors de la recuperation',
      details: error.message,
    });
  }
};

export const validateStudentController = async (req, res) => {
  try {
    const { etudiantId, institutionId } = req.params;
    const requestedStatus = req.body.status;
    const status = requestedStatus === 'rejete' ? 'refuse' : requestedStatus;

    if (!['valide', 'refuse'].includes(status)) {
      return res.status(400).json({
        error: "Le statut doit etre 'valide' ou 'refuse'",
      });
    }

    const updated = await updateValidationStatus(etudiantId, institutionId, status);
    return res.status(200).json({
      message: 'Statut mis a jour avec succes',
      updated,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Erreur lors de la validation',
      details: error.message,
    });
  }
};
