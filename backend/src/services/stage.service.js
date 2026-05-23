import prisma from '../config/prisma.js';
import { supabase } from '../config/supabase.js';
import { creerNotification } from './notification.service.js';

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
  
    const stageExistant = await prisma.experience.findFirst({
        where: { utilisateur_id: etudiantId, type: 'stage', titre: data.titre },
      });
      
      if (stageExistant) {
        throw new Error('Stage déjà existant');
      }

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
        rapport_stage: data.rapport_stage ?? null, //URL ou null
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

      const etudiant = await tx.utilisateur.findUnique({
        where: { utilisateur_id: etudiantId },
        select: { nom: true, prenom: true },
      });

      await creerNotification(
        professeur.utilisateur_id,
        `L'étudiant ${etudiant.prenom} ${etudiant.nom} demande la validation de son stage "${data.titre}".`,
        'validation_stage'
      );
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
  return prisma.experience.findMany({
    where: { utilisateur_id: etudiantId, type: 'stage' },
    include: {
      stage: { include: { validation: true } },
      competences: true,
      documentations: true,
    },
    orderBy: { date_experience: 'desc' },
  });
};

export const updateStage = async (etudiantId, experienceId, data, photoUrl) => {
  return await prisma.$transaction(async (tx) => {
    //verifier que le stage appartient vrai a l'etudiant
    const experience = await tx.experience.findFirst({
      where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'stage' },
      include: {
        stage: {
          include: {
            validation: {
              include: {
                professeur: { include: { utilisateur: true } },
              },
            },
          },
        },
      },
    });

    if (!experience) throw new Error('Stage non trouvé');

    const debut = data.date_debut ? new Date(data.date_debut) : experience.date_experience;
    const fin = data.date_fin ? new Date(data.date_fin) : new Date(experience.date_experience.getTime() + parseInt(experience.stage.duree) * 24 * 60 * 60 * 1000); //????
    const duree = (data.date_debut || data.date_fin) ? String(Math.ceil((fin - debut) / (1000 * 60 * 60 * 24))) : experience.stage.duree;

    await tx.experience.update({
      where: { experience_id: experienceId },
      data: {
        titre: data.titre ?? experience.titre,
        date_experience: debut,
        description: data.description ?? experience.description,
        visibilite: false, //invisible, il faut le revalider
      },
    });

    await tx.stage.update({
      where: { experience_id: experienceId },
      data: {
        duree: duree,
        missions_realisees: data.missions_realisees ?? experience.stage.missions_realisees,
        rapport_stage: data.rapport_stage ?? experience.stage.rapport_stage,
      },
    });

    //update les competances
    if (data.technologies !== undefined || data.domaines !== undefined) {
      const technologies = JSON.parse(data.technologies || '[]');
      const domaines = JSON.parse(data.domaines || '[]');

      //supprimer les anciennes
      await tx.competence.deleteMany({
        where: {
          experiences: {
            some: { experience_id: experienceId },
          },
        },
      });

      //creer les nouvelles
      await Promise.all([
        ...technologies.map((nom) =>
          tx.competence.create({
            data: {
              type: 'technologie',
              nom,
              experiences: { connect: { experience_id: experienceId } },
            },
          })
        ),
        ...domaines.map((nom) =>
          tx.competence.create({
            data: {
              type: 'domaine',
              nom,
              experiences: { connect: { experience_id: experienceId } },
            },
          })
        ),
      ]);
    }

    //si deja le stage est dans la table du valideStage
    if (experience.stage.validation) {
      let profId = experience.stage.validation.utilisateur_id;

      // L'étudiant veut changer de prof
      if (data.email_professeur) {
        const nouveauProf = await tx.utilisateur.findUnique({
          where: { email: data.email_professeur },
          include: { professeur: true },
        });
        if (!nouveauProf || !nouveauProf.professeur) {
          throw new Error('Professeur non trouvé avec cet email');
        }
        profId = nouveauProf.utilisateur_id;
      }

      await tx.valideStage.update({
        where: { experience_id: experienceId },
        data: {
          statut: 'en_attente',
          utilisateur_id: profId,
          date_d_action: null,
          commentaire: null,
        },
      });

      const etudiant = await tx.utilisateur.findUnique({
        where: { utilisateur_id: etudiantId },
        select: { nom: true, prenom: true },
      });

      await creerNotification(
        profId,
        `L'étudiant ${etudiant.prenom} ${etudiant.nom} a modifié son stage "${data.titre ?? experience.titre}". Une nouvelle validation est requise.`,
        'validation_stage'
      );

    // le stage n'a pa de validation et l'etudiant veut ajouter un prof
    } else if (data.email_professeur) {
      const prof = await tx.utilisateur.findUnique({
        where: { email: data.email_professeur },
        include: { professeur: true },
      });
      if (!prof || !prof.professeur) {
        throw new Error('Professeur non trouvé avec cet email');
      }

      await tx.valideStage.create({
        data: {
          utilisateur_id: prof.utilisateur_id,
          experience_id: experienceId,
          statut: 'en_attente',
        },
      });

      const etudiant = await tx.utilisateur.findUnique({
        where: { utilisateur_id: etudiantId },
        select: { nom: true, prenom: true },
      });

      await creerNotification(
        prof.utilisateur_id,
        `L'étudiant ${etudiant.prenom} ${etudiant.nom} demande la validation de son stage "${data.titre ?? experience.titre}".`,
        'validation_stage'
      );
    }

    if (photoUrl) {
      const docExistante = await tx.documentation.findFirst({
        where: { experience_id: experienceId },
      });
      if (docExistante) {
        await tx.documentation.update({
          where: { documentation_id: docExistante.documentation_id },
          data: { captures: photoUrl },
        });
      } else {
        await tx.documentation.create({
          data: { captures: photoUrl, experience_id: experienceId },
        });
      }
    }

    return tx.experience.findUnique({
      where: { experience_id: experienceId },
      include: {
        stage: { include: { validation: true } },
        competences: true,
        documentations: true,
      },
    });
  });
};

