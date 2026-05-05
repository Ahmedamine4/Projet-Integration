import { LinkInstitutionsToEtudiant } from '../services/link_institutions_etudiant.service.js';

export const LinkInstitutionsToEtudiantController = async (req, res) => {
    try {
        const { etudiantId, institutionNoms } = req.body;

        // Validation des entrées
        if (!etudiantId || !Array.isArray(institutionNoms) || institutionNoms.length === 0) {
            return res.status(400).json({ 
                error: 'etudiantId et un tableau institutionNoms sont requis' 
            });
        }

        const result = await LinkInstitutionsToEtudiant(etudiantId, institutionNoms);
        
        res.status(200).json({
            message: 'Demandes de liaison traitées avec succès.',
            count: result.length
        });
    } catch (error) {
        res.status(500).json({
            error: 'Erreur lors de la liaison',
            details: error.message
        });
    }
};