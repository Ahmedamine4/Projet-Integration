import prisma from '../config/prisma.js';
import { creerNotification } from './notification.service.js';
import { lierCompetencesExperience, supprimerCompetencesDeveloppees, getCompetencesByExperience } from './competence.helper.js';
import { uploadPhoto, remplacerPhoto, supprimerPhoto } from '../utils/photo.utils.js';

export const creeActivite = async (etudiantId, data, file) => {
  const activiteExistante = await prisma.experience.findFirst({
    where: { utilisateur_id: etudiantId, type: 'activite', titre: data.titre },
  });
  if (activiteExistante) throw new Error('Activité déjà existante');

  const competences = JSON.parse(data.competences || '[]');
  const isAcademique = data.is_academique === 'true';
  const visibilite = data.visibilite !== undefined ? data.visibilite : false;

  // Upload photo avant la transaction
  const photoUrl = file ? await uploadPhoto(file, 'activites-photos') : null;

  // Chercher l'institution par nom avant la transaction
  let institution = null;
  if (isAcademique && data.nom_institution) {
    institution = await prisma.institution.findFirst({
      where: { nom: data.nom_institution },
      include: { directeur: true },
    });
    if (!institution) throw new Error('Institution non trouvée');
  }

  // Chercher le club par nom avant la transaction
  let club = null;
  if (data.nom_club) {
    club = await prisma.club.findFirst({
      where: { nom: data.nom_club },
    });
    if (!club) throw new Error('Club non trouvé');
  }

  return await prisma.$transaction(async (tx) => {
    const experience = await tx.experience.create({
      data: {
        titre: data.titre,
        date_experience: new Date(data.date_experience),
        visibilite,
        type: 'activite',
        description: data.description,
        type_specifique: isAcademique ? 'academique' : 'personnel',
        utilisateur_id: etudiantId,
        photo: photoUrl ?? null,
        deleted_at: null,
      },
    });

    await tx.activite.create({
      data: {
        experience_id: experience.experience_id,
        type: data.typeActivite ?? null,
        lieu: data.lieu ?? null,
        clubs: club ? { connect: { club_id: club.club_id } } : undefined,
      },
    });

    // Créer les compétences via CompetenceDeveloppee
    for (const { nom, type } of competences) {
      await lierCompetencesExperience(tx, experience.experience_id, etudiantId, [nom], type);
    }

    // Si activité académique, créer la demande de validation auprès de l'institution
    let validation = null;
    if (isAcademique && institution) {
      validation = await tx.valideActivite.create({
        data: {
          experience_id: experience.experience_id,
          institution_id: institution.institution_id,
          statut: 'en_attente',
          date_d_action: new Date(),
        },
      });

      // Notifier le directeur de l'institution
      if (institution.directeur?.directeur_utilisateur_id) {
        const etudiant = await tx.utilisateur.findUnique({
          where: { utilisateur_id: etudiantId },
          select: { nom: true, prenom: true },
        });

        await creerNotification(
          institution.directeur.directeur_utilisateur_id,
          `L'étudiant ${etudiant.prenom} ${etudiant.nom} demande la validation de son activité "${data.titre}" auprès de ${institution.nom}.`,
          'validation_activite'
        );
      }
    }

    const result = await tx.activite.findUnique({
      where: { experience_id: experience.experience_id },
      include: {
        experience: true,
        validation: { include: { institution: true } },
      },
    });
    
    const competences = await getCompetencesByExperience(experience.experience_id);
    
    return {
      ...result,
      experience: {
        ...result.experience,
        competences,
      },
    };
  });
};

export const getActivitesByEtudiant = async (etudiantId) => {
  const activites = await prisma.activite.findMany({
    where: { experience: { utilisateur_id: etudiantId, deleted_at: null } },
    include: {
      clubs: true,
      validation: { include: { institution: true } },
      experience: true,
    },
    orderBy: { experience: { date_experience: 'desc' } },
  });

  return Promise.all(
    activites.map(async (activite) => {
      const competences = await getCompetencesByExperience(activite.experience_id);
      return {
        ...activite,
        experience: {
          ...activite.experience,
          competences,
        },
      };
    })
  );
};

