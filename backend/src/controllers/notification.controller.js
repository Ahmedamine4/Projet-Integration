import {
  getHistoriqueActivite,
  getNotifications,
  marquerCommeLue,
} from '../services/notification.service.js';

export const getMesNotifications = async (req, res) => {
  try {
    const utilisateurId = req.user.utilisateur_id;
    const notifications = await getNotifications(utilisateurId);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error('Erreur getNotifications:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const lireNotification = async (req, res) => {
  try {
    const utilisateurId = req.user.utilisateur_id;
    const { notificationId } = req.params;
    const notification = await marquerCommeLue(notificationId, utilisateurId);
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error('Erreur lireNotification:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getHistorique = async (req, res) => {
  try {
    const utilisateurId = req.user.utilisateur_id;
    const historique = await getHistoriqueActivite(utilisateurId);
    res.status(200).json({ success: true, data: historique });
  } catch (error) {
    console.error('Erreur getHistorique:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
