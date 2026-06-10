import api from './api';

const USE_FAKE_NOTIFICATIONS = true;

const fakeNotifications = [
  {
    id: 'fake-notification-1',
    type: 'follow',
    message: 'started following your portfolio.',
    read: false,
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    targetUserId: 'current-user',
    sourceUserId: 'user-amina',
    sourceUser: {
      id: 'user-amina',
      firstName: 'Amina',
      lastName: 'Bennani',
    },
  },
  {
    id: 'fake-notification-2',
    type: 'recommendation',
    message: 'sent you a recommendation request for the AI internship project.',
    read: false,
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    targetUserId: 'current-user',
    sourceUserId: 'user-youssef',
    sourceUser: {
      id: 'user-youssef',
      firstName: 'Youssef',
      lastName: 'El Idrissi',
    },
  },
  {
    id: 'fake-notification-3',
    type: 'validation',
    message: 'validated your education details.',
    read: true,
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    targetUserId: 'current-user',
    sourceUserId: 'user-salma',
    sourceUser: {
      id: 'user-salma',
      firstName: 'Salma',
      lastName: 'Ziani',
    },
  },
  {
    id: 'fake-notification-4',
    type: 'project',
    message: 'commented on your portfolio project: Smart Campus Dashboard.',
    read: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    targetUserId: 'current-user',
    sourceUserId: 'user-nadia',
    sourceUser: {
      id: 'user-nadia',
      firstName: 'Nadia',
      lastName: 'Alaoui',
    },
  },
  {
    id: 'fake-notification-5',
    type: 'certification',
    message: 'approved your new certification upload.',
    read: true,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    targetUserId: 'current-user',
    sourceUserId: 'user-karim',
    sourceUser: {
      id: 'user-karim',
      firstName: 'Karim',
      lastName: 'Mansouri',
    },
  },
];

/**
 * @param {string} endpoint
 * @returns {Promise<import('@/types/notification').Notification[]>}
 */
export async function getNotifications(endpoint = '/notifications') {
  if (USE_FAKE_NOTIFICATIONS) {
    return fakeNotifications.map((notification) => ({ ...notification }));
  }

  const response = await api.get(endpoint);

  return response.data.data;
}

/**
 * @param {string} notificationId
 * @returns {Promise<void>}
 */
export async function markNotificationAsRead(notificationId) {
  if (USE_FAKE_NOTIFICATIONS) {
    return;
  }

  await api.patch(`/notifications/${notificationId}/lire`);
}
