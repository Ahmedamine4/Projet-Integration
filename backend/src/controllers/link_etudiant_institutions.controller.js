import { LinkEtudiantToInstitution } from '../services/link_etudiant_institutions.service.js';

export const linkEtudiantToInstitutionController = async (req, res) => {
    try {
        const { etudiantId, filiereNom } = req.body;

        if (!etudiantId || !filiereNom) {
            return res.status(400).json({ error: 'etudiantId and filiereNom are required' });
        }
        const result = await LinkEtudiantToInstitution(etudiantId, filiereNom);
        res.status(200).json({
            message: 'Etudiant linked to institution successfully',
            data: result
        });
    } catch (error) {
        console.error('Error linking etudiant to institution:', error);
        res.status(500).json({ 
            error: 'An error occurred while linking etudiant to institution', 
            details: error.message
        });
    }
}