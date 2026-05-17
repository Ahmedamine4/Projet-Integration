import prisma from '../config/prisma.js';

export const getNotifications = async (utilisateurId) => {
  return prisma.notification.findMany({
    where: { utilisateur_id: utilisateurId },
    orderBy: { date_notification: 'desc' },
  });
};

export const marquerCommeLue = async (notificationId, utilisateurId) => {
  const notif = await prisma.notification.findUnique({
    where: { notification_id: notificationId },
  });

  if (!notif || notif.utilisateur_id !== utilisateurId) {
    throw new Error('Notification non trouvée ou accès refusé');
  }

  return prisma.notification.update({
    where: { notification_id: notificationId },
    data: { lu: true },
  });
};

export const creerNotification = async (utilisateurId, message, type) => {
  return prisma.notification.create({
    data: {
      message,
      type,
      lu: false,
      date_notification: new Date(),
      utilisateur_id: utilisateurId,
    },
  });
};