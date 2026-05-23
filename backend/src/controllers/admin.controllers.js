import {
  assignerDirecteur,
  promouvoirProfessionnel,
  rejecterProfessionnel,
  bloquerUtilisateur,
  debloquerUtilisateur,
  getProfessionnelsEnAttente,
} from '../services/admin.services.js';

export async function ajoutDirecteur(req, res) {
  try {
    const { utilisateur_id, institution_id, poste, bureau } = req.body;

    if (!utilisateur_id || !institution_id) {
      return res.status(400).json({
        success: false,
        message: 'utilisateur_id et institution_id sont vides',
      });
    }
    const result = await assignerDirecteur({ utilisateur_id, institution_id, poste, bureau });
    return res.status(200).json({
      success: true,
      message: result.message,
      utilisateur: result.utilisateur,
      institution_id: result.institution_id,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Erreur lors de l\'assignation du directeur',
    });
  }
}

export async function validerProfessionnel(req, res) {
  try {
    const utilisateur_id = req.params.id;
    const admin_id = req.user.utilisateur_id; // vient du authMiddleware

    const result = await promouvoirProfessionnel({ utilisateur_id, admin_id });

    return res.status(200).json({
      success: true,
      message: result.message,
      utilisateur: result.utilisateur,
      professionnel: result.professionnel,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Erreur lors de la validation du professionnel',
    });
  }
}

export async function refuserProfessionnel(req, res) {
  try {
    const utilisateur_id = req.params.id;
    const admin_id = req.user.utilisateur_id;

    const result = await rejecterProfessionnel({ utilisateur_id, admin_id });

    return res.status(200).json({
      success: true,
      message: result.message,
      utilisateur: result.utilisateur,
      professionnel: result.professionnel,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Erreur lors du refus du professionnel',
    });
  }
}

// ─── 4. Bloquer un utilisateur ───────────────────────────────────────────────
export async function bloquerUtilisateurController(req, res) {
  try {
    const utilisateur_id = req.params.id;

    const result = await bloquerUtilisateur({ utilisateur_id });

    return res.status(200).json({
      success: true,
      message: result.message,
      utilisateur: result.utilisateur,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Erreur lors du blocage du compte',
    });
  }
}

export async function debloquerUtilisateurController(req, res) {
  try {
    const utilisateur_id = req.params.id;

    const result = await debloquerUtilisateur({ utilisateur_id });

    return res.status(200).json({
      success: true,
      message: result.message,
      utilisateur: result.utilisateur,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Erreur lors du déblocage du compte',
    });
  }
}

export async function listProfessionnelsEnAttente(req, res) {
  try {
    const professionnels = await getProfessionnelsEnAttente();
    return res.status(200).json({
      success: true,
      professionnels,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération des professionnels',
    });
  }
}