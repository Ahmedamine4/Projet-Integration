const certificationService = require('../services/certificationService');
const asyncHandler = require('../utils/asyncHandler');

//add certif
exports.addCertification = asyncHandler(async (req, res) => {
  const {  title, issuingOrganization, issueDate, expiryDate, credentialUrl, description, code } = req.body;

  const etudiantId = req.user.etudiant_utilisateur_id || req.user.id;

  const certification = await certificationService.createCertification({
    etudiantId,
    title,
    issuingOrganization,
    issueDate,
    expiryDate,
    credentialUrl,
    description,
    code
  });

  res.status(201).json({
    success: true,
    message: "Certification ajoutée avec succès",
    data: certification
  });
});

//get certif
exports.getMyCertifications = asyncHandler(async (req, res) => {
  const etudiantId = req.user.etudiant_utilisateur_id || req.user.id;

  const certifications = await prisma.certification.findMany({
    where: {
      experience: {
        utilisateur_id: etudiantId
      }
    },
    include: {
      experience: true,
      validation: true
    },
    orderBy: { experience: { date_experience: 'desc' } }
  });

  res.json({ success: true, data: certifications });
});

