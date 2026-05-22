import {
  getDemandes,
  getStagesProf,
  getProjetsProf,
  getStageById,
  getProjetById,
  traiterValidationProjet,
  traiterValidationStageProf,
} from '../services/professeur.service.js';


// validation

export const listDemandes = async (req, res) => {
  try {
    const profId = req.user.utilisateur_id;
    const demandes = await getDemandes(profId);
    return res.status(200).json({ success: true, data: demandes });
  } catch (error) {
    console.error('Erreur listDemandes:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const listStages = async (req, res) => {
  try {
    const profId = req.user.utilisateur_id;
    const { statut, commente } = req.query;

    const STATUTS_VALIDES = ['en_attente', 'valide', 'refuse'];
    if (statut && !STATUTS_VALIDES.includes(statut)) {
      return res.status(400).json({ success: false, message: `Statut invalide. Valeurs acceptées : ${STATUTS_VALIDES.join(', ')}` });
    }

    if (commente !== undefined && commente !== 'true' && commente !== 'false') {
      return res.status(400).json({ success: false, message: "commente doit être 'true' ou 'false'" });
    }

    const commenteBool = commente === undefined ? undefined : commente === 'true';

    const stages = await getStagesProf(profId, statut, commenteBool);
    return res.status(200).json({ success: true, data: stages });
  } catch (error) {
    console.error('Erreur listStages:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};


export const listProjets = async (req, res) => {
  try {
    const profId = req.user.utilisateur_id;
    const { statut, commente } = req.query;

    const STATUTS_VALIDES = ['en_attente', 'valide', 'refuse'];
    if (statut && !STATUTS_VALIDES.includes(statut)) {
      return res.status(400).json({ success: false, message: `Statut invalide. Valeurs acceptées : ${STATUTS_VALIDES.join(', ')}` });
    }

    if (commente !== undefined && commente !== 'true' && commente !== 'false') {
      return res.status(400).json({ success: false, message: "commente doit être 'true' ou 'false'" });
    }

    const commenteBool = commente === undefined ? undefined : commente === 'true';

    const projets = await getProjetsProf(profId, statut, commenteBool);
    return res.status(200).json({ success: true, data: projets });
  } catch (error) {
    console.error('Erreur listProjets:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getStageDetail = async (req, res) => {
  try {
    const profId = req.user.utilisateur_id;
    const { experienceId } = req.params;
    const stage = await getStageById(profId, experienceId);
    return res.status(200).json({ success: true, data: stage });
  } catch (error) {
    console.error('Erreur getStageDetail:', error);
    const errorsMap = {
      'Stage non trouvé': 404,
      'Accès refusé': 403,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};


export const getProjetDetail = async (req, res) => {
  try {
    const profId = req.user.utilisateur_id;
    const { experienceId } = req.params;
    const projet = await getProjetById(profId, experienceId);
    return res.status(200).json({ success: true, data: projet });
  } catch (error) {
    console.error('Erreur getProjetDetail:', error);
    const errorsMap = {
      'Projet non trouvé': 404,
      'Accès refusé': 403,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};


export const validerProjet = async (req, res) => {
  try {
    const profId = req.user.utilisateur_id;
    const { experienceId } = req.params;
    const { statut, commentaire } = req.body;

    const STATUTS_VALIDES = ['valide', 'refuse'];
    if (statut && !STATUTS_VALIDES.includes(statut)) {
      return res.status(400).json({ success: false, message: "Statut invalide. Valeurs acceptées : valide, refuse" });
    }

    const result = await traiterValidationProjet(profId, experienceId, statut, commentaire);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur validerProjet:', error);
    const errorsMap = {
      'Demande de validation non trouvée': 404,
      'Accès refusé': 403,
      'Cette demande a déjà été traitée': 409,
      'Un commentaire est requis pour un refus': 400,
      'Un commentaire est requis': 400,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};


export const validerStage = async (req, res) => {
  try {
    const profId = req.user.utilisateur_id;
    const { experienceId } = req.params;
    const { statut, commentaire } = req.body;

    const STATUTS_VALIDES = ['valide', 'refuse'];
    if (statut && !STATUTS_VALIDES.includes(statut)) {
      return res.status(400).json({ success: false, message: "Statut invalide. Valeurs acceptées : valide, refuse" });
    }

    const result = await traiterValidationStageProf(profId, experienceId, statut, commentaire);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur validerStage:', error);
    const errorsMap = {
      'Demande de validation non trouvée': 404,
      'Accès refusé': 403,
      'Cette demande a déjà été traitée': 409,
      'Un commentaire est requis pour un refus': 400,
      'Un commentaire est requis': 400,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};