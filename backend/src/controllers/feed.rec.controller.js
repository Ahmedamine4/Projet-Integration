import {
  getProfessionnelFeedStudentsTop,
  getProfessionnelFeedSuggestions,
  getProfessionnelFeedExperiences,
  getProfessionnelFeedTags,
} from '../services/feed.rec.service.js';

// GET /api/professionnel/feed/tags
export const getProfessionnelFeedTagsController = async (req, res) => {
  try {
    const result = await getProfessionnelFeedTags();
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur getProfessionnelFeedTagsController:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /api/professionnel/feed/students-top?page=1&limit=5
export const getProfessionnelFeedStudentsTopController = async (req, res) => {
  try {
    const professionnelId = req.user.utilisateur_id;
    const { page, limit } = req.query;
    const result = await getProfessionnelFeedStudentsTop(professionnelId, { page, limit });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Erreur getProfessionnelFeedStudentsTopController:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /api/professionnel/feed/suggestions?page=1&limit=5
export const getProfessionnelFeedSuggestionsController = async (req, res) => {
  try {
    const professionnelId = req.user.utilisateur_id;
    const { page, limit } = req.query;
    const result = await getProfessionnelFeedSuggestions(professionnelId, { page, limit });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Erreur getProfessionnelFeedSuggestionsController:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /api/professionnel/feed/experiences?page=1&limit=10&technologie=React&domaine=IA&following=false&trending=false
export const getProfessionnelFeedExperiencesController = async (req, res) => {
  try {
    const professionnelId = req.user.utilisateur_id;
    const { page, limit, technologie, domaine, following, trending } = req.query;
    const result = await getProfessionnelFeedExperiences(professionnelId, {
      page,
      limit,
      technologie,
      domaine,
      following,
      trending,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Erreur getProfessionnelFeedExperiencesController:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};