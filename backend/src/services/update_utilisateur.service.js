import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';

export const updateNom = async(userid,new_nom) => {
    return await prisma.utilisateur.update({
        where: {utilisateur_id: userid},
        data: {nom: new_nom},
        select: {utilisateur_id: true, nom: true}
    });
};

export const updatePrenom = async(userid,new_prenom) => {
    return await prisma.utilisateur.update({
        where: {utilisateur_id: userid},
        data: {prenom: new_prenom},
        select: {utilisateur_id: true, prenom: true}
    });
};

export const updatePassword = async(userid,current_password,new_password) => {
    const user = await prisma.utilisateur.findUnique({ where: {utilisateur_id: userid} });

    const isMatched = await bcrypt.compare(current_password, user.mot_de_passe);

    if(!isMatched) throw new Error("L'ancienne mot de passe est incorrecte!");

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(new_password,salt);

    return await prisma.utilisateur.update({
        where: {utilisateur_id: userid},
        data: {mot_de_passe: hash}
    });
};

export const updateEmail = async(userid,new_email) => {
    const existing = await prisma.utilisateur.findUnique({ where: {email: new_email} });
    if (existing) throw new Error("Cet email est déjà utilisé par un autre compte!");

    return await prisma.utilisateur.update({
        where: {utilisateur_id: userid},
        data: {email: new_email},
        select: {utilisateur_id: true, email: true}
    });
};

//Works only for Students and normal users
export const deleteaccount = async (userid) => {
    if (prisma.etudiant) {
        await prisma.etudiant.deleteMany({
            where: { utilisateur_id: userid }
        });
    }
    return await prisma.utilisateur.delete({
        where: {utilisateur_id: userid},
        select: { utilisateur_id: true, nom: true ,email: true }
    });
};

export const LogoutFromAllDevices = async(userid) => {
    return await prisma.connexion.deleteMany({
        where: { utilisateur_id: userid }
    });
};