export const editActivite = async (etudiantId, experienceId, data, file) => {
  const activiteExistante = await prisma.experience.findFirst({
    where: {
      utilisateur_id: etudiantId,
      type: 'activite',
      titre: data.titre,
      deleted_at: null,
      experience_id: { not: experienceId },
    },
  });
  if (activiteExistante) throw new Error('Activité déjà existante');

  // Récupérer l'ancienne photo avant la transaction
  const experienceActuelle = await prisma.experience.findFirst({
    where: { experience_id: experienceId, deleted_at: null },
    select: { photo: true },
  });

  const photoUrl = file
    ? await remplacerPhoto(file, experienceActuelle?.photo, 'activites-photos')
    : null;

  // Chercher la nouvelle institution par nom avant la transaction (si fournie)
  let nouvelleInstitution = null;
  if (data.nom_institution) {
    nouvelleInstitution = await prisma.institution.findFirst({
      where: { nom: data.nom_institution },
      include: { directeur: true },
    });
    if (!nouvelleInstitution) throw new Error('Institution non trouvée');
  }

  // Chercher le club par nom avant la transaction (si fourni)
  let club = null;
  if (data.nom_club) {
    club = await prisma.club.findFirst({
      where: { nom: data.nom_club },
    });
    if (!club) throw new Error('Club non trouvé');
  }

  return await prisma.$transaction(async (tx) => {
    const experience = await tx.experience.findFirst({
      where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'activite', deleted_at: null },
      include: {
        activite: { include: { validation: true } },
        competence_dev: true,
      },
    });

    if (!experience) throw new Error('Activité non trouvée');

    // Vérification statut AVANT les updates
    if (experience.type_specifique === 'academique' && experience.activite.validation) {
      const statut = experience.activite.validation.statut;
      if (statut === 'valide' || statut === 'refuse') {
        throw new Error("Cette activité a déjà été traitée par l'institution, vous ne pouvez plus la modifier");
      }
    }

    const isAcademique = data.is_academique
      ? data.is_academique === 'true'
      : experience.type_specifique === 'academique';

    const visibilite = data.visibilite !== undefined
      ? data.visibilite
      : experience.visibilite;

    await tx.experience.update({
      where: { experience_id: experienceId, deleted_at: null },
      data: {
        titre: data.titre ?? experience.titre,
        date_experience: data.date_experience ? new Date(data.date_experience) : experience.date_experience,
        description: data.description ?? experience.description,
        visibilite,
        type_specifique: data.is_academique
          ? (isAcademique ? 'academique' : 'personnel')
          : experience.type_specifique,
        photo: photoUrl ?? experience.photo,
      },
    });

    await tx.activite.update({
      where: { experience_id: experienceId },
      data: {
        type: data.typeActivite ?? experience.activite.type,
        lieu: data.lieu ?? experience.activite.lieu,
        clubs: club ? { set: [{ club_id: club.club_id }] } : undefined,
      },
    });

    // Mise à jour des compétences
    if (data.competences !== undefined) {
      const competences = JSON.parse(data.competences || '[]');
      await supprimerCompetencesDeveloppees(tx, experienceId, etudiantId);
      for (const { nom, type } of competences) {
        await lierCompetencesExperience(tx, experienceId, etudiantId, [nom], type);
      }
    }

    // Si déjà une validation existante
    if (experience.activite.validation) {
      
      const institutionId = nouvelleInstitution
        ? nouvelleInstitution.institution_id
        : experience.activite.validation.institution_id;

      await tx.valideActivite.update({
        where: { experience_id: experienceId },
        data: {
          statut: 'en_attente',
          institution_id: institutionId,
          date_d_action: new Date(),
        },
      });

      const institutionFinale = nouvelleInstitution ?? await tx.institution.findUnique({
        where: { institution_id: institutionId },
        include: { directeur: true },
      });

      if (institutionFinale?.directeur?.directeur_utilisateur_id) {
        const etudiant = await tx.utilisateur.findUnique({
          where: { utilisateur_id: etudiantId },
          select: { nom: true, prenom: true },
        });

        await creerNotification(
          institutionFinale.directeur.directeur_utilisateur_id,
          `L'étudiant ${etudiant.prenom} ${etudiant.nom} a modifié son activité "${data.titre ?? experience.titre}". Il demande une validation auprès de ${institutionFinale.nom}.`,
          'validation_activite'
        );
      }

    } else if (nouvelleInstitution) {
      await tx.valideActivite.create({
        data: {
          experience_id: experienceId,
          institution_id: nouvelleInstitution.institution_id,
          statut: 'en_attente',
          date_d_action: new Date(),
        },
      });

      if (nouvelleInstitution.directeur?.directeur_utilisateur_id) {
        const etudiant = await tx.utilisateur.findUnique({
          where: { utilisateur_id: etudiantId },
          select: { nom: true, prenom: true },
        });

        await creerNotification(
          nouvelleInstitution.directeur.directeur_utilisateur_id,
          `L'étudiant ${etudiant.prenom} ${etudiant.nom} demande la validation de son activité "${data.titre ?? experience.titre}" auprès de ${nouvelleInstitution.nom}.`,
          'validation_activite'
        );
      }
    }

    const result = await tx.activite.findUnique({
      where: { experience_id: experienceId },
      include: {
        experience: true,
        validation: { include: { institution: true } },
      },
    });

    const competences = await getCompetencesByExperience(experienceId);

    return {
      ...result,
      experience: {
        ...result.experience,
        competences,
      },
    };
  });
};

