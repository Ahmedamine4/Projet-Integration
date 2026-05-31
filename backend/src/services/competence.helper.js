import { TypeCompetence } from '@prisma/client';


const formaterNomCompetence = (nom) => {
  if (!nom) return '';
  
  // 1. Enlève les espaces au début/fin et met tout en minuscules
  const cleanNom = nom.trim().toLowerCase(); 
  
  // 2. Met la première lettre en majuscule et recolle le reste
  return cleanNom.charAt(0).toUpperCase() + cleanNom.slice(1);
};


export const lierCompetenceExperience = async (tx, experienceId, etudiantId, nomBrut, type) => {

    if (type !== TypeCompetence.technologie && type !== TypeCompetence.domaine) {
    throw new Error(`Type de compétence invalide : ${type}`);
}
    
    const nom = formaterNomCompetence(nomBrut);
  //chercher ou creer la competence
  let competence = await tx.competence.findFirst({
    where: { nom, type },
  });

  if (!competence) {
    competence = await tx.competence.create({
      data: { type, nom },
    });
  }

  //compter les liaisons existantes de cet etudiant avec cette competence
  const count = await tx.competenceDeveloppee.count({
    where: {
        competence_id: competence.competence_id,
        experience: { utilisateur_id: etudiantId },
    },
  });

  const nouveauNiveau = String(count + 1);

  //maj toutes les liaisons existantes au nouveau niveau
  if (count > 0) {
    await tx.competenceDeveloppee.updateMany({
      where: {
        competence_id: competence.competence_id,
        experience: { utilisateur_id: etudiantId },
      },
      data: { niveau: nouveauNiveau },
    });
  }

  //creer la nouvelle liaison avec le meme niveau
  return tx.competenceDeveloppee.create({
    data: {
      experience_id: experienceId,
      competence_id: competence.competence_id,
      niveau: nouveauNiveau,
    },
  });
};


export const lierCompetencesExperience = async (tx, experienceId, etudiantId, noms, type) => {
  return Promise.all(
    noms.map(nom => lierCompetenceExperience(tx, experienceId, etudiantId, nom, type))
  );
};


export const supprimerCompetencesDeveloppees = async (tx, experienceId, etudiantId) => {
  
  const liaisonsASupprimer = await tx.competenceDeveloppee.findMany({
    where: { experience_id: experienceId },
    select: { competence_id: true },
  });

  await tx.competenceDeveloppee.deleteMany({
    where: { experience_id: experienceId },
  });


  for (const { competence_id } of liaisonsASupprimer) {
    const liaisonsRestantes = await tx.competenceDeveloppee.findMany({
      where: {
        competence_id,
        experience: { utilisateur_id: etudiantId },
      },
      select: { experience_id: true, niveau: true },
    });

    if (liaisonsRestantes.length > 0) {
      const niveauActuel = parseInt(liaisonsRestantes[0].niveau ?? '1', 10);
      const niveauReduit = String(Math.max(1, niveauActuel - 1));

      await tx.competenceDeveloppee.updateMany({
        where: {
          competence_id,
          experience: { utilisateur_id: etudiantId },
        },
        data: { niveau: niveauReduit },
      });
    }
  }
};