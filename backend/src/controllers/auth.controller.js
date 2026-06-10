import { generateLocalToken, generateRefreshToken, verifyRefreshToken} from '../config/jwt.js';
import { creerSession, fermerSession } from '../services/session.service.js';
import { supabase } from '../config/supabase.js';
import {
  registerLocalUser,// pour cree un user local
  loginLocalUser,
  syncGoogleUser,
  getPublicUserById,
  getAllPublicUsers,
  findUserByEmail
} from '../services/auth.service.js';

// Inscription locale
export async function register(req, res) {
  
  try {
    const user = await registerLocalUser(req.body);
    
    const token = generateLocalToken(user); 
    const refreshToken = generateRefreshToken(user);

    const cookieOptions = {
        httpOnly: true, // Invisible pour JavaScript
        secure: process.env.NODE_ENV === 'production', // Uniquement sur HTTPS en prod
        sameSite: 'strict', // Protection CSRF
    };

    //Access Token (15 minutes)
    res.cookie('accessToken', token, { 
        ...cookieOptions, 
        maxAge: 15 * 60 * 1000 
    });

    //Refresh Token (7 jours)
    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions, 
        maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    const session = await creerSession(user.utilisateur_id, req);
    res.cookie('sessionToken', session.session_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}
//login local
export async function login(req, res) {
  try {
    const resultat = await loginLocalUser(req.body);//ici resultat contient{token,user, refreshToken}

    const cookieOptions = {
        httpOnly: true, // Invisible pour JavaScript
        secure: process.env.NODE_ENV === 'production', // Uniquement sur HTTPS en prod
        sameSite: 'strict', // Protection CSRF
    };

    //Access Token (15 minutes)
    res.cookie('accessToken', resultat.token, { 
        ...cookieOptions, 
        maxAge: 15 * 60 * 1000 
    });

    //Refresh Token (7 jours)
    res.cookie('refreshToken', resultat.refreshToken, {
        ...cookieOptions, 
        maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    const session = await creerSession(resultat.user.utilisateur_id, req);
    res.cookie('sessionToken', session.session_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      provider: 'local',
      user: resultat.user,
      token: resultat.token,
    });
  }
  catch (error) {
    return res.status(401).json({
      success: false,
      error: error.message || 'Erreur lors de la connexion',
    });
  }
}
//authentification google/supabase
export async function googleAuth(req, res) {
  try {
    const authheader = req.headers.authorization || '';
    const token = req.body.access_token || (authheader.startsWith('Bearer ') ? authheader.split(' ')[1] : '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token Google d\'authentification manquant',
      });
    }
    //verifier le token google/supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(403).json({
        success: false,
        message: 'Token Google d\'authentification invalide ou expiré',
      });
    }
    const existingUser = await findUserByEmail(data.user.email);
    if (existingUser && existingUser.provider !== 'google') {
      return res.status(400).json({
        success: false,
        message: 'Un compte avec cet email existe déjà. Veuillez utiliser la connexion locale.',
      });
    }
    //ici on recupere les infos de l utilisateur a partir du token google/supabase
    const user = await syncGoogleUser({
      sub: data.user.id,
      email: data.user.email,
      user_metadata: data.user.user_metadata,
      //hna le nom prenom sont dans user_metadata

    });
    const localToken = generateLocalToken(user);
    const refreshToken = generateRefreshToken(user);

    const cookieOptions = {
        httpOnly: true, // Invisible pour JavaScript
        secure: process.env.NODE_ENV === 'production', // Uniquement sur HTTPS en prod
        sameSite: 'strict', // Protection CSRF
    };

    //Access Token (15 minutes)
    res.cookie('accessToken', localToken, { 
        ...cookieOptions, 
        maxAge: 15 * 60 * 1000 
    });

    //Refresh Token (7 jours)
    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions, 
        maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    const session = await creerSession(user.utilisateur_id, req);
    res.cookie('sessionToken', session.session_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.status(200).json({
      success: true,
      message: 'Authentification Google réussie',
      provider: 'google',
      user: user,
    });
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'authentification Google',
    });
  }
}

export async function refreshAccessToken(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken; 

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token manquant' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      // Si le refresh token est invalide, on efface les cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(403).json({ success: false, message: 'Refresh token invalide ou expiré.' });
    }

    const user = await getPublicUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // REFRESH TOKEN ROTATION : Générer un nouveau Access ET un nouveau Refresh
    const newAccessToken = generateLocalToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    };

    res.cookie('accessToken', newAccessToken, { 
        ...cookieOptions, 
        maxAge: 15 * 60 * 1000 
    });

    res.cookie('refreshToken', newRefreshToken, {
        ...cookieOptions, 
        maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    return res.status(200).json({ success: true, message: 'Tokens rafraîchis avec succès' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || 'Erreur serveur' });
  }
}

//profil utilisateur connecté
export async function getProfile(req, res) {
  try {
    //req.user vient du middleware d authentification contient user connecté
    const user = await getPublicUserById(req.user.utilisateur_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }
    return res.status(200).json({
      success: true,
      provider: req.user.provider,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération du profil',
    });
  }
}
//pour les admins : recuperer tous les utilisateurs
export async function getAllUsers(req, res) {
  try {
    const users = await getAllPublicUsers();
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération des utilisateurs',
    });
  }
}

export async function logout(req, res) {
  try {
    
    const userId = req.user.utilisateur_id;

    const sessionToken = req.cookies?.sessionToken;
    if (sessionToken) await fermerSession(sessionToken).catch(() => null);
    res.clearCookie('sessionToken');

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json({ 
      success: true, 
      message: "Déconnecté avec succès" 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la déconnexion' 
    });
  }
}