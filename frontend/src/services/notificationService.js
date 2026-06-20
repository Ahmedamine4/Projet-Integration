import api from './api';

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,
    id: user.id ?? user.utilisateur_id,
    firstName: user.firstName ?? user.prenom ?? '',
    lastName: user.lastName ?? user.nom ?? '',
    avatar: user.avatar ?? user.photo ?? '',
  };
}

function normalizeNotification(notification) {
  return {
    ...notification,
    id: notification.id ?? notification.notification_id,
    read: notification.read ?? Boolean(notification.lu),
    createdAt: notification.createdAt ?? notification.date_notification,
    targetUserId:
      notification.targetUserId
      ?? notification.utilisateur_cible_id
      ?? notification.utilisateur_id,
    sourceUser:
      notification.sourceUser
      ?? normalizeUser(notification.utilisateur_source),
  };
}

function extractNotifications(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.notifications)) {
    return payload.notifications;
  }

  return [];
}

/**
 * @param {string} endpoint
 * @returns {Promise<import('@/types/notification').Notification[]>}
 */
export async function getNotifications(endpoint = '/notifications') {
  const response = await api.get(endpoint);

  return extractNotifications(response.data).map(normalizeNotification);
}

/**
 * @param {string} notificationId
 * @returns {Promise<void>}
 */
export async function markNotificationAsRead(notificationId) {
  await api.patch(`/notifications/${notificationId}/lire`);
}