//pour le prof

export const getDemandesValidationProfesseur = async (profId) => {
  return prisma.valideStage.findMany({
    where: { 
      utilisateur_id: profId,
      statut: 'en_attente'
     },
    include: {
      stage: {
        include: {
          experience: {
            include: {
              etudiant: {
                include: {
                  utilisateur: {
                    select: { nom: true, prenom: true, email: true },
                  },
                },
              },
              competences: true,
              documentations: true,
            },
          },
        },
      },
    },
    orderBy: { date_d_action: 'desc' },
  });
};

export const traiterValidationStage = async (profId, experienceId, statut, commentaire) => {
  const validation = await prisma.valideStage.findUnique({
    where: { experience_id: experienceId },
    include: {
      stage: {
        include: {
          experience: { select: { titre: true, utilisateur_id: true } },
        },
      },
    },
  });

  if (!validation) throw new Error('Demande de validation non trouvée');
  if (validation.utilisateur_id !== profId) throw new Error('Accès refusé');
  if (validation.statut !== 'en_attente') throw new Error('Cette demande a déjà été traitée');

  const updated = await prisma.valideStage.update({
    where: { experience_id: experienceId },
    data: {
      statut,
      commentaire: commentaire ?? null,
      date_d_action: new Date(),
    },
  });

  //rendre stage visible 
  if (statut === 'valide') {
    await prisma.experience.update({
      where: { experience_id: experienceId },
      data: { visibilite: true },
    });
  }

  //notification pour etudiant
  const etudiantId = validation.stage.experience.utilisateur_id;
  const titreStage = validation.stage.experience.titre;

  const messageEtudiant =
    statut === 'valide'
      ? `Votre stage "${titreStage}" a été validé par votre professeur.`
      : `Votre stage "${titreStage}" a été refusé. Commentaire : ${commentaire ?? 'Aucun commentaire'}`;

  await creerNotification(etudiantId, messageEtudiant, 'validation_stage');

  return updated;
};

export const getStagesVisiblesByEtudiant = async (etudiantId) => {
  return prisma.experience.findMany({
    where: { utilisateur_id: etudiantId, type: 'stage', visibilite: true },
    include: {
      stage: { include: { validation: true } },
      competences: true,
      documentations: true,
    },
    orderBy: { date_experience: 'desc' },
  });
};