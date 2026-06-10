import api from './api';

function normalizeNotification(notification) {
  return {
    ...notification,
    id: notification.id ?? notification.notification_id,
    read: notification.read ?? Boolean(notification.lu),
    createdAt: notification.createdAt ?? notification.date_notification,
    targetUserId: notification.targetUserId ?? notification.utilisateur_id,
  };
}

/**
 * @param {string} endpoint
 * @returns {Promise<import('@/types/notification').Notification[]>}
 */
export async function getNotifications(endpoint = '/notifications') {
  const response = await api.get(endpoint);

  return response.data.data.map(normalizeNotification);
}

/**
 * @param {string} notificationId
 * @returns {Promise<void>}
 */
export async function markNotificationAsRead(notificationId) {
  await api.patch(`/notifications/${notificationId}/lire`);
}
