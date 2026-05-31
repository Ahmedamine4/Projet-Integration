import {
  creerDemandeRecommandation,
  getMesDemandesRecommandation,
} from '../services/lettre_recommandation.service.js';

export const demanderRecommandation = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { objet, description, email_professeur } = req.body;

    if (!email_professeur) {
      return res.status(400).json({ success: false, message: 'Email du professeur requis' });
    }
    if (!objet) {
      return res.status(400).json({ success: false, message: 'Objet de la demande requis' });
    }

    const result = await creerDemandeRecommandation(etudiantId, req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur demanderRecommandation:', error);
    const errorsMap = {
      'Professeur non trouvé avec cet email': 404,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getMesRecommandations = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const result = await getMesDemandesRecommandation(etudiantId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur getMesRecommandations:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};