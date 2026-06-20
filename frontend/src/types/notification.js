/**
 * @typedef {Object} NotificationUser
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string=} avatar
 */

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} type
 * @property {string} message
 * @property {boolean} read
 * @property {string} createdAt
 * @property {string} targetUserId
 * @property {string} sourceUserId
 * @property {NotificationUser=} sourceUser
 */

export {};

