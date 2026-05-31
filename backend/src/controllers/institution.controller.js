import { getInstitutions, getInstitutionsValideEtudiant } from '../services/institution.service.js';

export const getInstitution = async (req, res) => {
    try {
        const institutions = await getInstitutions();
        res.status(200).json(institutions);
    } catch (error) {
        console.error('Error fetching institutions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getInstitutionByEtudiant = async (req, res) => {
    try {
        const etudiantId = req.user.utilisateur_id;
        const institutions = await getInstitutionsValideEtudiant(etudiantId);
        return res.status(200).json({ success: true, data: institutions });
    } catch (error) {
        console.error('Erreur getMesInstitutions:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}