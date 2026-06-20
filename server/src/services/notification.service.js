const Notification = require("../models/Notification.model");
const logger = require("../utils/logger");

/**
 * Create an in-app notification for a user.
 */
const createNotification = async ({ recipientId, type, title, message, link = "" }) => {
  try {
    const notification = await Notification.create({
      recipientId,
      type,
      title,
      message,
      link,
    });
    return notification;
  } catch (error) {
    // Notifications are non-critical — log but don't throw
    logger.error("Failed to create notification:", error.message);
    return null;
  }
};

/**
 * Bulk-create notifications for multiple recipients.
 */
const broadcastNotification = async (recipientIds, { type, title, message, link = "" }) => {
  try {
    const docs = recipientIds.map((recipientId) => ({
      recipientId,
      type,
      title,
      message,
      link,
    }));
    await Notification.insertMany(docs, { ordered: false });
  } catch (error) {
    logger.error("Failed to broadcast notification:", error.message);
  }
};

module.exports = { createNotification, broadcastNotification };
