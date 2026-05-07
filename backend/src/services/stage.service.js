import prisma from '../config/prisma.js';
import { supabase } from '../config/supabase.js';

//upload photo sur supabase et collection de url
export const uploadPhoto = async (file) => {
  const fileName = `${Date.now()}_${file.originalname}`;

  const { error } = await supabase.storage
    .from('stages-photos')
    .upload(fileName, file.buffer, { contentType: file.mimetype });

  if (error) throw new Error('Erreur upload photo : ' + error.message);

  const { data } = supabase.storage
    .from('stages-photos')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

export const createStage = async (etudiantId, data, photoUrl) => {

    const debut = new Date(data.date_debut);
    const fin = new Date(data.date_fin);
    const diffMs = fin - debut;
    const duree = String(Math.ceil(diffMs / (1000 * 60 * 60 * 24)));;

    const technologies = JSON.parse(data.technologies || '[]');
    const domaines = JSON.parse(data.domaines || '[]');

  return await prisma.$transaction(async (tx) => {
    const experience = await tx.experience.create({
      data: {
        titre: data.titre,
        date_experience: debut,
        visibilite: false,       // par defaut
        type: 'stage',
        description: data.description,
        utilisateur_id: etudiantId,
      },
    });

    const stage = await tx.stage.create({
      data: {
        experience_id: experience.experience_id,
        duree: duree,
        missions_realisees: data.missions_realisees ?? null,
        rapport_stage: data.rapport_stage ?? null, //URL ou null ?????
      },
    });

    const competencesTech = await Promise.all(
      technologies.map(nom =>
        tx.competence.create({
          data: {
            type: 'technologie',
            nom: nom,
            experiences: {
              connect: { experience_id: experience.experience_id }
            }
          }
        })
      )
    );

    const competencesDomaines = await Promise.all(
      domaines.map(nom =>
        tx.competence.create({
          data: {
            type: 'domaine',
            nom: nom,
            experiences: {
              connect: { experience_id: experience.experience_id }
            }
          }
        })
      )
    );

    //si stage est academique
    let validation = null;
    if (data.is_academique === 'true' && data.email_professeur) {

      const professeur = await tx.utilisateur.findUnique({
        where: { email: data.email_professeur },
        include: { professeur: true }
      });

      if (!professeur || !professeur.professeur) {
        throw new Error('Professeur non trouvé avec cet email');
      }

      validation = await tx.valideStage.create({
        data: {
          utilisateur_id: professeur.utilisateur_id,
          experience_id: experience.experience_id,
          statut: 'en_attente',
        }
      });
    }

    let documentation = null;
    if (photoUrl) {
      documentation = await tx.documentation.create({
        data: {
          captures: photoUrl,
          experience_id: experience.experience_id,
        },
      });
    }

    return { 
      experience, 
      stage, 
      competences: [...competencesTech, ...competencesDomaines],
      validation, 
      documentation 
    };
  });
};


export const getStagesByEtudiant = async (etudiantId) => {
  return await prisma.experience.findMany({
    where: {
      utilisateur_id: etudiantId,
      type: 'stage',
    },
    include: {
      stage: {
        include: { validation: true },
      },
    },
    orderBy: { date_experience: 'desc' },
  });
};