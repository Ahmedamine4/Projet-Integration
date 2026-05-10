import {
  createActivite as createActiviteService,
  getMesActivitesService,
  getPortfolioPublicActivitiesService,
  updateValidationActiviteService,
} from '../services/activite.service.js';

function getStatusCode(error, fallbackStatus = 500) {
  return error?.statusCode || fallbackStatus;
}

export async function createActivite(req, res) {
  try {
    const activite = await createActiviteService(req.body, req.user);

    return res.status(201).json({
      success: true,
      data: activite,
    });
  } catch (error) {
    return res.status(getStatusCode(error, 400)).json({
      success: false,
      message: error.message || "Erreur lors de la creation de l'activite",
    });
  }
}

export async function getMesActivites(req, res) {
  try {
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
