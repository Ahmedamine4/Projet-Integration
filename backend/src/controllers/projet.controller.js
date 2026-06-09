import {
  creeProjet,
  getProjetsByEtudiant,
  editProjet,
  supprimerProjetService,
  updateVisibiliteProjetService,
} from '../services/projet.service.js';

export const addProjet = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { projectTitle, projectDate, description, projetType } = req.body;

    if (!projectTitle || !projectDate || !description) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }

    if (projetType === 'academique' && !req.body.professorEmail) {
      return res.status(400).json({ success: false, message: "Email du professeur requis pour un projet académique" });
    }

    const result = await creeProjet(etudiantId, req.body, req.file ?? null);
    return res.status(201).json({ success: true, data: result });

  } catch (error) {
    console.error('Erreur addProjet:', error);
    const errorsMap = {
      'Projet déjà existant': 409,
      'Professeur non trouvé avec cet email': 404,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getProjets = async (req, res) => {
  try {
    const projets = await getProjetsByEtudiant(req.user.utilisateur_id);
    return res.status(200).json({ success: true, data: projets });
  } catch (error) {
    console.error('Erreur getProjets:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const updateProjet = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { experienceId } = req.params;

    const result = await editProjet(etudiantId, experienceId, req.body, req.file ?? null);
    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error('Erreur updateProjet:', error);
    const errorsMap = {
      'Projet déjà existant': 409,
      'Projet non trouvé': 404,
      'Professeur non trouvé avec cet email': 404,
      'Les technologies importées depuis GitHub sont verrouillées': 403,
      'Ce projet a déjà été traité par le professeur, vous ne pouvez plus le modifier': 403,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const deleteProjet = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { experienceId } = req.params;

    await supprimerProjetService(etudiantId, experienceId);
    return res.status(200).json({ success: true, message: 'Projet supprimé avec succès' });

  } catch (error) {
    console.error('Erreur deleteProjet:', error);
    const errorsMap = {
      'Projet non trouvé': 404,
      'Ce projet a déjà été traité par le professeur, vous ne pouvez plus le supprimer': 403,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const updateVisibiliteProjet = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { experienceId } = req.params;
    const { visibilite } = req.body;

    if (typeof visibilite !== 'boolean') {
      return res.status(400).json({ success: false, message: 'visibilite doit être un boolean' });
    }

    const result = await updateVisibiliteProjetService(etudiantId, experienceId, visibilite);
    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error('Erreur updateVisibiliteProjet:', error);
    const errorsMap = {
      'Projet non trouvé': 404,
      'Vous ne pouvez changer la visibilité que si le projet académique est validé': 403,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};