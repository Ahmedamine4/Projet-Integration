import prisma from '../config/prisma.js';
import { creerNotification , TYPES_NOTIFICATION} from './notification.service.js';
 
const PAGE_SIZE = 10;
 
export const getDemandes = async (profId, { type, statut, page }) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const skip = (pageNum - 1) * PAGE_SIZE;
 
  const baseWhereStage = {
    utilisateur_id: profId,
    ...(statut && { statut }),
  };
 
  const baseWhereProjet = {
    utilisateur_id: profId,
    ...(statut && { statut }),
  };
 
  const baseWhereLettre = {
    prof_utilisateur_id: profId,
    ...(statut && { statut }),
  };
 
  const selectEtudiant = {
    utilisateur: { select: { nom: true, prenom: true } },
  };
 
  // Inclusion de utilisateur_id à l'intérieur de l'expérience pour les projets/stages
  const includeExperience = {
    select: {
      titre: true,
      utilisateur_id: true, // ID de l'étudiant créateur de l'expérience
      etudiant: { select: selectEtudiant },
    },
  };
 
  let rawStages = [];
  let rawProjets = [];
  let rawLettres = [];
 
  if (!type || type === 'stage') {
    rawStages = await prisma.valideStage.findMany({
      where: baseWhereStage,
      select: {
        statut: true,
        date_d_action: true,
        experience_id: true,
        commentaire: true,
        stage: { select: { experience: includeExperience } },
      },
      orderBy: { date_d_action: 'desc' },
    });
  }
 
  if (!type || type === 'projet') {
    rawProjets = await prisma.valideProjet.findMany({
      where: baseWhereProjet,
      select: {
        statut: true,
        date_d_action: true,
        experience_id: true,
        commentaire: true,
        projet: { select: { experience: includeExperience } },
      },
      orderBy: { date_d_action: 'desc' },
    });
  }
 
  if (!type || type === 'recommandation') {
    rawLettres = await prisma.lettresDeRecommendations.findMany({
      where: baseWhereLettre,
      select: {
        utilisateur_id: true,
        statut: true,
        date_lettre: true,
        objet: true,
        commentaire: true,
        utilisateur_id: true, // ID de l'étudiant directement dans la table de jointure
        etudiant: { select: selectEtudiant },
      },
      orderBy: { date_lettre: 'desc' },
    });
  }
 
  // Mapping avec inclusion systématique de l'utilisateur_id à la racine
  const stages = rawStages.map((item) => ({
    type: 'stage',
    experience_id: item.experience_id,
    utilisateur_id: item.stage?.experience?.utilisateur_id ?? null,
    titre: item.stage?.experience?.titre ?? null,
    statut: item.statut,
    commentaire: item.commentaire ?? null,
    date: item.date_d_action,
    etudiant: {
      nom: item.stage?.experience?.etudiant?.utilisateur?.nom ?? null,
      prenom: item.stage?.experience?.etudiant?.utilisateur?.prenom ?? null,
    },
  }));
 
  const projets = rawProjets.map((item) => ({
    type: 'projet',
    experience_id: item.experience_id,
    utilisateur_id: item.projet?.experience?.utilisateur_id ?? null,
    titre: item.projet?.experience?.titre ?? null,
    statut: item.statut,
    commentaire: item.commentaire ?? null,
    date: item.date_d_action,
    etudiant: {
      nom: item.projet?.experience?.etudiant?.utilisateur?.nom ?? null,
      prenom: item.projet?.experience?.etudiant?.utilisateur?.prenom ?? null,
    },
  }));
 
  const lettres = rawLettres.map((item) => ({
    type: 'recommandation',
    experience_id: null,
    utilisateur_id: item.utilisateur_id,
    titre: item.objet ?? null,
    statut: item.statut,
    commentaire: item.commentaire ?? null,
    date: item.date_lettre,
    etudiant: {
      nom: item.etudiant?.utilisateur?.nom ?? null,
      prenom: item.etudiant?.utilisateur?.prenom ?? null,
    },
  }));
 
  const all = [...stages, ...projets, ...lettres].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
 
  const total = all.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const data = all.slice(skip, skip + PAGE_SIZE);
 
  return {
    data,
    pagination: { page: pageNum, totalPages, total, pageSize: PAGE_SIZE },
  };
};

export const getStageById = async (profId, experienceId) => {
  const validation = await prisma.valideStage.findUnique({
    where: { experience_id: experienceId },
    include: {
      stage: {
        include: {
          experience: {
            include: {
              etudiant: { include: { utilisateur: true } },
              competence_dev: { include: { competence: true } },
            },
          },
        },
      },
    },
  });

  if (!validation) throw new Error('Stage non trouvé');
  if (validation.utilisateur_id !== profId) throw new Error('Accès refusé');

  return validation;
};

export const getProjetById = async (profId, experienceId) => {
  const validation = await prisma.valideProjet.findUnique({
    where: { experience_id: experienceId },
    include: {
      projet: {
        include: {
          experience: {
            include: {
              etudiant: { include: { utilisateur: true } },
              competence_dev: { include: { competence: true } },
            },
          },
        },
      },
    },
  });

  if (!validation) throw new Error('Projet non trouvé');
  if (validation.utilisateur_id !== profId) throw new Error('Accès refusé');

  return validation;
};

export const traiterValidationProjet = async (profId, experienceId, statut, commentaire) => {
  const validation = await prisma.valideProjet.findUnique({
    where: { experience_id: experienceId },
    include: { 
      projet: {
        include: {
          experience: {
            include: {
              etudiant: {
                include: { utilisateur: true }
              }
            }
          }
        }
      }
    },
  });

  if (!validation) throw new Error('Demande de validation non trouvée');
  if (validation.utilisateur_id !== profId) throw new Error('Accès refusé');
  if (validation.statut === 'valide' || validation.statut === 'refuse') throw new Error('Cette demande a déjà été traitée');

  // juste un commentaire, sans changer le statut
  if (!statut) {
    if (!commentaire?.trim()) throw new Error('Un commentaire est requis');

    const updated = await prisma.valideProjet.update({
      where: { experience_id: experienceId },
      data: { 
        commentaire, 
        date_d_action: new Date() 
      },
    });


    await creerNotification(
      validation.projet.experience.etudiant.utilisateur.utilisateur_id,
      `Votre professeur a laissé un commentaire sur votre projet "${validation.projet.experience.titre}".`,
      TYPES_NOTIFICATION.COMMENTAIRE_PROJET
    );

    return updated;
  }

  // valide ou refuse
  if (statut === 'refuse' && !commentaire?.trim()) throw new Error('Un commentaire est requis pour un refus');

  const updated = await prisma.valideProjet.update({
    where: { experience_id: experienceId },
    data: { statut, commentaire: commentaire ?? null, date_d_action: new Date() },
  });

  const msg = statut === 'valide'
    ? `Votre projet "${validation.projet.experience.titre}" a été validé par votre professeur.`
    : `Votre projet "${validation.projet.experience.titre}" a été refusé. Motif : ${commentaire}`;


  await creerNotification(
    validation.projet.experience.etudiant.utilisateur.utilisateur_id,
    msg,
    statut === 'valide'
      ? TYPES_NOTIFICATION.PROJET_VALIDE
      : TYPES_NOTIFICATION.PROJET_REFUSE
  );

  return updated;
};

export const traiterValidationStageProf = async (profId, experienceId, statut, commentaire) => {
  const validation = await prisma.valideStage.findUnique({
    where: { experience_id: experienceId },
    include: { 
      stage: {
        include: {
          experience: {
            include: {
              etudiant: {
                include: { utilisateur: true }
              }
            }
          }
        }
      }
    },
  });

  if (!validation) throw new Error('Demande de validation non trouvée');
  if (validation.utilisateur_id !== profId) throw new Error('Accès refusé');
  if (validation.statut === 'valide' || validation.statut === 'refuse') throw new Error('Cette demande a déjà été traitée');

  //juste un commentaire, sans changer le statut
  if (!statut) {
    if (!commentaire?.trim()) throw new Error('Un commentaire est requis');

    const updated = await prisma.valideStage.update({
      where: { experience_id: experienceId },
      data: { commentaire, date_d_action: new Date() },
    });


    await creerNotification(
      validation.stage.experience.etudiant.utilisateur.utilisateur_id,
      `Votre professeur a laissé un commentaire sur votre stage "${validation.stage.experience.titre}".`,
      TYPES_NOTIFICATION.COMMENTAIRE_STAGE
    );

    return updated;
  }

  //valide ou refuse
  if (statut === 'refuse' && !commentaire?.trim()) throw new Error('Un commentaire est requis pour un refus');

  const updated = await prisma.valideStage.update({
    where: { experience_id: experienceId },
    data: { statut, commentaire: commentaire ?? null, date_d_action: new Date() },
  });

  const msg = statut === 'valide'
    ? `Votre stage "${validation.stage.experience.titre}" a été validé par votre professeur.`
    : `Votre stage "${validation.stage.experience.titre}" a été refusé. Motif : ${commentaire}`;
  
  await creerNotification(
    validation.stage.experience.etudiant.utilisateur.utilisateur_id,
    msg,
    statut === 'valide'
      ? TYPES_NOTIFICATION.STAGE_VALIDE
      : TYPES_NOTIFICATION.STAGE_REFUSE
  );

  return updated;
};

export const getLettreById = async (profId, etudiantId) => {
  const lettre = await prisma.lettresDeRecommendations.findUnique({
    where: { utilisateur_id_prof_utilisateur_id: { utilisateur_id: etudiantId, prof_utilisateur_id: profId } },
    include: {
      etudiant: {
        include: {
          utilisateur: { select: { nom: true, prenom: true, email: true, photo: true, linkedin: true, github: true } },
          experiences: {
            where: { visibilite: true },
            select: { titre: true, type: true, date_experience: true, description: true },
            orderBy: { date_experience: 'desc' },
          },
        },
      },
    },
  });
 
  if (!lettre) throw new Error('Demande non trouvée');
  return lettre;
};
 
export const traiterLettre = async (profId, etudiantId, { statut, commentaire }, file) => {
  const lettre = await prisma.lettresDeRecommendations.findUnique({
    where: { utilisateur_id_prof_utilisateur_id: { utilisateur_id: etudiantId, prof_utilisateur_id: profId } },
    include: { etudiant: { include: { utilisateur: true } } },
  });
 
  if (!lettre) throw new Error('Demande non trouvée');
  if (lettre.statut === 'valide') throw new Error('Cette demande a déjà été traitée');
 
  // Cas 1 : commentaire seulement (statut reste en_attente)
  if (!statut) {
    if (!commentaire?.trim()) throw new Error('Un commentaire est requis');
 
    const updated = await prisma.lettresDeRecommendations.update({
      where: { utilisateur_id_prof_utilisateur_id: { utilisateur_id: etudiantId, prof_utilisateur_id: profId } },
      data: { commentaire },
    });
 

    await creerNotification(
      etudiantId,
      `Votre professeur a laissé un commentaire sur votre demande de lettre : "${lettre.objet}".`,
      TYPES_NOTIFICATION.COMMENTAIRE_RECOMMANDATION
    );

    return updated;
  }
 
  // Cas 2 : refus
  if (statut === 'refuse') {
    if (!commentaire?.trim()) throw new Error('Un commentaire est requis pour un refus');
 
    const updated = await prisma.lettresDeRecommendations.update({
      where: { utilisateur_id_prof_utilisateur_id: { utilisateur_id: etudiantId, prof_utilisateur_id: profId } },
      data: { statut: 'refuse', commentaire },
    });
 

    await creerNotification(
      etudiantId,
      `Votre demande de lettre de recommandation "${lettre.objet}" a été refusée. Motif : ${commentaire}`,
      TYPES_NOTIFICATION.RECOMMANDATION_REFUSEE
    );
 
    return updated;
  }
 
  // Cas 3 : validation avec fichier
  if (statut === 'valide') {
    if (!file) throw new Error('Un fichier PDF est requis pour valider');
 
    const updated = await prisma.lettresDeRecommendations.update({
      where: { utilisateur_id_prof_utilisateur_id: { utilisateur_id: etudiantId, prof_utilisateur_id: profId } },
      data: { statut: 'valide', fichier: `data:application/pdf;base64,${file.buffer.toString("base64")}`, commentaire: commentaire ?? null },
    });
 

    await creerNotification(
      etudiantId,
      `Votre lettre de recommandation "${lettre.objet}" a été validée et est disponible.`,
      TYPES_NOTIFICATION.RECOMMANDATION_VALIDEE
    );
 
    return updated;
  }
 
  throw new Error('Statut invalide');
};