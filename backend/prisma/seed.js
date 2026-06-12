/**
 * SEED COMPLET — Plateforme académique (étudiants / professeurs / institutions / professionnels)
 *
 * Couverture des modèles Prisma :
 *  - Utilisateur (+ Administrateur, Directeur, Professeur, Etudiant, Professionnel)
 *  - Institution, Directeur
 *  - Professeur <-> Institution (many-to-many)
 *  - Etudiant, ValideEtudiant (rattachement étudiant <-> institution)
 *  - Competence, CompetenceDeveloppee
 *  - Experience + sous-types (Projet, Stage, Activite, Certification)
 *  - ValideProjet, ValideStage, ValideActivite
 *  - LettresDeRecommendations (prof <-> étudiant)
 *  - Interaction (recommandations / commentaires prof -> expérience étudiant)
 *  - Offre, Demande (professionnels)
 *  - Club, Badge, Portfolio, PortfolioScoreHistory, Repository
 *  - Follow, Notification, Connexion (couverture minimale)
 *
 * Volumes (selon le cahier des charges) :
 *  - 1 administrateur
 *  - 10 institutions, chacune avec son directeur
 *  - 10 professeurs / institution  (100 au total)
 *  - 60 étudiants / institution    (600 au total)
 *  - 5 expériences / étudiant      (3000 au total) avec compétences (1 à 6) + validations
 *  - 30 professionnels avec offres + demandes d'étudiants
 *  - lettres de recommandation + interactions (recommandations) prof <-> étudiant
 */

import {
  PrismaClient,
  RoleUtilisateur,
  TypeExperience,
  TypeSpecifique,
  StatutValidation,
  TypeCompetence,
  TypeOffre,
  StatutOffre,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const PASSWORD = 'P@ssw0rd123';

// ----------------------------------------------------------------------------
// CONSTANTES / ENUMS
// ----------------------------------------------------------------------------

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

const SPECIFIQUES = [TypeSpecifique.academique, TypeSpecifique.personnel];

const TYPES_OFFRE = [
  TypeOffre.CDI,
  TypeOffre.CDD,
  TypeOffre.Stage,
  TypeOffre.Alternance,
  TypeOffre.Freelance,
  TypeOffre.Temps_partiel,
  TypeOffre.Temps_plein,
  TypeOffre.Apprentissage,
  TypeOffre.Consultant,
];

// Pool de compétences (sera créé une seule fois en base)
const TECHNOLOGIES = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'Next.js',
  'Python', 'Django', 'Java', 'Spring Boot', 'PostgreSQL', 'MongoDB',
  'Docker', 'Kubernetes', 'AWS', 'Prisma', 'GraphQL', 'Flutter',
  'Vue.js', 'Tailwind CSS',
];

const DOMAINES = [
  'Intelligence artificielle', 'Cybersécurité', 'Développement web',
  'Développement mobile', 'Cloud computing', 'Data science',
  'Gestion de projet', 'DevOps', 'Réseaux', 'Systèmes embarqués',
  'UI/UX Design', 'Marketing digital', 'Blockchain', 'Big Data',
  'Internet des objets', 'Audit informatique', 'Analyse financière',
  'E-commerce', 'Robotique', 'Bases de données',
];

// ----------------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------------

const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

const randomItems = (items, min, max) => {
  const count = faker.number.int({ min, max: Math.min(max, items.length) });
  return faker.helpers.arrayElements(items, count);
};

const randomDateBetween = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

let githubIdCounter = 1_000_000;

// ----------------------------------------------------------------------------
// MAIN
// ----------------------------------------------------------------------------

