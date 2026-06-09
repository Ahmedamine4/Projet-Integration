import { getPendingValidations, updateValidationStatus } from '../services/validation_etudiant.service.js';

export const listPendingController = async (req, res) => {
    try {
        const { institutionId } = req.params;
        const list = await getPendingValidations(institutionId);
        res.status(200).json(list);
    } catch (error) {
<<<<<<< Updated upstream
        res.status(500).json({ error: 'Erreur lors de la recuperation', details: error.message });
=======
        res.status(500).json({ error: "Erreur lors de la rÃ©cupÃ©ration", details: error.message });
>>>>>>> Stashed changes
    }
};

export const validateStudentController = async (req, res) => {
    try {
        const { etudiantId, institutionId } = req.params;
        const { status } = req.body;
<<<<<<< Updated upstream

        if (!['valide', 'refuse'].includes(status)) {
            return res.status(400).json({ error: "Le statut doit etre 'valide' ou 'refuse'" });
        }

        const updated = await updateValidationStatus(etudiantId, institutionId, status, {
            utilisateurSourceId: req.user?.utilisateur_id ?? null,
        });

        res.status(200).json({ message: 'Statut mis a jour avec succes', updated });
=======
        const utilisateurSourceId = req.user?.utilisateur_id ?? null;

        if (!['valide', 'refuse'].includes(status)) {
            return res.status(400).json({ error: "Le statut doit Ãªtre 'valide' ou 'refuse'" });
        }

        const updated = await updateValidationStatus(etudiantId, institutionId, status, { utilisateurSourceId });
        res.status(200).json({ message: "Statut mis Ã  jour avec succÃ¨s", updated });
>>>>>>> Stashed changes
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la validation', details: error.message });
    }
};
