import {
  createActivite,
  createAcademicActivityService,
  createPersonalActivityService,
  getMesActivitesService,
  getPortfolioPublicActivitiesService,
  submitActivityForValidationService,
  updateValidationActiviteService,
} from '../services/activite.service.js';

// Petit helper pour reutiliser le code HTTP defini par le service.
function getStatusCode(error, fallbackStatus = 500) {
  return error?.statusCode || fallbackStatus;
}

export async function addActivite(req, res) {
  try {
    const activite = await createActivite(req.body, req.user);

    return res.status(201).json({
      success: true,
      data: activite,
    });
  } catch (error) {
    return res.status(getStatusCode(error, 400)).json({
      success: false,
      message: error.message || "Erreur lors de l'ajout de l'activite",
    });
  }
}

export async function createActivitePersonnelle(req, res) {
  try {
    const activite = await createPersonalActivityService(req.body, req.user);

    return res.status(201).json({
      success: true,
      message: 'Activite personnelle ajoutee avec succes',
      data: activite,
    });
  } catch (error) {
    return res.status(getStatusCode(error, 400)).json({
      success: false,
      message: error.message || "Erreur lors de l'ajout de l'activite",
    });
  }
}

export async function createActiviteAcademique(req, res) {
  try {
    const activite = await createAcademicActivityService(req.body, req.user);

    return res.status(201).json({
      success: true,
      message: 'Activite academique ajoutee et soumise a validation',
      data: activite,
    });
  } catch (error) {
    return res.status(getStatusCode(error, 400)).json({
      success: false,
      message: error.message || "Erreur lors de l'ajout de l'activite academique",
    });
  }
}

export async function soumettreActiviteValidation(req, res) {
  try {
    const activite = await submitActivityForValidationService(
      req.params.id,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Activite soumise a validation avec succes',
      data: activite,
    });
  } catch (error) {
    return res.status(getStatusCode(error, 400)).json({
      success: false,
      message: error.message || "Erreur lors de la soumission de l'activite",
    });
  }
}

export async function getMesActivites(req, res) {
  try {
    // req.user vient du middleware d'authentification.
    const activites = await getMesActivitesService(req.user);

    return res.status(200).json({
      success: true,
      data: activites,
    });
  } catch (error) {
    return res.status(getStatusCode(error, 400)).json({
      success: false,
      message: error.message || 'Erreur lors de la recuperation des activites',
    });
  }
}

export async function updateValidationActivite(req, res) {
  try {
    const activite = await updateValidationActiviteService(
      req.params.id,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Validation de l activite mise a jour avec succes',
      data: activite,
    });
  } catch (error) {
    return res.status(getStatusCode(error, 400)).json({
      success: false,
      message: error.message || "Erreur lors de la mise a jour de la validation",
    });
  }
}

export async function getActivitesPubliquesPortfolio(req, res) {
  try {
    const activites = await getPortfolioPublicActivitiesService(req.params.etudiantId);

    return res.status(200).json({
      success: true,
      data: activites,
    });
  } catch (error) {
    return res.status(getStatusCode(error, 400)).json({
      success: false,
      message: error.message || 'Erreur lors de la recuperation des activites publiques',
    });
  }
}
