import prisma from '../config/prisma.js';
import { creerNotification } from './notification.service.js';

const ALLOWED_FIELDS = ['github', 'instagram', 'x', 'linkedin'];

export async function getSocialMedia(userId) {
  const user = await prisma.utilisateur.findUnique({
    where: { utilisateur_id: userId },
    select: {
      github: true,
      instagram: true,
      x: true,
      linkedin: true,
    },
  });

  if (!user) throw new Error('Utilisateur non trouvé');
  return user;
}

export async function updateSocialMedia(userId, data) {

  const sanitized = {};
  if (data.github !== undefined) sanitized.github = data.github?.trim() || null;
  if (data.instagram !== undefined) sanitized.instagram = data.instagram?.trim() || null;
  if (data.x !== undefined) sanitized.x = data.x?.trim() || null;
  if (data.linkedin !== undefined) sanitized.linkedin = data.linkedin?.trim() || null;

  if (Object.keys(sanitized).length === 0) {
    throw new Error('Aucun champ valide fourni');
  }


  const updated = await prisma.utilisateur.update({
    where: { utilisateur_id: userId },
    data: sanitized,
    select: {
      github: true,
      instagram: true,
      x: true,
      linkedin: true,
    },
  });

  await creerNotification(
    userId,
    'Vos liens sociaux ont ete mis a jour.',
    'portfolio_update',
    { utilisateurSourceId: userId }
  );

  return updated;
}
