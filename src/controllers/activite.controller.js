import { TypeSpecifique } from '@prisma/client';
import { supabase } from '../config/supabase.js';
import { createProjet } from '../services/projet.service.js';

function normalizeFileName(fileName) {
  const trimmedName = typeof fileName === 'string' ? fileName.trim() : 'file';
  const dotIndex = trimmedName.lastIndexOf('.');
  const hasExtension = dotIndex > 0 && dotIndex < trimmedName.length - 1;

  const baseName = hasExtension ? trimmedName.slice(0, dotIndex) : trimmedName;
  const extension = hasExtension ? trimmedName.slice(dotIndex).toLowerCase() : '';

  const normalizedBaseName = baseName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['"]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  return `${normalizedBaseName || 'file'}${extension}`;
}

export const addProjet = async (req, res) => {
  try {
    const userId = req.user.utilisateur_id;
    const data = req.body;

    if (typeof data.visibleToEveryone === 'string') {
      const normalizedVisibility = data.visibleToEveryone.trim().toLowerCase();

      if (normalizedVisibility === 'true') {
        data.visibleToEveryone = true;
      } else if (normalizedVisibility === 'false') {
        data.visibleToEveryone = false;
      }
    }

    data.technologies = JSON.parse(data.technologies || '[]');
    data.domains = JSON.parse(data.domains || '[]');

    let imageUrl = null;

    if (req.file) {
      const safeOriginalName = normalizeFileName(req.file.originalname);
      const fileName = `${Date.now()}-${safeOriginalName}`;

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

    if (
      !data.projectTitle ||
      !data.projectDate ||
      !data.description ||
      typeof data.visibleToEveryone !== 'boolean'
    ) {
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
