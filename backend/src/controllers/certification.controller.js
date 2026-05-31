import {
  uploadPhoto,
  creeCertification,
  getCertificationsByEtudiant,
  editCertification,
  updateVisibiliteCertificationService,
} from '../services/certification.service.js';

export const addCertification = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { titre, date } = req.body;

    if (!titre || !date) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }

    let photoUrl = null;
    if (req.file) photoUrl = await uploadPhoto(req.file);

    const result = await creeCertification(etudiantId, req.body, photoUrl);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur addCertification:', error);
    const errorsMap = {
      'Certification déjà existante': 409,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getMesCertifications = async (req, res) => {
  try {
    const certifications = await getCertificationsByEtudiant(req.user.utilisateur_id);
    return res.status(200).json({ success: true, data: certifications });
  } catch (error) {
    console.error('Erreur getMesCertifications:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const updateCertification = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { experienceId } = req.params;

    let photoUrl = null;
    if (req.file) photoUrl = await uploadPhoto(req.file);

    const result = await editCertification(etudiantId, experienceId, req.body, photoUrl);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur updateCertification:', error);
    const errorsMap = {
      'Certification déjà existante': 409,
      'Certification non trouvée': 404,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const updateVisibiliteCertification = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { experienceId } = req.params;
    const { visibilite } = req.body;

    if (typeof visibilite !== 'boolean') {
      return res.status(400).json({ success: false, message: 'visibilite doit être un boolean' });
    }

    const result = await updateVisibiliteCertificationService(etudiantId, experienceId, visibilite);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur updateVisibiliteCertification:', error);
    const errorsMap = {
      'Certification non trouvée': 404,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};