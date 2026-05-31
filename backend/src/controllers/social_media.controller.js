import { getSocialMedia, updateSocialMedia } from '../services/social_media.service.js';
 
export const getSocialMediaController = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await getSocialMedia(userId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.message === 'Utilisateur non trouvé') {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
 
export const updateSocialMediaController = async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user?.utilisateur_id;
 
    if (!requesterId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non connecté' });
    }
 
    if (requesterId !== userId) {
      return res.status(403).json({ success: false, message: 'Accès refusé : non propriétaire' });
    }
 
    const updated = await updateSocialMedia(userId, req.body);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error.message.startsWith('Aucun champ')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};