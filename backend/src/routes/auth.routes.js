const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const { register, login, getProfile, getAllUsers } = require('../controllers/auth.controller');
const { verifyToken, authorizeRoles, ROLES } = require('../middlewares/auth.middleware');
const { passport, isConfigured } = require('../config/passport');

// =====================
// ROUTES PUBLIQUES
// =====================
router.post('/register', register);
router.post('/login', login);

// =====================
// GOOGLE OAUTH
// =====================

// 1️⃣ Lancer OAuth
router.get('/google', (req, res, next) => {
    if (!isConfigured) {
        return res.status(500).json({
            success: false,
            message: 'Google OAuth non configuré',
        });
    }

    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
    })(req, res, next);
});

// 2️⃣ CALLBACK
router.get(
    '/google/callback',
    (req, res, next) => {
        passport.authenticate('google', { session: false }, (err, user, info) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: 'Erreur OAuth',
                    details: err.message,
                });
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié',
                    details: info?.message,
                });
            }

            req.user = user;
            next();
        })(req, res, next);
    },
    (req, res) => {
        const token = jwt.sign(
            {
                id: req.user.id,
                email: req.user.email,
                role: req.user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        // Option frontend redirect
        if (process.env.OAUTH_REDIRECT_URL) {
            return res.redirect(
                `${process.env.OAUTH_REDIRECT_URL}?token=${encodeURIComponent(token)}`
            );
        }

        return res.json({
            success: true,
            token,
        });
    }
);

// =====================
// ROUTES PROTÉGÉES
// =====================
router.get('/profile', verifyToken, getProfile);

router.get(
    '/users',
    verifyToken,
    authorizeRoles(ROLES.ADMIN),
    getAllUsers
);

module.exports = router;