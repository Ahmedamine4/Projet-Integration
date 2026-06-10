import prisma from '../config/prisma.js';


export const creerRecommandation = async (professionnelId, portfolioId, texte) => {
  
  const portfolio = await prisma.portfolio.findUnique({
    where: { portfolio_id: portfolioId },
  });
  if (!portfolio) throw new Error('Portfolio non trouvé');

  
  const auteur = await prisma.utilisateur.findUnique({
    where: { utilisateur_id: professionnelId },
  });
  if (!auteur) throw new Error('Utilisateur non trouvé');
  if (auteur.role !== 'professionnel' && auteur.role !== 'professeur') {
    throw new Error('Accès refusé');
  }

  const existante = await prisma.interaction.findFirst({
    where: {
      utilisateur_id: professionnelId,
      portfolio_id: portfolioId,
      type: 'recommandation',
    },
  });
  if (existante) throw new Error('Vous avez déjà laissé une recommandation sur ce portfolio');

  return prisma.interaction.create({
    data: {
      utilisateur_id: professionnelId,
      portfolio_id: portfolioId,
      type: 'recommandation',
      texte,
      visibilite: false,
      date_interaction: new Date(),
    },
    include: {
      utilisateur: {
        select: { nom: true, prenom: true, email: true },
      },
    },
  });
};


export const updateVisibiliteRecommandation = async (etudiantId, interactionId, visibilite) => {
  // Vérifier que la recommandation appartient au portfolio de cet étudiant
  const interaction = await prisma.interaction.findUnique({
    where: { interaction_id: interactionId },
    include: { portfolio: true },
  });

  if (!interaction) throw new Error('Recommandation non trouvée');
  if (interaction.type !== 'recommandation') throw new Error('Cette interaction n\'est pas une recommandation');
  if (interaction.portfolio?.utilisateur_id !== etudiantId) throw new Error('Accès refusé');

  return prisma.interaction.update({
    where: { interaction_id: interactionId },
    data: { visibilite },
    select: { interaction_id: true, visibilite: true },
  });
};


export const getAllRecommandations = async (etudiantId) => {
  const portfolio = await prisma.portfolio.findUnique({
    where: { utilisateur_id: etudiantId },
    select: { portfolio_id: true },
  });
  if (!portfolio) return [];

  return prisma.interaction.findMany({
    where: {
      portfolio_id: portfolio.portfolio_id,
      type: 'recommandation',
    },
    include: {
      utilisateur: {
        select: { nom: true, prenom: true, email: true },
        include: {
          professionnel: { select: { entreprise: true, poste: true } },
        },
      },
    },
    orderBy: { date_interaction: 'desc' },
  });
};


export const getRecommandationsVisibles = async (etudiantId) => {
  const portfolio = await prisma.portfolio.findUnique({
    where: { utilisateur_id: etudiantId },
    select: { portfolio_id: true },
  });
  if (!portfolio) return [];

  return prisma.interaction.findMany({
    where: {
      portfolio_id: portfolio.portfolio_id,
      type: 'recommandation',
      visibilite: true,
    },
    include: {
      utilisateur: {
        select: { nom: true, prenom: true, email: true },
        include: {
          professionnel: { select: { entreprise: true, poste: true } },
        },
      },
    },
    orderBy: { date_interaction: 'desc' },
  });
};