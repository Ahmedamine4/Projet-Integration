import {getFeedTechnologiesDomaines, getFeedOffres, getFeedSuggestions, getFeedExperiences, envoyerDemande} from '../services/feed.service.js';

export const getFeedTechnologiesAndDomaines = async (req, res) => {
  try {
    const result = await getFeedTechnologiesDomaines();
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur getFeedTechnologiesAndDomaines:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getOffresFeed = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { page, limit } = req.query;
    const result = await getFeedOffres(etudiantId, { page, limit });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Erreur getOffresFeed:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
 
export const getSuggestionsFeed = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { page, limit } = req.query;
    const result = await getFeedSuggestions(etudiantId, { page, limit });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Erreur getSuggestionsFeed:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
 
export const getExperiencesFeed = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { page, limit, technologie, domaine, meme_ecole, following, trending } = req.query;
    const result = await getFeedExperiences(etudiantId, {
      page,
      limit,
      technologie,
      domaine,
      meme_ecole,
      following,
      trending,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Erreur getExperiencesFeed:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const envoyerDemandeController = async (req, res) => {
  try {
    const utilisateurId = req.user.utilisateur_id;
    const { offreId } = req.params;
    const { message } = req.body;

    const demande = await envoyerDemande(
      offreId,
      utilisateurId,
      message
    );

    res.status(201).json({
      success: true,
      data: demande
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};