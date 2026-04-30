import { generateLocalToken } from '../config/jwt.js';
import { supabase } from '../config/supabase.js';
import {
  registerLocalUser,// pour cree un user local
  loginLocalUser,
  syncGoogleUser,
  getPublicUserById,
  getAllPublicUsers,
} from '../services/auth.service.js';

// Inscription locale
export async function register(req, res) {
  
  try {
    const user = await registerLocalUser(req.body);
    
    // Correction : token 
    const token = generateLocalToken(user); 
    return res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      user,
      token, //  reponse
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
    const resultat = await loginLocalUser(req.body);//ici resultat contient{token,user}

    return res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      provider: 'local',
      token: resultat.token,
      user: resultat.user,
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
    //ici on recupere les infos de l utilisateur a partir du token google/supabase
    const user = await syncGoogleUser({
      sub: data.user.id,
      email: data.user.email,
      user_metadata: data.user.user_metadata,
      //hna le nom prenom sont dans user_metadata

    });
    const localToken = generateLocalToken(user);
    return res.status(200).json({
      success: true,
      message: 'Authentification Google réussie',
      provider: 'google',
      user: user,
      token: localToken
    });
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'authentification Google',
    });
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