import {
  createStage,
  uploadPhoto,
  getStagesByEtudiant,
  updateStage,
  getDemandesValidationProfesseur,
  traiterValidationStage,
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


    if (req.body.is_academique === 'true' || req.body.is_academique === true) {
      if (!req.body.email_professeur) {
        return res.status(400).json({ 
          success: false, 
          message: 'Veuillez entrer l\'email du professeur' 
        });
      }
    }

    let photoUrl = null;
    if (req.file) {
      console.log('Photo reçue:', req.file.originalname); // ← AJOUTER
      photoUrl = await uploadPhoto(req.file);
      console.log('Photo URL:', photoUrl); // ← AJOUTER
    }

    const result = await createStage(etudiantId, req.body, photoUrl);
    res.status(201).json({ success: true, data: result });

  } catch (error) {
    console.error('Erreur addStage:', error);

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
    console.error('Erreur getStages:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const editStage = async (req, res) => {
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

    const result = await updateStage(etudiantId, experienceId, req.body, photoUrl);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur editStage:', error);
    if (error.message === 'Stage non trouvé') {
      return res.status(404).json({ success: false, message: 'Stage non trouvé' });
    }
    if (error.message === 'Professeur non trouvé avec cet email') {
      return res.status(404).json({ success: false, message: 'Aucun professeur trouvé avec cet email' });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

//pour prof

export const getDemandesValidation = async (req, res) => {
  try {
    const demandes = await getDemandesValidationProfesseur(req.user.utilisateur_id);
    res.status(200).json({ success: true, data: demandes });
  } catch (error) {
    console.error('Erreur getDemandesValidation:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const traiterValidation = async (req, res) => {
  try {
    const profId = req.user.utilisateur_id;
    const { experienceId } = req.params;
    const { statut, commentaire } = req.body;

    if (!statut) {
      return res.status(400).json({ success: false, message: 'Le statut est requis' });
    }

    if (!['valide', 'refuse'].includes(statut)) {
      return res.status(400).json({ success: false, message: 'Statut invalide. Valeurs acceptées : valide, refuse' });
    }

    if (statut === 'refuse' && !commentaire?.trim()) {
      return res.status(400).json({ success: false, message: 'Un commentaire est requis pour un refus' });
    }

    const result = await traiterValidationStage(profId, experienceId, statut, commentaire);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur traiterValidation:', error);
    const errorsMap = {
      'Demande de validation non trouvée': 404,
      'Accès refusé': 403,
      'Cette demande a déjà été traitée': 409,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};