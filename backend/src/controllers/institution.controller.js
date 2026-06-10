import {
  getInstitutions,
  getAcademicInstitutions,
  getNonAcademicInstitutions,
  getInstitutionsValideEtudiant,
  getProfesseursByInstitution,
} from '../services/institution.service.js';

export const getInstitution = async (req, res) => {
  try {
    const institutions = await getInstitutions();
    res.status(200).json(institutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAcademicInstitutionsController = async (req, res) => {
  try {
    const institutions = await getAcademicInstitutions();
    return res.status(200).json({ success: true, data: institutions });
  } catch (error) {
    console.error('Error fetching academic institutions:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getNonAcademicInstitutionsController = async (req, res) => {
  try {
    const institutions = await getNonAcademicInstitutions();
    return res.status(200).json({ success: true, data: institutions });
  } catch (error) {
    console.error('Error fetching non-academic institutions:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getInstitutionByEtudiant = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const institutions = await getInstitutionsValideEtudiant(etudiantId);
    return res.status(200).json({ success: true, data: institutions });
  } catch (error) {
    console.error('Erreur getMesInstitutions:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getProfesseursParInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const data = await getProfesseursByInstitution(institutionId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Erreur getProfesseursParInstitution:', error);
    const errorsMap = {
      'Institution non trouvée': 404,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};