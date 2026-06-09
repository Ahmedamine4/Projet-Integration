import nodemailer from 'nodemailer';

export async function envoyerIdentifiants({
  email,
  prenom,
  motDePasse,
  institution,
}) {
  const transporter =nodemailer.createTransport({service: 'gmail',auth: {
        user:
          process.env.PLATFORM_EMAIL,

        pass:
          process.env.PLATFORM_EMAIL_PASSWORD,
      },
    });

  await transporter.sendMail({
    from: process.env.PLATFORM_EMAIL,
    to: email,

    subject:'Compte directeur créé',

    html: `Vous êtes maintenant directeur de
        ${institution}
        <br><br>
        Mot de passe Temporaire  :
        <b>${motDePasse}</b>
      `,
  });
}