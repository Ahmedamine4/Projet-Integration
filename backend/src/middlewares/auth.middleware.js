// src/middleware/auth.middleware.js
// Middleware JWT + contrôle des rôles (Authorization)

const jwt = require('jsonwebtoken');


// 1. Vérification du token JWT

const verifyToken = (req, res, next) => {
  // Le token est attendu dans le header Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Accès refusé. Token manquant.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Token expiré. Veuillez vous reconnecter.'
        : 'Token invalide.';
    return res.status(403).json({ success: false, message });
  }
};

// 2. Contrôle des rôles (Authorization)
//    Usage : authorizeRoles('administrator', 'teacher')

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès interdit. Rôle requis : ${allowedRoles.join(' ou ')}.`,
      });
    }
    next();
  };
};

// Rôles disponibles dans l'application

const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'administrator',
  PROFESSIONAL: 'professional',
};

module.exports = { verifyToken, authorizeRoles, ROLES };