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

export const getNotificationsByUserId = async (req, res) => {
  try {
    const requesterId = req.user.utilisateur_id;
    const requesterRole = req.user.role;
    const { userId } = req.params;

    if (!userId || userId === ':userId') {
      return res.status(400).json({
        success: false,
        message: 'Identifiant utilisateur invalide',
      });
    }

    const canReadTargetNotifications =
      requesterId === userId || requesterRole === 'administrateur';

    if (!canReadTargetNotifications) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé : vous ne pouvez consulter que vos notifications",
      });
    }

    const notifications = await getNotifications(userId);
    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error('Erreur getNotificationsByUserId:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des notifications',
    });
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

    if (error.message === 'Notification non trouvee ou acces refuse') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

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
