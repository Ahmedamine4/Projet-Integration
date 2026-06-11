import * as UserService from '../services/update_utilisateur.service.js';

export const updatePersonalInformationsController = async(req,res) => {
    try {
        const {userId} = req.params;
        const {nom, prenom, email, current_password, new_password} = req.body;

        if (!userId || userId === ":userId") {
            return res.status(400).json({ error: "ID utilisateur invalide dans l'URL" });
        }

        let result;

        if (nom) {
            result = await UserService.updateNom(userId,nom);
        }
        if (prenom) {
            result = await UserService.updatePrenom(userId,prenom);
        }
        if (email) {
            result = await UserService.updateEmail(userId,email);
        }
        if (new_password) {
            result = await UserService.updatePassword(userId, current_password, new_password);
        }

        res.status(200).json({message: "Mise à jour réussie", data: result});
    } catch(error) {
        res.status(500).json({error: error.message});
    }
};

export const requestProfessionnelStatusController = async (req, res) => {
  try {
    const userId = req.user.utilisateur_id; 
    const { entreprise, poste, email_professionnel } = req.body;

    if (!entreprise || !poste || !email_professionnel) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    const result = await UserService.createProfessionnelProfile(userId, {
      entreprise,
      poste,
      email_professionnel
    });

    res.status(201).json({ message: "Demande de statut professionnel envoyée.", data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAccountController = async (req, res) => {
  try {
    const userId = req.user.utilisateur_id; 
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Veuillez entrer votre mot de passe pour confirmer la suppression." });
    }

    await UserService.deleteUserAccount(userId, password);

    res.status(200).json({ message: "Compte et données associées supprimés avec succès." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};