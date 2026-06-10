import api from './api';

/**
 * @param {string} endpoint
 * @returns {Promise<import('@/types/notification').Notification[]>}
 */
export async function getNotifications(endpoint = '/notifications') {
  const response = await api.get(endpoint);

  return response.data.data;
}

/**
 * @param {string} notificationId
 * @returns {Promise<void>}
 */
export async function markNotificationAsRead(notificationId) {
  await api.patch(`/notifications/${notificationId}/lire`);
}
