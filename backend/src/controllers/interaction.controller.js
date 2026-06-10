import {
  creerRecommandation,
  updateVisibiliteRecommandation,
  getAllRecommandations,
  getRecommandationsVisibles,
} from '../services/interaction.service.js';


export const addRecommandation = async (req, res) => {
  try {
    const professionnelId = req.user.utilisateur_id;
    const { portfolioId } = req.params;
    const { texte } = req.body;

    if (!texte?.trim()) {
      return res.status(400).json({ success: false, message: 'Le texte de la recommandation est requis' });
    }

    const result = await creerRecommandation(professionnelId, portfolioId, texte);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur addRecommandation:', error);
    const errorsMap = {
      'Portfolio non trouvé': 404,
      'Professionnel non trouvé': 404,
      'Utilisateur non trouvé': 404,
        'Accès refusé': 403,
      'Vous avez déjà laissé une recommandation sur ce portfolio': 409,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};


export const toggleVisibiliteRecommandation = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { interactionId } = req.params;
    const { visibilite } = req.body;

    if (typeof visibilite !== 'boolean') {
      return res.status(400).json({ success: false, message: 'visibilite doit être un boolean' });
    }

    const result = await updateVisibiliteRecommandation(etudiantId, interactionId, visibilite);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur toggleVisibiliteRecommandation:', error);
    const errorsMap = {
      'Recommandation non trouvée': 404,
      "Cette interaction n'est pas une recommandation": 400,
      'Accès refusé': 403,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};


export const getMesRecommandations = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const result = await getAllRecommandations(etudiantId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur getMesRecommandations:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};


export const getRecommandationsPortfolio = async (req, res) => {
  try {
    const { etudiantId } = req.params;
    const result = await getRecommandationsVisibles(etudiantId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur getRecommandationsPortfolio:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};