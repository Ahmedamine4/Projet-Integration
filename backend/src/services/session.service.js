import prisma from '../config/prisma.js';
import { parseSessionInfo } from '../utils/session.utils.js';


export const loggerSession = async (utilisateurId, action, req) => {

  const { browser, device_type, os, browser_version, ip, ville, pays } = parseSessionInfo(req);

  return prisma.connexion.create({
    data: {
      utilisateur_id: utilisateurId,
      action,
      browser,
      device_type,
      os,
      browser_version,
      ip,
      ville,
      pays
    },
  });
};


export const getSessionsByUser = async (utilisateurId) => {
  return prisma.connexion.findMany({
    where: { utilisateur_id: utilisateurId },
    orderBy: { date_action: "desc" },
    take: 20,
  });
};


export const getAllSessions = async ({ page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;
  
  const [sessions, total] = await Promise.all([
    prisma.connexion.findMany({
      orderBy: { date_action: "desc" },
      skip, take: limit,
      include: { utilisateur: { select: { nom: true, prenom: true, email: true } } },
    }),
    prisma.connexion.count(),
  ]);
  
  return { sessions, total, page, limit };
};