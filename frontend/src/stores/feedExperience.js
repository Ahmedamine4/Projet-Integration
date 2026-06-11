import { defineStore } from 'pinia';
import api from '@/services/api';

const USE_MOCK = true;

// Quand le backend sera prêt, tu changes juste ces 2 lignes.
const FEED_EXPERIENCES_ENDPOINT = '/feed/experiences';

const MOCK_EXPERIENCES = [  
  {
  id: 'cmq8efs2t000jqv5lwfma5vei',
  type: 'project',

  portfolioUserId: 'cmq8efenu000bqv5lu13zr2a8',
  userId: 'cmq8efenu000bqv5lu13zr2a8',
  utilisateur_id: 'cmq8efenu000bqv5lu13zr2a8',
  etudiant_id: 'cmq8efenu000bqv5lu13zr2a8',

  title: 'Projet 1',
  description: 'Projet importé depuis GitHub : new-project',
  date: '2026-06-10',
  imagePreview: null,

  studentName: 'Nour Bakkali',
  schoolName: 'Compte local',
  feedReason: 'Projet réel visible en base',

  rankScore: 999,
  portfolioScore: 0,
  credibilityScore: 0,

  isVerified: true,
  recommendationsCount: 0,
  githubReposCount: 1,
  githubUrl: null,

  technologies: ['GitHub'],
  domains: ['Web Frontend'],
},
...Array.from({ length: 11 }, (_, index) => {
  const number = index + 2;

  return {
    id: `mock-project-${number}`,
    type: 'project',

    portfolioUserId: `mock-user-${number}`,
    userId: `mock-user-${number}`,
    utilisateur_id: `mock-user-${number}`,
    etudiant_id: `mock-user-${number}`,

    title: `Projet ${number}`,
    description: `Experience mock ${number}`,
    date: `2026-06-${String(number).padStart(2, '0')}`,
    imagePreview: null,

    studentName: `Etudiant ${number}`,
    schoolName: 'Compte local',
    feedReason: 'Projet mock visible',

    rankScore: 100 - number,
    portfolioScore: number,
    credibilityScore: number,

    isVerified: true,
    recommendationsCount: number,
    githubReposCount: 1,
    githubUrl: null,

    technologies: ['GitHub'],
    domains: ['Web Frontend'],
  };
})
];

const MOCK_FILTER_TECHNOLOGIES = [
  ...new Set(MOCK_EXPERIENCES.flatMap((item) => item.technologies || [])),
];

function extractArray(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function getFeedPayload(data) {
  if (Array.isArray(data)) {
    return {
      payload: {},
      items: data,
      hasMore: undefined,
      nextCursor: null,
    };
  }

  const payload =
    data?.data && !Array.isArray(data.data)
      ? data.data
      : data;

  return {
    payload,
    items: extractArray(payload, ['items', 'feedItems', 'experiences']),
    hasMore: payload?.hasMore,
    nextCursor: payload?.nextCursor ?? payload?.cursor ?? null,
  };
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

export const useFeedExperienceStore = defineStore('feedExperience', {
  state: () => ({
    items: [],
    selectedProject: null,
    filterTechnologies: [],
    loading: false,
    loadingMore: false,
    error: null,
    limit: 4,
    page: 1,
    nextCursor: null,
    hasMore: true,
    lastParams: {},
  }),

  actions: {
    resetPagination() {
      this.items = [];
      this.page = 1;
      this.nextCursor = null;
      this.hasMore = true;
    },

    setSelectedProject(project) {
      this.selectedProject = project;
    },

    buildRequestParams(params = {}) {
      return {
        ...params,
        limit: this.limit,
        page: this.page,
        cursor: this.nextCursor || undefined,
      };
    },

    applyFeedResponse(rawItems, hasMore, nextCursor, { append = false } = {}) {
      const normalizedItems = rawItems.map((item) => normalizeExperience(item));
      const existingKeys = new Set(
        this.items.map((item) => item.feedKey || item.id).filter(Boolean)
      );

      const nextItems = append
        ? normalizedItems.filter((item) => {
            const key = item.feedKey || item.id;

            if (!key) return true;
            if (existingKeys.has(key)) return false;

            existingKeys.add(key);
            return true;
          })
        : normalizedItems;

      this.items = append
        ? [...this.items, ...nextItems]
        : nextItems;

      this.nextCursor = nextCursor ?? null;
      this.hasMore = typeof hasMore === 'boolean'
        ? hasMore
        : normalizedItems.length >= this.limit;
      this.page += 1;
    },

    getMockFeedPage(params = {}) {
      const currentPage = Number(params.page || 1);
      const limit = Number(params.limit || this.limit);
      const start = (currentPage - 1) * limit;
      const normalized = MOCK_EXPERIENCES
        .map((item) => normalizeExperience(item))
        .filter((item) => matchesMockFilters(item, params));
      const items = normalized.slice(start, start + limit);
      const nextOffset = start + items.length;

      return {
        items: items.map((item) => item.raw || item),
        hasMore: nextOffset < normalized.length,
        nextCursor: nextOffset < normalized.length ? String(nextOffset) : null,
      };
    },

    async fetchFeedExperiences(params = {}, options = { reset: true }) {
      const shouldReset = options.reset !== false;

      if (shouldReset) {
        this.resetPagination();
      }

      this.loading = true;
      this.error = null;
      this.lastParams = params;

      try {
        const requestParams = this.buildRequestParams(params);

        if (USE_MOCK) {
          const page = this.getMockFeedPage(requestParams);
          this.applyFeedResponse(page.items, page.hasMore, page.nextCursor, {
            append: !shouldReset,
          });
          return;
        }

        const response = await api.get(FEED_EXPERIENCES_ENDPOINT, {
          params: requestParams,
        });
        const feedPayload = getFeedPayload(response.data);
        const data = feedPayload.payload;

        const mixedItems = feedPayload.items;

        const projects = extractArray(feedPayload.payload, ['projects', 'projets']);

        const internships = extractArray(feedPayload.payload, ['internships', 'stages']);

        const certifications = extractArray(feedPayload.payload, ['certifications', 'certificates']);

        const activities = extractArray(data, ['activities', 'activites', 'activités'])
          .map((item) => normalizeExperience(item, 'activity'));

        const allItems = mixedItems.length
          ? mixedItems
          : [...projects, ...internships, ...certifications, ...activities];

        this.applyFeedResponse(allItems, feedPayload.hasMore, feedPayload.nextCursor, {
          append: !shouldReset,
        });
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

    async fetchNextFeedExperiences(params = {}) {
      if (!this.hasMore || this.loading || this.loadingMore) return;

      this.loadingMore = true;
      this.error = null;
      this.lastParams = params;

      try {
        const requestParams = this.buildRequestParams(params);

        if (USE_MOCK) {
          const page = this.getMockFeedPage(requestParams);
          this.applyFeedResponse(page.items, page.hasMore, page.nextCursor, {
            append: true,
          });
          return;
        }

        const response = await api.get(FEED_EXPERIENCES_ENDPOINT, {
          params: requestParams,
        });
        const feedPayload = getFeedPayload(response.data);

        this.applyFeedResponse(feedPayload.items, feedPayload.hasMore, feedPayload.nextCursor, {
          append: true,
        });
      } catch (error) {
        console.error('Erreur chargement suite feed:', error);

        this.error =
          error.response?.data?.message ||
          'Impossible de charger la suite du feed.';
      } finally {
        this.loadingMore = false;
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
