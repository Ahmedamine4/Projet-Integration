const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
    );
};


// =====================
// REGISTER
// =====================
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'username, email et password requis'
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email déjà utilisé'
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
        );

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role: 'student'
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true
            }
        });

        return res.status(201).json({
            success: true,
            user
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l’inscription'
        });
    }
};


// =====================
// LOGIN
// =====================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'email et password requis'
            });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants invalides'
            });
        }

        // 🔴 compte Google sans password
        if (user.googleId && !user.password) {
            return res.status(401).json({
                success: false,
                message: 'Compte Google, utilisez Google login'
            });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants invalides'
            });
        }

        const token = generateToken(user);

        return res.json({
            success: true,
            token
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion'
        });
    }
};


// =====================
// PROFILE (JWT required)
// =====================
exports.getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                username: true,
                email: true,
                role: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur introuvable'
            });
        }

        return res.json({
            success: true,
            user
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};


// =====================
// GET ALL USERS (ADMIN)
// =====================
exports.getAllUsers = async (_req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                role: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.json({
            success: true,
            users
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Erreur récupération utilisateurs'
        });
    }
};