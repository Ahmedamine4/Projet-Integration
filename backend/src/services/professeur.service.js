import prisma from '../config/prisma.js';
import { creerNotification } from './notification.service.js';
 
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
    select: {
      titre: true,
      etudiant: { include: selectEtudiant },
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
};


export const getStageById = async (profId, experienceId) => {
  const stage = await prisma.valideStage.findUnique({
    where: { experience_id: experienceId },
    include: {
      experience: {
        include: {
          etudiant: { include: { utilisateur: true } },
          competence_dev: { include: { competence: true } },
        },
      },
      stage: true,
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
      experience: {
        include: {
          etudiant: { include: { utilisateur: true } },
          competence_dev: { include: { competence: true } },
        },
      },
      projet: true,
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
      experience: {
        include: {
          etudiant: {
            include: { utilisateur: true }
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
        date_d_action: new Date() },
    });

    await creerNotification(
      validation.experience.etudiant.utilisateur.utilisateur_id,
      `Votre professeur a laissé un commentaire sur votre projet "${validation.experience.titre}".`,
      'commentaire_projet'
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
    ? `Votre projet "${validation.experience.titre}" a été validé par votre professeur.`
    : `Votre projet "${validation.experience.titre}" a été refusé. Motif : ${commentaire}`;

  await creerNotification(
    validation.experience.etudiant.utilisateur.utilisateur_id, 
    msg, 
    'validation_projet'
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
      validation.experience.etudiant.utilisateur.utilisateur_id,
      `Votre professeur a laissé un commentaire sur votre stage "${validation.experience.titre}".`,
      'commentaire_stage'
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
    ? `Votre stage "${validation.experience.titre}" a été validé par votre professeur.`
    : `Votre stage "${validation.experience.titre}" a été refusé. Motif : ${commentaire}`;
  
  await creerNotification(
    validation.experience.etudiant.utilisateur.utilisateur_id, 
    msg, 
    'validation_stage'
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
      'commentaire_recommandation'
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
      'refus_recommandation'
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
      `Votre lettre de recommandation "${lettre.objet}" est disponible.`,
      'validation_recommandation'
    );
 
    return updated;
  }
 
  throw new Error('Statut invalide');
};