async function main() {
  console.log('🌱 Début du seed Prisma...');

  const alreadySeeded = await prisma.utilisateur.findUnique({
    where: { email: 'admin@platform.local' },
  });

  if (alreadySeeded) {
    console.log('✅ Le seed a déjà été appliqué. Aucune donnée n’a été dupliquée.');
    return;
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // ----------------------------------------------------------------------
  // 1. ADMINISTRATEUR
  // ----------------------------------------------------------------------
  console.log('1/10 - Création de l’administrateur');
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
        create: { niveau_acces: 'super_admin' },
      },
    },
    include: { administrateur: true },
  });
  console.log(`   ✔ Administrateur créé : ${administrateur.email}`);

  // ----------------------------------------------------------------------
  // 2. POOL DE COMPETENCES
  // ----------------------------------------------------------------------
  console.log('2/10 - Création du pool de compétences');
  const competences = [];

  for (const nom of TECHNOLOGIES) {
    competences.push(
      await prisma.competence.create({
        data: { type: TypeCompetence.technologie, nom, description: faker.lorem.sentence() },
      }),
    );
  }

  for (const nom of DOMAINES) {
    competences.push(
      await prisma.competence.create({
        data: { type: TypeCompetence.domaine, nom, description: faker.lorem.sentence() },
      }),
    );
  }
  console.log(`   ✔ ${competences.length} compétences créées`);

  // ----------------------------------------------------------------------
  // 3. INSTITUTIONS + DIRECTEURS + PROFESSEURS + ETUDIANTS
  // ----------------------------------------------------------------------
  console.log('3/10 - Création des institutions, directeurs, professeurs et étudiants');

  const institutions = [];
  const directeurs = [];
  const professeurs = []; // tous les professeurs (toutes institutions)
  const etudiants = [];   // tous les étudiants (toutes institutions)

  const NB_INSTITUTIONS = 10;
  const PROFS_PAR_INSTITUTION = 10;
  const ETUDIANTS_PAR_INSTITUTION = 60;

  for (let i = 1; i <= NB_INSTITUTIONS; i += 1) {
    // --- Institution ---
    const institution = await prisma.institution.create({
      data: {
        nom: `${faker.company.name()} University ${i}`,
        addresse: faker.location.streetAddress(),
        email: faker.internet.email({ provider: `institution${i}.edu` }),
        description: faker.lorem.sentences(2),
        academique: true,
      },
    });
    institutions.push(institution);

    // --- Directeur ---
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

    // --- Professeurs de l'institution ---
    const profsInstitution = [];
    for (let p = 1; p <= PROFS_PAR_INSTITUTION; p += 1) {
      const professeur = await prisma.utilisateur.create({
        data: {
          nom: faker.person.lastName(),
          prenom: faker.person.firstName(),
          email: `prof.${i}.${p}.${faker.string.alphanumeric(5)}@${faker.internet.domainName()}`,
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
                'Réseaux et Télécoms',
              ]),
              specialite: faker.lorem.words(2),
              institutions: {
                connect: { institution_id: institution.institution_id },
              },
            },
          },
        },
        include: { professeur: true },
      });
      profsInstitution.push(professeur);
      professeurs.push(professeur);
    }

    // --- Etudiants de l'institution ---
    const etudiantsInstitution = [];
    for (let e = 1; e <= ETUDIANTS_PAR_INSTITUTION; e += 1) {
      const dateDebut = randomDateBetween(new Date('2022-09-01'), new Date('2024-09-01'));

      const etudiant = await prisma.utilisateur.create({
        data: {
          nom: faker.person.lastName(),
          prenom: faker.person.firstName(),
          email: `etu.${i}.${e}.${faker.string.alphanumeric(5)}@${faker.internet.domainName()}`,
          mot_de_passe: passwordHash,
          role: RoleUtilisateur.etudiant,
          telephone: faker.phone.number('+212 6## ### ###'),
          a_propos: faker.person.bio(),
          github: `https://github.com/${faker.internet.userName()}`,
          etudiant: {
            create: {
              promotion: `${faker.number.int({ min: 2023, max: 2027 })}`,
              niveau: faker.helpers.arrayElement(['Licence', 'Master 1', 'Master 2', 'Cycle Ingénieur']),
              etudie: true,
              github_API: `https://api.github.com/users/${faker.internet.userName()}`,
              institutions: {
                create: {
                  institution_id: institution.institution_id,
                  statut: StatutValidation.valide,
                  date_debut: dateDebut,
                  niveau: faker.helpers.arrayElement(['Licence', 'Master 1', 'Master 2', 'Cycle Ingénieur']),
                  description: 'Inscription validée par l’institution',
                },
              },
            },
          },
        },
        include: { etudiant: true },
      });

      etudiantsInstitution.push(etudiant);
      etudiants.push(etudiant);
    }

    console.log(`   ✔ Institution ${i}/${NB_INSTITUTIONS} : ${institution.nom} (1 directeur, ${profsInstitution.length} professeurs, ${etudiantsInstitution.length} étudiants)`);
  }

  console.log(`   ✔ Total : ${institutions.length} institutions, ${professeurs.length} professeurs, ${etudiants.length} étudiants`);

  // ----------------------------------------------------------------------
  // 4. PROFESSIONNELS + OFFRES + DEMANDES
  // ----------------------------------------------------------------------
  console.log('4/10 - Création des professionnels, offres et demandes');

  const professionnels = [];
  const offres = [];
  const NB_PROFESSIONNELS = 30;

  for (let i = 1; i <= NB_PROFESSIONNELS; i += 1) {
    const professionnel = await prisma.utilisateur.create({
      data: {
        nom: faker.person.lastName(),
        prenom: faker.person.firstName(),
        email: `pro.${i}.${faker.string.alphanumeric(5)}@${faker.internet.domainName()}`,
        mot_de_passe: passwordHash,
        role: RoleUtilisateur.professionnel,
        telephone: faker.phone.number('+212 6## ### ###'),
        a_propos: faker.person.bio(),
        linkedin: `https://www.linkedin.com/in/${faker.internet.userName()}`,
        professionnel: {
          create: {
            entreprise: faker.company.name(),
            poste: faker.person.jobTitle(),
            email_professionnel: faker.internet.email(),
            statut: randomItem(STATUTS),
            admin_id: administrateur.utilisateur_id,
          },
        },
      },
      include: { professionnel: true },
    });
    professionnels.push(professionnel);

    // 1 à 3 offres par professionnel
    const nbOffres = faker.number.int({ min: 1, max: 3 });
    for (let o = 0; o < nbOffres; o += 1) {
      const offre = await prisma.offre.create({
        data: {
          entreprise: professionnel.professionnel.entreprise,
          localisation: faker.location.city(),
          technologies: randomItems(TECHNOLOGIES, 2, 5),
          description: faker.lorem.paragraph(),
          type: randomItem(TYPES_OFFRE),
          statut: faker.helpers.arrayElement([StatutOffre.ACTIVE, StatutOffre.TERMINEE]),
          date: randomDateBetween(new Date('2024-01-01'), new Date()),
          utilisateur_id: professionnel.utilisateur_id,
        },
      });
      offres.push(offre);
    }
  }
  console.log(`   ✔ ${professionnels.length} professionnels créés, ${offres.length} offres créées`);

  // Demandes : des étudiants postulent à des offres
  console.log('   - Création des demandes (candidatures étudiants)');
  let nbDemandes = 0;
  for (let i = 0; i < 80; i += 1) {
    const offre = randomItem(offres);
    const etudiant = randomItem(etudiants);

    // Eviter les doublons sur la clé composite [offre_id, utilisateur_id]
    const existe = await prisma.demande.findUnique({
      where: { offre_id_utilisateur_id: { offre_id: offre.offre_id, utilisateur_id: etudiant.utilisateur_id } },
    });
    if (existe) continue;

    await prisma.demande.create({
      data: {
        offre_id: offre.offre_id,
        utilisateur_id: etudiant.utilisateur_id,
        message: faker.lorem.sentences(2),
      },
    });
    nbDemandes += 1;
  }
  console.log(`   ✔ ${nbDemandes} demandes créées`);

  // ----------------------------------------------------------------------
  // 5. EXPERIENCES (+ sous-types + validations + compétences)
  // ----------------------------------------------------------------------
  console.log('5/10 - Création des expériences pour les étudiants (avec compétences et validations)');

  const EXPERIENCES_PAR_ETUDIANT = 5;
  const experiences = [];
  let experienceCounter = 0;
  let repositoryCounter = 0;

  // Pour retrouver rapidement l'institution d'un étudiant et les professeurs associés
  // (chaque étudiant n'a qu'une institution dans ce seed)
  const institutionByEtudiantId = new Map();
  {
    const liens = await prisma.valideEtudiant.findMany();
    for (const lien of liens) {
      institutionByEtudiantId.set(lien.utilisateur_id, lien.institution_id);
    }
  }

  // Map institution_id -> liste de professeurs de cette institution
  const profsByInstitution = new Map();
  for (const institution of institutions) {
    const profsLies = await prisma.professeur.findMany({
      where: { institutions: { some: { institution_id: institution.institution_id } } },
      select: { prof_utilisateur_id: true },
    });
    profsByInstitution.set(institution.institution_id, profsLies.map((p) => p.prof_utilisateur_id));
  }

  for (const etudiant of etudiants) {
    const institutionId = institutionByEtudiantId.get(etudiant.utilisateur_id);
    const profsDisponibles = profsByInstitution.get(institutionId) ?? [];

    for (let e = 0; e < EXPERIENCES_PAR_ETUDIANT; e += 1) {
      const type = EXPERIENCE_TYPES[(experienceCounter + e) % EXPERIENCE_TYPES.length];
      const specifique = randomItem(SPECIFIQUES);
      const statut = STATUTS[experienceCounter % STATUTS.length];
      const profValidateurId = profsDisponibles.length
        ? randomItem(profsDisponibles)
        : randomItem(professeurs).utilisateur_id;

      const experienceData = {
        titre: `${faker.hacker.verb()} ${faker.word.adjective()} ${faker.word.noun()}`,
        description: faker.lorem.sentences(2),
        date_experience: randomDateBetween(new Date('2023-01-01'), new Date()),
        visibilite: true,
        type,
        type_specifique: specifique,
        is_draft: false,
        technologies_locked: false,
        utilisateur_id: etudiant.utilisateur_id,
      };

      // --- PROJET ---
      if (type === TypeExperience.projet) {
        let repositoryId = null;

        // 30% des projets sont liés à un repository GitHub
        if (faker.datatype.boolean({ probability: 0.3 })) {
          repositoryCounter += 1;
          const repo = await prisma.repository.create({
            data: {
              github_id: githubIdCounter++,
              etudiant_id: etudiant.utilisateur_id,
              title: faker.git.commitMessage(),
              description: faker.lorem.sentence(),
              link: `https://github.com/${faker.internet.userName()}/${faker.git.commitMessage().replace(/\s+/g, '-').toLowerCase()}`,
              language: faker.helpers.arrayElement(['JavaScript', 'TypeScript', 'Python', 'Java', 'Dart']),
              stars: faker.number.int({ min: 0, max: 200 }),
              forks: faker.number.int({ min: 0, max: 50 }),
              private: faker.datatype.boolean(),
            },
          });
          repositoryId = repo.repository_id;
        }

        experienceData.projet = {
          create: {
            repository_id: repositoryId,
            lien_github: `https://github.com/${faker.internet.userName()}/${faker.git.commitMessage().replace(/\s+/g, '-').toLowerCase()}`,
            lien_youtube: `https://www.youtube.com/watch?v=${faker.string.alphanumeric(11)}`,
            resultat_obtenu: faker.lorem.sentence(),
            validation: {
              create: {
                utilisateur_id: profValidateurId,
                statut,
                date_d_action: new Date(),
                commentaire: faker.lorem.sentence(),
              },
            },
          },
        };
      }

      // --- STAGE ---
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
                utilisateur_id: profValidateurId,
                statut,
                date_d_action: new Date(),
                commentaire: faker.lorem.sentence(),
              },
            },
          },
        };
      }

      // --- ACTIVITE ---
      if (type === TypeExperience.activite) {
        experienceData.activite = {
          create: {
            type: faker.helpers.arrayElement(['Atelier', 'Conférence', 'Compétition', 'Séminaire', 'Hackathon']),
            lieu: faker.location.city(),
            validation: {
              create: {
                institution_id: institutionId,
                statut,
                date_d_action: new Date(),
                commentaire: faker.lorem.sentence(),
              },
            },
          },
        };
      }

      // --- CERTIFICATION ---
      if (type === TypeExperience.certification) {
        experienceData.certification = {
          create: {
            document: `https://example.com/certificates/${faker.string.uuid()}`,
            lien_URL: faker.internet.url(),
            code: faker.helpers.slugify(`${faker.word.adjective()}-${faker.word.noun()}`).toUpperCase(),
            institution_id: institutionId,
          },
        };
      }

      const experience = await prisma.experience.create({ data: experienceData });
      experiences.push({ ...experience, _etudiant_id: etudiant.utilisateur_id });

      // --- Compétences développées (1 à 6 par expérience) ---
      const competencesChoisies = randomItems(competences, 1, 6);
      let niveau = 1;
      for (const competence of competencesChoisies) {
        await prisma.competenceDeveloppee.create({
          data: {
            experience_id: experience.experience_id,
            competence_id: competence.competence_id,
            niveau: String(niveau),
          },
        });
        niveau += 1;
      }

      experienceCounter += 1;
    }
  }

  console.log(`   ✔ ${experiences.length} expériences créées (${repositoryCounter} repositories GitHub liés)`);

  // ----------------------------------------------------------------------
  // 6. INTERACTIONS (recommandations / feedbacks prof <-> étudiant)
  // ----------------------------------------------------------------------
  console.log('6/10 - Création des interactions (recommandations professeurs/professionnels)');

  const TYPES_INTERACTION = ['commentaire', 'feedback', 'recommandation', 'contribution', 'avis'];
  let nbInteractions = 0;

  for (let i = 0; i < 400; i += 1) {
    const experience = randomItem(experiences);
    const institutionId = institutionByEtudiantId.get(experience._etudiant_id);
    const profsDisponibles = profsByInstitution.get(institutionId) ?? [];

    // Priorité aux professeurs de l'institution de l'étudiant (recommandations),
    // sinon un professionnel au hasard
    const auteur = profsDisponibles.length && faker.datatype.boolean({ probability: 0.7 })
      ? { utilisateur_id: randomItem(profsDisponibles) }
      : randomItem(professionnels);

    await prisma.interaction.create({
      data: {
        type: randomItem(TYPES_INTERACTION),
        texte: faker.lorem.sentences(2),
        visibilite: true,
        date_interaction: randomDateBetween(experience.date_experience ?? new Date('2023-01-01'), new Date()),
        experience_id: experience.experience_id,
        utilisateur_id: auteur.utilisateur_id,
      },
    });
    nbInteractions += 1;
  }
  console.log(`   ✔ ${nbInteractions} interactions créées`);

  // ----------------------------------------------------------------------
  // 7. LETTRES DE RECOMMANDATION (prof <-> étudiant)
  // ----------------------------------------------------------------------
  console.log('7/10 - Création des lettres de recommandation');

  const lettresDeRecommandations = new Set();
  let nbLettres = 0;

  for (let i = 0; i < 150; i += 1) {
    const etudiant = randomItem(etudiants);
    const institutionId = institutionByEtudiantId.get(etudiant.utilisateur_id);
    const profsDisponibles = profsByInstitution.get(institutionId) ?? [];
    if (!profsDisponibles.length) continue;

    const profId = randomItem(profsDisponibles);
    const key = `${etudiant.utilisateur_id}-${profId}`;
    if (lettresDeRecommandations.has(key)) continue;
    lettresDeRecommandations.add(key);

    await prisma.lettresDeRecommendations.create({
      data: {
        utilisateur_id: etudiant.utilisateur_id,
        prof_utilisateur_id: profId,
        objet: faker.lorem.sentence({ min: 3, max: 6 }),
        description: faker.lorem.paragraph(),
        fichier: `https://storage.example.com/lettres/${faker.string.uuid()}.pdf`,
        statut: randomItem(STATUTS),
        commentaire: faker.lorem.sentence(),
      },
    });
    nbLettres += 1;
  }
  console.log(`   ✔ ${nbLettres} lettres de recommandation créées`);

  // ----------------------------------------------------------------------
  // 8. CLUBS + BADGES + ACTIVITES
  // ----------------------------------------------------------------------
  console.log('8/10 - Création des clubs et badges');

  const clubs = [];
  for (const institution of institutions) {
    const nbClubs = faker.number.int({ min: 1, max: 2 });
    for (let c = 0; c < nbClubs; c += 1) {
      const membres = faker.helpers.arrayElements(
        etudiants.filter((e) => institutionByEtudiantId.get(e.utilisateur_id) === institution.institution_id),
        faker.number.int({ min: 5, max: 15 }),
      );

      const club = await prisma.club.create({
        data: {
          nom: `Club ${faker.word.adjective()} ${faker.word.noun()}`,
          description: faker.lorem.sentence(),
          date_creation: randomDateBetween(new Date('2020-01-01'), new Date('2023-01-01')),
          responsable: `${faker.person.firstName()} ${faker.person.lastName()}`,
          institutions: { connect: { institution_id: institution.institution_id } },
          etudiants: { connect: membres.map((m) => ({ etudiant_utilisateur_id: m.utilisateur_id })) },
        },
      });
      clubs.push(club);
    }
  }

  // Lier quelques activités existantes à des clubs
  const activitesExistantes = await prisma.activite.findMany({ select: { experience_id: true } });
  for (const activite of faker.helpers.arrayElements(activitesExistantes, Math.min(50, activitesExistantes.length))) {
    await prisma.activite.update({
      where: { experience_id: activite.experience_id },
      data: { clubs: { connect: { club_id: randomItem(clubs).club_id } } },
    });
  }
  console.log(`   ✔ ${clubs.length} clubs créés`);

  // Badges attribués à des étudiants
  const BADGES = [
    { nom: 'Top Contributeur', icone: '🏆', score: 100, description: 'Décerné aux étudiants les plus actifs' },
    { nom: 'Stage Validé', icone: '🎓', score: 50, description: 'Premier stage validé' },
    { nom: 'Certifié', icone: '📜', score: 30, description: 'Première certification validée' },
    { nom: 'Mentor', icone: '🤝', score: 40, description: 'A aidé d’autres étudiants' },
    { nom: 'Innovateur', icone: '💡', score: 60, description: 'Projet remarqué par un professeur' },
  ];

  const badges = [];
  for (const badgeData of BADGES) {
    const beneficiaires = faker.helpers.arrayElements(etudiants, faker.number.int({ min: 20, max: 60 }));
    const badge = await prisma.badge.create({
      data: {
        ...badgeData,
        etudiants: { connect: beneficiaires.map((e) => ({ etudiant_utilisateur_id: e.utilisateur_id })) },
      },
    });
    badges.push(badge);
  }
  console.log(`   ✔ ${badges.length} badges créés`);

  // ----------------------------------------------------------------------
  // 9. PORTFOLIOS + HISTORIQUE DE SCORE
  // ----------------------------------------------------------------------
  console.log('9/10 - Création des portfolios et historiques de score');

  let nbPortfolios = 0;
  for (const etudiant of etudiants) {
    const score = faker.number.int({ min: 40, max: 100 });

    const portfolio = await prisma.portfolio.create({
      data: {
        titre: `Portfolio de ${etudiant.prenom} ${etudiant.nom}`,
        objectif_cible: faker.person.jobTitle(),
        visibilite: true,
        date_generation: new Date(),
        score_credibilite: score,
        utilisateur_id: etudiant.utilisateur_id,
        history: {
          create: [
            {
              score: Math.max(0, score - faker.number.int({ min: 5, max: 15 })),
              breakdown: { experiences: 'initial', competences: 'initial' },
              date: randomDateBetween(new Date('2024-01-01'), new Date('2024-06-01')),
            },
            {
              score,
              breakdown: { experiences: 'mise à jour', competences: 'mise à jour' },
              date: new Date(),
            },
          ],
        },
      },
    });
    nbPortfolios += 1;

    // Quelques interactions visibles sur le portfolio (avis de professionnels)
    if (faker.datatype.boolean({ probability: 0.4 })) {
      await prisma.interaction.create({
        data: {
          type: 'avis',
          texte: faker.lorem.sentences(2),
          visibilite: true,
          date_interaction: new Date(),
          portfolio_id: portfolio.portfolio_id,
          utilisateur_id: randomItem(professionnels).utilisateur_id,
        },
      });
    }
  }
  console.log(`   ✔ ${nbPortfolios} portfolios créés`);

  // ----------------------------------------------------------------------
  // 10. FOLLOW, NOTIFICATIONS, CONNEXIONS (couverture minimale)
  // ----------------------------------------------------------------------
  console.log('10/10 - Création des follows, notifications et connexions');

  // Follow : étudiants suivent des professeurs / professionnels
  const followsCrees = new Set();
  let nbFollows = 0;
  for (let i = 0; i < 200; i += 1) {
    const follower = randomItem(etudiants);
    const following = randomItem([...professeurs, ...professionnels]);
    const key = `${follower.utilisateur_id}-${following.utilisateur_id}`;
    if (follower.utilisateur_id === following.utilisateur_id || followsCrees.has(key)) continue;
    followsCrees.add(key);

    await prisma.follow.create({
      data: { followerId: follower.utilisateur_id, followingId: following.utilisateur_id },
    });
    nbFollows += 1;
  }
  console.log(`   ✔ ${nbFollows} relations follow créées`);

  // Notifications : informer les étudiants de la validation de leurs expériences
  let nbNotifications = 0;
  for (const experience of faker.helpers.arrayElements(experiences, 300)) {
    await prisma.notification.create({
      data: {
        message: `Votre expérience "${experience.titre}" a été mise à jour.`,
        date_notification: new Date(),
        lu: faker.datatype.boolean(),
        type: 'validation_experience',
        utilisateur_cible_id: experience._etudiant_id,
        utilisateur_source_id: randomItem(professeurs).utilisateur_id,
      },
    });
    nbNotifications += 1;
  }
  console.log(`   ✔ ${nbNotifications} notifications créées`);

  // Connexions : historique de connexion pour quelques utilisateurs
  const tousUtilisateurs = [administrateur, ...directeurs, ...professeurs, ...etudiants, ...professionnels];
  let nbConnexions = 0;
  for (const utilisateur of faker.helpers.arrayElements(tousUtilisateurs, 100)) {
    const dateConnexion = randomDateBetween(new Date('2024-01-01'), new Date());
    await prisma.connexion.create({
      data: {
        utilisateur_id: utilisateur.utilisateur_id,
        session_token: faker.string.uuid(),
        browser: faker.helpers.arrayElement(['Chrome', 'Firefox', 'Safari', 'Edge']),
        browser_version: `${faker.number.int({ min: 90, max: 130 })}.0`,
        device_type: faker.helpers.arrayElement(['desktop', 'mobile', 'tablet']),
        os: faker.helpers.arrayElement(['Windows', 'macOS', 'Linux', 'Android', 'iOS']),
        ip: faker.internet.ip(),
        ville: faker.location.city(),
        pays: 'Maroc',
        is_current: false,
        date_connexion: dateConnexion,
        date_deconnexion: new Date(dateConnexion.getTime() + 1000 * 60 * faker.number.int({ min: 5, max: 120 })),
        last_active: dateConnexion,
        expires_at: new Date(dateConnexion.getTime() + 1000 * 60 * 60 * 24 * 7),
      },
    });
    nbConnexions += 1;
  }
  console.log(`   ✔ ${nbConnexions} connexions créées`);

  console.log('--------------------------------------------------');
  console.log('🎉 BASE DE DONNÉES REMPLIE AVEC SUCCÈS !');
  console.log(`   Administrateur : ${administrateur.email}`);
  console.log(`   Institutions   : ${institutions.length}`);
  console.log(`   Directeurs     : ${directeurs.length}`);
  console.log(`   Professeurs    : ${professeurs.length}`);
  console.log(`   Étudiants      : ${etudiants.length}`);
  console.log(`   Professionnels : ${professionnels.length}`);
  console.log(`   Offres         : ${offres.length}`);
  console.log(`   Expériences    : ${experiences.length}`);
  console.log(`   Compétences    : ${competences.length}`);
  console.log('   🔑 Mot de passe pour tous les comptes de test : ' + PASSWORD);
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