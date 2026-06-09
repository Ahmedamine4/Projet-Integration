import prisma from '../config/prisma.js';
import { creerNotification } from './notification.service.js';
import { TypeExperience, TypeSpecifique } from '@prisma/client';
import { lierCompetencesExperience, supprimerCompetencesDeveloppees } from './competence.helper.js';
import { uploadPhoto, remplacerPhoto, supprimerPhoto } from '../utils/photo.utils.js';

export const creeProjet = async (etudiantId, data, file) => {
  const projetExistant = await prisma.experience.findFirst({
    where: { utilisateur_id: etudiantId, type: 'projet', titre: data.projectTitle },
  });
  if (projetExistant) throw new Error('Projet déjà existant');

  const technologies = JSON.parse(data.technologies || '[]');
  const domaines = JSON.parse(data.domains || '[]');
  const isAcademique = data.projetType === 'academique';

  // Upload photo avant la transaction
  const photoUrl = file ? await uploadPhoto(file, 'projets-photos') : null;

  return await prisma.$transaction(async (tx) => {
    const experience = await tx.experience.create({
      data: {
        titre: data.projectTitle,
        date_experience: new Date(data.projectDate),
        visibilite: false,
        type: 'projet',
        description: data.description,
        type_specifique: isAcademique ? 'academique' : 'personnel',
        utilisateur_id: etudiantId,
        photo: photoUrl ?? null,
      },
    });

    const projet = await tx.projet.create({
      data: {
        experience_id: experience.experience_id,
        lien_github: data.githubLink ?? null,
      },
    });

    const competencesTech = await lierCompetencesExperience(
      tx, experience.experience_id, etudiantId, technologies, 'technologie'
    );
    const competencesDomaines = await lierCompetencesExperience(
      tx, experience.experience_id, etudiantId, domaines, 'domaine'
    );

    //si projet académique creer valideProjet avec statut en_attend et envoyer notification au prof
    let validation = null;
    if (isAcademique && data.professorEmail) {
      const professeur = await tx.utilisateur.findUnique({
        where: { email: data.professorEmail },
        include: { professeur: true },
      });
      if (!professeur || !professeur.professeur) throw new Error('Professeur non trouvé avec cet email');

      validation = await tx.valideProjet.create({
        data: {
          utilisateur_id: professeur.utilisateur_id,
          experience_id: experience.experience_id,
          statut: 'en_attente',
          date_d_action: new Date(),
        },
      });

      const etudiant = await tx.utilisateur.findUnique({
        where: { utilisateur_id: etudiantId },
        select: { nom: true, prenom: true },
      });

      await creerNotification(
        professeur.utilisateur_id,
        `L'étudiant ${etudiant.prenom} ${etudiant.nom} demande la validation de son projet "${data.projectTitle}".`,
        'validation_projet'
      );
    }


    return { experience, projet, competences: [...competencesTech, ...competencesDomaines], validation };
  });
};

export const getProjetsByEtudiant = async (etudiantId) => {
  return prisma.experience.findMany({
    where: { utilisateur_id: etudiantId, type: 'projet' },
    include: {
      projet: { include: { validation: true } },
      competence_dev: { include: { competence: true } },
    },
    orderBy: { date_experience: 'desc' },
  });
};

