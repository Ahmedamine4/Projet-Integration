import prisma from '../config/prisma.js';
import { createStage, uploadPhoto, getStagesByEtudiant } from '../services/stage.service.js';

export const addStage = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const { titre, description, missions_realisees, date_debut, date_fin, rapport_stage } = req.body;

    if (!titre || !description || !date_debut || !date_fin) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }

    if (new Date(date_fin) <= new Date(date_debut)) {
      return res.status(400).json({ 
        success: false, 
        message: 'La date de fin doit être après la date de début' 
      });
    }

    let technologies, domaines;
    try {
      technologies = JSON.parse(req.body.technologies || '[]');
      domaines = JSON.parse(req.body.domaines || '[]');
    } catch (e) {
      return res.status(400).json({ 
        success: false, 
        message: 'Format invalide pour les technologies ou domaines' 
      });
    }

    if (!Array.isArray(technologies) || !Array.isArray(domaines)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Les technologies et domaines doivent être des tableaux' 
      });
    }

    const stageExistant = await prisma.experience.findFirst({
      where: { utilisateur_id: etudiantId, type: 'stage', titre: titre },
    });
    if (stageExistant) {
      return res.status(409).json({ 
        success: false, 
        message: 'Vous avez déjà un stage avec ce titre' 
      });
    }

    if (req.body.is_academique === 'true' || req.body.is_academique === true) {
      if (!req.body.email_professeur) {
        return res.status(400).json({ 
          success: false, 
          message: 'Veuillez entrer l\'email du professeur' 
        });
      }
    }

    let photoUrl = null;
    if (req.file) {
      console.log('Photo reçue:', req.file.originalname); // ← AJOUTER
      photoUrl = await uploadPhoto(req.file);
      console.log('Photo URL:', photoUrl); // ← AJOUTER
    }

    const result = await createStage(etudiantId, req.body, photoUrl);
    res.status(201).json({ success: true, data: result });

  } catch (error) {
    console.error('Erreur addStage:', error);

    if (error.message === 'Professeur non trouvé avec cet email') {
      return res.status(404).json({ success: false, message: 'Aucun professeur trouvé avec cet email' });
    }

    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getStages = async (req, res) => {
  try {
    const etudiantId = req.user.utilisateur_id;
    const stages = await getStagesByEtudiant(etudiantId);
    res.status(200).json({ success: true, data: stages });
  } catch (error) {
    console.error('Erreur getStages:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};