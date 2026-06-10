import nodemailer from 'nodemailer';

export function isMailConfigured() {
  return Boolean(process.env.PLATFORM_EMAIL && process.env.PLATFORM_EMAIL_PASSWORD);
}

export async function envoyerIdentifiants({
  email,
  prenom,
  motDePasse,
  institution,
  role = 'directeur',
}) {
  if (!isMailConfigured()) {
    throw new Error('Configuration email manquante: PLATFORM_EMAIL et PLATFORM_EMAIL_PASSWORD sont requis');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.PLATFORM_EMAIL,
      pass: process.env.PLATFORM_EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.PLATFORM_EMAIL,
    to: email,
    subject: `Compte ${role} cree`,
    html: `Bonjour ${prenom || ''},
        <br><br>
        Vous etes maintenant ${role} de ${institution}.
        <br><br>
        Mot de passe temporaire :
        <b>${motDePasse}</b>
      `,
  });
}
