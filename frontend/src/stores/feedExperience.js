import { defineStore } from 'pinia';
import api from '@/services/api';

const USE_MOCK = true;

// Quand le backend sera prêt, tu changes juste ces 2 lignes.
const FEED_EXPERIENCES_ENDPOINT = '/feed/experiences';

const MOCK_EXPERIENCES = [
  {
    id: 'project-1',
    type: 'project',
    portfolioUserId: 4,
    title: 'SmartStudyRoom Platform',
    description:
      "Une plateforme collaborative qui utilise l'IA pour optimiser les espaces d'étude partagés.",
    date: '2025-05-18',
    imagePreview: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80',
    studentName: 'Amine Kettani',
    schoolName: 'ENSA Casablanca',
    feedReason: 'Même école',
    rankScore: 94,
    portfolioScore: 82,
    credibilityScore: 82,
    isVerified: true,
    recommendationsCount: 128,
    githubReposCount: 3,
    githubUrl: 'https://github.com/demo/smart-study-room',
    technologies: ['Vue 3', 'FastAPI', 'PostgreSQL'],
    domains: ['Web Frontend', 'Web Backend', 'Machine Learning & AI'],
  },
  {
    id: 'internship-1',
    type: 'internship',
    portfolioUserId: 5,
    title: 'Software Engineering Internship',
    description:
      'Stage validé portant sur le développement d’une application web interne et la documentation technique.',
    date: '2025-04-12',
    imagePreview: null,
    studentName: 'Youssef Benmoussa',
    schoolName: 'ENSA Casablanca',
    feedReason: 'Stage validé',
    rankScore: 86,
    portfolioScore: 74,
    credibilityScore: 74,
    isVerified: true,
    recommendationsCount: 22,
    githubReposCount: 0,
    githubUrl: null,
    technologies: ['Node.js', 'PostgreSQL'],
    domains: ['Web Backend'],
  },
  {
    id: 'certification-1',
    type: 'certification',
    portfolioUserId: 6,
    title: 'Docker Fundamentals Certification',
    description:
      'Certification validée autour des bases Docker, images, conteneurs et orchestration simple.',
    date: '2025-03-20',
    imagePreview: null,
    studentName: 'Nour Berrada',
    schoolName: 'ENSA Casablanca',
    feedReason: 'Certification vérifiée',
    rankScore: 78,
    portfolioScore: 88,
    credibilityScore: 88,
    isVerified: true,
    recommendationsCount: 18,
    githubReposCount: 0,
    githubUrl: null,
    technologies: ['Docker', 'Linux'],
    domains: ['DevOps & Cloud Infrastructure'],
  },
  {
    id: 'activity-1',
    type: 'activity',
    portfolioUserId: 2,
    title: 'Hackathon AI Challenge',
    description:
      'Participation à un hackathon autour de solutions IA appliquées aux services étudiants.',
    date: '2025-06-02',
    imagePreview: null,
    studentName: 'Sara Idrissi',
    schoolName: 'ENSIAS Rabat',
    feedReason: 'Activité vérifiée',
    rankScore: 91,
    portfolioScore: 86,
    credibilityScore: 86,
    isVerified: true,
    recommendationsCount: 34,
    githubReposCount: 0,
    githubUrl: null,
    technologies: ['Python', 'LangChain', 'FastAPI'],
    domains: ['Machine Learning & AI'],
  },
];
const MOCK_FILTER_TECHNOLOGIES = [
  'Vue 3',
  'React',
  'Node.js',
  'FastAPI',
  'PostgreSQL',
  'Docker',
  'Python',
  'LangChain',
  'Linux',
];

