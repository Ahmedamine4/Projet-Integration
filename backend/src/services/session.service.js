import prisma from '../config/prisma.js';
import { parseSessionInfo } from '../utils/session.utils.js';
import crypto from 'crypto';


export const creerSession = async (utilisateurId, req) => {
  const { browser, browser_version, device_type, os, ip, ville, pays } = parseSessionInfo(req);
  const session_token = crypto.randomUUID();
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

  return prisma.connexion.create({
    data: {
      utilisateur_id: utilisateurId,
      session_token,
      browser,
      browser_version,
      device_type,
      os,
      ip,
      ville,
      pays,
      is_current: true,
      expires_at,
    },
  });
};


export const fermerSession = async (sessionToken) => {
  return prisma.connexion.updateMany({
    where: { session_token: sessionToken },
    data: {
      is_current: false,
      last_active: new Date(),
      date_deconnexion: new Date(),
    },
  }).catch(() => null);
};


export const fermerAutresSessions = async (utilisateurId, sessionTokenCourant) => {
  return prisma.connexion.updateMany({
    where: {
      utilisateur_id: utilisateurId,
      session_token: { not: sessionTokenCourant },
      is_current: true,
    },
    data: {
      is_current: false,
      last_active: new Date(),
      date_deconnexion: new Date(),
    },
  });
};


export const getSessionsActives = async (utilisateurId) => {
  // Supprimer les sessions expirées
  await prisma.connexion.updateMany({
    where: { utilisateur_id: utilisateurId, expires_at: { lt: new Date() } },
    data: {
      is_current: false,
      date_deconnexion: new Date(),
    },
  });

  return prisma.connexion.findMany({
    where: { utilisateur_id: utilisateurId, is_current: true },
    orderBy: { date_connexion: 'desc' },
  });
};


export const getAllSessions = async ({ page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    prisma.connexion.findMany({
      orderBy: { date_connexion: 'desc' },
      skip, take: limit,
      include: { utilisateur: { select: { nom: true, prenom: true, email: true, role: true } } },
    }),
    prisma.connexion.count(),
  ]);

  const events = sessions
    .flatMap((session) => {
      const loginEvent = {
        ...session,
        event_id: `${session.connexion_id}:login`,
        action: 'LOGIN',
        date_action: session.date_connexion,
      };

      if (!session.date_deconnexion) return [loginEvent];

      return [
        loginEvent,
        {
          ...session,
          event_id: `${session.connexion_id}:logout`,
          action: 'LOGOUT',
          date_action: session.date_deconnexion,
        },
      ];
    })
    .sort((a, b) => new Date(b.date_action) - new Date(a.date_action));

  return { sessions: events, total: events.length, page, limit };
};
