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
<<<<<<< HEAD
=======
        type_specifique: data.projetType === 'academique' ? 'academique' : 'personnel',
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
        utilisateur_id: userId,
      },
    });

    const projetData = {
      experience_id: experience.experience_id,
      lien_github: data.githubLink,
<<<<<<< HEAD
      photo: data.imageUrl, //
      technologies: data.technologies, //
      domains: data.domains, //
=======
      photo: data.imageUrl,
      technologies: data.technologies,
      domains: data.domains,
      //ici j ai ajouter is_draft et technologies_locked pour les projets personnels importés depuis github
      is_draft: false,
      technologies_locked: false,
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
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
<<<<<<< HEAD
=======
//cration d'un projet brouillon à partir d'un repo github, avec is_draft à true et technologies_locked à true .

export const createDraftProjetFromRepository = async (repository, etudiantId) => {
  return await prisma.$transaction(async (tx) => {
    const experience = await tx.experience.create({
      data: {
        titre: repository.name,
        description: repository.description || null,
        visibilite: false,
        type: TypeExperience.projet,
        type_specifique: TypeSpecifique.personnel,
        utilisateur_id: etudiantId,
      },
    });

    const projet = await tx.projet.create({
      data: {
        experience_id: experience.experience_id,
        repository_id: repository.repository_id,
        lien_github: repository.html_url,
        technologies: repository.language ? [repository.language] : [],
        domains: [],
        is_draft: true,
        technologies_locked: true,
      },
    });

    return { experience, projet };
  });
};
/*boucle sur les repositories importés
cherche si un projet existe déjà pour repository_id
si oui : ne recrée rien
sinon : appelle createDraftProjetFromRepository(...)*/

export const createDraftProjectsFromRepos = async (etudiantId, repositories) => {
  const draftProjects = [];

  for (const repository of repositories) {
    const existingProjet = await prisma.projet.findFirst({
      where: {
        repository_id: repository.repository_id,
      },
      select: { experience_id: true },
    });

    if (existingProjet) {
      continue;
    }

    const draftProjet = await createDraftProjetFromRepository(repository, etudiantId);
    draftProjects.push(draftProjet);
  }

  return draftProjects;
};
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
