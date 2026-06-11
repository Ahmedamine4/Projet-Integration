import {
  getDemandes,
  getPendingStats,
  getStageById,
  getProjetById,
  traiterValidationProjet,
  traiterValidationStageProf,
  getLettreById,
  traiterLettre,
} from '../services/professeur.service.js';

const TYPES_VALIDES   = ['stage', 'projet', 'recommandation'];
const STATUTS_VALIDES = ['en_attente', 'valide', 'refuse'];

export const listDemandes = async (req, res) => {
  try {
    const profId = req.user.utilisateur_id;
    const { type, statut, page } = req.query;
 
    if (type && !TYPES_VALIDES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Type invalide. Valeurs acceptées : ${TYPES_VALIDES.join(', ')}`,
      });
    }
 
    if (statut && !STATUTS_VALIDES.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Valeurs acceptées : ${STATUTS_VALIDES.join(', ')}`,
      });
    }
 
    const [result, stats] = await Promise.all([
      getDemandes(profId, { type, statut, page }),
      getPendingStats(profId)
    ]);
    return res.status(200).json({ 
      success: true, 
      ...result, 
      stats 
    });
  } catch (error) {
    console.error('Erreur listDemandes:', error);
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
    const errorsMap = { 'Stage non trouvé': 404, 'Accès refusé': 403 };
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
    const errorsMap = { 'Projet non trouvé': 404, 'Accès refusé': 403 };
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

    if (statut && !['valide', 'refuse'].includes(statut)) {
      return res.status(400).json({ success: false, message: 'Statut invalide. Valeurs acceptées : valide, refuse' });
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

    if (statut && !['valide', 'refuse'].includes(statut)) {
      return res.status(400).json({ success: false, message: 'Statut invalide. Valeurs acceptées : valide, refuse' });
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

export const getLettre = async (req, res) => {
  try {
    const profId = req.user.utilisateur_id;
    const { etudiantId } = req.params;
 
    const lettre = await getLettreById(profId, etudiantId);
    return res.status(200).json({ success: true, data: lettre });
  } catch (error) {
    console.error('Erreur getLettre:', error);
    const errorsMap = { 'Demande non trouvée': 404 };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const traiterDemandeLettre = async (req, res) => {
  try {
    const profId = req.user.utilisateur_id;
    const { etudiantId } = req.params;
    const { statut, commentaire } = req.body;
 
    if (statut && !STATUTS_VALIDES.includes(statut)) {
      return res.status(400).json({ success: false, message: `Statut invalide. Valeurs acceptées : ${STATUTS_VALIDES.join(', ')}` });
    }
 
    const result = await traiterLettre(profId, etudiantId, { statut, commentaire }, req.file ?? null);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur traiterDemandeLettre:', error);
    const errorsMap = {
      'Demande non trouvée': 404,
      'Cette demande a déjà été traitée': 409,
      'Un commentaire est requis': 400,
      'Un commentaire est requis pour un refus': 400,
      'Un fichier PDF est requis pour valider': 400,
      'Statut invalide': 400,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};