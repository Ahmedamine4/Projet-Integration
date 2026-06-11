import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import {
  creerNotification,
  TYPES_NOTIFICATION,
} from "./notification.service.js";

export const updateNom = async (userid, new_nom) => {
  return await prisma.utilisateur.update({
    where: { utilisateur_id: userid },
    data: { nom: new_nom },
    select: { utilisateur_id: true, nom: true },
  });
};

export const updatePrenom = async (userid, new_prenom) => {
  return await prisma.utilisateur.update({
    where: { utilisateur_id: userid },
    data: { prenom: new_prenom },
    select: { utilisateur_id: true, prenom: true },
  });
};

export const updatePassword = async (
  userid,
  current_password,
  new_password,
) => {
  const user = await prisma.utilisateur.findUnique({
    where: { utilisateur_id: userid },
  });

  const isMatched = await bcrypt.compare(current_password, user.mot_de_passe);

  if (!isMatched) throw new Error("L'ancienne mot de passe est incorrecte!");

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(new_password, salt);

  await creerNotification(
    userid,
    "Votre mot de passe a été modifié avec succès.",
    TYPES_NOTIFICATION.PASSWORD_UPDATED,
  );

  return await prisma.utilisateur.update({
    where: { utilisateur_id: userid },
    data: { mot_de_passe: hash },
  });
};

export const updateEmail = async (userid, new_email) => {
  const existing = await prisma.utilisateur.findUnique({
    where: { email: new_email },
  });
  if (existing)
    throw new Error("Cet email est déjà utilisé par un autre compte!");

  await creerNotification(
    userid,
    "Votre adresse email a été mise à jour avec succès.",
    TYPES_NOTIFICATION.EMAIL_UPDATED,
  );

  return await prisma.utilisateur.update({
    where: { utilisateur_id: userid },
    data: { email: new_email },
    select: { utilisateur_id: true, email: true },
  });
};


export const createProfessionnelProfile = async (userid, { entreprise, poste, email_professionnel }) => {
  // 1. Get a random admin ID
  const admins = await prisma.administrateur.findMany({
    select: { admin_utilisateur_id: true }
  });

  if (admins.length === 0) {
    throw new Error("Aucun administrateur disponible pour la validation.");
  }

  const randomAdmin = admins[Math.floor(Math.random() * admins.length)];

  return await prisma.professionnel.create({
    data: {
      professionnel_utilisateur_id: userid,
      entreprise,
      poste,
      email_professionnel,
      statut: "en_attente",
      admin_id: randomAdmin.admin_utilisateur_id
    }
  });
};

export const deleteUserAccount = async (userid, password) => {
  const user = await prisma.utilisateur.findUnique({
    where: { utilisateur_id: userid },
  });

  if (!user) throw new Error("Utilisateur introuvable.");

  const isMatched = await bcrypt.compare(password, user.mot_de_passe);
  if (!isMatched) throw new Error("Mot de passe incorrect. La suppression a échoué.");

  await prisma.utilisateur.delete({ 
    where: { utilisateur_id: userid } 
  });

  return true;
};