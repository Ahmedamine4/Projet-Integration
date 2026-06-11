import { getFeedEtudiant, getFeedTechnologiesDomaines } from '../services/feed.service.js';

export const getFeed = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const result = await getFeedEtudiant(etudiantId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur getFeed:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getFeedTechnologiesAndDomaines = async (req, res) => {
  try {
    const result = await getFeedTechnologiesDomaines();
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur getFeedTechnologiesAndDomaines:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};