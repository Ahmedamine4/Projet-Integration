import * as photoService from '../services/photo.service.js';

export const uploadProfilePhotoController = async (req, res) => {
  try {
    const userId = req.params.id;
    const requesterId = req.user?.utilisateur_id;

    if (!requesterId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non connecté' });
    }

    if (requesterId !== userId) {
      return res.status(403).json({ success: false, message: 'Accès refusé: non propriétaire' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Fichier photo manquant' });
    }

    const updated = await photoService.uploadUserProfilePhoto(userId, req.file);
    return res.status(200).json({ success: true, photo: updated.photo });
  } catch (error) {
    console.error('Erreur uploadProfilePhoto:', error);
    return res.status(500).json({ success: false, message: error.message || 'Erreur serveur' });
  }
};

export const getProfilePhotoController = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await photoService.getUserProfilePhotoByUserId(userId);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }

    return res.status(200).json({ success: true, photo: result.photo ?? null });
  } catch (error) {
    console.error('Erreur getProfilePhoto:', error);
    return res.status(500).json({ success: false, message: error.message || 'Erreur serveur' });
  }
};
