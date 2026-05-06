
const { body } = require('express-validator');

const validateAddCertification = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Le titre doit contenir entre 3 et 150 caractères'),

  body('issuingOrganization')
    .trim()
    .notEmpty()
    .withMessage("L'organisme émetteur est requis"),

  body('credentialUrl')
    .optional()
    .isURL()
    .withMessage("L'URL du certificat doit être valide"),

  body('issueDate')
    .optional()
    .isISO8601()
    .withMessage('La date doit être au format valide'),
];

module.exports = { validateAddCertification };