import express from "express";
import { validerProjet } from "../controllers/projet.controller.js";

import {
  authMiddleware,
  authorizeRoles,
  ROLES,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.put(
  "/validprojets/:id",
  authMiddleware,
  authorizeRoles(ROLES.PROFESSEUR),
  validerProjet
);

export default router;