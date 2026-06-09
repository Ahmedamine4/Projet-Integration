import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import { creerNotification } from './notification.service.js';

export const updateNom = async (userid, new_nom) => {
    const updated = await prisma.utilisateur.update({
        where: { utilisateur_id: userid },
        data: { nom: new_nom },
        select: { utilisateur_id: true, nom: true }
    });

    await creerNotification(
        userid,
        'Votre nom a ete mis a jour.',
        'portfolio_update',
        { utilisateurSourceId: userid }
    );

    return updated;
};

export const updatePrenom = async (userid, new_prenom) => {
    const updated = await prisma.utilisateur.update({
        where: { utilisateur_id: userid },
        data: { prenom: new_prenom },
        select: { utilisateur_id: true, prenom: true }
    });

    await creerNotification(
        userid,
        'Votre prenom a ete mis a jour.',
        'portfolio_update',
        { utilisateurSourceId: userid }
    );

    return updated;
};

export const updatePassword = async (userid, current_password, new_password) => {
    const user = await prisma.utilisateur.findUnique({ where: { utilisateur_id: userid } });

    const isMatched = await bcrypt.compare(current_password, user.mot_de_passe);

    if (!isMatched) throw new Error("L'ancienne mot de passe est incorrecte!");

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(new_password, salt);

    const updated = await prisma.utilisateur.update({
        where: { utilisateur_id: userid },
        data: { mot_de_passe: hash }
    });

    await creerNotification(
        userid,
        'Votre mot de passe a ete modifie.',
        'compte_securite',
        { utilisateurSourceId: userid }
    );

    return updated;
};

export const updateEmail = async (userid, new_email) => {
    const existing = await prisma.utilisateur.findUnique({ where: { email: new_email } });
    if (existing) throw new Error("Cet email est deja utilise par un autre compte!");

    const updated = await prisma.utilisateur.update({
        where: { utilisateur_id: userid },
        data: { email: new_email },
        select: { utilisateur_id: true, email: true }
    });

    await creerNotification(
        userid,
        'Votre adresse email a ete modifiee.',
        'compte_modifie',
        { utilisateurSourceId: userid }
    );

    return updated;
};
