import prisma from '../config/prisma.js';


//j'ai ajouté la fonctionnalité que admin peut promouvoir un autre user
export async function addAdmin({utilisateur_id,niveau_acces}) {
 const result = await prisma.$transaction(async (tx) => {
      await tx.utilisateur.update({
      where: { utilisateur_id },
      data: { role: 'administrateur' },
    });
    const admin = await tx.administrateur.create({
      data: {
        admin_utilisateur_id: utilisateur_id,
        niveau_acces,
      },
    });

    return admin;
  });

  return {
    message: 'Admin ajouté',
    admin: result,
  }; 
}



export async function assignerDirecteur({ utilisateur_id, institution_id, poste, bureau }) {

  const result = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.utilisateur.update({
      where: { utilisateur_id },
      data: { role: 'directeur' },
      select: USER_SELECT,
    });
    await tx.directeur.create({
      data: {
        directeur_id: utilisateur_id,
        institution_id,
        poste: poste || null,
        bureau: bureau || null,
      },
    });

    return updatedUser;
  });

  return {
    message: `${result.prenom} ${result.nom} est maintenant directeur de ${institution.nom}`,
    utilisateur: result,
    institution_id,
  };
}

//promotion
export async function promouvoirProfessionnel({ utilisateur_id, admin_id }) {
  const utilisateur = await prisma.etudiant.findMany({
    where: { statut: 'en_attente' },
  });

//màj statut pro
  const professionnel = await prisma.utilisateur.update({
    where: { professionnel_utilisateur_id: utilisateur_id },
    data: {
      statut: 'valide',
      admin_id,
    },
  });

  return {
    message: `${professionnel.prenom} ${professionnel.nom} a été validé comme professionnel`,
    utilisateur: professionnel,
    professionnel,
  };
}

//reject pro
export async function rejecterProfessionnel({ utilisateur_id, admin_id }) {
  const utilisateur = await prisma.etudiant.findMany({
    where: { statut: 'en_attente' },
  });

//màj statut pro
  const professionnel = await prisma.utilisateur.update({
    where: { professionnel_utilisateur_id: utilisateur_id },
    data: {
      statut: 'refuse',
      admin_id,
    },
  });

  return {
    message: `${professionnel.prenom} ${professionnel.nom} a été refuse comme professionnel`,
    utilisateur: professionnel,
    professionnel,
  };
}
// j' ai ajouter un attribut bloque dans la table utilisateur 
export async function bloquerUtilisateur({ utilisateur_id }) {
  const utilisateur = await prisma.utilisateur.update({
    where: { utilisateur_id },
    data: { bloque: true },
  });

  return {
    message: 'Compte bloqué avec succès',
    utilisateur,
  };
}

export async function debloquerUtilisateur({ utilisateur_id }) {
  const utilisateur = await prisma.utilisateur.update({
    where: { utilisateur_id },
    data: { bloque: false },
  });

  return {
    message: 'Compte débloqué avec succès',
    utilisateur,
  };
}

export async function getProfessionnelsEnAttente() {
  return prisma.professionnel.findMany({
    where: {
        statut: 'en_attente',
    },
    include: {
      utilisateur: {
        select: {
          nom: true,
          prenom: true,
          email: true,
        },
      },
    },
  });
}