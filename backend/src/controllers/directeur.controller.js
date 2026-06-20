import {
  getDashboardStats,
  getInstitutionMembers,
  getPendingRequests,
  createInstitutionProfessor,
  traiterDemandeInscription,
  traiterDemandeActivite
} from '../services/directeur.service.js';

export async function getStats(req, res) {
  try {
    const data = await getDashboardStats(req.user.utilisateur_id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function getMembers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const type = req.query.type; // 'etudiant' ou 'professeur'
    
    const data = await getInstitutionMembers(req.user.utilisateur_id, page, type);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function getRequests(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const type = req.query.type; // 'inscription' ou 'activite'
    
    const data = await getPendingRequests(req.user.utilisateur_id, page, type);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
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
      message: result.emailSent ? 'Professeur créé avec succès' : 'Professeur créé, email non envoyé',
      ...result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function traiterInscription(req, res) {
  try {
    const { etudiantId, statut } = req.body;
    if (!etudiantId || !statut) return res.status(400).json({ success: false, message: "etudiantId et statut requis" });

    const data = await traiterDemandeInscription(req.user.utilisateur_id, etudiantId, statut);
    return res.status(200).json({ success: true, message: `Inscription traitée : ${statut}`, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function traiterActivite(req, res) {
  try {
    const { experienceId, statut } = req.body;
    if (!experienceId || !statut) return res.status(400).json({ success: false, message: "experienceId et statut requis" });

    const data = await traiterDemandeActivite(req.user.utilisateur_id, experienceId, statut);
    return res.status(200).json({ success: true, message: `Activité traitée : ${statut}`, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}