import prisma from '../config/prisma.js';

// Recuperer "a_propos" d'un utilisateur par son id
export async function getAboutByUserId(userId) {
  const user = await prisma.utilisateur.findUnique({
    where: { utilisateur_id: userId },
    select: { utilisateur_id: true, a_propos: true },
  });

  if (!user) return null;

  return { ownerId: user.utilisateur_id, about: user.a_propos ?? null };
}

// modifier le "a_propos" d'un utilisateur par son id
export async function updateUserAboutByUserId(userId, aboutText) {
  return prisma.utilisateur.update({
    where: { utilisateur_id: userId },
    data: { a_propos: aboutText },
    select: { utilisateur_id: true, a_propos: true },
  });
}
