// Done
import prisma from '../config/prisma.js';
import { TypeExperience, StatutValidation } from '@prisma/client';

export const createCertification = async (data, userId) => {
  return await prisma.$transaction(async (tx) => {
    
    //  Création de l'Experience (heritage)
    const experience = await tx.experience.create({
      data: {
        titre: data.title,
        type: TypeExperience.certification,
        date_experience: data.issueDate ? new Date(data.issueDate) : new Date(),
        description: data.description || null,
        visibilite: data.visibleToEveryone ?? true,
        utilisateur_id: userId,
      },
    });

    //  Création de la Certification
    const certification = await tx.certification.create({
      data: {
        experience_id: experience.experience_id,
        document: data.credentialUrl || null,
        lien_URL: data.credentialUrl || null,
        code: data.code || null,
      },
    });

    return {
      experience,
      certification
    };
  });
};

export const getMyCertifications = async (userId) => {
  return await prisma.certification.findMany({
    where: {
      experience: {
        utilisateur_id: userId
      }
    },
    include: {
      experience: true,
      validation: true
    },
    orderBy: {
      experience: { 
        date_experience: 'desc' 
      }
    }
  });
};