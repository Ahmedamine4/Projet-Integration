import {
  getProfFeedStudentsTop,
  getProfFeedSuggestions,
  getProfFeedExperiences,
  getProfFeedTags,
} from '../services/feed.prof.service.js';

// GET /api/prof/feed/tags
// Retourne la liste des technologies et domaines disponibles (filtres UI)
export const getProfFeedTagsController = async (req, res) => {
  try {
    const result = await getProfFeedTags();
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur getProfFeedTagsController:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /api/prof/feed/students-top?page=1&limit=5
// Bandeau haut : étudiants de la même institution scorés, puis hors institution
export const getProfFeedStudentsTopController = async (req, res) => {
  try {
    const profId = req.user.utilisateur_id;
    const { page, limit } = req.query;
    const result = await getProfFeedStudentsTop(profId, { page, limit });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Erreur getProfFeedStudentsTopController:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /api/prof/feed/suggestions?page=1&limit=5
// Colonne droite : étudiants non suivis par le prof, ordre aléatoire
export const getProfFeedSuggestionsController = async (req, res) => {
  try {
    const profId = req.user.utilisateur_id;
    const { page, limit } = req.query;
    const result = await getProfFeedSuggestions(profId, { page, limit });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Erreur getProfFeedSuggestionsController:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /api/prof/feed/experiences?page=1&limit=10&technologie=React&domaine=IA&meme_ecole=true&following=false&trending=false
// Fil central : expériences scorées avec filtres
export const getProfFeedExperiencesController = async (req, res) => {
  try {
    const profId = req.user.utilisateur_id;
    const { page, limit, technologie, domaine, meme_ecole, following, trending } = req.query;
    const result = await getProfFeedExperiences(profId, {
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
    console.error('Erreur getProfFeedExperiencesController:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};