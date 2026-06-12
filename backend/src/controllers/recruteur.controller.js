import {
  creerOffre,
  getToutesLesDemandes,
  envoyerDemande,
  getOffresPagination,
  getDemandesPagination,
  terminerOffre,
} from "../services/recruteur.service.js";


export const createOffreController = async (req, res) => {
  try {
    const utilisateurId = req.user.utilisateur_id;

    const offre = await creerOffre(utilisateurId, req.body);

    res.status(201).json({ success: true, data: offre });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMesOffresController = async (req, res) => {
  try {
    const utilisateurId = req.user.utilisateur_id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getOffresPagination(page, limit, utilisateurId);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const envoyerDemandeController = async (req, res) => {
  try {
    const utilisateurId = req.user.utilisateur_id;
    const { offreId } = req.params;
    const { message } = req.body;

    const demande = await envoyerDemande(
      offreId,
      utilisateurId,
      message
    );

    res.status(201).json({
      success: true,
      data: demande
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const terminerOffreController = async (req, res) => {
  try {
    const utilisateurId = req.user.utilisateur_id;
    const { offreId } = req.params;

    const offre = await terminerOffre(offreId, utilisateurId);

    res.json(offre);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getDemandesParOffreController = async (req, res) => {
  try {
    const { offreId } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getDemandesPagination(page, limit, offreId);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
    