import jwt from 'jsonwebtoken';
import {
  getAboutByUserId,
  updateUserAboutByUserId,
  getPortfolioEtudiant,
  getExperienceById,
} from '../services/portfolio.service.js';

import {
  findUserByLocalId,
  findUserBySupabaseUid,
  syncGoogleUser,
} from '../services/auth.service.js';

function sanitizeAbout(input) {
  if (input == null) return null;
  let s = String(input);
  s = s.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
  s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  s = s.replace(/<[^>]*>?/gm, '');
  s = s.replace(/[ \t]+/g, ' ');
  s = s.split('\n').map((line) => line.trim()).join('\n');
  s = s.replace(/\n{3,}/g, '\n\n');
  s = s.trim();

  const MAX_LEN = 3000;
  if (s.length === 0) return null;
  if (s.length > MAX_LEN) s = s.slice(0, MAX_LEN);

  return s;
}

export const getAbout = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await getAboutByUserId(userId);

    if (!result) {
      return res.status(200).json({ success: true, about: null, ownerId: null, isOwner: false });
    }

    const { ownerId, about } = result;

    let normalizedAbout = about;
    if (typeof normalizedAbout === 'string') {
      normalizedAbout = normalizedAbout.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
      normalizedAbout = normalizedAbout.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    let isOwner = false;
    try {
      const token = req.cookies?.accessToken;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await findUserByLocalId(decoded.id);
          if (user) isOwner = user.utilisateur_id === ownerId;
        } catch (errLocal) {
          try {
            const decoded2 = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
            let user2 = await findUserBySupabaseUid(decoded2.sub);
            if (!user2) user2 = await syncGoogleUser(decoded2);
            if (user2) isOwner = user2.utilisateur_id === ownerId;
          } catch (errSupabase) {
          }
        }
      }
    } catch (e) {
      // probleme de token, on ignore et on considère pas comme owner
    }

    return res.status(200).json({ success: true, about: normalizedAbout, ownerId: ownerId ?? null, isOwner });
  } catch (error) {
    console.error('Error in getAbout:', error);
    return res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};


export const updateAbout = async (req, res) => {
  try {
    const userId = req.params.id;
    const requesterId = req.user?.utilisateur_id;

    if (!requesterId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non connecté' });
    }

    if (requesterId !== userId) {
      return res.status(403).json({ success: false, message: 'Accès refusé: non propriétaire' });
    }

    const aboutText = sanitizeAbout(req.body?.a_propos ?? null);

    const updated = await updateUserAboutByUserId(userId, aboutText);

    return res.status(200).json({ success: true, updated });
  } catch (error) {
    console.error('Error in updateAbout:', error);
    return res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

export const getPortfolioEtudiantController = async (req, res) => {
  try {
    const { etudiantId } = req.params;
    const isOwner = req.user.utilisateur_id === etudiantId;
    const data = await getPortfolioEtudiant(etudiantId, isOwner);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Erreur getPortfolioEtudiant:', error);
    if (error.message === 'Étudiant non trouvé') {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getExperienceByIdController = async (req, res) => {
  try {
    const { idexperience } = req.params;
 
    const experience = await getExperienceById(idexperience);
 
    if (!experience) {
      return res.status(404).json({ success: false, message: 'Expérience non trouvée' });
    }
 
    return res.status(200).json({ success: true, data: experience });
  } catch (error) {
    console.error('Erreur getExperienceById:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};