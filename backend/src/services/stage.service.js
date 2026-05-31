import prisma from '../config/prisma.js';
import { supabase } from '../config/supabase.js';
import { creerNotification } from './notification.service.js';
import { lierCompetencesExperience, supprimerCompetencesDeveloppees } from './competence.helper.js';

//upload photo sur supabase et collection de url
export const uploadPhoto = async (file) => {
  const fileName = `${Date.now()}_${file.originalname}`;

  const { error } = await supabase.storage
    .from('stages-photos')
    .upload(fileName, file.buffer, { contentType: file.mimetype });

  if (error) throw new Error('Erreur upload photo : ' + error.message);

  const { data } = supabase.storage
    .from('stages-photos')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

export const creeStage = async (etudiantId, data, photoUrl) => {
  
    const stageExistant = await prisma.experience.findFirst({
        where: { utilisateur_id: etudiantId, type: 'stage', titre: data.titre },
      });
      if (stageExistant) throw new Error('Stage déjà existant');
    

    const debut = new Date(data.date_debut);
    const fin = new Date(data.date_fin);
    const diffMs = fin - debut;
    const duree = String(Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    const technologies = JSON.parse(data.technologies || '[]');
    const domaines = JSON.parse(data.domaines || '[]');

  return await prisma.$transaction(async (tx) => {
    const experience = await tx.experience.create({
      data: {
        titre: data.titre,
        date_experience: debut,
        visibilite: false,
        type: 'stage',
        description: data.description,
        type_specifique: data.is_academique === 'true' ? 'academique' : 'personnel',
        utilisateur_id: etudiantId,
        photo: photoUrl ?? null,
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
    
    const competencesTech = await lierCompetencesExperience(
      tx, experience.experience_id, etudiantId, technologies, 'technologie'
    );
    const competencesDomaines = await lierCompetencesExperience(
      tx, experience.experience_id, etudiantId, domaines, 'domaine'
    );

    //si stage est academique
    let validation = null;
    if (data.is_academique === 'true' && data.email_professeur) {

      const professeur = await tx.utilisateur.findUnique({
        where: { email: data.email_professeur },
        include: { professeur: true }
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
        }
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

    return { 
      experience, 
      stage, 
      competences: [...competencesTech, ...competencesDomaines],
      validation, 
    };
  });
};

export const getStagesByEtudiant = async (etudiantId) => {
  return prisma.experience.findMany({
    where: { utilisateur_id: etudiantId, type: 'stage' },
    include: {
      stage: { include: { validation: true } },
      competence_dev: { include: { competence: true } },
    },
    orderBy: { date_experience: 'desc' },
  });
};

export const editStage = async (etudiantId, experienceId, data, photoUrl) => {
  const stageExistant = await prisma.experience.findFirst({
    where: { utilisateur_id: etudiantId, type: 'stage', titre: data.titre, experience_id: { not: experienceId } },
  });
  if (stageExistant) {
    throw new Error('Stage déjà existant');
  }

  return await prisma.$transaction(async (tx) => {
    //verifier que le stage appartient vrai a l'etudiant
    const experience = await tx.experience.findFirst({
      where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'stage' },
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

    if (!experience) throw new Error('Stage not found');

    const debut = data.date_debut ? new Date(data.date_debut) : experience.date_experience;
    const fin = data.date_fin ? new Date(data.date_fin) : experience.stage.date_fin;
    const duree = (data.date_debut || data.date_fin) ? String(Math.ceil((fin - debut) / (1000 * 60 * 60 * 24))) : experience.stage.duree;

    // editer experience et stage
    await tx.experience.update({
      where: { experience_id: experienceId },
      data: {
        titre: data.titre ?? experience.titre,
        date_experience: debut,
        description: data.description ?? experience.description,
        visibilite: false, //invisible
        type_specifique: data.is_academique ? (data.is_academique === 'true' ? 'academique' : 'personnel') : experience.type_specifique,
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

    //update les competences
    if (data.technologies !== undefined || data.domaines !== undefined) {
      const technologies = JSON.parse(data.technologies || '[]');
      const domaines = JSON.parse(data.domaines || '[]');

      // Supprimer les anciennes liaisons de cette expérience
      await supprimerCompetencesDeveloppees(tx, experienceId, etudiantId);

      // Recréer avec la logique de niveau
      await lierCompetencesExperience(tx, experienceId, etudiantId, technologies, 'technologie');
      await lierCompetencesExperience(tx, experienceId, etudiantId, domaines, 'domaine');
    }

    //si deja le stage est dans la table du valideStage
    if (experience.stage.validation) {
      //si le stage est valide ou refuse on ne peut plus le modifier
      if (experience.stage.validation.statut !== 'en_attente') {
        throw new Error('Ce stage a déjà été traité par le professeur, vous ne pouvez plus le modifier');
      }

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
        `L'étudiant ${etudiant.prenom} ${etudiant.nom} a modifié son stage "${data.titre ?? experience.titre}". Il demande une validation pour un stage.`,
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

    return tx.experience.findUnique({
      where: { experience_id: experienceId },
      include: {
        stage: { include: { validation: true } },
        competence_dev: { include: { competence: true } },
      },
    });
  });
};

export const getStagesVisiblesByEtudiant = async (etudiantId) => {
  return prisma.experience.findMany({
    where: { utilisateur_id: etudiantId, type: 'stage', visibilite: true },
    include: {
      stage: { include: { validation: true } },
      competence_dev: { include: { competence: true } },
    },
    orderBy: { date_experience: 'desc' },
  });
};

export const updateVisibiliteStageService = async (etudiantId, experienceId, visibilite) => {
  const experience = await prisma.experience.findFirst({
    where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'stage' },
    include: {
      stage: { include: { validation: true } },
    },
  });

  if (!experience) throw new Error('Stage non trouvé');

  //si academique statut doit etre valide
  if (experience.type_specifique === 'academique') {
    const statut = experience.stage?.validation?.statut;
    if (statut !== 'valide') {
      throw new Error('Vous ne pouvez changer la visibilité que si le stage académique est validé');
    }
  }
  
  //si personnel
  return prisma.experience.update({
    where: { experience_id: experienceId },
    data: { visibilite },
    select: { experience_id: true, visibilite: true },
  });
};