function extractArray(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function normalizeType(type) {
  const value = String(type || '').toLowerCase();

  if (['projet', 'project'].includes(value)) return 'project';
  if (['stage', 'internship'].includes(value)) return 'internship';
  if (['certificat', 'certification', 'certificate'].includes(value)) return 'certification';
  if (['activite', 'activité', 'activity'].includes(value)) return 'activity';

  return 'project';
}

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function getRankScore(item) {
  return Number(
    item.rankScore ??
    item.rankingScore ??
    item.matchScore ??
    item.score ??
    item.feedScore ??
    item.campusRankScore ??
    item.recommendationScore ??
    item.portfolioScore ??
    item.credibilityScore ??
    item.scoreCredibilite ??
    0
  );
}

function normalizeExperience(item, forcedType = null) {
  const type = normalizeType(forcedType || item.type || item.feedType || item.category);

  const owner =
    item.etudiant?.utilisateur ||
    item.utilisateur ||
    item.user ||
    item.owner ||
    item.etudiant ||
    {};

  const studentName =
    item.studentName ||
    item.nomEtudiant ||
    item.userName ||
    [owner.prenom || owner.firstName, owner.nom || owner.lastName]
      .filter(Boolean)
      .join(' ') ||
    'Étudiant';

  const rawId =
    item.id ||
    item.projet_id ||
    item.stage_id ||
    item.certification_id ||
    item.activite_id;

  return {
    id: rawId,
    feedKey: `${type}-${rawId}`,
    type,

    portfolioUserId:
      item.portfolioUserId ||
      item.utilisateur_id ||
      item.userId ||
      item.etudiant_id ||
      item.etudiantId ||
      item.etudiant?.id,

    title:
      item.title ||
      item.titre ||
      item.nom ||
      item.intitule ||
      'Élément sans titre',

    description:
      item.description ||
      item.missions ||
      item.resume ||
      item.organisme ||
      '',

    date:
      item.date ||
      item.createdAt ||
      item.updatedAt ||
      item.dateDebut ||
      item.dateObtention ||
      null,

    imagePreview:
      item.imagePreview ||
      item.imageUrl ||
      item.captureUrl ||
      item.screenshotUrl ||
      item.captures?.[0] ||
      null,

    shareUrl: item.shareUrl || null,

    studentName,

    schoolName:
      item.schoolName ||
      item.etudiant?.institution?.nom ||
      item.institution?.nom ||
      item.school?.nom ||
      'Institution non renseignée',

    initials: item.initials || getInitials(studentName),

    feedReason:
      item.feedReason ||
      item.reason ||
      item.recommandationReason ||
      'Recommandé',

    rankScore: getRankScore(item),

    portfolioScore:
      Number(
        item.portfolioScore ??
        item.credibilityScore ??
        item.scoreCredibilite ??
        0
      ),

    credibilityScore:
      Number(
        item.credibilityScore ??
        item.scoreCredibilite ??
        item.portfolioScore ??
        0
      ),

    isVerified:
      item.isVerified ??
      item.isCertified ??
      item.visibleToEveryone ??
      item.effectiveVisibleToEveryone ??
      item.statut === 'VALIDE' ??
      item.validationStatus === 'valide' ??
      false,

    recommendationsCount:
      item.recommendationsCount ||
      item._count?.recommandations ||
      item.recommandations?.length ||
      0,

    githubReposCount:
      type === 'project'
        ? item.githubReposCount ||
          item.repositories?.length ||
          item.githubRepositories?.length ||
          0
        : 0,

    githubUrl:
      type === 'project'
        ? item.githubUrl || item.lienGithub || item.githubLink || null
        : null,

    technologies:
      item.technologies ||
      item.technologyNames ||
      item.techStack ||
      item.outils ||
      [],

    domains:
      item.domains ||
      item.domaines ||
      item.competences ||
      (item.domaine ? [item.domaine] : []),

    raw: item,
  };
}

function normalizeValue(value) {
  return String(value || '').trim().toLowerCase();
}

function matchesMockFilters(item, params) {
  const search = normalizeValue(params.search);
  const technology = normalizeValue(params.technology);
  const domain = normalizeValue(params.domain);
  const source = params.source;

  if (search) {
    const text = [
      item.title,
      item.description,
      item.studentName,
      item.schoolName,
      item.type,
      ...(item.technologies || []),
      ...(item.domains || []),
    ]
      .join(' ')
      .toLowerCase();

    if (!text.includes(search)) return false;
  }

  if (source === 'same-school' && item.feedReason !== 'Même école') return false;
  if (source === 'following' && item.feedReason !== 'Abonnement') return false;

  if (technology) {
    const hasTechnology = (item.technologies || []).some((tech) =>
      normalizeValue(tech).includes(technology)
    );

    if (!hasTechnology) return false;
  }

  if (domain) {
    const hasDomain = (item.domains || []).some((itemDomain) =>
      normalizeValue(itemDomain).includes(domain)
    );

    if (!hasDomain) return false;
  }

  return true;
}

function sortExperiences(items, sort = 'trending') {
  return [...items].sort((a, b) => {
    if (sort === 'recent') {
      return new Date(b.date || 0) - new Date(a.date || 0);
    }

    if (sort === 'portfolio-score') {
      return (b.portfolioScore || 0) - (a.portfolioScore || 0);
    }

    return (b.rankScore || 0) - (a.rankScore || 0);
  });
}

export const useFeedExperienceStore = defineStore('feedExperience', {
  state: () => ({
    items: [],
    filterTechnologies: [],
    loading: false,
    error: null,
    lastParams: {},
  }),

  actions: {
    async fetchFeedExperiences(params = {}) {
      this.loading = true;
      this.error = null;
      this.lastParams = params;

      try {
        if (USE_MOCK) {
          const normalized = MOCK_EXPERIENCES
            .map((item) => normalizeExperience(item))
            .filter((item) => matchesMockFilters(item, params));

          this.items = sortExperiences(normalized, params.sort);
          return;
        }

        const response = await api.get(FEED_EXPERIENCES_ENDPOINT, { params });
        const data = response.data;

        const mixedItems = extractArray(data, ['items', 'feedItems', 'experiences'])
          .map((item) => normalizeExperience(item));

        const projects = extractArray(data, ['projects', 'projets'])
          .map((item) => normalizeExperience(item, 'project'));

        const internships = extractArray(data, ['internships', 'stages'])
          .map((item) => normalizeExperience(item, 'internship'));

        const certifications = extractArray(data, ['certifications', 'certificates'])
          .map((item) => normalizeExperience(item, 'certification'));

        const activities = extractArray(data, ['activities', 'activites', 'activités'])
          .map((item) => normalizeExperience(item, 'activity'));

        const allItems = mixedItems.length
          ? mixedItems
          : [...projects, ...internships, ...certifications, ...activities];

        this.items = sortExperiences(allItems, params.sort);
      } catch (error) {
        console.error('Erreur chargement expériences feed:', error);

        this.error =
          error.response?.data?.message ||
          'Impossible de charger le feed.';

        this.items = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchFeedTechnologies() {
      try {
        if (USE_MOCK) {
          this.filterTechnologies = MOCK_FILTER_TECHNOLOGIES;
          return;
        }

        const response = await api.get('/feed/technologies');

        this.filterTechnologies =
          response.data.technologies ||
          response.data.data?.technologies ||
          response.data ||
          [];
      } catch (error) {
        console.error('Erreur chargement technologies feed:', error);
        this.filterTechnologies = [];
      }
    },
  },
});