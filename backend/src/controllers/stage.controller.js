import {
  uploadPhoto,
  creeStage,
  getStagesByEtudiant,
  editStage,
  updateVisibiliteStageService,
} from '../services/stage.service.js';

export const addStage = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { titre, description, missions_realisees, date_debut, date_fin, rapport_stage } = req.body;

    if (!titre || !description || !date_debut || !date_fin) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }

    if (new Date(date_fin) <= new Date(date_debut)) {
      return res.status(400).json({ 
        success: false, 
        message: 'La date de fin doit être après la date de début' 
      });
    }

    let technologies, domaines;
    try {
      technologies = JSON.parse(req.body.technologies || '[]');
      domaines = JSON.parse(req.body.domaines || '[]');
    } catch (e) {
      return res.status(400).json({ 
        success: false, 
        message: 'Format invalide pour les technologies ou domaines' 
      });
    }

    if (!Array.isArray(technologies) || !Array.isArray(domaines)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Les technologies et domaines doivent être des tableaux' 
      });
    }


    if (req.body.is_academique === 'true') {
      if (!req.body.email_professeur) {
        return res.status(400).json({ 
          success: false, 
          message: 'Veuillez entrer l\'email du professeur' 
        });
      }
    }

    let photoUrl = null;
    if (req.file) {
      console.log('Photo reçue:', req.file.originalname); 
      photoUrl = await uploadPhoto(req.file);
      console.log('Photo URL:', photoUrl);
    }

    const result = await creeStage(etudiantId, req.body, photoUrl);
    res.status(201).json({ success: true, data: result });

  } catch (error) {
    console.error('Error addStage:', error);

    if (error.message === 'Professeur non trouvé avec cet email') {
      return res.status(404).json({ success: false, message: 'Aucun professeur trouvé avec cet email' });
    }

    if (error.message === 'Stage déjà existant') {
      return res.status(409).json({ success: false, message: 'Vous avez déjà un stage avec ce titre' });
    }

    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getStages = async (req, res) => {
  try {
    const stages = await getStagesByEtudiant(req.user.utilisateur_id);
    res.status(200).json({ success: true, data: stages });
  } catch (error) {
    console.error('Error getStages:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const updateStage = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { experienceId } = req.params;

    if (req.body.date_debut && req.body.date_fin) {
      if (new Date(req.body.date_fin) <= new Date(req.body.date_debut)) {
        return res.status(400).json({ success: false, message: 'La date de fin doit être après la date de début' });
      }
    }

    let photoUrl = null;
    if (req.file) photoUrl = await uploadPhoto(req.file);

    const result = await editStage(etudiantId, experienceId, req.body, photoUrl);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur updateStage:', error);
    const errorsMap = {
      'Stage déjà existant': 409,
      'Stage not found': 404,
      'Professeur non trouvé avec cet email': 404,
      'Ce stage a déjà été traité par le professeur, vous ne pouvez plus le modifier': 403,
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

    if (typeof visibilite !== 'boolean') {
      return res.status(400).json({ success: false, message: 'visibilite doit être un boolean' });
    }

    const result = await updateVisibiliteStageService(etudiantId, experienceId, visibilite);
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