import { getDemandesEtudiant } from '../services/etudiant.service.js';

const TYPES_VALIDES   = ['stage', 'projet', 'activite', 'recommandation'];
const STATUTS_VALIDES = ['en_attente', 'valide', 'refuse'];

export const listMesDemandes = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { type, statut, page } = req.query;

    if (type && !TYPES_VALIDES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Type invalide. Valeurs acceptées : ${TYPES_VALIDES.join(', ')}`,
      });
    }

    if (statut && !STATUTS_VALIDES.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Valeurs acceptées : ${STATUTS_VALIDES.join(', ')}`,
      });
    }

    const result = await getDemandesEtudiant(etudiantId, { type, statut, page });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Erreur listMesDemandes:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};