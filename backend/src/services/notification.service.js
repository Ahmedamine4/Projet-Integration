import prisma from '../config/prisma.js';

export const getNotifications = async (utilisateurId) => {
  return prisma.notification.findMany({
    where: { utilisateur_cible_id: utilisateurId },
    orderBy: { date_notification: 'desc' },
    include: {
      utilisateur_source: {
        select: {
          utilisateur_id: true,
          nom: true,
          prenom: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

export const getHistoriqueActivite = async (utilisateurId) => {
  return prisma.notification.findMany({
    where: {
      utilisateur_cible_id: utilisateurId,
      type: {
        in: [
          'portfolio_update',
          'portfolio_visibility',
          'github_import',
          'validation_projet',
          'validation_stage',
          'recommandation',
          'validation_institution',
          'commentaire_projet',
          'commentaire_stage',
        ],
      },
    },
    orderBy: { date_notification: 'desc' },
    include: {
      utilisateur_source: {
        select: {
          utilisateur_id: true,
          nom: true,
          prenom: true,
          role: true,
        },
      },
    },
  });
};

export const marquerCommeLue = async (notificationId, utilisateurId) => {
  const notif = await prisma.notification.findUnique({
    where: { notification_id: notificationId },
  });

  if (!notif || notif.utilisateur_cible_id !== utilisateurId) {
    throw new Error('Notification non trouvee ou acces refuse');
  }

  return prisma.notification.update({
    where: { notification_id: notificationId },
    data: { lu: true },
  });
};

export const creerNotification = async (
  utilisateurCibleId,
  message,
  type,
  options = {}
) => {
  const { utilisateurSourceId = null } = options;

  return prisma.notification.create({
    data: {
      message,
      type,
      lu: false,
      date_notification: new Date(),
      utilisateur_cible_id: utilisateurCibleId,
      utilisateur_source_id: utilisateurSourceId,
    },
  });
};
