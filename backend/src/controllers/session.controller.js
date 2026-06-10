import prisma from '../config/prisma.js';
import {
  getSessionsActives,
  getAllSessions,
  fermerSession,
  fermerAutresSessions,
} from '../services/session.service.js';


export const getMesSessions = async (req, res) => {
  try {
    const userId = req.user.utilisateur_id;
    const sessionTokenCourant = req.cookies?.sessionToken;
    const sessions = await getSessionsActives(userId);

    const data = sessions.map(s => ({
      ...s,
      session_token: undefined, // ne pas exposer le token
      is_current: s.session_token === sessionTokenCourant,
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const logoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.utilisateur_id;

    const session = await prisma.connexion.findUnique({
      where: { connexion_id: sessionId },
    });

    if (!session || session.utilisateur_id !== userId) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    // Ne pas permettre de fermer la session courante via cette route
    const sessionTokenCourant = req.cookies?.sessionToken;
    if (session.session_token === sessionTokenCourant) {
      return res.status(400).json({ success: false, message: 'Utilisez /logout pour fermer la session courante' });
    }

    await fermerSession(session.session_token);
    return res.status(200).json({ success: true, message: 'Session fermée' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const logoutAutresSessions = async (req, res) => {
  try {
    const userId = req.user.utilisateur_id;
    const sessionTokenCourant = req.cookies?.sessionToken;

    const result = await fermerAutresSessions(userId, sessionTokenCourant);
    return res.status(200).json({ success: true, message: `${result.count} session(s) fermée(s)` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getAdminSessions = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 50;
    const data  = await getAllSessions({ page, limit });
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};