import prisma from "../config/prisma.js";
import { creerNotification , TYPES_NOTIFICATION} from './notification.service.js';
import { TypeOffre } from "@prisma/client";

export const creerOffre = async (utilisateurId, data) => {

  const offre = await prisma.offre.create({
    data: {
      entreprise: data.entreprise,
      localisation: data.localisation,
      technologies: data.technologies,
      description: data.description,
      type: data.type,
      utilisateur_id: utilisateurId,
    },
  });

  await creerNotification(
    utilisateurId,
    `Votre offre chez ${data.entreprise} a été créée avec succès!`,
    TYPES_NOTIFICATION.OFFRE_CREEE,
  );

  return offre;
};

export const getMesOffres = async (utilisateurId) => {
  return prisma.offre.findMany({
    where: {
      utilisateur_id: utilisateurId,
    },
    include: {
      _count: {
        select: {
          demandes: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });
};


export const getToutesLesDemandes = async (
  utilisateurId,
) => {
  return prisma.demande.findMany({
    where: {
      offre: {
        utilisateur_id: utilisateurId,
      },
    },
    include: {
      offre: {
        select: {
          offre_id: true,
          entreprise: true,
          localisation: true,
          type: true,
        },
      },
      utilisateur: {
        select: {
          utilisateur_id: true,
          nom: true,
          prenom: true,
          email: true,
          photo: true,
        },
      },
    },
    orderBy: {
      offre: {
        date: "desc",
      },
    },
  });
};

export const terminerOffre = async (offreId, utilisateurId) => {
  const offre = await prisma.offre.findFirst({
    where: {
      offre_id: offreId,
      utilisateur_id: utilisateurId,
    },
  });

  if (!offre) throw new Error("Offre introuvable");

  return prisma.offre.update({
    where: { offre_id: offreId },
    data: { statut: "TERMINEE" },
  });
};

export const getOffresPagination = async (page = 1, limit = 10, utilisateurId) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.offre.findMany({
      where: {
        utilisateur_id: utilisateurId,
      },
      skip,
      take: limit,
      orderBy: {
        date: "desc",
      },
      include: {
        _count: {
          select: { demandes: true },
        },
      },
    }),

    prisma.offre.count({
      where: {
        utilisateur_id: utilisateurId,
      },
    }),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getDemandesPagination = async (page = 1, limit = 10, offreId) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.demande.findMany({
      where: { offre_id: offreId },
      skip,
      take: limit,
      include: {
        utilisateur: true,
      },
      orderBy: {
        message: "asc",
      },
    }),

    prisma.demande.count({
      where: { offre_id: offreId },
    }),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getTypesOffres = async () => {
  return Object.values(TypeOffre);
};