import { getPendingValidations, updateValidationStatus } from '../services/validation_etudiant.service.js';

export const listPendingController = async (req, res) => {
    try {
        const { institutionId } = req.params;
        // On passe directement institutionId sans parseInt car c'est un String ("institution_1")
        const list = await getPendingValidations(institutionId);
        res.status(200).json(list);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération", details: error.message });
    }
};

export const validateStudentController = async (req, res) => {
    try {
        const { etudiantId, institutionId } = req.params;
        const { status } = req.body; // 'valide' ou 'rejete'

        if (!['valide', 'rejete'].includes(status)) {
            return res.status(400).json({ error: "Le statut doit être 'valide' ou 'rejete'" });
        }

        const updated = await updateValidationStatus(etudiantId, institutionId, status);
        res.status(200).json({ message: "Statut mis à jour avec succès", updated });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la validation", details: error.message });
    }
};