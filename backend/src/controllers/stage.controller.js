import {
  creeStage,
  getStagesByEtudiant,
  editStage,
  supprimerStageService,
  updateVisibiliteStageService,
} from '../services/stage.service.js';

const parseBoolean = (value) => value === true || value === 'true' || value === '1' || value === 1;

export const addStage = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { titre, description, date_debut, date_fin } = req.body;

    if (!titre || !description || !date_debut || !date_fin) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }

    if (new Date(date_fin) <= new Date(date_debut)) {
      return res.status(400).json({
        success: false,
        message: 'La date de fin doit être après la date de début',
      });
    }

    let technologies, domaines;
    try {
      technologies = JSON.parse(req.body.technologies || '[]');
      domaines = JSON.parse(req.body.domaines || '[]');
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Format invalide pour les technologies ou domaines',
      });
    }

    if (!Array.isArray(technologies) || !Array.isArray(domaines)) {
      return res.status(400).json({
        success: false,
        message: 'Les technologies et domaines doivent être des tableaux',
      });
    }

    if (req.body.is_academique === 'true' && !req.body.email_professeur) {
      return res.status(400).json({
        success: false,
        message: "Veuillez entrer l'email du professeur",
      });
    }

    const result = await creeStage(etudiantId, req.body, req.file ?? null);
    return res.status(201).json({ success: true, data: result });

  } catch (error) {
    console.error('Erreur addStage:', error);
    const errorsMap = {
      'Stage déjà existant': 409,
      'Professeur non trouvé avec cet email': 404,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getStages = async (req, res) => {
  try {
    const stages = await getStagesByEtudiant(req.user.utilisateur_id);
    return res.status(200).json({ success: true, data: stages });
  } catch (error) {
    console.error('Erreur getStages:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const updateStage = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { experienceId } = req.params;

    if (req.body.date_debut && req.body.date_fin) {
      if (new Date(req.body.date_fin) <= new Date(req.body.date_debut)) {
        return res.status(400).json({
          success: false,
          message: 'La date de fin doit être après la date de début',
        });
      }
    }

    const result = await editStage(etudiantId, experienceId, req.body, req.file ?? null);
    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error('Erreur updateStage:', error);
    const errorsMap = {
      'Stage déjà existant': 409,
      'Stage non trouvé': 404,
      'Professeur non trouvé avec cet email': 404,
      'Ce stage a déjà été traité par le professeur, vous ne pouvez plus le modifier': 403,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const deleteStage = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { experienceId } = req.params;

    await supprimerStageService(etudiantId, experienceId);
    return res.status(200).json({ success: true, message: 'Stage supprimé avec succès' });

  } catch (error) {
    console.error('Erreur deleteStage:', error);
    const errorsMap = {
      'Stage non trouvé': 404,
      'Ce stage a déjà été traité par le professeur, vous ne pouvez plus le supprimer': 403,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const updateVisibiliteStage = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { experienceId } = req.params;
    const { visibilite } = req.body;

    if (visibilite === undefined) {
      return res.status(400).json({ success: false, message: 'visibilite est requis' });
    }

    const visibiliteBoolean = parseBoolean(visibilite);

    if (typeof visibiliteBoolean !== 'boolean') {
      return res.status(400).json({ success: false, message: 'visibilite doit être un boolean ou une chaîne true/false' });
    }

    const result = await updateVisibiliteStageService(etudiantId, experienceId, visibiliteBoolean);
    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error('Erreur updateVisibiliteStage:', error);
    const errorsMap = {
      'Stage non trouvé': 404,
      'Vous ne pouvez changer la visibilité que si le stage académique est validé': 403,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};