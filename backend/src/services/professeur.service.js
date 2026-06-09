import prisma from '../config/prisma.js';
import { creerNotification } from './notification.service.js';

<<<<<<< Updated upstream

// validation

export const getDemandes = async (profId) => {
  const stages = await prisma.valideStage.findMany({
    where: {
      utilisateur_id: profId,
      statut: { in: ['en_attente', 'valide', 'refuse'] },
    },
=======
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

  const includeExperience = {
>>>>>>> Stashed changes
    select: {
      statut: true,
      date_d_action: true,
      experience_id: true,
      experience: {
        select: {
          titre: true,
          etudiant: {
            include: {
              utilisateur: { select: { nom: true, prenom: true } },
            },
          },
        },
      },
    },
<<<<<<< Updated upstream
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
      experience: {
        select: {
          titre: true,
          etudiant: {
            include: {
              utilisateur: { select: { nom: true, prenom: true } },
            },
          },
        },
      },
    },
    orderBy: { date_d_action: 'desc' },
  });

  return [...stages, ...projets].map((item) => ({
=======
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
        experience: includeExperience,
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
        experience: includeExperience,
      },
      orderBy: { date_d_action: 'desc' },
    });
  }

  if (!type || type === 'recommandation') {
    rawLettres = await prisma.lettresDeRecommendations.findMany({
      where: baseWhereLettre,
      select: {
        statut: true,
        date_lettre: true,
        objet: true,
        commentaire: true,
        etudiant: { include: selectEtudiant },
      },
      orderBy: { date_lettre: 'desc' },
    });
  }

  const stages = rawStages.map((item) => ({
    type: 'stage',
>>>>>>> Stashed changes
    experience_id: item.experience_id,
    titre: item.experience?.titre,
    statut: item.statut,
    date_d_action: item.date_d_action,
    etudiant: {
      nom: item.experience?.etudiant?.utilisateur?.nom,
      prenom: item.experience?.etudiant?.utilisateur?.prenom,
    },
  }));
