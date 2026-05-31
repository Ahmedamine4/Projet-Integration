import prisma from "../config/prisma.js";
import { StatutValidation } from "@prisma/client";

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

  // update
  return await prisma.valideProjet.update({
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
};
