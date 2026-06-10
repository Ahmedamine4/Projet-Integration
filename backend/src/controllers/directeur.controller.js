import {
  createInstitutionProfessor,
  getDirecteurDashboard,
} from '../services/directeur.service.js';

export async function getDashboard(req, res) {
  try {
    const data = await getDirecteurDashboard(req.user.utilisateur_id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la recuperation du dashboard directeur',
    });
  }
}

export async function addProfessor(req, res) {
  try {
    const result = await createInstitutionProfessor({
      directeurId: req.user.utilisateur_id,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: result.emailSent
        ? 'Professeur cree avec succes'
        : 'Professeur cree, mais email non envoye',
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la creation du professeur',
    });
  }
}
