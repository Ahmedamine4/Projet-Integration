import * as UserService from '../services/update_utilisateur.service.js';

export const updatePersonalInformationsController = async(req,res) => {
    try {
        const {userId} = req.params;
        const requesterId = req.user?.utilisateur_id;
        const {nom, prenom, email, current_password, new_password} = req.body;

        if (!userId || userId === ":userId") {
            return res.status(400).json({ error: "ID utilisateur invalide dans l'URL" });
        }

        if (!requesterId) {
            return res.status(401).json({ error: 'Utilisateur non connecte' });
        }

        if (requesterId !== userId) {
            return res.status(403).json({ error: 'Acces refuse : non proprietaire' });
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

        res.status(200).json({message: "Mise Ã  jour rÃ©ussie", data: result});
    } catch(error) {
        res.status(500).json({error: error.message});
    }
};
