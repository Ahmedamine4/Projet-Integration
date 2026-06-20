import {
  creeActivite,
  getActivitesByEtudiant,
  editActivite,
  supprimerActiviteService,
  updateVisibiliteActiviteService,
} from '../services/activite.service.js';

export const addActivite = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { titre, description, date_experience } = req.body;

    if (!titre || !description || !date_experience) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }

    if (req.body.is_academique === 'true' && !req.body.nom_institution) {
      return res.status(400).json({
        success: false,
        message: "Le nom de l'institution est requis pour une activité académique",
      });
    }

    const result = await creeActivite(etudiantId, req.body, req.file ?? null);
    return res.status(201).json({ success: true, data: result });

  } catch (error) {
    console.error('Erreur addActivite:', error);
    const errorsMap = {
      'Activité déjà existante': 409,
      'Institution non trouvée': 404,
      'Club non trouvé': 404,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getActivites = async (req, res) => {
  try {
    const activites = await getActivitesByEtudiant(req.user.utilisateur_id);
    return res.status(200).json({ success: true, data: activites });
  } catch (error) {
    console.error('Erreur getActivites:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const updateActivite = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { experienceId } = req.params;

    const result = await editActivite(etudiantId, experienceId, req.body, req.file ?? null);
    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error('Erreur updateActivite:', error);
    const errorsMap = {
      'Activité déjà existante': 409,
      'Activité non trouvée': 404,
      'Institution non trouvée': 404,
      'Club non trouvé': 404,
      "Cette activité a déjà été traitée par l'institution, vous ne pouvez plus la modifier": 403,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const deleteActivite = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { experienceId } = req.params;

    await supprimerActiviteService(etudiantId, experienceId);
    return res.status(200).json({ success: true, message: 'Activité supprimée avec succès' });

  } catch (error) {
    console.error('Erreur deleteActivite:', error);
    const errorsMap = {
      'Activité non trouvée': 404,
      "Cette activité a déjà été traitée par l'institution, vous ne pouvez plus la supprimer": 403,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const updateVisibiliteActivite = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { experienceId } = req.params;
    const { visibilite } = req.body;

    if (typeof visibilite !== 'boolean') {
      return res.status(400).json({ success: false, message: 'visibilite doit être un boolean' });
    }

    const result = await updateVisibiliteActiviteService(etudiantId, experienceId, visibilite);
    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error('Erreur updateVisibiliteActivite:', error);
    const errorsMap = {
      'Activité non trouvée': 404,
      "Vous ne pouvez changer la visibilité que si l'activité académique est validée": 403,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};