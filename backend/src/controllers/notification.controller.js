import {
  getNotifications,
  getNotificationNotread,
  marquerCommeLue,
  supprimerNotification,
} from "../services/notification.service.js";

export const getMesNotifications = async (req, res) => {
  try {
    const utilisateurId = req.user.utilisateur_id;

    const notifications = await getNotifications(utilisateurId);

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Erreur getNotifications:", error);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

export const getMesNotificationsNonLues = async (req, res) => {
  try {
    const utilisateurId = req.user.utilisateur_id;

    const notifications = await getNotificationNotread(utilisateurId);

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Erreur getNotificationNotread:", error);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

export const lireNotification = async (req, res) => {
  try {
    const utilisateurId = req.user.utilisateur_id;
    const { notificationId } = req.params;

    const notification = await marquerCommeLue(
      notificationId,
      utilisateurId
    );

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Erreur lireNotification:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const supprimerNotificationController = async (req, res) => {
  try {
    const utilisateurId = req.user.utilisateur_id;
    const { notificationId } = req.params;

    await supprimerNotification(notificationId, utilisateurId);

    return res.status(200).json({
      success: true,
      message: "Notification supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur supprimerNotification:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};