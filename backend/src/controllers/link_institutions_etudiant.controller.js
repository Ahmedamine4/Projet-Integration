import {
  LinkInstitutionsToEtudiantService,
  updateValidEtudiantDescriptionService,
} from '../services/link_institutions_etudiant.service.js';

export const LinkInstitutionsToEtudiantController = async (req, res) => {
    try {
        const { etudiantId, etudie, institutions } = req.body;

        if (!etudiantId || !Array.isArray(institutions) || institutions.length === 0) {
            return res.status(400).json({
                error: "etudiantId et un tableau 'institutions' sont requis.",
            });
        }

        const result = await LinkInstitutionsToEtudiantService(etudiantId, etudie, institutions);

        res.status(200).json({
            message: 'Institutions liées avec succès, avec statut en attente.',
            count: result.length,
            data: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Erreur lors de la liaison des institutions',
            details: error.message,
        });
    }
};

export const updateValidEtudiantDescriptionController = async (req, res) => {
  try {
    const etudiantId = req.user?.utilisateur_id;
    const { description } = req.body;

    if (!etudiantId || typeof description !== 'string') {
      return res.status(400).json({
        error: 'Description est requise.',
      });
    }

    const updated = await updateValidEtudiantDescriptionService(etudiantId, description);

    return res.status(200).json({
      message: 'Description enregistrée avec succès.',
      data: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Erreur lors de l’enregistrement de la description',
      details: error.message,
    });
  }
};