import { getSessionsByUser, getAllSessions } from '../services/session.service.js';


export const getMesSessions = async (req, res) => {
  try {
    const sessions = await getSessionsByUser(req.user.utilisateur_id); 
    return res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};


export const getAdminSessions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const data = await getAllSessions({ page, limit });
    
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};