import { LinkInstitutionsToEtudiant } from '../services/link_institutions_etudiant.service.js';

export const LinkInstitutionsToEtudiantController = async (req, res) => {
    try {
        const etudiantId = req.user.utilisateur_id || req.user.id;

        if (!etudiantId) {
            return res.status(401).json({ 
                error: 'Action non autorisée. Étudiant non identifié.' 
            });
        }

        const { institutionId } = req.body;

        // Validation des entrées
        if (!Array.isArray(institutionId) || institutionId.length === 0) {
            return res.status(400).json({ 
                error: 'etudiantId et un tableau institution Id (Ids) sont requis' 
            });
        }

        const result = await LinkInstitutionsToEtudiant(etudiantId, institutionId);
        
        res.status(200).json({
            message: 'Demandes de liaison traitées avec succès.',
            count: result.length
        });
    } catch (error) {
        const statusCode = error.message.includes("Aucune institution") ? 404 : 500;
        
        res.status(statusCode).json({
            error: 'Erreur lors de la liaison',
            details: error.message
        });
    }
};