export const updateVisibiliteActiviteService = async (etudiantId, experienceId, visibilite) => {
  const experience = await prisma.experience.findFirst({
    where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'activite', deleted_at: null },
    include: {
      activite: { include: { validation: true } },
    },
  });

  if (!experience) throw new Error('Activité non trouvée');

  if (experience.type_specifique === 'academique') {
    const statut = experience.activite?.validation?.statut;
    if (statut !== 'valide' && statut !== 'refuse') {
      throw new Error("Vous ne pouvez changer la visibilité que si l'activité académique n'est pas encore traitée par l'institution");
    }
  }

  return prisma.experience.update({
    where: { experience_id: experienceId },
    data: { visibilite },
    select: { experience_id: true, visibilite: true },
  });
};

export async function getActivitesVisiblesByEtudiant(etudiantId) {
  const activites = await prisma.experience.findMany({
    where: {
      utilisateur_id: etudiantId,
      type: 'activite',
      deleted_at: null,
      visibilite: true,
      OR: [
        { type_specifique: 'personnel' },
        {
          type_specifique: 'academique',
          activite: { validation: { statut: { in: ['valide', 'refuse'] } } },
        },
      ],
    },
    include: {
      activite: {
        include: {
          validation: { include: { institution: true } },
          clubs: true,
        },
      },
    },
    orderBy: { date_experience: 'desc' },
  });

  return Promise.all(
    activites.map(async (activite) => {
      const competences = await getCompetencesByExperience(activite.experience_id);
      return {
        ...activite,
        competences,
      };
    })
  );
}

export const supprimerActiviteService = async (etudiantId, experienceId) => {
  const experience = await prisma.experience.findFirst({
    where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'activite', deleted_at: null },
    include: {
      activite: { include: { validation: true } },
    },
  });

  if (!experience) throw new Error('Activité non trouvée');

  if (experience.type_specifique === 'academique' && experience.activite?.validation) {
    const statut = experience.activite.validation.statut;
    if (statut === 'valide') {
      throw new Error("Cette activité a été validée par l'institution, vous ne pouvez plus la supprimer. Utilisez la visibilité pour la masquer.");
    }
  }

  await supprimerPhoto(experience.photo, 'activites-photos');

  await prisma.experience.update({
    where: { experience_id: experienceId },
    data: { deleted_at: new Date() },
  });
};