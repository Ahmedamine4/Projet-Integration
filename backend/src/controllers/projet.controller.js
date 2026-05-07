import { TypeSpecifique } from '@prisma/client';
import { supabase } from '../config/supabase.js';
import { createProjet} from '../services/projet.service.js';

export const addProjet = async (req, res) => {
  try {
     const userId = req.user.id;
     const data = req.body;

    let imageUrl = null;

    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;

      const { error } = await supabase.storage
        .from('projets')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (error) throw new Error(error.message);

      const { data: publicUrl } = supabase.storage
        .from('projets')
        .getPublicUrl(fileName);

      data.imageUrl = publicUrl.publicUrl;
    }


    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found in request"
      });
    }

  if (!data.projectTitle || !data.projectDate || !data.description || data.visibleToEveryone === undefined) {
      return res.status(400).json({
        message: "Champs obligatoires manquants"
      });
    }
  
  if (data.projetType === TypeSpecifique.academique && (!data.professorEmail || data.professorEmail.length === 0)) {
      return res.status(400).json({
        message: "Email du professeur est requis pour les projets académiques"
      });
    }

    const result = await createProjet(data, userId);

    res.status(201).json({
      success: true,
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};