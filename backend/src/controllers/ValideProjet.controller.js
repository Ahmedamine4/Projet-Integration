import { validerProjetService } from "../services/ValideProjet.service.js";

export const validerProjet = async (req, res) => {
  try {

    const { id } = req.params;

    const utilisateur_id = req.user.utilisateur_id;

    const { statut, commentaireProf } = req.body;

    const projet = await validerProjetService({
      experience_id: Number(id),
      utilisateur_id,
      statut,
      commentaireProf,
    });

    return res.status(200).json({
      success: true,
      message: "Action effectuée avec succès",
      data: projet,
    });

  } catch (error) {

    if (error.message === "PROJET_INTROUVABLE") {
      return res.status(404).json({
        success: false,
        message: "Projet introuvable",
      });
    }

    if (error.message === "STATUT_INVALIDE") {
      return res.status(400).json({
        success: false,
        message: "Statut invalide",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};