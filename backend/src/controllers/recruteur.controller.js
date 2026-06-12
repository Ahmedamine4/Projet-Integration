import {
  creerOffre,
  getToutesLesDemandes,
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

export const getTypesOffresController = async (req, res) => {
  try {
    const typesOffres = await getTypesOffres();

    res.json(typesOffres);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};  