export const editProjet = async (etudiantId, experienceId, data, file) => {
  const projetExistant = await prisma.experience.findFirst({
    where: { utilisateur_id: etudiantId, type: 'projet', titre: data.projectTitle, experience_id: { not: experienceId } },
  });
  if (projetExistant) throw new Error('Projet déjà existant');

  // Récupérer l'ancienne photo avant la transaction
  const experienceActuelle = await prisma.experience.findFirst({
    where: { experience_id: experienceId },
    select: { photo: true },
  });

  const photoUrl = file
    ? await remplacerPhoto(file, experienceActuelle?.photo, 'projets-photos')
    : null;

  return await prisma.$transaction(async (tx) => {
    const experience = await tx.experience.findFirst({
      where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'projet' },
      include: {
        projet: { include: { validation: true } },
      },
    });

    if (!experience) throw new Error('Projet non trouvé');

    const isAcademique = data.projetType
      ? data.projetType === 'academique'
      : experience.type_specifique === 'academique';

    // Vérification statut AVANT les updates
    if (isAcademique && experience.projet?.validation) {
      const statut = experience.projet.validation.statut;
      if (statut === 'valide' || statut === 'refuse') {
        throw new Error('Ce projet a déjà été traité par le professeur, vous ne pouvez plus le modifier');
      }
    }

    if (experience.technologies_locked && data.technologies !== undefined) {
      throw new Error('Les technologies importées depuis GitHub sont verrouillées');
    }

    await tx.experience.update({
      where: { experience_id: experienceId },
      data: {
        titre: data.projectTitle ?? experience.titre,
        date_experience: data.projectDate ? new Date(data.projectDate) : experience.date_experience,
        description: data.description ?? experience.description,
        visibilite: false,
        type_specifique: data.projetType
          ? (data.projetType === 'academique' ? 'academique' : 'personnel')
          : experience.type_specifique,
        photo: photoUrl ?? experience.photo,
      },
    });

    await tx.projet.update({
      where: { experience_id: experienceId },
      data: {
        lien_github: data.githubLink ?? experience.projet.lien_github,
      },
    });

    if (data.technologies !== undefined || data.domains !== undefined) {
      const technologies = JSON.parse(data.technologies || '[]');
      const domaines = JSON.parse(data.domains || '[]');

      await supprimerCompetencesDeveloppees(tx, experienceId, etudiantId);

      await lierCompetencesExperience(tx, experienceId, etudiantId, technologies, 'technologie');
      await lierCompetencesExperience(tx, experienceId, etudiantId, domaines, 'domaine');
    }

    if (experience.projet.validation) {
      let profId = experience.projet.validation.utilisateur_id;

      if (data.professorEmail) {
        const nouveauProf = await tx.utilisateur.findUnique({
          where: { email: data.professorEmail },
          include: { professeur: true },
        });
        if (!nouveauProf || !nouveauProf.professeur) throw new Error('Professeur non trouvé avec cet email');
        profId = nouveauProf.utilisateur_id;
      }

      await tx.valideProjet.update({
        where: { experience_id: experienceId },
        data: { statut: 'en_attente', utilisateur_id: profId, date_d_action: new Date() },
      });

      const etudiant = await tx.utilisateur.findUnique({
        where: { utilisateur_id: etudiantId },
        select: { nom: true, prenom: true },
      });

      await creerNotification(
        profId,
        `L'étudiant ${etudiant.prenom} ${etudiant.nom} a modifié son projet "${data.projectTitle ?? experience.titre}". Il demande une validation.`,
        'validation_projet'
      );

    } else if (data.professorEmail) {
      const prof = await tx.utilisateur.findUnique({
        where: { email: data.professorEmail },
        include: { professeur: true },
      });
      if (!prof || !prof.professeur) throw new Error('Professeur non trouvé avec cet email');


      await tx.valideProjet.create({
        data: { utilisateur_id: prof.utilisateur_id, experience_id: experienceId, statut: 'en_attente', date_d_action: new Date() },
      });

      const etudiant = await tx.utilisateur.findUnique({
        where: { utilisateur_id: etudiantId },
        select: { nom: true, prenom: true },
      });

      await creerNotification(
        prof.utilisateur_id,
        `L'étudiant ${etudiant.prenom} ${etudiant.nom} demande la validation de son projet "${data.projectTitle ?? experience.titre}".`,
        'validation_projet'
      );
    }

    return tx.experience.findUnique({
      where: { experience_id: experienceId },
      include: {
        projet: { include: { validation: true } },
        competence_dev: { include: { competence: true } },
      },
    });
  });
};

