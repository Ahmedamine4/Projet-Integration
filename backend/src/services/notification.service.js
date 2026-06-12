import prisma from "../config/prisma.js";
import { envoyerNotificationEmail } from "../utils/sendMailnotif.js";

export const TYPES_NOTIFICATION = {
  COMMENTAIRE_PROJET: "commentaire_projet",
  COMMENTAIRE_STAGE: "commentaire_stage",

  VALIDATION_PROJET: "validation_projet",
  PROJET_VALIDE: "projet_valide",
  PROJET_REFUSE: "projet_refuse",

  VALIDATION_STAGE: "validation_stage",
  STAGE_VALIDE: "stage_valide",
  STAGE_REFUSE: "stage_refuse",

  VALIDATION_ETUDIANT_ACCEPTEE: "validation_etudiant_acceptee",
  VALIDATION_ETUDIANT_REFUSEE: "validation_etudiant_refusee",

  RECOMMANDATION_VALIDEE: "recommandation_validee",
  RECOMMANDATION_REFUSEE: "recommandation_refusee",
  RECOMMANDATION_DEMANDEE: "recommandation_demandee",

  PASSWORD_UPDATED: "password_updated",
  EMAIL_UPDATED: "email_updated",

  NOUVEAU_FOLLOWER: "nouveau_follower",
  NOUVELLE_CANDIDATURE: "nouvelle_candidature",
};

export const getNotifications = async (utilisateurId, types = null) => {
  return prisma.notification.findMany({
    where: {
      utilisateur_cible_id: utilisateurId,
      ...(types && {
        type: {
          in: types,
        },
      }),
    },
    orderBy: {
      date_notification: "desc",
    },
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

export const supprimerNotification = async (notificationId, utilisateurId) => {
  const notif = await prisma.notification.findUnique({
    where: {
      notification_id: notificationId,
    },
  });

  if (!notif || notif.utilisateur_cible_id !== utilisateurId) {
    throw new Error("Notification non trouvée ou accès refusé");
  }
  return prisma.notification.delete({
    where: {
      notification_id: notificationId,
    },
  });
};

export const getNotificationNotread = async (utilisateurId) => {
  return prisma.notification.findMany({
    where: {
      utilisateur_cible_id: utilisateurId,
      lu: false,
    },
  });
};


export const marquerCommeLue = async (notificationId, utilisateurId) => {
  const notif = await prisma.notification.findUnique({
    where: {
      notification_id: notificationId,
    },
  });

  if (!notif || notif.utilisateur_cible_id !== utilisateurId) {
    throw new Error("Notification non trouvée ou accès refusé");
  }

  return prisma.notification.update({
    where: {
      notification_id: notificationId,
    },
    data: {
      lu: true,
    },
  });
};

export const creerNotification = async (
  utilisateurCibleId,
  message,
  type,
  options = {},
) => {
  const {
    utilisateurSourceId = null,
    subject = "Notification folioCraft",
    tx = prisma,
  } = options;

  const notification = await tx.notification.create({
    data: {
      message,
      type,
      lu: false,
      date_notification: new Date(),
      utilisateur_cible_id: utilisateurCibleId,
      utilisateur_source_id: utilisateurSourceId,
    },
    include: {
      utilisateur_source: true,
    },
  });

  const utilisateur = await tx.utilisateur.findUnique({
    where: {
      utilisateur_id: utilisateurCibleId,
    },
    select: {
      email: true,
    },
  });

  if (utilisateur?.email) {
    envoyerNotificationEmail({
      email: utilisateur.email,
      subject,
      message,
      userSource: notification.utilisateur_source,
    }).catch((err) => {
      console.error("Erreur lors de l'envoi de l'email :", err);
    });
  }

  return notification;
};
