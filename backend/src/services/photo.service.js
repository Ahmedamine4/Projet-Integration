import prisma from '../config/prisma.js';
import { remplacerPhoto } from '../utils/photo.utils.js';

export const uploadUserProfilePhoto = async (userId, file) => {
  if (!file) {
    throw new Error('Fichier photo manquant');
  }

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { utilisateur_id: userId },
    select: { photo: true },
  });

  if (!utilisateur) {
    throw new Error('Utilisateur introuvable');
  }

  const photoUrl = await remplacerPhoto(file, utilisateur.photo, 'profil');

  return prisma.utilisateur.update({
    where: { utilisateur_id: userId },
    data: { photo: photoUrl },
    select: { utilisateur_id: true, photo: true },
  });
};

export const getUserProfilePhotoByUserId = async (userId) => {
  return prisma.utilisateur.findUnique({
    where: { utilisateur_id: userId },
    select: { photo: true },
  });
};
