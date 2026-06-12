import express from "express";
import {
  createOffreController,
  getMesOffresController,
  envoyerDemandeController,
  terminerOffreController,
  getDemandesParOffreController,
} from "../controllers/recruteur.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();
router.use(authMiddleware);

// Créer une offre
router.post("/offres",createOffreController);

// Récupérer les offres du recruteur connecté (pagination)
router.get("/offres",getMesOffresController);

// Terminer une offre
router.patch(
  "/offres/:offreId/terminer",
  terminerOffreController
);

// Envoyer une demande sur une offre
router.post(
  "/offres/:offreId/demandes",
  envoyerDemandeController
);

// Récupérer les demandes d'une offre (pagination)
router.get(
  "/offres/:offreId/demandes",
  getDemandesParOffreController
);

export default router;