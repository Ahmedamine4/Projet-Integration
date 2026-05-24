import * as UserService from '../services/update_utilisateur.service.js';

export const updatePersonalInformationsController = async(req,res) => {
    try {
        const userId = req.user.utilisateur_id;
        const {nom, prenom, email, current_password, new_password} = req.body;

        if (!userId) {
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

export const LogoutFromAllDevicesController = async(req,res) => {
    try {
        const userId = req.user.utilisateur_id;

        if (!userId) {
            return res.status(400).json({error: "ID utilisateur invalide dans l'URL"});
        }
        const result = await UserService.LogoutFromAllDevices(userId);
        res.status(200).json({
            message: "Vous avez été déconnecté de tous les appareils avec succès.",
            count: result.count //Numbres of devices disconnected
        });

    } catch(error) {
        res.status(500).json({error: "Erreur lors de la déconnexion globale", details: error.message});
    }
};

export const deleteaccountController = async(req,res) => {
    try {
        const userId = req.user.utilisateur_id;

        if (!userId) {
            return res.status(400).json({ error: "ID utilisateur invalide dans l'URL" });
        }
        const deletedUser = await UserService.deleteaccount(userId);
        res.status(200).json({
            message: "Compte supprimé définitivement.",
            data: deletedUser
        });

    } catch (error) {
        res.status(500).json({error: "Erreur lors de la suppression du compte", details: error.message});
    }
}