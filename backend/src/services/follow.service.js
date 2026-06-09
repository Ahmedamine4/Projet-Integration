import prisma from '../config/prisma.js';
import { creerNotification } from './notification.service.js';

export const followUser = async (followerId, followingId) => {
  if (followerId === followingId) throw new Error('Vous ne pouvez pas vous suivre vous-même');

  const cible = await prisma.utilisateur.findUnique({
    where: { utilisateur_id: followingId },
    select: { utilisateur_id: true, nom: true, prenom: true },
  });
  if (!cible) throw new Error('Utilisateur non trouvé');

  const existant = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });
  if (existant) throw new Error('Vous suivez déjà cet utilisateur');

  const follow = await prisma.follow.create({
    data: { followerId, followingId },
  });

  const suiveur = await prisma.utilisateur.findUnique({
    where: { utilisateur_id: followerId },
    select: { nom: true, prenom: true },
  });

  await creerNotification(
    followingId,
    `${suiveur.prenom} ${suiveur.nom} a commence a vous suivre.`,
    'nouveau_follower',
    { utilisateurSourceId: followerId }
  );

  return follow;
};

export const unfollowUser = async (followerId, followingId) => {
  const existant = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });
  if (!existant) throw new Error('Vous ne suivez pas cet utilisateur');

  await prisma.follow.delete({
    where: { followerId_followingId: { followerId, followingId } },
  });
};

export const getFollowers = async (userId, callerId) => {
  const followers = await prisma.follow.findMany({
    where: { followingId: userId },
    orderBy: { createdAt: 'desc' },
    select: {
      createdAt: true,
      follower: {
        select: {
          utilisateur_id: true,
          nom: true,
          prenom: true,
          role: true,
          photo: true,
        },
      },
    },
  });

  return Promise.all(
    followers.map(async (f) => {
      const isFollowing = !!(await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: callerId, followingId: f.follower.utilisateur_id } },
      }));
      return { ...f.follower, followedAt: f.createdAt, isFollowing };
    })
  );
};

export const getFollowing = async (userId, callerId) => {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    orderBy: { createdAt: 'desc' },
    select: {
      createdAt: true,
      following: {
        select: {
          utilisateur_id: true,
          nom: true,
          prenom: true,
          role: true,
          photo: true,
        },
      },
    },
  });

  return Promise.all(
    following.map(async (f) => {
      const isFollowing = !!(await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: callerId, followingId: f.following.utilisateur_id } },
      }));
      return { ...f.following, followedAt: f.createdAt, isFollowing };
    })
  );
};