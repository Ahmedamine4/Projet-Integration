import express from "express";
import {
  getMesNotifications,
  getMesNotificationsNonLues,
  lireNotification,
  supprimerNotificationController,
} from "../controllers/notification.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getMesNotifications);

router.get("/non-lues", getMesNotificationsNonLues);

router.patch("/:notificationId/lire", lireNotification);

router.delete("/:notificationId", supprimerNotificationController);

export default router;