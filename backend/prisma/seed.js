import { PrismaClient, RoleUtilisateur, TypeExperience, TypeSpecifique, StatutValidation } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const STATUTS = [
  StatutValidation.en_attente,
  StatutValidation.valide,
  StatutValidation.refuse,
];

const EXPERIENCE_TYPES = [
  TypeExperience.projet,
  TypeExperience.stage,
  TypeExperience.activite,
  TypeExperience.certification,
];

const SPECIFIQUES = [
  TypeSpecifique.academique,
  TypeSpecifique.personnel,
];

const randomItem = (items) => items[Math.floor(Math.random() * items.length)];
const randomDateBetween = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

async function main() {
  console.log('🌱 Début du seed Prisma...');

  const alreadySeeded = await prisma.utilisateur.findUnique({
    where: { email: 'admin@platform.local' },
  });

  if (alreadySeeded) {
    console.log('✅ Le seed a déjà été appliqué. Aucune donnée n’a été dupliquée.');
    return;
  }

  const passwordHash = await bcrypt.hash('P@ssw0rd123', 10);

  console.log('1/8 - Création de l’administrateur');
  const administrateur = await prisma.utilisateur.create({
    data: {
      nom: faker.person.lastName(),
      prenom: faker.person.firstName(),
      email: 'admin@platform.local',
      mot_de_passe: passwordHash,
      role: RoleUtilisateur.administrateur,
      telephone: faker.phone.number('+212 6## ### ###'),
      a_propos: faker.person.bio(),
      linkedin: `https://www.linkedin.com/in/${faker.internet.userName()}`,
      administrateur: {
        create: {
          niveau_acces: 'super_admin',
        },
      },
    },
  });
  console.log(`   ✔ Administrateur créé : ${administrateur.email}`);

  console.log('2/8 - Création des institutions et des directeurs');
  const institutions = [];
  const directeurs = [];

  for (let i = 1; i <= 4; i += 1) {
    const institution = await prisma.institution.create({
      data: {
        nom: faker.company.name() + " University", // Changement ici pour éviter les bugs Faker
        addresse: faker.location.streetAddress(),
        email: faker.internet.email({ provider: `institution${i}.edu` }),
        description: faker.lorem.sentences(2),
        academique: faker.datatype.boolean(),
      },
    });

    institutions.push(institution);

    const directeur = await prisma.utilisateur.create({
      data: {
        nom: faker.person.lastName(),
        prenom: faker.person.firstName(),
        email: `directeur${i}@${faker.internet.domainName()}`,
        mot_de_passe: passwordHash,
        role: RoleUtilisateur.directeur,
        telephone: faker.phone.number('+212 6## ### ###'),
        a_propos: faker.person.bio(),
        directeur: {
          create: {
            poste: `Directeur ${institution.nom}`,
            bureau: `Bureau ${i}0${i}`,
            institution_id: institution.institution_id,
          },
        },
      },
    });

    directeurs.push(directeur);
    console.log(`   ✔ Institution et directeur créés : ${institution.nom}`);
  }

  console.log('3/8 - Création des professionnels');
  const professionnels = [];

  for (let i = 1; i <= 4; i += 1) {
    const professionnel = await prisma.utilisateur.create({
      data: {
        nom: faker.person.lastName(),
        prenom: faker.person.firstName(),
        email: `pro${i}@${faker.internet.domainName()}`,
        mot_de_passe: passwordHash,
        role: RoleUtilisateur.professionnel,
        telephone: faker.phone.number('+212 6## ### ###'),
        a_propos: faker.person.bio(),
        professionnel: {
          create: {
            entreprise: faker.company.name(),
            poste: faker.person.jobTitle(),
            email_professionnel: faker.internet.email(),
            statut: randomItem(STATUTS),
            admin_id: administrateur.utilisateur_id, // CORRIGÉ
          },
        },
      },
    });

    professionnels.push(professionnel);
  }
  console.log(`   ✔ ${professionnels.length} professionnels créés`);

  console.log('4/8 - Création des professeurs');
  const professeurs = [];

  for (let i = 1; i <= 20; i += 1) {
    const connectedInstitutions = faker.helpers.arrayElements(institutions, faker.number.int({ min: 1, max: 2 }));

    const professeur = await prisma.utilisateur.create({
      data: {
        nom: faker.person.lastName(),
        prenom: faker.person.firstName(),
        email: `professeur${i}@${faker.internet.domainName()}`,
        mot_de_passe: passwordHash,
        role: RoleUtilisateur.professeur,
        telephone: faker.phone.number('+212 6## ### ###'),
        a_propos: faker.person.bio(),
        professeur: {
          create: {
            departement: faker.helpers.arrayElement([
              'Génie Logiciel',
              'Génie Informatique',
              'Mathématiques Appliquées',
              'Cybersécurité',
            ]),
            specialite: faker.lorem.words(2),
            institutions: {
              connect: connectedInstitutions.map((institution) => ({
                institution_id: institution.institution_id,
              })),
            },
          },
        },
      },
    });

    professeurs.push(professeur);
  }
  console.log(`   ✔ ${professeurs.length} professeurs créés`);

  console.log('5/8 - Création des étudiants');
  const etudiants = [];

  for (let i = 1; i <= 5; i += 1) {
    const studentInstitution = randomItem(institutions);

    const etudiant = await prisma.utilisateur.create({
      data: {
        nom: faker.person.lastName(),
        prenom: faker.person.firstName(),
        email: `etudiant${i}@${faker.internet.domainName()}`,
        mot_de_passe: passwordHash,
        role: RoleUtilisateur.etudiant,
        telephone: faker.phone.number('+212 6## ### ###'),
        a_propos: faker.person.bio(),
        github: `https://github.com/${faker.internet.userName()}`,
        etudiant: {
          create: {
            promotion: `${faker.number.int({ min: 2024, max: 2027 })}`,
            niveau: faker.helpers.arrayElement(['Licence', 'Master 1', 'Master 2', 'Cycle Ingénieur']),
            etudie: true,
            github_API: `https://api.github.com/users/${faker.internet.userName()}`,
            institutions: {
              create: {
                institution_id: studentInstitution.institution_id,
                statut: randomItem(STATUTS),
                date_debut: randomDateBetween(new Date('2023-09-01'), new Date()),
              },
            },
          },
        },
      },
    });

    etudiants.push(etudiant);
  }
  console.log(`   ✔ ${etudiants.length} étudiants créés`);

  console.log('6/8 - Création des expériences pour les étudiants');
  const experiences = [];
  let experienceCounter = 0;

  for (let studentIndex = 0; studentIndex < etudiants.length; studentIndex += 1) {
    const etudiant = etudiants[studentIndex];
    const experienceCount = studentIndex < 2 ? 4 : 3;

    for (let experienceIndex = 0; experienceIndex < experienceCount; experienceIndex += 1) {
      const type = randomItem(EXPERIENCE_TYPES);
      const specifique = randomItem(SPECIFIQUES);
      const statut = STATUTS[experienceCounter % STATUTS.length];
      const professeur = randomItem(professeurs);
      const institution = randomItem(institutions);

      const experienceData = {
        titre: `${faker.hacker.verb()} ${type} ${faker.word.noun()}`,
        description: faker.lorem.sentences(2),
        date_experience: randomDateBetween(new Date('2023-01-01'), new Date()),
        visibilite: true,
        type,
        type_specifique: specifique,
        utilisateur_id: etudiant.utilisateur_id,
      };

      if (type === TypeExperience.projet) {
        experienceData.projet = {
          create: {
            lien_github: `https://github.com/${faker.internet.userName()}/${faker.git.commitMessage().replace(/\s+/g, '-').toLowerCase()}`,
            lien_youtube: `https://www.youtube.com/watch?v=${faker.string.alphanumeric(11)}`,
            resultat_obtenu: faker.lorem.sentence(),
            validation: {
              create: {
                utilisateur_id: professeur.utilisateur_id, // CORRIGÉ
                statut,
                commentaire: faker.lorem.sentence(),
              },
            },
          },
        };
      }

      if (type === TypeExperience.stage) {
        const start = randomDateBetween(new Date('2023-01-01'), new Date('2025-01-01'));
        const end = new Date(start);
        end.setMonth(end.getMonth() + faker.number.int({ min: 1, max: 6 }));

        experienceData.stage = {
          create: {
            date_fin: end,
            duree: `${faker.number.int({ min: 1, max: 6 })} mois`,
            missions_realisees: faker.lorem.sentences(2),
            rapport_stage: faker.lorem.paragraph(),
            validation: {
              create: {
                utilisateur_id: professeur.utilisateur_id, // CORRIGÉ
                statut,
                commentaire: faker.lorem.sentence(),
              },
            },
          },
        };
      }

      if (type === TypeExperience.activite) {
        experienceData.activite = {
          create: {
            type: faker.helpers.arrayElement(['Atelier', 'Conférence', 'Compétition', 'Séminaire']),
            lieu: faker.location.city(),
            validation: {
              create: {
                institution_id: institution.institution_id,
                statut,
                commentaire: faker.lorem.sentence(),
              },
            },
          },
        };
      }

      if (type === TypeExperience.certification) {
        experienceData.certification = {
          create: {
            document: `https://example.com/certificates/${faker.string.uuid()}`,
            lien_URL: faker.internet.url(),
            code: faker.helpers.slugify(`${faker.word.adjective()}-${faker.word.noun()}`).toUpperCase(),
            institution_id: institution.institution_id,
          },
        };
      }

      const experience = await prisma.experience.create({ data: experienceData });
      experiences.push(experience);
      experienceCounter += 1;
    }
  }

  console.log(`   ✔ ${experiences.length} expériences créées pour les étudiants`);

  console.log('7/8 - Création des interactions');

  for (let i = 1; i <= 10; i += 1) {
    const experience = randomItem(experiences);
    const utilisateur = randomItem([...professeurs, ...professionnels]);

    await prisma.interaction.create({
      data: {
        type: faker.helpers.arrayElement(['commentaire', 'feedback', 'contribution', 'avis']),
        texte: faker.lorem.sentences(2),
        visibilite: true,
        date_interaction: randomDateBetween(experience.date_experience ?? new Date(), new Date()),
        experience_id: experience.experience_id,
        utilisateur_id: utilisateur.utilisateur_id,
      },
    });
  }
  console.log('   ✔ 10 interactions créées');

  console.log('8/8 - Création des lettres de recommandation');
  const lettresDeRecommandations = new Set();

  for (let i = 0; i < 5; i += 1) {
    let etudiant = randomItem(etudiants);
    let professeur = randomItem(professeurs);
    const key = `${etudiant.utilisateur_id}-${professeur.utilisateur_id}`; // CORRIGÉ

    if (lettresDeRecommandations.has(key)) {
      professeur = randomItem(professeurs.filter((prof) => prof.utilisateur_id !== professeur.utilisateur_id)); // CORRIGÉ
    }

    lettresDeRecommandations.add(key);

    await prisma.lettresDeRecommendations.create({
      data: {
        utilisateur_id: etudiant.utilisateur_id,
        prof_utilisateur_id: professeur.utilisateur_id, // CORRIGÉ
        objet: faker.lorem.sentence({ min: 3, max: 6 }),
        description: faker.lorem.paragraph(),
        fichier: `https://storage.example.com/lettres/${faker.string.uuid()}.pdf`,
        statut: STATUTS[i % STATUTS.length],
        commentaire: faker.lorem.sentence(),
      },
    });
  }
  console.log('   ✔ 5 lettres de recommandation créées');

  console.log('--------------------------------------------------');
  console.log('🎉 BASE DE DONNÉES REMPLIE AVEC SUCCÈS !');
  console.log(`   Administrateur : ${administrateur.email}`);
  console.log(`   Institutions : ${institutions.map((institution) => institution.nom).join(', ')}`);
  console.log(`   Professionnels : ${professionnels.length}`);
  console.log(`   Professeurs : ${professeurs.length}`);
  console.log(`   Étudiants : ${etudiants.length}`);
  console.log(`   Expériences : ${experiences.length}`);
  console.log('   🔑 Mot de passe pour tous les comptes de test : P@ssw0rd123');
  console.log('--------------------------------------------------');
}

main()
  .catch((error) => {
    console.error('Erreur lors du seeding :', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });