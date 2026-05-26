import {
  uploadPhoto,
  creeActivite,
  getActivitesByEtudiant,
  editActivite,
  updateVisibiliteActiviteService,
} from '../services/activite.service.js';

export const addActivite = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { titre, date_experience, description } = req.body;

    if (!titre || !date_experience || !description) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }

    let imageUrl = null;
    if (req.file) imageUrl = await uploadPhoto(req.file);

    const result = await creeActivite(etudiantId, req.body, imageUrl);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur addActivite:', error);
    const errorsMap = {
      'Activité déjà existante': 409,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getMesActivites = async (req, res) => {
  try {
    const activites = await getActivitesByEtudiant(req.user.utilisateur_id);
    return res.status(200).json({ success: true, data: activites });
  } catch (error) {
    console.error('Erreur getMesActivites:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const updateActivite = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { experienceId } = req.params;

    let imageUrl = null;
    if (req.file) imageUrl = await uploadPhoto(req.file);

    const result = await editActivite(etudiantId, experienceId, req.body, imageUrl);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur updateActivite:', error);
    const errorsMap = {
      'Activité déjà existante': 409,
      'Activité non trouvée': 404,
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
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};