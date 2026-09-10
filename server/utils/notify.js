import Notification from "../models/Notification.js";

export const notifyUser = async ({ recipient, type, title, message, link = "" }) => {
  try {
    if (!recipient) return;
    await Notification.create({ recipient, type, title, message, link });
  } catch (error) {
    console.error("Notification create error:", error.message);
  }
};