export const getProjetsVisiblesByEtudiant = async (etudiantId) => {
  return prisma.experience.findMany({
    where: {
      utilisateur_id: etudiantId,
      type: 'projet',
      visibilite: true,
    },
    include: {
      projet: { include: { validation: true } },
      competence_dev: { include: { competence: true } },
    },
    orderBy: { date_experience: 'desc' },
  });
};

export const updateVisibiliteProjetService = async (etudiantId, experienceId, visibilite) => {
  const experience = await prisma.experience.findFirst({
    where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'projet' },
    include: { projet: { include: { validation: true } } },
  });

  if (!experience) throw new Error('Projet non trouvé');

  if (experience.type_specifique === 'academique') {
    const statut = experience.projet?.validation?.statut;
    if (statut !== 'valide') {
      throw new Error('Vous ne pouvez changer la visibilité que si le projet académique est validé');
    }
  }

  return prisma.experience.update({
    where: { experience_id: experienceId },
    data: { visibilite },
    select: { experience_id: true, visibilite: true },
  });
};
//cration d'un projet brouillon à partir d'un repo github, avec is_draft à true et technologies_locked à true .

export const createDraftProjetFromRepository = async (repository, etudiantId) => {
  return await prisma.$transaction(async (tx) => {
    const experience = await tx.experience.create({
      data: {
        titre: repository.title,
        description: repository.description || `Projet importé depuis GitHub : ${repository.title}`,  // a verifier 
        visibilite: false,
        type: TypeExperience.projet,
        type_specifique: TypeSpecifique.personnel,
        utilisateur_id: etudiantId,
        is_draft: true,
        technologies_locked: true,
      },
    });

    const projet = await tx.projet.create({
      data: {
        experience_id: experience.experience_id,
        repository_id: repository.repository_id,
        lien_github: repository.link,
      },
    });

    if (repository.language) {
      await lierCompetencesExperience(
        tx, experience.experience_id, etudiantId, [repository.language], 'technologie'
      );
    }

    return { experience, projet };
  });
};
/*boucle sur les repositories importés
cherche si un projet existe déjà pour repository_id
si oui : ne recrée rien
sinon : appelle createDraftProjetFromRepository(...)*/

export const createDraftProjectsFromRepos = async (etudiantId, repositories) => {
  const draftProjects = [];

  // On parcourt tous les repositories GitHub déjà synchronisés pour cet étudiant.
  for (const repository of repositories) {
    // Sécurité métier :
    // si le repository est rattaché à un autre étudiant,
    // on ne crée aucun draft pour éviter un mauvais ownership.
    if (repository.etudiant_id && repository.etudiant_id !== etudiantId) {
      continue;
    }

    // Vérification anti-doublon :
    // avant de créer un draft, on regarde si un projet existe déjà
    // pour ce repository et pour ce même étudiant.
    // Si oui, on ne recrée rien.
    const existingProjet = await prisma.projet.findFirst({
      where: {
        repository_id: repository.repository_id,
        experience: {
          utilisateur_id: etudiantId,
        },
      },
      select: { experience_id: true },
    });

    if (existingProjet) {
      continue;
    }

    // Si aucun projet n'est lié à ce repository pour cet étudiant,
    // alors on crée un nouveau draft projet.
    const draftProjet = await createDraftProjetFromRepository(repository, etudiantId);
    draftProjects.push(draftProjet);
  }

  return draftProjects;
};


export const supprimerProjetService = async (etudiantId, experienceId) => {
  const experience = await prisma.experience.findFirst({
    where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'projet' },
    include: {
      projet: { include: { validation: true } },
    },
  });

  if (!experience) throw new Error('Projet non trouvé');

  //bloquer si deja traite par le professeur
  if (experience.type_specifique === 'academique' && experience.projet?.validation) {
    const statut = experience.projet.validation.statut;
    if (statut === 'valide' || statut === 'refuse') {
      throw new Error('Ce projet a déjà été traité par le professeur, vous ne pouvez plus le supprimer');
    }
  }

  await supprimerPhoto(experience.photo, 'projets-photos');

  await prisma.experience.delete({
    where: { experience_id: experienceId },
  });
};