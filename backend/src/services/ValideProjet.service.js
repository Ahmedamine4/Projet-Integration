import prisma from "../config/prisma.js";
import { StatutValidation } from "@prisma/client";
import { creerNotification } from "./notification.service.js";

export const validerProjetService = async ({
  experience_id,
  utilisateur_id,
  statut,
  commentaireProf,
}) => {

  // vérifier si le projet existe
  const projet = await prisma.valideProjet.findUnique({
    where: {
      experience_id_utilisateur_id: {
        experience_id,
        utilisateur_id,
      },
    },
    include: {
      projet: {
        include: {
          experience: {
            select: {
              utilisateur_id: true,
              titre: true,
            },
          },
        },
      },
    },
  });

  if (!projet) {
    throw new Error("PROJET_INTROUVABLE");
  }


  const statutsValides = [
    StatutValidation.en_attente,
    StatutValidation.valide,
    StatutValidation.refuse,
  ];


  let nouveauStatut = projet.statut;

  //si aucun statut envoyé mais commentaire existe
  if (statut === undefined || statut === null) {

    if (commentaireProf) {
      nouveauStatut = StatutValidation.en_attente;
    }

  } else {

    // vérifier si le statut est valide
    if (!statutsValides.includes(statut)) {
      throw new Error("STATUT_INVALIDE");
    }

    nouveauStatut = statut;
  }

  const updated = await prisma.valideProjet.update({
    where: {
      experience_id_utilisateur_id: {
        experience_id,
        utilisateur_id,
      },
    },

    data: {
      statut: nouveauStatut,
      commentaire: commentaireProf || null,
      date_d_action: new Date(),
    },
  });

  if ((statut === undefined || statut === null) && commentaireProf) {
    await creerNotification(
      projet.projet.experience.utilisateur_id,
      `Votre professeur a laisse un commentaire sur votre projet "${projet.projet.experience.titre}".`,
      "commentaire_projet",
      { utilisateurSourceId: utilisateur_id }
    );

    return updated;
  }

  if (statut !== undefined && statut !== null) {
    const message =
      nouveauStatut === StatutValidation.valide
        ? `Votre projet "${projet.projet.experience.titre}" a ete valide par votre professeur.`
        : `Votre projet "${projet.projet.experience.titre}" a ete refuse.${commentaireProf ? ` Motif : ${commentaireProf}` : ""}`;

    await creerNotification(
      projet.projet.experience.utilisateur_id,
      message,
      "validation_projet",
      { utilisateurSourceId: utilisateur_id }
    );
  }

  return updated;
};
