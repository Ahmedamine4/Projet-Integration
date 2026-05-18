import jwt from 'jsonwebtoken';

import {
  findUserByLocalId,
  findUserBySupabaseUid,
  sanitizeUser,
  syncGoogleUser,
} from '../services/auth.service.js';

export const ROLES = {
  ADMIN: 'administrateur',
  PROFESSEUR: 'professeur',
  ETUDIANT: 'etudiant',
  PROFESSIONNEL: 'professionnel',
};

// Récupérer le token depuis : Authorization: Bearer TOKEN
// function getToken(req) {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return null;
//   }

//   return authHeader.split(' ')[1];
// }

// Récupérer le token depuis les cookies
function getToken(req) {
  return req.cookies?.accessToken || null; 
}

// Middleware hybride : local + Google
export async function authMiddleware(req, res, next) {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token d'authentification manquant",
    });
  }
  
  // Vérifier token local Express
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await findUserByLocalId(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    req.user = sanitizeUser(user);
    req.authType = 'local';

    return next();
  } catch (error) {
    // Si ce n'est pas un token local, on essaie Google
  }

  // Vérifier token Google / Supabase
  try {
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);

    let user = await findUserBySupabaseUid(decoded.sub);

    if (!user) {
      user = await syncGoogleUser(decoded);
    }

    req.user = sanitizeUser(user);
    req.authType = 'google';

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token d'authentification invalide ou expiré",
    });
  }
}

// Middleware d’autorisation par rôle
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non connecté',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé, rôle non autorisé',
      });
    }

    return next();
  };
}