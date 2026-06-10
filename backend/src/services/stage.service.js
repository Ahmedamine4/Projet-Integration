import prisma from '../config/prisma.js';
import { creerNotification } from './notification.service.js';
import { lierCompetencesExperience, supprimerCompetencesDeveloppees, getCompetencesByExperience } from './competence.helper.js';
import { uploadPhoto, remplacerPhoto, supprimerPhoto } from '../utils/photo.utils.js';

export const creeStage = async (etudiantId, data, file) => {

  const stageExistant = await prisma.experience.findFirst({
    where: { utilisateur_id: etudiantId, type: 'stage', titre: data.titre, deleted_at: null },
  });
  if (stageExistant) throw new Error('Stage déjà existant');

  const debut = new Date(data.date_debut);
  const fin = new Date(data.date_fin);
  const duree = String(Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)));

  const technologies = JSON.parse(data.technologies || '[]');
  const domaines = JSON.parse(data.domaines || '[]');
  const visibilite = data.visibilite !== undefined ? data.visibilite : false;

  // Upload photo avant la transaction
  const photoUrl = file ? await uploadPhoto(file, 'stages-photos') : null;

  return await prisma.$transaction(async (tx) => {
    const experience = await tx.experience.create({
      data: {
        titre: data.titre,
        date_experience: debut,
        visibilite,
        type: 'stage',
        description: data.description,
        type_specifique: data.is_academique === 'true' ? 'academique' : 'personnel',
        utilisateur_id: etudiantId,
        photo: photoUrl ?? null,
        deleted_at: null,
      },
    });

    const stage = await tx.stage.create({
      data: {
        experience_id: experience.experience_id,
        date_fin: fin,
        duree: duree,
        missions_realisees: data.missions_realisees ?? null,
        rapport_stage: data.rapport_stage ?? null,
      },
    });

    await lierCompetencesExperience(tx, experience.experience_id, etudiantId, technologies, 'technologie');
    await lierCompetencesExperience(tx, experience.experience_id, etudiantId, domaines, 'domaine');

    //si stage est academique
    let validation = null;
    if (data.is_academique === 'true' && data.email_professeur) {

      const professeur = await tx.utilisateur.findUnique({
        where: { email: data.email_professeur },
        include: { professeur: true },
      });

      if (!professeur || !professeur.professeur) {
        throw new Error('Professeur non trouvé avec cet email');
      }

      validation = await tx.valideStage.create({
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
        `L'étudiant ${etudiant.prenom} ${etudiant.nom} demande la validation de son stage "${data.titre}".`,
        'validation_stage'
      );
    }

    const result = await tx.stage.findUnique({
      where: { experience_id: experience.experience_id },
      include: {
        experience: true,
        validation: true,
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

export const getStagesByEtudiant = async (etudiantId) => {
  const stages = await prisma.stage.findMany({
    where: { experience: { utilisateur_id: etudiantId, deleted_at: null } },
    include: {
      validation: true,
      experience: true,
    },
    orderBy: { experience: { date_experience: 'desc' } },
  });

  return Promise.all(
    stages.map(async (stage) => {
      const competences = await getCompetencesByExperience(stage.experience_id);
      return {
        ...stage,
        experience: {
          ...stage.experience,
          competences,
        },
      };
    })
  );
};

export const editStage = async (etudiantId, experienceId, data, file) => {
  const stageExistant = await prisma.experience.findFirst({
    where: { utilisateur_id: etudiantId, type: 'stage', titre: data.titre, deleted_at: null, experience_id: { not: experienceId } },
  });
  if (stageExistant) throw new Error('Stage déjà existant');

  //recupere l'ancienne photo avant la transaction
  const experienceActuelle = await prisma.experience.findFirst({
    where: { experience_id: experienceId, deleted_at: null },
    select: { photo: true },
  });

  const photoUrl = file
    ? await remplacerPhoto(file, experienceActuelle?.photo, 'stages-photos')
    : null;

  return await prisma.$transaction(async (tx) => {
    // verifier que le stage appartient bien à l'etudiant
    const experience = await tx.experience.findFirst({
      where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'stage', deleted_at: null },
      include: {
        stage: {
          include: {
            validation: {
              include: {
                professeur: { include: { utilisateur: true } },
              },
            },
          },
        },
      },
    });

    if (!experience) throw new Error('Stage non trouvé');

    //verification statut AVANT les updates
    if (experience.type_specifique === 'academique' && experience.stage.validation) {
      const statut = experience.stage.validation.statut;
      if (statut === 'valide' || statut === 'refuse') {
        throw new Error('Ce stage a déjà été traité par le professeur, vous ne pouvez plus le modifier');
      }
    }

    const debut = data.date_debut ? new Date(data.date_debut) : experience.date_experience;
    const fin = data.date_fin ? new Date(data.date_fin) : experience.stage.date_fin;
    const duree = (data.date_debut || data.date_fin)
      ? String(Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)))
      : experience.stage.duree;

    const visibilite = data.visibilite !== undefined
      ? data.visibilite
      : experience.visibilite;

    await tx.experience.update({
      where: { experience_id: experienceId },
      data: {
        titre: data.titre ?? experience.titre,
        date_experience: debut,
        description: data.description ?? experience.description,
        visibilite,
        type_specifique: data.is_academique
          ? (data.is_academique === 'true' ? 'academique' : 'personnel')
          : experience.type_specifique,
        photo: photoUrl ?? experience.photo,
      },
    });

    await tx.stage.update({
      where: { experience_id: experienceId },
      data: {
        date_fin: fin,
        duree: duree,
        missions_realisees: data.missions_realisees ?? experience.stage.missions_realisees,
        rapport_stage: data.rapport_stage ?? experience.stage.rapport_stage,
      },
    });

    //maj des competences
    if (data.technologies !== undefined || data.domaines !== undefined) {
      const technologies = JSON.parse(data.technologies || '[]');
      const domaines = JSON.parse(data.domaines || '[]');

      // Supprimer les anciennes liaisons de cette expérience
      await supprimerCompetencesDeveloppees(tx, experienceId, etudiantId);

      // Recréer avec la logique de niveau
      await lierCompetencesExperience(tx, experienceId, etudiantId, technologies, 'technologie');
      await lierCompetencesExperience(tx, experienceId, etudiantId, domaines, 'domaine');
    }

    // Si déjà une validation existante
    if (experience.stage.validation) {
      let profId = experience.stage.validation.utilisateur_id;

      // L'étudiant veut changer de prof
      if (data.email_professeur) {
        const nouveauProf = await tx.utilisateur.findUnique({
          where: { email: data.email_professeur },
          include: { professeur: true },
        });

        if (!nouveauProf || !nouveauProf.professeur) {
          throw new Error('Professeur non trouvé avec cet email');
        }
        profId = nouveauProf.utilisateur_id;
      }

      await tx.valideStage.update({
        where: { experience_id: experienceId },
        data: {
          statut: 'en_attente',
          utilisateur_id: profId,
          date_d_action: new Date(),
        },
      });

      const etudiant = await tx.utilisateur.findUnique({
        where: { utilisateur_id: etudiantId },
        select: { nom: true, prenom: true },
      });

      await creerNotification(
        profId,
        `L'étudiant ${etudiant.prenom} ${etudiant.nom} a modifié son stage "${data.titre ?? experience.titre}". Il demande une validation.`,
        'validation_stage'
      );

    // le stage n'a pa de validation et l'etudiant veut ajouter un prof
    } else if (data.email_professeur) {
      const prof = await tx.utilisateur.findUnique({
        where: { email: data.email_professeur },
        include: { professeur: true },
      });
      if (!prof || !prof.professeur) {
        throw new Error('Professeur non trouvé avec cet email');
      }

      await tx.valideStage.create({
        data: {
          utilisateur_id: prof.utilisateur_id,
          experience_id: experienceId,
          statut: 'en_attente',
          date_d_action: new Date(),
        },
      });

      const etudiant = await tx.utilisateur.findUnique({
        where: { utilisateur_id: etudiantId },
        select: { nom: true, prenom: true },
      });

      await creerNotification(
        prof.utilisateur_id,
        `L'étudiant ${etudiant.prenom} ${etudiant.nom} demande la validation de son stage "${data.titre ?? experience.titre}".`,
        'validation_stage'
      );
    }

    const result = await tx.stage.findUnique({
      where: { experience_id: experienceId },
      include: {
        experience: true,
        validation: true,
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

export const getStagesVisiblesByEtudiant = async (etudiantId) => {
  const stages = await prisma.experience.findMany({
    where: {
      utilisateur_id: etudiantId,
      type: 'stage',
      visibilite: true,
      deleted_at: null,
      OR: [
        { type_specifique: 'personnel' },
        {
          type_specifique: 'academique',
          stage: { validation: { statut: { in: ['valide', 'refuse'] } } },
        },
      ],
    },
    include: {
      stage: { include: { validation: true } },
    },
    orderBy: { date_experience: 'desc' },
  });

  return Promise.all(
    stages.map(async (stage) => {
      const competences = await getCompetencesByExperience(stage.experience_id);
      return {
        ...stage,
        competences,
      };
    })
  );
};

export const updateVisibiliteStageService = async (etudiantId, experienceId, visibilite) => {
  const experience = await prisma.experience.findFirst({
    where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'stage', deleted_at: null },
    include: {
      stage: { include: { validation: true } },
    },
  });

  if (!experience) throw new Error('Stage non trouvé');

  //si academique statut doit etre valide
  if (experience.type_specifique === 'academique') {
    const statut = experience.stage?.validation?.statut;
    if (statut !== 'valide' && statut !== 'refuse') {
      throw new Error('Vous ne pouvez changer la visibilité que si le stage académique n\'est pas encore traité par le professeur');
    }
  }

  //si personnel
  return prisma.experience.update({
    where: { experience_id: experienceId },
    data: { visibilite },
    select: { experience_id: true, visibilite: true },
  });
};

export const supprimerStageService = async (etudiantId, experienceId) => {
  const experience = await prisma.experience.findFirst({
    where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'stage', deleted_at: null },
    include: {
      stage: { include: { validation: true } },
    },
  });

  if (!experience) throw new Error('Stage non trouvé');

  if (experience.type_specifique === 'academique' && experience.stage?.validation?.statut === 'valide') {
    throw new Error('Ce stage est validé. Masquez-le en changeant sa visibilité au lieu de le supprimer.');
  }

  await supprimerPhoto(experience.photo, 'stages-photos');

  await prisma.experience.update({
    where: { experience_id: experienceId },
    data: { deleted_at: new Date() },
  });
};