import { followUser, unfollowUser, getFollowers, getFollowing } from '../services/follow.service.js';

export const follow = async (req, res) => {
  try {
    const followerId = req.user.utilisateur_id;
    const { targetId } = req.body;

    if (!targetId) return res.status(400).json({ success: false, message: 'targetId est requis' });

    const result = await followUser(followerId, targetId);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur follow:', error);
    const errorsMap = {
      'Vous ne pouvez pas vous suivre vous-même': 400,
      'Utilisateur non trouvé': 404,
      'Vous suivez déjà cet utilisateur': 409,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const unfollow = async (req, res) => {
  try {
    const followerId = req.user.utilisateur_id;
    const { targetId } = req.params;

    await unfollowUser(followerId, targetId);
    return res.status(200).json({ success: true, message: 'Vous ne suivez plus cet utilisateur' });
  } catch (error) {
    console.error('Erreur unfollow:', error);
    const errorsMap = {
      'Vous ne suivez pas cet utilisateur': 404,
    };
    const status = errorsMap[error.message];
    if (status) return res.status(status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const listFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const callerId = req.user.utilisateur_id;

    const data = await getFollowers(userId, callerId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Erreur listFollowers:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const listFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const callerId = req.user.utilisateur_id;

    const data = await getFollowing(userId, callerId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Erreur listFollowing:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};