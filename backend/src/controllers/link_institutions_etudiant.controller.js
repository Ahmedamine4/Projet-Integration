import { LinkInstitutionsToEtudiant } from '../services/link_institutions_etudiant.service.js';

export const LinkInstitutionsToEtudiantController = async (req, res) => {
    try {
        const etudiantId = req.user?.utilisateur_id;
        const { institutionId } = req.body;

        if (!etudiantId || !Array.isArray(institutionId) || institutionId.length === 0) {
            return res.status(400).json({
                error: 'etudiantId et un tableau institution Id (Ids) sont requis'
            });
        }

        const result = await LinkInstitutionsToEtudiant(etudiantId, institutionId);

        res.status(200).json({
            message: 'Demandes de liaison traitÃ©es avec succÃ¨s.',
            count: result.length
        });
    } catch (error) {
        res.status(500).json({
            error: 'Erreur lors de la liaison',
            details: error.message
        });
    }
};
