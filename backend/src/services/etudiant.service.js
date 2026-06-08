import prisma from '../config/prisma.js';

const PAGE_SIZE = 10;



export const getDemandesEtudiant = async (etudiantId, { type, statut, page }) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const skip = (pageNum - 1) * PAGE_SIZE;

  const whereExperience = { utilisateur_id: etudiantId };
  const filtreStatut = statut ? { statut } : {};

  let rawStages = [];
  let rawProjets = [];
  let rawActivites = [];
  let rawLettres = [];

  if (!type || type === 'stage') {
    rawStages = await prisma.valideStage.findMany({
      where: {
        ...filtreStatut,
        experience: { ...whereExperience },
      },
      select: {
        statut: true,
        date_d_action: true,
        experience_id: true,
        commentaire: true,
        experience: { select: { titre: true } },
        professeur: {
          select: { utilisateur: { select: { nom: true, prenom: true } } },
        },
      },
      orderBy: { date_d_action: 'desc' },
    });
  }

  if (!type || type === 'projet') {
    rawProjets = await prisma.valideProjet.findMany({
      where: {
        ...filtreStatut,
        experience: { ...whereExperience },
      },
      select: {
        statut: true,
        date_d_action: true,
        experience_id: true,
        commentaire: true,
        experience: { select: { titre: true } },
        professeur: {
          select: { utilisateur: { select: { nom: true, prenom: true } } },
        },
      },
      orderBy: { date_d_action: 'desc' },
    });
  }

  if (!type || type === 'activite') {
    rawActivites = await prisma.valideActivite.findMany({
      where: {
        ...filtreStatut,
        activite: { experience: { ...whereExperience } },
      },
      select: {
        statut: true,
        date_d_action: true,
        experience_id: true,
        commentaire: true,
        activite: { select: { experience: { select: { titre: true } } } },
        institution: { select: { nom: true } },
      },
      orderBy: { date_d_action: 'desc' },
    });
  }

  if (!type || type === 'recommandation') {
    rawLettres = await prisma.lettresDeRecommendations.findMany({
      where: {
        utilisateur_id: etudiantId,
        ...filtreStatut,
      },
      select: {
        statut: true,
        date_lettre: true,
        objet: true,
        commentaire: true,
        fichier: true,
        professeur: {
          select: { utilisateur: { select: { nom: true, prenom: true } } },
        },
      },
      orderBy: { date_lettre: 'desc' },
    });
  }

  // Normaliser
  const stages = rawStages.map((i) => ({
    type: 'stage',
    experience_id: i.experience_id,
    titre: i.experience?.titre ?? null,
    statut: i.statut,
    commentaire: i.commentaire ?? null,
    date: i.date_d_action,
    traite_par: {
      nom: i.professeur?.utilisateur?.nom ?? null,
      prenom: i.professeur?.utilisateur?.prenom ?? null,
      role: 'professeur',
    },
  }));

  const projets = rawProjets.map((i) => ({
    type: 'projet',
    experience_id: i.experience_id,
    titre: i.experience?.titre ?? null,
    statut: i.statut,
    commentaire: i.commentaire ?? null,
    date: i.date_d_action,
    traite_par: {
      nom: i.professeur?.utilisateur?.nom ?? null,
      prenom: i.professeur?.utilisateur?.prenom ?? null,
      role: 'professeur',
    },
  }));

  const activites = rawActivites.map((i) => ({
    type: 'activite',
    experience_id: i.experience_id,
    titre: i.activite?.experience?.titre ?? null,
    statut: i.statut,
    commentaire: i.commentaire ?? null,
    date: i.date_d_action,
    traite_par: {
      nom: i.institution?.nom ?? null,
      prenom: null,
      role: 'institution',
    },
  }));

  const lettres = rawLettres.map((i) => ({
    type: 'recommandation',
    experience_id: null,
    titre: i.objet ?? null,
    statut: i.statut,
    commentaire: i.commentaire ?? null,
    fichier: i.fichier ?? null,
    date: i.date_lettre,
    traite_par: {
      nom: i.professeur?.utilisateur?.nom ?? null,
      prenom: i.professeur?.utilisateur?.prenom ?? null,
      role: 'professeur',
    },
  }));

  const all = [...stages, ...projets, ...activites, ...lettres].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const total = all.length;
  const data = all.slice(skip, skip + PAGE_SIZE);

  return {
    data,
    pagination: { page: pageNum, totalPages: Math.ceil(total / PAGE_SIZE), total, pageSize: PAGE_SIZE },
  };
};