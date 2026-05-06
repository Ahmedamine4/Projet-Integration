const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CertificationService {
  async createCertification(data) {
    return await prisma.certification.create({
      data: {
        userId: data.userId,
        title: data.title,
        issuingOrganization: data.issuingOrganization,
        issueDate: data.issueDate ? new Date(data.issueDate) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        credentialUrl: data.credentialUrl,
        description: data.description,
      },
    });
  }
}

module.exports = new CertificationService();