<<<<<<< Updated upstream
=======

  const projets = rawProjets.map((item) => ({
    type: 'projet',
    experience_id: item.experience_id,
    titre: item.experience?.titre ?? null,
    statut: item.statut,
    commentaire: item.commentaire ?? null,
    date: item.date_d_action,
    etudiant: {
      nom: item.experience?.etudiant?.utilisateur?.nom ?? null,
      prenom: item.experience?.etudiant?.utilisateur?.prenom ?? null,
    },
  }));

  const lettres = rawLettres.map((item) => ({
    type: 'recommandation',
    experience_id: null,
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
>>>>>>> Stashed changes
};

export const getStagesProf = async (profId, statut, commente) => {
  const stages = await prisma.valideStage.findMany({
    where: {
      utilisateur_id: profId,
      statut: statut
        ? statut
        : { in: ['en_attente', 'valide', 'refuse'] },
      ...(commente === true && { commentaire: { not: null } }),
      ...(commente === false && { commentaire: null }),
    },
    select: {
      statut: true,
      experience_id: true,
      date_d_action: true,
      experience: {
        select: {
          titre: true,
          etudiant: {
            include: {
              utilisateur: { select: { nom: true, prenom: true } },
            },
          },
        },
      },
    },
    orderBy: { date_d_action: 'desc' },
  });

  return stages.map((item) => ({
    experience_id: item.experience_id,
    titre: item.experience?.titre ?? null,
    statut: item.statut,
    date_d_action: item.date_d_action,
    etudiant: {
      nom: item.experience?.etudiant?.utilisateur?.nom ?? null,
      prenom: item.experience?.etudiant?.utilisateur?.prenom ?? null,
    },
  }));
};

export const getProjetsProf = async (profId, statut, commente) => {
  const projets = await prisma.valideProjet.findMany({
    where: {
      utilisateur_id: profId,
      statut: statut
        ? statut
        : { in: ['en_attente', 'valide', 'refuse'] },
      ...(commente === true && { commentaire: { not: null } }),
      ...(commente === false && { commentaire: null }),
    },
    select: {
      statut: true,
      experience_id: true,
      date_d_action: true,
      experience: {
        select: {
          titre: true,
          etudiant: {
            include: {
              utilisateur: { select: { nom: true, prenom: true } },
            },
          },
        },
      },
    },
    orderBy: { date_d_action: 'desc' },
  });

  return projets.map((item) => ({
    experience_id: item.experience_id,
    titre: item.experience?.titre ?? null,
    statut: item.statut,
    date_d_action: item.date_d_action,
    etudiant: {
      nom: item.experience?.etudiant?.utilisateur?.nom ?? null,
      prenom: item.experience?.etudiant?.utilisateur?.prenom ?? null,
    },
  }));
};

export const getStageById = async (profId, experienceId) => {
  const stage = await prisma.valideStage.findUnique({
    where: { experience_id: experienceId },
    include: {
      experience: {
        include: {
          etudiant: {
            include: { utilisateur: true },
          },
          competence_dev: {
            include: { competence: true },
          },
        },
      },
      stage: true,
    },
  });

  if (!stage) throw new Error('Stage non trouvÃ©');
  if (stage.utilisateur_id !== profId) throw new Error('AccÃ¨s refusÃ©');

  return stage;
};

export const getProjetById = async (profId, experienceId) => {
  const projet = await prisma.valideProjet.findUnique({
    where: { experience_id: experienceId },
    include: {
      experience: {
        include: {
          etudiant: {
            include: { utilisateur: true },
          },
          competence_dev: {
            include: { competence: true },
          },
        },
      },
      projet: true,
    },
  });

  if (!projet) throw new Error('Projet non trouvÃ©');
  if (projet.utilisateur_id !== profId) throw new Error('AccÃ¨s refusÃ©');

  return projet;
};

export const traiterValidationProjet = async (profId, experienceId, statut, commentaire) => {
  const validation = await prisma.valideProjet.findUnique({
    where: { experience_id: experienceId },
    include: {
      experience: {
        include: {
          etudiant: {
            include: { utilisateur: true }
          }
        }
      }
    },
  });

  if (!validation) throw new Error('Demande de validation non trouvÃ©e');
  if (validation.utilisateur_id !== profId) throw new Error('AccÃ¨s refusÃ©');
  if (validation.statut === 'valide' || validation.statut === 'refuse') throw new Error('Cette demande a dÃ©jÃ  Ã©tÃ© traitÃ©e');

  if (!statut) {
    if (!commentaire?.trim()) throw new Error('Un commentaire est requis');

    const updated = await prisma.valideProjet.update({
      where: { experience_id: experienceId },
      data: {
        commentaire,
        date_d_action: new Date()
      },
<<<<<<< Updated upstream
=======
    });
    const professeur = await prisma.utilisateur.findUnique({
      where: { utilisateur_id: profId },
      select: { nom: true, prenom: true },
>>>>>>> Stashed changes
    });

    await creerNotification(
      validation.experience.etudiant.utilisateur.utilisateur_id,
<<<<<<< Updated upstream
      `Votre professeur a laissé un commentaire sur votre projet "${validation.experience.titre}".`,
=======
      `Votre professeur ${professeur.prenom} ${professeur.nom} a laissÃ© un commentaire sur votre projet "${validation.experience.titre}".`,
>>>>>>> Stashed changes
      'commentaire_projet',
      { utilisateurSourceId: profId }
    );

    return updated;
  }

  if (statut === 'refuse' && !commentaire?.trim()) throw new Error('Un commentaire est requis pour un refus');

  const updated = await prisma.valideProjet.update({
    where: { experience_id: experienceId },
    data: { statut, commentaire: commentaire ?? null, date_d_action: new Date() },
  });

  const msg = statut === 'valide'
    ? `Votre projet "${validation.experience.titre}" a Ã©tÃ© validÃ© par votre professeur.`
    : `Votre projet "${validation.experience.titre}" a Ã©tÃ© refusÃ©. Motif : ${commentaire}`;

  await creerNotification(
    validation.experience.etudiant.utilisateur.utilisateur_id,
    msg,
<<<<<<< Updated upstream
    'validation_projet',
=======
    statut === 'valide' ? 'projet_valide' : 'projet_refuse',
>>>>>>> Stashed changes
    { utilisateurSourceId: profId }
  );

  return updated;
};

export const traiterValidationStageProf = async (profId, experienceId, statut, commentaire) => {
  const validation = await prisma.valideStage.findUnique({
    where: { experience_id: experienceId },
    include: {
      experience: {
        include: {
          etudiant: {
            include: { utilisateur: true }
          }
        }
      }
    },
  });

  if (!validation) throw new Error('Demande de validation non trouvÃ©e');
  if (validation.utilisateur_id !== profId) throw new Error('AccÃ¨s refusÃ©');
  if (validation.statut === 'valide' || validation.statut === 'refuse') throw new Error('Cette demande a dÃ©jÃ  Ã©tÃ© traitÃ©e');

  if (!statut) {
    if (!commentaire?.trim()) throw new Error('Un commentaire est requis');

    const updated = await prisma.valideStage.update({
      where: { experience_id: experienceId },
      data: { commentaire, date_d_action: new Date() },
    });
    const professeur = await prisma.utilisateur.findUnique({
      where: { utilisateur_id: profId },
      select: { nom: true, prenom: true },
    });

    await creerNotification(
      validation.experience.etudiant.utilisateur.utilisateur_id,
<<<<<<< Updated upstream
      `Votre professeur a laissé un commentaire sur votre stage "${validation.experience.titre}".`,
=======
      `Votre professeur ${professeur.prenom} ${professeur.nom} a laissÃ© un commentaire sur votre stage "${validation.experience.titre}".`,
>>>>>>> Stashed changes
      'commentaire_stage',
      { utilisateurSourceId: profId }
    );

    return updated;
  }

  if (statut === 'refuse' && !commentaire?.trim()) throw new Error('Un commentaire est requis pour un refus');

  const updated = await prisma.valideStage.update({
    where: { experience_id: experienceId },
    data: { statut, commentaire: commentaire ?? null, date_d_action: new Date() },
  });

  const msg = statut === 'valide'
<<<<<<< Updated upstream
    ? `Votre stage "${validation.experience.titre}" a été validé par votre professeur.`
    : `Votre stage "${validation.experience.titre}" a été refusé. Motif : ${commentaire}`;
=======
    ? `Votre stage "${validation.experience.titre}" a Ã©tÃ© validÃ© par votre professeur.`
    : `Votre stage "${validation.experience.titre}" a Ã©tÃ© refusÃ©. Motif : ${commentaire}`;
>>>>>>> Stashed changes

  await creerNotification(
    validation.experience.etudiant.utilisateur.utilisateur_id,
    msg,
<<<<<<< Updated upstream
    'validation_stage',
=======
    statut === 'valide' ? 'stage_valide' : 'stage_refuse',
>>>>>>> Stashed changes
    { utilisateurSourceId: profId }
  );

  return updated;
<<<<<<< Updated upstream
};
=======
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

  if (!lettre) throw new Error('Demande non trouvÃ©e');
  return lettre;
};


export const traiterLettre = async (profId, etudiantId, { statut, commentaire }, file) => {
  const lettre = await prisma.lettresDeRecommendations.findUnique({
    where: { utilisateur_id_prof_utilisateur_id: { utilisateur_id: etudiantId, prof_utilisateur_id: profId } },
    include: { etudiant: { include: { utilisateur: true } } },
  });

  if (!lettre) throw new Error('Demande non trouvÃ©e');
  if (lettre.statut === 'valide') throw new Error('Cette demande a dÃ©jÃ  Ã©tÃ© traitÃ©e');

  const professeur = await prisma.utilisateur.findUnique({
    where: { utilisateur_id: profId },
    select: {
      nom: true,
      prenom: true,
    },
  });

  if (!statut) {
    if (!commentaire?.trim()) throw new Error('Un commentaire est requis');

    const updated = await prisma.lettresDeRecommendations.update({
      where: { utilisateur_id_prof_utilisateur_id: { utilisateur_id: etudiantId, prof_utilisateur_id: profId } },
      data: { commentaire },
    });

    await creerNotification(
      lettre.etudiant.utilisateur.utilisateur_id,
      `Le professeur ${professeur.prenom} ${professeur.nom} a ajoutÃ© un commentaire sur votre lettre de recommandation "${lettre.objet}".`,
      'commentaire_recommandation',
      { utilisateurSourceId: profId }
    );


    return updated;
  }

  if (statut === 'refuse') {
    if (!commentaire?.trim()) throw new Error('Un commentaire est requis pour un refus');

    const updated = await prisma.lettresDeRecommendations.update({
      where: { utilisateur_id_prof_utilisateur_id: { utilisateur_id: etudiantId, prof_utilisateur_id: profId } },
      data: { statut: 'refuse', commentaire },
    });

    await creerNotification(
      lettre.etudiant.utilisateur.utilisateur_id,
      `Le professeur ${professeur.prenom} ${professeur.nom} a refusÃ© votre demande de lettre de recommandation "${lettre.objet}". Motif : ${commentaire}`,
      'recommandation_refusee',
      { utilisateurSourceId: profId }
    );

    return updated;
  }

  if (statut === 'valide') {
    if (!file) throw new Error('Un fichier PDF est requis pour valider');


    const updated = await prisma.lettresDeRecommendations.update({
      where: { utilisateur_id_prof_utilisateur_id: { utilisateur_id: etudiantId, prof_utilisateur_id: profId } },
      data: { statut: 'valide', fichier: `data:application/pdf;base64,${file.buffer.toString("base64")}`, commentaire: commentaire ?? null },
    });

    await creerNotification(
      lettre.etudiant.utilisateur.utilisateur_id,
      `Le professeur ${professeur.prenom} ${professeur.nom} a validÃ© votre demande de lettre de recommandation "${lettre.objet}".`,
      'recommandation_validee',
      { utilisateurSourceId: profId }
    );

    return updated;
  }

  throw new Error('Statut invalide');
};
>>>>>>> Stashed changes
