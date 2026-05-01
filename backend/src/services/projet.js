import prisma from '../config/prisma.js';
import { TypeExperience } from '@prisma/client';

export const createProjet = async (data, userId) => {
  return await prisma.$transaction(async (tx) => {

    const experience = await tx.experience.create({
      data: {
        titre: data.titre,
        date_experience: data.date_experience,
        visibilite: data.visibilite,
        type: TypeExperience.projet,
        description: data.description,
        utilisateur_id: userId
      }
    });

    const projet = await tx.projet.create({
      data: {
        experience_id: experience.experience_id,
        type_projet: data.type_projet,
        lien_github: data.lien_github,
        lien_youtube: data.lien_youtube,
        resultat_obtenus: data.resultat_obtenus,
        role: data.role
      }
    });

    return { experience, projet };
  });
};