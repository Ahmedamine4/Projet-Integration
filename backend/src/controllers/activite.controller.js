import {
  createActivite as createActiviteService,
  getMesActivitesService,
  getPortfolioPublicActivitiesService,
  updateValidationActiviteService,
} from '../services/activite.service.js';
import { supabase } from '../config/supabase.js';

function getStatusCode(error, fallbackStatus = 500) {
  return error?.statusCode || fallbackStatus;
}

function normalizeArrayPayload(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

export async function createActivite(req, res) {
  try {
    const data = { ...req.body };
    data.competences = normalizeArrayPayload(data.competences);
    data.documentations = normalizeArrayPayload(data.documentations);

    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;

      const { error } = await supabase.storage
        .from('activites')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (error) {
        throw new Error(error.message);
      }

      const { data: publicUrl } = supabase.storage
        .from('activites')
        .getPublicUrl(fileName);

      data.documentations.push({
        captures: publicUrl.publicUrl,
      });
    }

    const activite = await createActiviteService(data, req.user);

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
