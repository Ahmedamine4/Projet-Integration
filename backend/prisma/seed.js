/**
 * ============================================================
 * SEED COMPLET — Plateforme Portfolio Étudiant
 * Couvre : Utilisateurs, Institutions, Directeurs, Professeurs,
 * Étudiants, Expériences (25/étudiant), CompétencesDeveloppées,
 * Validations (ValideEtudiant, ValideProjet, ValideStage, ValideActivite),
 * Portfolios + PortfolioScoreHistory, Offres, Demandes,
 * Interactions (recommandations prof→étudiant), Clubs, Badges,
 * LettresDeRecommendations, Follows, Notifications
 * ============================================================
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

// ── Helpers ────────────────────────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => faker.helpers.arrayElements(arr, n);
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// URLs de photos de profil réelles (Unsplash — format stable)
const PHOTO_URLS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop',
];

// URLs de photos pour les expériences (Unsplash thème tech/travail)
const EXPERIENCE_PHOTO_URLS = [
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop',
];

const STATUTS = [StatutValidation.en_attente, StatutValidation.valide, StatutValidation.refuse];
const EXP_TYPES = [
  TypeExperience.projet,
  TypeExperience.stage,
  TypeExperience.activite,
  TypeExperience.certification,
];
// Distribution : 7 projets, 6 stages, 6 activités, 6 certifications = 25
const EXP_DISTRIBUTION = [
  ...Array(7).fill(TypeExperience.projet),
  ...Array(6).fill(TypeExperience.stage),
  ...Array(6).fill(TypeExperience.activite),
  ...Array(6).fill(TypeExperience.certification),
];

const DEPARTEMENTS = [
  'Génie Logiciel',
  'Génie Informatique',
  'Mathématiques Appliquées',
  'Cybersécurité',
  'Intelligence Artificielle',
  'Réseaux & Télécommunications',
];

const NIVEAUX = ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2', 'Cycle Ingénieur'];

const OFFRE_TYPES = [
  TypeOffre.CDI,
  TypeOffre.CDD,
  TypeOffre.Stage,
  TypeOffre.Alternance,
  TypeOffre.Freelance,
  TypeOffre.Temps_plein,
  TypeOffre.Apprentissage,
  TypeOffre.Consultant,
];

const TECH_STACKS = [
  ['React', 'Node.js', 'PostgreSQL'],
  ['Python', 'FastAPI', 'Docker'],
  ['Java', 'Spring Boot', 'MySQL'],
  ['Vue.js', 'Laravel', 'Redis'],
  ['Angular', 'NestJS', 'MongoDB'],
  ['Flutter', 'Firebase', 'Dart'],
  ['TensorFlow', 'Python', 'Keras'],
  ['AWS', 'Terraform', 'Kubernetes'],
];

const COMPETENCES_DATA = [
  // technologie
  { type: TypeCompetence.technologie, nom: 'JavaScript', description: 'Langage de programmation web' },
  { type: TypeCompetence.technologie, nom: 'Python', description: 'Langage polyvalent' },
  { type: TypeCompetence.technologie, nom: 'React', description: 'Bibliothèque UI' },
  { type: TypeCompetence.technologie, nom: 'Node.js', description: 'Runtime JS côté serveur' },
  { type: TypeCompetence.technologie, nom: 'Docker', description: 'Containerisation' },
  { type: TypeCompetence.technologie, nom: 'PostgreSQL', description: 'Base de données relationnelle' },
  { type: TypeCompetence.technologie, nom: 'MongoDB', description: 'Base de données NoSQL' },
  { type: TypeCompetence.technologie, nom: 'Java', description: 'Langage orienté objet' },
  { type: TypeCompetence.technologie, nom: 'Spring Boot', description: 'Framework Java' },
  { type: TypeCompetence.technologie, nom: 'TensorFlow', description: 'Framework ML' },
  { type: TypeCompetence.technologie, nom: 'AWS', description: 'Cloud Amazon' },
  { type: TypeCompetence.technologie, nom: 'Git', description: 'Contrôle de version' },
  { type: TypeCompetence.technologie, nom: 'Kubernetes', description: 'Orchestration de containers' },
  { type: TypeCompetence.technologie, nom: 'Vue.js', description: 'Framework JavaScript' },
  // domaine
  { type: TypeCompetence.domaine, nom: 'Développement Web', description: 'Conception de sites web' },
  { type: TypeCompetence.domaine, nom: 'Machine Learning', description: 'Apprentissage automatique' },
  { type: TypeCompetence.domaine, nom: 'Cybersécurité', description: 'Sécurité informatique' },
  { type: TypeCompetence.domaine, nom: 'DevOps', description: 'Pratiques CI/CD' },
  { type: TypeCompetence.domaine, nom: 'Gestion de projet', description: 'Méthodes agiles' },
  { type: TypeCompetence.domaine, nom: 'Data Science', description: 'Analyse de données' },
  { type: TypeCompetence.domaine, nom: 'Réseaux', description: 'Administration réseau' },
  { type: TypeCompetence.domaine, nom: 'Embedded Systems', description: 'Systèmes embarqués' },
];

const NIVEAUX_COMPETENCE = ['débutant', 'intermédiaire', 'avancé', 'expert'];

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Démarrage du seed complet...\n');

  // Vérification anti-doublon
  const alreadySeeded = await prisma.utilisateur.findUnique({
    where: { email: 'admin@platform.local' },
  });
  if (alreadySeeded) {
    console.log('✅ Seed déjà appliqué. Aucune donnée dupliquée.');
    return;
  }

  const passwordHash = await bcrypt.hash('P@ssw0rd123', 10);

  // ══════════════════════════════════════════════════════════════════════════════
  // 1. ADMINISTRATEUR
  // ══════════════════════════════════════════════════════════════════════════════
  console.log('1/12 — Création de l\'administrateur');
  const adminUser = await prisma.utilisateur.create({
    data: {
      nom: 'Benali',
      prenom: 'Karim',
      email: 'admin@platform.local',
      mot_de_passe: passwordHash,
      role: RoleUtilisateur.administrateur,
      telephone: '+212 661 234 567',
      a_propos: 'Administrateur principal de la plateforme Portfolio Étudiant.',
      linkedin: 'https://www.linkedin.com/in/karim-benali-admin',
      photo: PHOTO_URLS[0],
      administrateur: {
        create: { niveau_acces: 'super_admin' },
      },
    },
  });
  console.log(`   ✔ Admin créé : ${adminUser.email}`);

  // ══════════════════════════════════════════════════════════════════════════════
  // 2. INSTITUTIONS + DIRECTEURS (2 institutions, 1 directeur chacune)
  // ══════════════════════════════════════════════════════════════════════════════
  console.log('2/12 — Création des institutions et directeurs');

  const institutionsData = [
    {
      nom: 'École Nationale Supérieure d\'Informatique',
      addresse: '23 Avenue Mohammed V, Rabat',
      email: 'contact@ensi.ac.ma',
      description: 'Grande école d\'ingénieurs spécialisée en informatique et systèmes d\'information.',
      academique: true,
      directeur: { nom: 'Alaoui', prenom: 'Hassan', email: 'directeur.ensi@platform.local', poste: 'Directeur Général ENSI', bureau: 'Bureau 101' },
    },
    {
      nom: 'Institut Supérieur de Technologie Appliquée',
      addresse: '5 Rue des Ingénieurs, Casablanca',
      email: 'info@ista.ac.ma',
      description: 'Institut de formation aux métiers du numérique et de l\'innovation technologique.',
      academique: true,
      directeur: { nom: 'El Fassi', prenom: 'Sanaa', email: 'directeur.ista@platform.local', poste: 'Directrice Générale ISTA', bureau: 'Bureau 201' },
    },
  ];

  const institutions = [];
  const directeurUsers = [];

  for (const instData of institutionsData) {
    const { directeur: dirData, ...instFields } = instData;

    const institution = await prisma.institution.create({ data: instFields });
    institutions.push(institution);

    const dirUser = await prisma.utilisateur.create({
      data: {
        nom: dirData.nom,
        prenom: dirData.prenom,
        email: dirData.email,
        mot_de_passe: passwordHash,
        role: RoleUtilisateur.directeur,
        telephone: faker.phone.number('+212 6## ### ###'), // L'avertissement de dépréciation vient d'ici, ce n'est pas bloquant
        a_propos: `Directeur/trice de ${institution.nom}.`,
        photo: pick(PHOTO_URLS),
        directeur: {
          create: {
            poste: dirData.poste,
            bureau: dirData.bureau,
            institution_id: institution.institution_id,
          },
        },
      },
    });
    directeurUsers.push(dirUser);
    console.log(`   ✔ Institution : ${institution.nom} | Directeur : ${dirUser.email}`);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 3. COMPÉTENCES (catalogue global)
  // ══════════════════════════════════════════════════════════════════════════════
  console.log('3/12 — Création des compétences');
  const competences = [];
  for (const c of COMPETENCES_DATA) {
    const comp = await prisma.competence.create({ data: c });
    competences.push(comp);
  }
  console.log(`   ✔ ${competences.length} compétences créées`);

  // ══════════════════════════════════════════════════════════════════════════════
  // 4. BADGES
  // ══════════════════════════════════════════════════════════════════════════════
  console.log('4/12 — Création des badges');
  const badgesData = [
    { nom: 'Premier Projet', icone: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png', score: 10, description: 'A publié son premier projet.' },
    { nom: 'Stage Validé', icone: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', score: 20, description: 'A complété un stage professionnel validé.' },
    { nom: 'Top Contributeur', icone: 'https://cdn-icons-png.flaticon.com/512/2111/2111288.png', score: 50, description: 'Plus de 10 contributions GitHub.' },
    { nom: 'Certifié', icone: 'https://cdn-icons-png.flaticon.com/512/1633/1633716.png', score: 15, description: 'A obtenu une certification officielle.' },
    { nom: 'Profil Complet', icone: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png', score: 5, description: 'Profil rempli à 100%.' },
  ];
  const badges = [];
  for (const b of badgesData) {
    const badge = await prisma.badge.create({ data: b });
    badges.push(badge);
  }
  console.log(`   ✔ ${badges.length} badges créés`);

  // ══════════════════════════════════════════════════════════════════════════════
  // 5. CLUBS (2 clubs par institution)
  // ══════════════════════════════════════════════════════════════════════════════
  console.log('5/12 — Création des clubs');
  const clubs = [];
  const clubsData = [
    { nom: 'Club IA & Data', description: 'Club dédié à l\'intelligence artificielle et la data science.', responsable: 'Prof. Alami' },
    { nom: 'Club Dev Web', description: 'Club orienté développement web et mobile.', responsable: 'Prof. Tahir' },
    { nom: 'Club Cybersec', description: 'Club de sensibilisation à la cybersécurité.', responsable: 'Prof. Mounir' },
    { nom: 'Club Robotique', description: 'Club de robotique et systèmes embarqués.', responsable: 'Prof. Zerhouni' },
  ];
  for (let i = 0; i < clubsData.length; i++) {
    const club = await prisma.club.create({
      data: {
        ...clubsData[i],
        date_creation: randDate(new Date('2020-01-01'), new Date('2023-06-01')),
        institutions: {
          connect: { institution_id: institutions[i % 2].institution_id },
        },
      },
    });
    clubs.push(club);
  }
  console.log(`   ✔ ${clubs.length} clubs créés`);

  // ══════════════════════════════════════════════════════════════════════════════
  // 6. PROFESSEURS (4 par institution = 8 total)
  // ══════════════════════════════════════════════════════════════════════════════
  console.log('6/12 — Création des professeurs');
  const professeurs = [];

  for (let instIdx = 0; instIdx < institutions.length; instIdx++) {
    for (let p = 1; p <= 4; p++) {
      const profUser = await prisma.utilisateur.create({
        data: {
          nom: faker.person.lastName(),
          prenom: faker.person.firstName(),
          email: `prof.${instIdx + 1}.${p}@platform.local`,
          mot_de_passe: passwordHash,
          role: RoleUtilisateur.professeur,
          telephone: faker.phone.number('+212 6## ### ###'),
          a_propos: faker.person.bio(),
          photo: pick(PHOTO_URLS),
          linkedin: `https://www.linkedin.com/in/prof-${instIdx + 1}-${p}`,
          professeur: {
            create: {
              departement: pick(DEPARTEMENTS),
              specialite: faker.lorem.words(2),
              institutions: {
                connect: { institution_id: institutions[instIdx].institution_id },
              },
            },
          },
        },
      });
      professeurs.push(profUser);
    }
  }
  console.log(`   ✔ ${professeurs.length} professeurs créés`);

  // ══════════════════════════════════════════════════════════════════════════════
  // 7. PROFESSIONNELS (8 professionnels avec statut valide)
  // ══════════════════════════════════════════════════════════════════════════════
  console.log('7/12 — Création des professionnels');
  const professionnels = [];
  const entreprises = [
    'OCP Group', 'Maroc Telecom', 'Attijariwafa Bank', 'ONCF',
    'Capgemini Maroc', 'IBM Maroc', 'Oracle Maroc', 'Accenture Maroc',
  ];
  for (let i = 0; i < 8; i++) {
    const proUser = await prisma.utilisateur.create({
      data: {
        nom: faker.person.lastName(),
        prenom: faker.person.firstName(),
        email: `pro${i + 1}@platform.local`,
        mot_de_passe: passwordHash,
        role: RoleUtilisateur.professionnel,
        telephone: faker.phone.number('+212 6## ### ###'),
        a_propos: faker.person.bio(),
        photo: pick(PHOTO_URLS),
        linkedin: `https://www.linkedin.com/in/professionnel-${i + 1}`,
        professionnel: {
          create: {
            entreprise: entreprises[i],
            poste: faker.person.jobTitle(),
            email_professionnel: `recruteur${i + 1}@${entreprises[i].toLowerCase().replace(/\s/g, '')}.com`,
            statut: StatutValidation.valide,
            admin_id: adminUser.utilisateur_id,
          },
        },
      },
    });
    professionnels.push(proUser);
  }
  console.log(`   ✔ ${professionnels.length} professionnels créés`);

  // ══════════════════════════════════════════════════════════════════════════════
  // 8. OFFRES (1 à 2 offres par professionnel)
  // ══════════════════════════════════════════════════════════════════════════════
  console.log('8/12 — Création des offres');
  const offres = [];
  for (const pro of professionnels) {
    const nbOffres = randInt(1, 2);
    for (let o = 0; o < nbOffres; o++) {
      const techStack = pick(TECH_STACKS);
      const offre = await prisma.offre.create({
        data: {
          entreprise: pro.professionnel?.entreprise ?? faker.company.name(),
          localisation: faker.location.city() + ', Maroc',
          technologies: techStack,
          description: `Nous recherchons un(e) ${faker.person.jobTitle()} passionné(e) pour rejoindre notre équipe. Missions : ${faker.lorem.sentences(2)}`,
          type: pick(OFFRE_TYPES),
          statut: StatutOffre.ACTIVE,
          utilisateur_id: pro.utilisateur_id,
        },
      });
      offres.push(offre);
    }
  }
  console.log(`   ✔ ${offres.length} offres créées`);

  // ══════════════════════════════════════════════════════════════════════════════
  // 9. ÉTUDIANTS (6 par institution = 12 total)
  //    + ValideEtudiant + Portfolio + PortfolioScoreHistory + Expériences (25)
  //    + CompétencesDeveloppées (≤6/expérience) + Validations
  // ══════════════════════════════════════════════════════════════════════════════
  console.log('9/12 — Création des étudiants + expériences + portfolios');

  const etudiants = [];

  for (let instIdx = 0; instIdx < institutions.length; instIdx++) {
    for (let e = 1; e <= 6; e++) {
      const globalIdx = instIdx * 6 + e;
      const username = `etudiant${globalIdx}`;

      // ── Créer l'utilisateur + profil étudiant ────────────────────────────────
      const etudiantUser = await prisma.utilisateur.create({
        data: {
          nom: faker.person.lastName(),
          prenom: faker.person.firstName(),
          email: `${username}@platform.local`,
          mot_de_passe: passwordHash,
          role: RoleUtilisateur.etudiant,
          telephone: faker.phone.number('+212 6## ### ###'),
          a_propos: faker.person.bio(),
          photo: PHOTO_URLS[globalIdx % PHOTO_URLS.length],
          github: `https://github.com/${username}`,
          linkedin: `https://www.linkedin.com/in/${username}`,
          etudiant: {
            create: {
              promotion: `${randInt(2023, 2026)}`,
              niveau: pick(NIVEAUX),
              etudie: true,
              github_API: `https://api.github.com/users/${username}`,
            },
          },
        },
      });

      // ── ValideEtudiant ───────────────────────────────────────────────────────
      await prisma.valideEtudiant.create({
        data: {
          utilisateur_id: etudiantUser.utilisateur_id,
          institution_id: institutions[instIdx].institution_id,
          statut: StatutValidation.valide,
          date_debut: randDate(new Date('2022-09-01'), new Date('2023-09-01')),
          date_fin: randDate(new Date('2025-06-01'), new Date('2027-06-30')),
          description: `Étudiant inscrit en ${pick(NIVEAUX)} à ${institutions[instIdx].nom}`,
          niveau: pick(NIVEAUX),
        },
      });

      // ── Assigner 1-2 clubs ───────────────────────────────────────────────────
      const studentClubs = pickN(clubs, randInt(1, 2));
      await prisma.etudiant.update({
        where: { etudiant_utilisateur_id: etudiantUser.utilisateur_id },
        data: { clubs: { connect: studentClubs.map((c) => ({ club_id: c.club_id })) } },
      });

      // ── Assigner 1-2 badges ──────────────────────────────────────────────────
      const studentBadges = pickN(badges, randInt(1, 2));
      await prisma.etudiant.update({
        where: { etudiant_utilisateur_id: etudiantUser.utilisateur_id },
        data: { badges: { connect: studentBadges.map((b) => ({ badge_id: b.badge_id })) } },
      });

      // ── Portfolio (score_credibilite laissé vide = null pour test du calcul) ─
      const portfolio = await prisma.portfolio.create({
        data: {
          utilisateur_id: etudiantUser.utilisateur_id,
          titre: `Portfolio de ${etudiantUser.prenom} ${etudiantUser.nom}`,
          objectif_cible: pick(['Développeur Full Stack', 'Data Scientist', 'DevOps Engineer', 'Cybersecurity Analyst', 'ML Engineer']),
          visibilite: true,
          date_generation: new Date(),
          score_credibilite: null, // ← intentionnellement vide pour valider le calcul
        },
      });

      // ── PortfolioScoreHistory (min 6 entrées avec évolution réaliste) ────────
      let previousScore = randInt(20, 40);
      const historyCount = randInt(6, 10);
      const historyStart = new Date('2024-01-01');

      for (let h = 0; h < historyCount; h++) {
        const delta = randInt(-5, 15); // tendance haussière légère
        const newScore = Math.min(100, Math.max(0, previousScore + delta));
        const historyDate = new Date(historyStart);
        historyDate.setMonth(historyDate.getMonth() + h * 2);

        await prisma.portfolioScoreHistory.create({
          data: {
            portfolio_id: portfolio.portfolio_id,
            score: newScore,
            breakdown: {
              projets: randInt(5, 25),
              stages: randInt(5, 20),
              activites: randInt(2, 15),
              certifications: randInt(2, 15),
              profil: randInt(5, 15),
              recommandations: randInt(0, 10),
            },
            date: historyDate,
          },
        });
        previousScore = newScore;
      }

      // ── 25 Expériences (7P + 6St + 6Ac + 6Ce) ───────────────────────────────
      // On mélange la distribution
      const expTypes = [...EXP_DISTRIBUTION].sort(() => Math.random() - 0.5);
      const profResponsable = pick(professeurs);

      for (let xIdx = 0; xIdx < 25; xIdx++) {
        const type = expTypes[xIdx];
        const typeSpecifique = pick([TypeSpecifique.academique, TypeSpecifique.personnel]);
        const statut = STATUTS[xIdx % STATUTS.length];
        const expDate = randDate(new Date('2023-01-01'), new Date('2025-06-01'));

        // Données communes de l'expérience
        const expData = {
          titre: `${faker.hacker.verb()} ${faker.word.noun()} — ${type}`,
          description: faker.lorem.sentences(3),
          date_experience: expDate,
          visibilite: true,
          type,
          type_specifique: typeSpecifique,
          photo: EXPERIENCE_PHOTO_URLS[xIdx % EXPERIENCE_PHOTO_URLS.length],
          is_draft: false,
          technologies_locked: false,
          utilisateur_id: etudiantUser.utilisateur_id,
        };

        // ── Sous-type spécifique ─────────────────────────────────────────────
        if (type === TypeExperience.projet) {
          expData.projet = {
            create: {
              lien_github: `https://github.com/${username}/projet-${xIdx + 1}`,
              lien_youtube: `https://www.youtube.com/watch?v=${faker.string.alphanumeric(11)}`,
              resultat_obtenu: faker.lorem.sentence(),
              validation: {
                create: {
                  utilisateur_id: profResponsable.utilisateur_id,
                  statut,
                  commentaire: faker.lorem.sentence(),
                  date_d_action: randDate(expDate, new Date()),
                },
              },
            },
          };
        }

        if (type === TypeExperience.stage) {
          const stageFin = new Date(expDate);
          stageFin.setMonth(stageFin.getMonth() + randInt(2, 6));
          expData.stage = {
            create: {
              date_fin: stageFin,
              duree: `${randInt(2, 6)} mois`,
              missions_realisees: faker.lorem.sentences(3),
              rapport_stage: faker.lorem.paragraphs(2),
              validation: {
                create: {
                  utilisateur_id: profResponsable.utilisateur_id,
                  statut,
                  commentaire: faker.lorem.sentence(),
                  date_d_action: randDate(expDate, new Date()),
                },
              },
            },
          };
        }

        if (type === TypeExperience.activite) {
          const actInstitution = pick(institutions);
          expData.activite = {
            create: {
              type: pick(['Atelier', 'Conférence', 'Compétition', 'Séminaire', 'Hackathon', 'Workshop']),
              lieu: faker.location.city() + ', Maroc',
              validation: {
                create: {
                  institution_id: actInstitution.institution_id,
                  statut,
                  commentaire: faker.lorem.sentence(),
                  date_d_action: randDate(expDate, new Date()),
                },
              },
              clubs: pickN(clubs, 1).length > 0 ? {
                connect: [{ club_id: clubs[xIdx % clubs.length].club_id }],
              } : undefined,
            },
          };
        }

        if (type === TypeExperience.certification) {
          const certInstitution = pick(institutions);
          expData.certification = {
            create: {
              document: `https://images.unsplash.com/photo-1589330273594-fade1ee91647?w=800&h=600&fit=crop`,
              lien_URL: `https://verify.${certInstitution.nom.toLowerCase().replace(/[^a-z0-9]/g, '')}.ma/cert/${faker.string.uuid()}`,
              code: `CERT-${faker.string.alphanumeric(8).toUpperCase()}`,
              institution_id: certInstitution.institution_id,
            },
          };
        }

        // Créer l'expérience
        const experience = await prisma.experience.create({ data: expData });

        // ── CompétencesDeveloppées (1 à 6 par expérience) ────────────────────
        const nbCompetences = randInt(1, 6);
        const selectedComps = pickN(competences, nbCompetences);
        for (const comp of selectedComps) {
          await prisma.competenceDeveloppee.create({
            data: {
              experience_id: experience.experience_id,
              competence_id: comp.competence_id,
              niveau: pick(NIVEAUX_COMPETENCE),
            },
          });
        }
      } // fin des 25 expériences

      etudiants.push(etudiantUser);
      console.log(`   ✔ Étudiant ${globalIdx}/12 : ${etudiantUser.email} — 25 expériences créées`);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 10. DEMANDES (étudiants postulent aux offres)
  // ══════════════════════════════════════════════════════════════════════════════
  console.log('10/12 — Création des demandes');
  let totalDemandes = 0;
  const demandesSet = new Set();

  for (const etudiant of etudiants) {
    // Chaque étudiant postule à 2-4 offres
    const selectedOffres = pickN(offres, randInt(2, 4));
    for (const offre of selectedOffres) {
      const key = `${offre.offre_id}-${etudiant.utilisateur_id}`;
      if (demandesSet.has(key)) continue;
      demandesSet.add(key);

      await prisma.demande.create({
        data: {
          message: faker.lorem.sentences(2),
          offre_id: offre.offre_id,
          utilisateur_id: etudiant.utilisateur_id,
        },
      });
      totalDemandes++;
    }
  }
  console.log(`   ✔ ${totalDemandes} demandes créées`);

  // ══════════════════════════════════════════════════════════════════════════════
  // 11. INTERACTIONS — Recommandations prof → portfolio étudiant
  //     (utilisées pour alimenter score_credibilite)
  // ══════════════════════════════════════════════════════════════════════════════
  console.log('11/12 — Création des interactions (recommandations professeurs)');
  let totalInteractions = 0;

  // Récupérer tous les portfolios créés
  const allPortfolios = await prisma.portfolio.findMany({
    select: { portfolio_id: true, utilisateur_id: true },
  });

  // Chaque professeur laisse 3 recommandations sur des portfolios d'étudiants
  for (const prof of professeurs) {
    const targetPortfolios = pickN(allPortfolios, 3);
    for (const portfolio of targetPortfolios) {
      if (portfolio.utilisateur_id === prof.utilisateur_id) continue;

      await prisma.interaction.create({
        data: {
          type: pick(['recommandation', 'feedback', 'evaluation', 'avis_professionnel']),
          texte: faker.lorem.sentences(3),
          visibilite: true,
          date_interaction: randDate(new Date('2024-01-01'), new Date()),
          portfolio_id: portfolio.portfolio_id,
          utilisateur_id: prof.utilisateur_id,
        },
      });
      totalInteractions++;
    }
  }

  // Professionnels laissent aussi des interactions sur des expériences
  const allExperiencesQuery = await prisma.experience.findMany({
    select: { experience_id: true, date_experience: true },
    take: 40,
  });

  for (const pro of professionnels) {
    const targetExps = pickN(allExperiencesQuery, 2);
    for (const exp of targetExps) {
      await prisma.interaction.create({
        data: {
          type: pick(['commentaire', 'feedback', 'contribution', 'avis']),
          texte: faker.lorem.sentences(2),
          visibilite: true,
          date_interaction: randDate(exp.date_experience ?? new Date('2024-01-01'), new Date()),
          experience_id: exp.experience_id,
          utilisateur_id: pro.utilisateur_id,
        },
      });
      totalInteractions++;
    }
  }
  console.log(`   ✔ ${totalInteractions} interactions créées`);

  // ══════════════════════════════════════════════════════════════════════════════
  // 12. LETTRES DE RECOMMANDATION + FOLLOWS
  // ══════════════════════════════════════════════════════════════════════════════
  console.log('12/12 — Lettres de recommandation + follows');

  // Lettres de recommandation (au moins 1 par étudiant)
  let totalLettres = 0;
  const lettresSet = new Set();

  for (const etudiant of etudiants) {
    const profDeLettre = pick(professeurs);
    const key = `${etudiant.utilisateur_id}-${profDeLettre.utilisateur_id}`;
    if (lettresSet.has(key)) continue;
    lettresSet.add(key);

    await prisma.lettresDeRecommendations.create({
      data: {
        utilisateur_id: etudiant.utilisateur_id,
        prof_utilisateur_id: profDeLettre.utilisateur_id,
        objet: faker.lorem.sentence({ min: 3, max: 7 }),
        description: faker.lorem.paragraphs(2),
        fichier: `https://storage.platform.local/lettres/${faker.string.uuid()}.pdf`,
        statut: pick(STATUTS),
        commentaire: faker.lorem.sentence(),
      },
    });
    totalLettres++;
  }
  console.log(`   ✔ ${totalLettres} lettres de recommandation créées`);

  // Follows : étudiants suivent des professeurs et professionnels
  let totalFollows = 0;
  const followsSet = new Set();

  for (const etudiant of etudiants) {
    const toFollow = pickN([...professeurs, ...professionnels], randInt(3, 6));
    for (const target of toFollow) {
      if (target.utilisateur_id === etudiant.utilisateur_id) continue;
      const key = `${etudiant.utilisateur_id}-${target.utilisateur_id}`;
      if (followsSet.has(key)) continue;
      followsSet.add(key);

      await prisma.follow.create({
        data: {
          followerId: etudiant.utilisateur_id,
          followingId: target.utilisateur_id,
        },
      });
      totalFollows++;
    }
  }
  console.log(`   ✔ ${totalFollows} follows créés`);

  // ══════════════════════════════════════════════════════════════════════════════
  // RÉSUMÉ FINAL
  // ══════════════════════════════════════════════════════════════════════════════
  const stats = {
    etudiants: etudiants.length,
    professeurs: professeurs.length,
    professionnels: professionnels.length,
    institutions: institutions.length,
    offres: offres.length,
    experiences: etudiants.length * 25,
    portfolios: etudiants.length,
  };

  // Follow : étudiants suivent des professeurs / professionnels
  // UTILISATION DE followsSet AU LIEU DE followsCrees POUR ÉVITER LES DOUBLONS
  let nbFollows = 0;
  for (let i = 0; i < 200; i += 1) {
    const follower = pick(etudiants);
    const following = pick([...professeurs, ...professionnels]);
    const key = `${follower.utilisateur_id}-${following.utilisateur_id}`;
    
    // On vérifie directement dans le followsSet rempli à l'étape 12
    if (follower.utilisateur_id === following.utilisateur_id || followsSet.has(key)) continue;
    followsSet.add(key);

    await prisma.follow.create({
      data: { followerId: follower.utilisateur_id, followingId: following.utilisateur_id },
    });
    nbFollows += 1;
  }
  console.log(`   ✔ ${nbFollows} relations follow créées supplémentaires`);

  // Notifications : informer les étudiants de la validation de leurs expériences
  let nbNotifications = 0;
  const allExperiences = await prisma.experience.findMany();
  
  for (const experience of faker.helpers.arrayElements(allExperiences, Math.min(300, allExperiences.length))) {
    await prisma.notification.create({
      data: {
        message: `Votre expérience "${experience.titre}" a été mise à jour.`,
        date_notification: new Date(),
        lu: faker.datatype.boolean(),
        type: 'validation_experience',
        utilisateur_cible_id: experience.utilisateur_id,
        utilisateur_source_id: pick(professeurs).utilisateur_id,
      },
    });
    nbNotifications += 1;
  }
  console.log(`   ✔ ${nbNotifications} notifications créées`);

  // Connexions : historique de connexion pour quelques utilisateurs
  let nbConnexions = 0;
  console.log(`   ✔ ${nbConnexions} connexions créées`);

  console.log('--------------------------------------------------');
  console.log('🎉 BASE DE DONNÉES REMPLIE AVEC SUCCÈS !');
  console.log(`   Administrateur : ${adminUser.email}`);
  console.log(`   Institutions   : ${institutions.length}`);
  console.log(`   Directeurs     : ${directeurUsers.length}`);
  console.log(`   Professeurs    : ${professeurs.length}`);
  console.log(`   Étudiants      : ${etudiants.length}`);
  console.log(`   Professionnels : ${professionnels.length}`);
  console.log(`   Offres         : ${offres.length}`);
  console.log(`   Expériences    : ${allExperiences.length}`);
  console.log('   🔑 Mot de passe pour tous les comptes de test : P@ssw0rd123');
  console.log('--------------------------------------------------');
}

main()
  .catch((err) => {
    console.error('❌ Erreur seed :', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });