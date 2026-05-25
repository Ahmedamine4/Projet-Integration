import prisma from '../config/prisma.js';
import { creerNotification } from './notification.service.js';


// validation

export const getDemandes = async (profId) => {
  const stages = await prisma.valideStage.findMany({
    where: {
      utilisateur_id: profId,
      statut: { in: ['en_attente', 'valide', 'refuse'] },
    },
    select: {
      statut: true,
      date_d_action: true,
      experience_id: true,
      stage: { // On passe par stage
        select: {
          experience: { // Puis par experience
            select: {
              titre: true,
              etudiant: {
                select: {
                  utilisateur: { select: { nom: true, prenom: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { date_d_action: 'desc' },
  });

  const projets = await prisma.valideProjet.findMany({
    where: {
      utilisateur_id: profId,
      statut: { in: ['en_attente', 'valide', 'refuse'] },
    },
    select: {
      statut: true,
      date_d_action: true,
      experience_id: true,
      projet: { // On passe par 'projet' pour atteindre 'experience'
        select: {
          experience: {
            select: {
              titre: true,
              etudiant: {
                select: {
                  utilisateur: { select: { nom: true, prenom: true } }
                }
              }
            }
          }
        }
      }
    },
    orderBy: { date_d_action: 'desc' },
  });

  const formattedProjets = projets.map((item) => ({
    experience_id: item.experience_id,
    titre: item.projet?.experience?.titre,
    statut: item.statut,
    date_d_action: item.date_d_action,
    etudiant: {
      nom: item.projet?.experience?.etudiant?.utilisateur?.nom,
      prenom: item.projet?.experience?.etudiant?.utilisateur?.prenom,
    },
  }));

  // fusionne avec les stages (il faudra formater stages pareil)
  return [...stages, ...formattedProjets]; 
};

export const getStagesProf = async (profId, statut, commente) => {
  const stages = await prisma.valideStage.findMany({
    where: {
      utilisateur_id: profId,
      statut: statut ? statut : { in: ['en_attente', 'valide', 'refuse'] },
      ...(commente === true && { commentaire: { not: null } }),
      ...(commente === false && { commentaire: null }),
    },
    select: {
      statut: true,
      experience_id: true,
      date_d_action: true,
      stage: {
        select: {
          experience: {
            select: {
              titre: true,
              etudiant: {
                select: { utilisateur: { select: { nom: true, prenom: true } } },
              },
            },
          },
        },
      },
    },
    orderBy: { date_d_action: 'desc' },
  });

  return stages.map((item) => ({
    experience_id: item.experience_id,
    titre: item.stage?.experience?.titre ?? null,
    statut: item.statut,
    date_d_action: item.date_d_action,
    etudiant: {
      nom: item.stage?.experience?.etudiant?.utilisateur?.nom ?? null,
      prenom: item.stage?.experience?.etudiant?.utilisateur?.prenom ?? null,
    },
  }));
};


export const getProjetsProf = async (profId, statut, commente) => {
  const projets = await prisma.valideProjet.findMany({
    where: {
      utilisateur_id: profId,
      statut: statut ? statut : { in: ['en_attente', 'valide', 'refuse'] },
      ...(commente === true  && { commentaire: { not: null } }),
      ...(commente === false && { commentaire: null }),
    },
    select: {
      statut: true,
      experience_id: true,
      date_d_action: true,
      projet: {
        select: {
          experience: {
            select: {
              titre: true,
              etudiant: {
                select: {
                  utilisateur: { select: { nom: true, prenom: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { date_d_action: 'desc' },
  });

  return projets.map((item) => ({
    experience_id: item.experience_id,
    titre: item.projet?.experience?.titre ?? null,
    statut: item.statut,
    date_d_action: item.date_d_action,
    etudiant: {
      nom: item.projet?.experience?.etudiant?.utilisateur?.nom ?? null,
      prenom: item.projet?.experience?.etudiant?.utilisateur?.prenom ?? null,
    },
  }));
};

export const getStageById = async (profId, experienceId) => {
  const stage = await prisma.valideStage.findUnique({
    where: { experience_id: experienceId },
    include: {
      stage: { // On passe par stage pour atteindre experience
        include: {
          experience: {
            include: {
              etudiant: { include: { utilisateur: true } }, // Pour avoir les infos du student
              documentations: true,
              competences: true,
            },
          },
        },
      },
    },
  });

  if (!stage) throw new Error('Stage non trouvé');
  if (stage.utilisateur_id !== profId) throw new Error('Accès refusé');

  return stage;
};


export const getProjetById = async (profId, experienceId) => {
  const projet = await prisma.valideProjet.findUnique({
    where: { experience_id: experienceId },
    include: {
      projet: { // On passe par projet pour atteindre experience
        include: {
          experience: {
            include: {
              etudiant: { include: { utilisateur: true } },
              documentations: true,
              competences: true,
            },
          },
        },
      },
    },
  });

  if (!projet) throw new Error('Projet non trouvé');
  if (projet.utilisateur_id !== profId) throw new Error('Accès refusé');

  return projet;
};



export const traiterValidationProjet = async (profId, experienceId, statut, commentaire) => {
  const validation = await prisma.valideProjet.findUnique({
    where: { experience_id: experienceId },
    include: { 
      projet: { // Il faut inclure 'projet' d'abord
        include: { experience: true } 
      } 
    },
  });

  if (!validation) throw new Error('Demande de validation non trouvée');
  if (validation.utilisateur_id !== profId) throw new Error('Accès refusé');
  if (validation.statut === 'valide' || validation.statut === 'refuse') throw new Error('Cette demande a déjà été traitée');

  // Utilise validation.projet.experience au lieu de validation.experience
  const experience = validation.projet.experience;

  if (!statut) {
    if (!commentaire?.trim()) throw new Error('Un commentaire est requis');

    const updated = await prisma.valideProjet.update({
      where: { experience_id: experienceId },
      data: { commentaire, date_d_action: new Date() },
    });

    await creerNotification(
      experience.utilisateur_id,
      `Votre professeur a laissé un commentaire sur votre projet "${experience.titre}".`,
      'commentaire_projet'
    );

    return updated;
  }

  if (statut === 'refuse' && !commentaire?.trim()) throw new Error('Un commentaire est requis pour un refus');

  const updated = await prisma.valideProjet.update({
    where: { experience_id: experienceId },
    data: { statut, commentaire: commentaire ?? null, date_d_action: new Date() },
  });

  const msg = statut === 'valide'
    ? `Votre projet "${experience.titre}" a été validé par votre professeur.`
    : `Votre projet "${experience.titre}" a été refusé. Motif : ${commentaire}`;
  
  await creerNotification(experience.utilisateur_id, msg, 'validation_projet');

  return updated;
};

export const traiterValidationStageProf = async (profId, experienceId, statut, commentaire) => {
  const validation = await prisma.valideStage.findUnique({
    where: { experience_id: experienceId },
    include: { 
      stage: { // Il faut inclure 'stage' d'abord
        include: { experience: true } 
      } 
    },
  });

  if (!validation) throw new Error('Demande de validation non trouvée');
  if (validation.utilisateur_id !== profId) throw new Error('Accès refusé');
  if (validation.statut === 'valide' || validation.statut === 'refuse') throw new Error('Cette demande a déjà été traitée');

  // Utilise validation.stage.experience au lieu de validation.experience
  const experience = validation.stage.experience;

  if (!statut) {
    if (!commentaire?.trim()) throw new Error('Un commentaire est requis');

    const updated = await prisma.valideStage.update({
      where: { experience_id: experienceId },
      data: { commentaire, date_d_action: new Date() },
    });

    await creerNotification(
      experience.utilisateur_id,
      `Votre professeur a laissé un commentaire sur votre stage "${experience.titre}".`,
      'commentaire_stage'
    );

    return updated;
  }

  if (statut === 'refuse' && !commentaire?.trim()) throw new Error('Un commentaire est requis pour un refus');

  const updated = await prisma.valideStage.update({
    where: { experience_id: experienceId },
    data: { statut, commentaire: commentaire ?? null, date_d_action: new Date() },
  });

  const msg = statut === 'valide'
    ? `Votre stage "${experience.titre}" a été validé par votre professeur.`
    : `Votre stage "${experience.titre}" a été refusé. Motif : ${commentaire}`;
    
  await creerNotification(experience.utilisateur_id, msg, 'validation_stage');

  return updated;
};