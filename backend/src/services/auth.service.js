import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { generateLocalToken } from '../config/jwt.js';

// Champs envoyés au frontend
const USER_SELECT = {
  utilisateur_id: true,
  email: true,
  role: true,
  provider: true,
};

// Normaliser email
function normalizeEmail(email) {
  return email?.trim().toLowerCase();
}

// Supprimer mot de passe
export function sanitizeUser(user) {
  if (!user) return null;

  const { mot_de_passe, ...safeUser } = user;
  return safeUser;
}

// Trouver user par ID
export async function findUserByLocalId(id) {
  return prisma.utilisateur.findUnique({
    where: { utilisateur_id: id },
  });
}

// Trouver user par Supabase
export async function findUserBySupabaseUid(uid) {
  return prisma.utilisateur.findUnique({
    where: { supabase_uid: uid },
  });
}

// Trouver user par email
export async function findUserByEmail(email) {
  return prisma.utilisateur.findUnique({
    where: { email: normalizeEmail(email) },
  });
}

// Vérifier professeur
export async function findProfessorByEmail(email) {
  return prisma.utilisateur.findUnique({
    where: { 
      email: normalizeEmail(email) 
    },
    include: { 
      professeur: true // recupere les infos lie du table professeurs
    }
  });
}

// INSCRIPTION
export async function registerLocalUser(data) {
  // mapping firstName/lastName suppression confirmPassword
  const { firstName, lastName, email, password } = data;

  // renommer pour eviter crash
  const normalizedEmail = email?.trim().toLowerCase();

  if (!lastName || !firstName || !email || !password ) {
    throw new Error('Tous les champs sont requis');
  }

  if (!email.includes('@')) {
    throw new Error('Email invalide');
  }

  if (password.length < 8) {
    throw new Error('Mot de passe trop court');
  }


  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('Email déjà utilisé');
  }


  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.utilisateur.create({
    data: {
      nom: lastName,    // mapping
      prenom: firstName, // mapping
      email: normalizedEmail,
      mot_de_passe: hashedPassword,
      role: 'etudiant', // minuscule pour Prisma
      provider: 'local',
    },
    select: USER_SELECT,
  });

  return user;
}

// LOGIN
export async function loginLocalUser({ email, password }) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error('Email ou mot de passe incorrect');
  }

  if (user.provider !== 'local') {
    throw new Error('Utiliser Google pour se connecter');
  }

  const valid = await bcrypt.compare(password, user.mot_de_passe);

  if (!valid) {
    throw new Error('Email ou mot de passe incorrect');
  }

  const token = generateLocalToken({
    id: user.utilisateur_id,
    email: user.email,
    role: user.role,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
}

// GOOGLE SYNC
export async function syncGoogleUser(decoded) {
  const supabaseUid = decoded.sub;
  const email = normalizeEmail(decoded.email);
  const metadata = decoded.user_metadata || {};
  const fullName = metadata.full_name || "";
  const googlePrenom = metadata.given_name || fullName.split(' ')[0] || "Prénom";
  const googleNom = metadata.family_name || fullName.split(' ').slice(1).join(' ') || "Nom";

  if (!supabaseUid) {
    throw new Error('Token Google invalide');
  }

  let user = await findUserBySupabaseUid(supabaseUid);

  if (user) return sanitizeUser(user);

  user = await findUserByEmail(email);

  if (user) {
    await prisma.utilisateur.update({
      where: { utilisateur_id: user.utilisateur_id },
      data: {
        supabase_uid: supabaseUid,
        provider: 'google',
      },
    });

    return sanitizeUser(user);
  }

  const newUser = await prisma.utilisateur.create({
    data: {
      nom: googleNom,
      prenom: googlePrenom,
      email,
      provider: 'google',
      supabase_uid: supabaseUid,
      role: 'etudiant',
    },
    select: USER_SELECT,
  });

  return newUser;
}

// PROFIL
export async function getPublicUserById(id) {
  return prisma.utilisateur.findUnique({
    where: { utilisateur_id: id },
    select: USER_SELECT,
  });
}

// LISTE USERS (admin)
export async function getAllPublicUsers() {
  return prisma.utilisateur.findMany({
    select: USER_SELECT,
  });
}