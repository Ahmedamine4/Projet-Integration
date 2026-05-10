//Done

export const createCertification = async (data) => {
  const { 
    etudiantId, 
    title, 
    issuingOrganization, 
    issueDate, 
    expiryDate, 
    credentialUrl, 
    description, 
    code 
  } = data;

  const certification = await prisma.certification.create({
    data: {
      titre: title,
      description: description || null,
      date_certification:  new Date(issueDate) ,
      visibilite: true,
      utilisateur_id: etudiantId,
      document: credentialUrl,
    },
    include: {
      certification: true,
      validation: true
    }
  });

  return certification;
};

export const getCertificationsByEtudiantId = async (etudiantId) => {
  return await prisma.certification.findMany({
    where: {
      certification: {
        utilisateur_id: etudiantId
      }
    },
    include: {
      certification: {
        select: {
          titre: true,
          description: true,
          date_experience: true,
          visibilite: true
        }
      },
      validation: true
    },
    orderBy: {
      certification: { date_certification: 'desc' }
    }
  });
};