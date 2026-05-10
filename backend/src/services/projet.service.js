import prisma from "../config/prisma.js";
import { RoleUtilisateur } from "@prisma/client";
import {
  StatutValidation,
  TypeExperience,
  TypeSpecifique,
} from "@prisma/client";

export const createProjet = async (data, userId) => {
  return await prisma.$transaction(async (tx) => {
    const experience = await tx.experience.create({
      data: {
        titre: data.projectTitle,
        date_experience: new Date(data.projectDate),
        description: data.description,
        visibilite: data.visibleToEveryone,
        type: TypeExperience.projet,
        utilisateur_id: userId,
      },
    });

    const projetData = {
      experience_id: experience.experience_id,
      lien_github: data.githubLink,
      photo: data.imageUrl, //
      technologies: data.technologies, //
      domains: data.domains, //
    };

    if (data.projetType === TypeSpecifique.academique) {
      const prof = await prisma.utilisateur.findFirst({
        where: {
          email: data.professorEmail,
          role: RoleUtilisateur.professeur,
        },
      });
      if (!prof) {
        throw new Error("Professeur non trouvé avec cet email");
      }
      projetData.validation = {
        create: {
          experience_id: experience.experience_id,
          utilisateur_id: prof.utilisateur_id,
          statut: StatutValidation.en_attente,
          date_d_action: new Date(),
          commentaire: null,
        },
      };
    }
    const projet = await tx.projet.create({
      data: projetData,
    });

    return { experience, projet };
  });
};
