<template>
  <div class="feed-shell">
    <Sidebar :user="mockUser" />

    <main class="feed-page">
      <FeedHeader class="sticky-header" />

      <div class="feed-content">
        <section
          class="offers-row"
          :class="{ 'offers-row--with-action': feedConfig.showAddOfferButton }"
        >
          <FeedOffersCarousel
            :offers="topCarouselItems"
            :title="feedConfig.topSectionTitle"
            :subtitle="feedConfig.topSectionSubtitle"
            @select-offer="handleTopCarouselSelect"
          />

          <button
            v-if="feedConfig.showAddOfferButton"
            type="button"
            class="add-offer-button feed-add-offer-button"
            @click="openAddOfferModal"
          >
            <Plus
              :size="14"
              :stroke-width="2.7"
            />
            Add offer
          </button>
        </section>

        <div class="feed-grid">
          <aside class="suggested-sidebar sticky-suggestions">
            <section class="suggested-students-card">
              <header class="suggested-students-header">
                <h2>{{ feedConfig.sidebarTitle }}</h2>
                <p>{{ feedConfig.sidebarSubtitle }}</p>
              </header>

              <div class="suggested-students-list">
                <article
                  v-for="student in sidebarStudents"
                  :key="student.id"
                  class="suggested-student"
                >
                  <div class="suggested-avatar">
                    {{ student.initials }}
                  </div>

                  <div class="suggested-info">
                    <button
                      type="button"
                      class="suggested-name-button"
                      @click.stop="openStudentPortfolio(student)"
                    >
                      {{ student.name }}
                    </button>

                    <span>{{ student.speciality }}</span>

                    <div class="suggested-stack">
                      <small
                        v-for="item in student.stack"
                        :key="item"
                      >
                        {{ item }}
                      </small>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="follow-mini-button"
                    :class="{ 'is-following': student.isFollowing }"
                    :aria-label="sidebarActionAria(student)"
                    @click.stop="handleSidebarStudentAction(student)"
                  >
                    <Check
                      v-if="student.isFollowing"
                      :size="11"
                      :stroke-width="2.6"
                    />

                    <Plus
                      v-else
                      :size="12"
                      :stroke-width="2.8"
                    />

                    <span v-if="student.isFollowing">
                      {{ sidebarActionLabel(student) }}
                    </span>
                  </button>
                </article>
              </div>
            </section>
          </aside>

          <section class="feed-list">
            <template v-if="filteredProjects.length">
              <FeedProjectCard
                v-for="project in filteredProjects"
                :key="project.id"
                :project="project"
                @click="openProjectDetail(project)"
                @share="shareProject = $event"
                @open-student="openProjectOwnerPortfolio"
              />
            </template>

            <div
              v-else
              class="feed-empty"
            >
              <SearchX :size="32" />
              <p>{{ feedConfig.emptyMessage }}</p>
            </div>
          </section>

          <aside class="feed-sidebar sticky-filters">
            <FeedFiltersPanel
              :filters="filters"
              :search="search"
              :technologies="allTechnologies"
              :domains="allDomains"
              @update:filters="filters = $event"
              @update:search="search = $event"
              @reset="resetFilters"
            />
          </aside>
        </div>
      </div>
    </main>

    <ShareProjectModal
      :project="shareProject"
      @close="shareProject = null"
    />

    <FeedOfferDetailModal
      :offer="selectedOffer"
      @close="closeOfferDetail"
      @apply="openApplyOffer"
    />

    <ApplyOfferModal
      :offer="applyingOffer"
      @close="closeApplyOffer"
      @submit="handleApplyOfferSubmit"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { Check, Plus, SearchX } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

import Sidebar from '@/components/layout/AppSidebar.vue';
import FeedHeader from '@/components/feed/feedHeader.vue';
import FeedFiltersPanel from '@/components/feed/FeedFiltersPanel.vue';
import FeedProjectCard from '@/components/feed/feedProject.vue';
import ShareProjectModal from '@/components/feed/ShareProjectModal.vue';
import FeedOffersCarousel from '@/components/feed/FeedOffersCarousel.vue';
import FeedOfferDetailModal from '@/components/feed/FeedOfferDetailModal.vue';
import ApplyOfferModal from '@/components/feed/ApplyOfferModal.vue';

const router = useRouter();

const mockUser = {
  prenom: 'Wissam',
  nom: 'Bakkali',

  // Test roles:
  // 'etudiant' | 'professionnel' | 'professeur'
  role: 'professeur',
};

const currentRole = computed(() => mockUser.role || 'etudiant');
const isRecruiter = computed(() => currentRole.value === 'professionnel');
const isProfessor = computed(() => currentRole.value === 'professeur');

const feedConfigByRole = {
  etudiant: {
    topSectionTitle: 'Recommended opportunities',
    topSectionSubtitle: 'Internships and jobs matching your portfolio.',
    sidebarTitle: 'Suggested students',
    sidebarSubtitle: 'Profiles you may want to follow.',
    emptyMessage: 'Aucun élément ne correspond à vos filtres.',
    showAddOfferButton: false,
  },

  professionnel: {
    topSectionTitle: 'Top students',
    topSectionSubtitle: 'Discover high-performing students with strong portfolios.',
    sidebarTitle: 'Featured candidates',
    sidebarSubtitle: 'Students with strong public portfolios.',
    emptyMessage: 'Aucun profil ou élément ne correspond à vos filtres.',
    showAddOfferButton: true,
  },

  professeur: {
    topSectionTitle: 'Top students',
    topSectionSubtitle: 'Discover high-performing students from your school.',
    sidebarTitle: 'Students from your school',
    sidebarSubtitle: 'Profiles you may want to follow.',
    emptyMessage: 'Aucun élément ne correspond à vos filtres.',
    showAddOfferButton: false,
  },
};

const feedConfig = computed(() => {
  return feedConfigByRole[currentRole.value] || feedConfigByRole.etudiant;
});

const suggestedStudents = ref([
  {
    id: 1,
    portfolioUserId: 1,
    initials: 'SI',
    name: 'Sara Idrissi',
    speciality: 'Frontend Developer',
    schoolName: 'ENSA Casablanca',
    stack: ['Vue', 'Node'],
    technologies: ['Vue 3', 'Node.js', 'PostgreSQL'],
    domains: ['Web Frontend', 'Web Backend'],
    portfolioScore: 86,
    isFollowing: false,
  },
  {
    id: 2,
    portfolioUserId: 2,
    initials: 'YK',
    name: 'Yassine Karim',
    speciality: 'AI & Data Student',
    schoolName: 'ENSIAS Rabat',
    stack: ['Python', 'FastAPI'],
    technologies: ['Python', 'FastAPI', 'LangChain'],
    domains: ['Machine Learning & AI', 'Data Engineering'],
    portfolioScore: 91,
    isFollowing: false,
  },
  {
    id: 3,
    portfolioUserId: 3,
    initials: 'AB',
    name: 'Amal Benali',
    speciality: 'DevOps Student',
    schoolName: 'ENSA Casablanca',
    stack: ['Docker', 'CI/CD'],
    technologies: ['Docker', 'GitLab CI', 'Linux'],
    domains: ['DevOps & Cloud Infrastructure'],
    portfolioScore: 78,
    isFollowing: false,
  },
]);

const studentsFromSchool = ref([
  {
    id: 4,
    portfolioUserId: 4,
    initials: 'AK',
    name: 'Amine Kettani',
    speciality: 'Software Engineering Student',
    schoolName: 'ENSA Casablanca',
    stack: ['Vue 3', 'FastAPI'],
    technologies: ['Vue 3', 'FastAPI', 'PostgreSQL'],
    domains: ['Web Frontend', 'Web Backend'],
    portfolioScore: 82,
    isFollowing: false,
  },
  {
    id: 5,
    portfolioUserId: 5,
    initials: 'YB',
    name: 'Youssef Benmoussa',
    speciality: 'Mobile Development Student',
    schoolName: 'ENSA Casablanca',
    stack: ['Flutter', 'Node.js'],
    technologies: ['Flutter', 'Node.js', 'Firebase'],
    domains: ['Mobile Development', 'Web Backend'],
    portfolioScore: 74,
    isFollowing: false,
  },
  {
    id: 6,
    portfolioUserId: 6,
    initials: 'NB',
    name: 'Nour Berrada',
    speciality: 'Cybersecurity Student',
    schoolName: 'ENSA Casablanca',
    stack: ['Linux', 'Security'],
    technologies: ['Linux', 'Python', 'Networking'],
    domains: ['Cybersecurity'],
    portfolioScore: 88,
    isFollowing: false,
  },
]);

const topStudents = computed(() => {
  return [...suggestedStudents.value].sort((a, b) => {
    return (b.portfolioScore || 0) - (a.portfolioScore || 0);
  });
});

const sidebarStudents = computed(() => {
  if (isRecruiter.value) return topStudents.value;
  if (isProfessor.value) return studentsFromSchool.value;

  return suggestedStudents.value;
});

const search = ref('');
const shareProject = ref(null);
const selectedOffer = ref(null);
const applyingOffer = ref(null);

const defaultFilters = () => ({
  source: 'all',
  sort: 'trending',
  technology: null,
  domain: null,
});

const filters = ref(defaultFilters());

const mockProjects = [
  {
    id: 'cmq2w34ze000dug4a8r9byuqb',
    type: 'projet',
    portfolioUserId: 4,
    campusRankScore: 94,
    portfolioScore: 82,
    credibilityScore: 82,
    title: 'SmartStudyRoom Platform',
    description:
      'Une plateforme collaborative qui utilise l\'IA pour optimiser les espaces d\'étude partagés. Les étudiants peuvent réserver des salles, former des groupes d\'étude et recevoir des recommandations de ressources personnalisées en fonction de leur cours et de leurs objectifs.',
    date: '2025-05-18',
    imagePreview:
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80',
    shareUrl: null,
    studentName: 'Amine Kettani',
    schoolName: 'ENSA Casablanca',
    feedReason: 'Même école',
    isVerified: true,
    recommendationsCount: 128,
    githubReposCount: 3,
    technologies: ['Vue 3', 'FastAPI', 'PostgreSQL'],
    domains: ['Web Frontend', 'Web Backend', 'Machine Learning & AI'],
  },
  {
    id: 2,
    type: 'projet',
    portfolioUserId: 2,
    campusRankScore: 88,
    portfolioScore: 91,
    credibilityScore: 91,
    title: 'AI Portfolio Recommendation System',
    description:
      'Un système intelligent qui analyse les projets académiques des étudiants et propose des recommandations de compétences à acquérir, ainsi que des profils d\'entreprises susceptibles d\'être intéressées par leur profil. Utilise des embeddings NLP pour comparer les portfolios.',
    date: '2025-06-02',
    imagePreview:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    shareUrl: null,
    studentName: 'Sara Idrissi',
    schoolName: 'ENSIAS Rabat',
    feedReason: 'Abonnement',
    isVerified: true,
    recommendationsCount: 97,
    githubReposCount: 2,
    technologies: ['Python', 'LangChain', 'React'],
    domains: ['Machine Learning & AI', 'Data Engineering'],
  },
  {
    id: 3,
    type: 'projet',
    portfolioUserId: 5,
    campusRankScore: 72,
    portfolioScore: 74,
    credibilityScore: 74,
    title: 'Campus Event Aggregator',
    description:
      'Application mobile et web qui centralise tous les événements du campus — workshops, hackathons, séminaires — et envoie des notifications personnalisées aux étudiants selon leurs centres d\'intérêt et leur parcours académique.',
    date: '2025-04-30',
    imagePreview:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    shareUrl: null,
    studentName: 'Youssef Benmoussa',
    schoolName: 'ENSA Casablanca',
    feedReason: 'Même école',
    isVerified: false,
    recommendationsCount: 54,
    githubReposCount: 1,
    technologies: ['Flutter', 'Node.js', 'Firebase'],
    domains: ['Mobile Development', 'Web Backend'],
  },
];

const mockOffers = [
  {
    id: 1,
    title: 'Frontend Developer Intern',
    company: 'Capgemini',
    location: 'Casablanca',
    duration: '4 to 6 months',
    level: 'Student / Junior',
    technologies: ['Vue 3', 'JavaScript', 'HTML', 'CSS', 'Git'],
    description:
      'Join the frontend team to build reusable Vue components, improve UI consistency and contribute to internal web platforms.',
  },
  {
    id: 2,
    title: 'Junior Full-Stack Developer',
    company: 'Inetum',
    location: 'Rabat',
    duration: 'Permanent contract',
    level: 'Junior',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
    description:
      'Work on full-stack web applications, participate in API development, database integration and frontend feature delivery.',
  },
  {
    id: 3,
    title: 'AI Engineering Intern',
    company: 'OCP Solutions',
    location: 'Hybrid',
    duration: '6 months',
    level: 'Final-year student',
    technologies: ['Python', 'FastAPI', 'LangChain', 'PostgreSQL'],
    description:
      'Contribute to AI-powered internal tools, build APIs, test LLM-based workflows and support data-driven product features.',
  },
  {
    id: 4,
    title: 'DevOps Intern',
    company: 'Orange Business',
    location: 'Casablanca',
    duration: '4 months',
    level: 'Student',
    technologies: ['Docker', 'CI/CD', 'Linux', 'GitLab'],
    description:
      'Assist the DevOps team with deployment pipelines, containerized environments and monitoring improvements.',
  },
];

const topCarouselItems = computed(() => {
  if (isRecruiter.value || isProfessor.value) {
    return topStudents.value.map((student) => ({
      ...student,
      id: student.id,
      title: student.name,
      company: student.schoolName,
      location: `Portfolio score ${student.portfolioScore || 0}`,
      duration: student.speciality,
      level: isRecruiter.value ? 'Featured candidate' : 'Top student',
      technologies: student.technologies || student.stack || [],
      domains: student.domains || [],
      description: buildStudentCarouselDescription(student),
      carouselType: 'student-profile',
    }));
  }

  return mockOffers.map((offer) => ({
    ...offer,
    carouselType: 'offer',
  }));
});

const allTechnologies = computed(() => {
  const technologiesMap = new Map();

  mockProjects.forEach((project) => {
    (project.technologies || []).forEach((technology) => {
      const key = normalizeFilterValue(technology);

      if (!technologiesMap.has(key)) {
        technologiesMap.set(key, technology);
      }
    });
  });

  return [...technologiesMap.values()].sort((a, b) => a.localeCompare(b));
});

const allDomains = computed(() => [
  'Mobile Development',
  'DevOps & Cloud Infrastructure',
  'Machine Learning & AI',
  'High Performance & Quantum Computing',
  'Data Engineering',
  'Embedded Systems & IoT',
  'Web Frontend',
  'Cybersecurity',
  'Web Backend',
]);

const filteredProjects = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  const currentFilters = filters.value;

  let result = mockProjects.filter((project) => {
    if (keyword) {
      const searchableText = [
        project.title,
        project.description,
        project.studentName,
        project.schoolName,
        project.type,
        ...(project.technologies || []),
        ...(project.domains || []),
      ]
        .join(' ')
        .toLowerCase();

      if (!searchableText.includes(keyword)) return false;
    }

    if (
      currentFilters.source === 'same-school' &&
      project.feedReason !== 'Même école'
    ) {
      return false;
    }

    if (
      currentFilters.source === 'following' &&
      project.feedReason !== 'Abonnement'
    ) {
      return false;
    }

    if (!itemHasTechnology(project, currentFilters.technology)) {
      return false;
    }

    if (!itemHasDomain(project, currentFilters.domain)) {
      return false;
    }

    return true;
  });

  if (currentFilters.sort === 'portfolio-score') {
    result = [...result].sort(
      (a, b) => (b.portfolioScore || 0) - (a.portfolioScore || 0)
    );
  } else if (currentFilters.sort === 'trending') {
    result = [...result].sort(
      (a, b) => (b.campusRankScore || 0) - (a.campusRankScore || 0)
    );
  } else if (currentFilters.sort === 'recent') {
    result = [...result].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }

  return result;
});

function buildStudentCarouselDescription(student) {
  const score = student.portfolioScore
    ? `Portfolio score ${student.portfolioScore}`
    : 'Strong portfolio';

  const domains = student.domains?.length
    ? student.domains.slice(0, 2).join(', ')
    : 'multiple domains';

  return `${score} with experience in ${domains}.`;
}

function normalizeFilterValue(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\./g, '');
}

function itemHasTechnology(item, selectedTechnology) {
  if (!selectedTechnology) return true;

  const selected = normalizeFilterValue(selectedTechnology);

  return (item.technologies || []).some((technology) => {
    const normalizedTechnology = normalizeFilterValue(technology);

    return (
      normalizedTechnology === selected ||
      normalizedTechnology.includes(selected) ||
      selected.includes(normalizedTechnology)
    );
  });
}

function itemHasDomain(item, selectedDomain) {
  if (!selectedDomain) return true;

  const selected = normalizeFilterValue(selectedDomain);

  return (item.domains || []).some((domain) => {
    const normalizedDomain = normalizeFilterValue(domain);

    return (
      normalizedDomain === selected ||
      normalizedDomain.includes(selected) ||
      selected.includes(normalizedDomain)
    );
  });
}

function resetFilters() {
  filters.value = defaultFilters();
  search.value = '';
}

function handleTopCarouselSelect(item) {
  if (item.carouselAction === 'open-profile') {
    openStudentPortfolio(item);
    return;
  }

  if (item.carouselType === 'student-profile') {
    return;
  }

  openOfferDetail(item);
}

function openProjectDetail(project) {
  const ownerId =
    project.portfolioUserId ||
    project.userId ||
    project.utilisateur_id ||
    project.etudiant_id;

  if (ownerId) {
    router.push({
      name: 'portfolio-experience',
      params: {
        id: ownerId,
        experienceId: project.id,
      },
    });

    return;
  }

  router.push({
    name: 'my-portfolio-experience',
    params: {
      experienceId: project.id,
    },
  });
}

function openOfferDetail(offer) {
  selectedOffer.value = offer;
}

function closeOfferDetail() {
  selectedOffer.value = null;
}

function openApplyOffer(offer) {
  selectedOffer.value = null;
  applyingOffer.value = offer;
}

function closeApplyOffer() {
  applyingOffer.value = null;
}

function handleApplyOfferSubmit(payload) {
  console.log('Offer application payload:', payload);
  closeApplyOffer();
}

function openAddOfferModal() {
  console.log('Open add offer modal');
}

function handleSidebarStudentAction(student) {
  student.isFollowing = !student.isFollowing;
}

function sidebarActionLabel(student) {
  if (isRecruiter.value) return student.isFollowing ? 'Saved' : '';
  return student.isFollowing ? 'Following' : '';
}

function sidebarActionAria(student) {
  if (isRecruiter.value) {
    return student.isFollowing ? `Saved ${student.name}` : `Save ${student.name}`;
  }

  return student.isFollowing ? `Following ${student.name}` : `Follow ${student.name}`;
}

function openStudentPortfolio(student) {
  const portfolioId = student.portfolioUserId || student.userId || student.id;

  if (!portfolioId) return;

  router.push(`/portfolio/${portfolioId}`);
}

function openProjectOwnerPortfolio(project) {
  const portfolioId =
    project.portfolioUserId ||
    project.userId ||
    project.utilisateur_id ||
    project.etudiant_id;

  if (!portfolioId) return;

  router.push(`/portfolio/${portfolioId}`);
}
</script>

<style scoped>
.feed-shell {
  height: 100vh;
  display: flex;
  overflow: hidden;
  background: var(--color-background);
}

.feed-page {
  flex: 1;
  min-width: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--color-background);
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--color-primary-rgb), 0.18) transparent;
}

.feed-page::-webkit-scrollbar {
  width: 6px;
}

.feed-page::-webkit-scrollbar-thumb {
  background: rgba(var(--color-primary-rgb), 0.18);
  border-radius: 999px;
}

.feed-page::-webkit-scrollbar-track {
  background: transparent;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 50;
}

.feed-content {
  width: 100%;
  max-width: calc(250px + 700px + 270px + (var(--space-md) * 2));
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md) 0 var(--space-xl);
}

.offers-row {
  position: relative;
  width: 100%;
  min-width: 0;
  flex-shrink: 0;
  overflow: hidden;
}

.offers-row :deep(*) {
  max-width: none;
}

.offers-row :deep(.offers-section),
.offers-row :deep(.offers-scroll-frame),
.offers-row :deep(.offers-list),
.offers-row :deep(.offers-frame),
.offers-row :deep(.offers-scroller) {
  width: 100%;
  max-width: none;
}

.offers-row--with-action :deep(.offers-section-header) {
  padding-right: 7.25rem;
}

.add-offer-button {
  flex: 0 0 auto;
  min-height: 2.1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border: 1px solid var(--color-primary);
  border-radius: 999px;
  padding: 0 var(--space-md);
  background: var(--color-primary);
  color: var(--color-background);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  cursor: pointer;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.18);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    background-color var(--transition-fast);
}

.add-offer-button:hover {
  transform: translateY(-1px);
  background-color: rgba(var(--color-primary-rgb), 0.92);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.feed-add-offer-button {
  position: absolute;
  top: 0;
  right: 5.8rem;
  z-index: 6;
}

.feed-grid {
  display: grid;
  grid-template-columns: 250px minmax(0, 700px) 270px;
  align-items: start;
  justify-content: center;
  gap: var(--space-md);
  width: 100%;
}

.feed-list {
  width: 100%;
  max-width: 700px;
  display: grid;
  gap: var(--space-md);
}

.feed-list :deep(.project-card) {
  width: 100%;
  max-width: 100%;
  border-color: rgba(var(--color-primary-rgb), 0.11);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.feed-list :deep(.project-card:hover) {
  transform: translateY(-2px);
  border-color: rgba(var(--color-secondary-rgb), 0.2);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.055);
}

.feed-list :deep(.card-title) {
  color: rgba(var(--color-primary-rgb), 0.94);
  font-weight: var(--font-bold);
}

.feed-list :deep(.tag--domain) {
  border-color: rgba(var(--color-secondary-rgb), 0.18);
  background: rgba(var(--color-secondary-rgb), 0.07);
  color: rgba(var(--color-secondary-rgb), 0.92);
}

.feed-list :deep(.tag--tech) {
  border-color: rgba(var(--color-primary-rgb), 0.1);
  background: rgba(var(--color-primary-rgb), 0.035);
  color: rgba(var(--color-primary-rgb), 0.62);
}

.feed-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.sticky-filters {
  width: 270px;
  position: sticky;
  top: 88px;
  align-self: start;
  justify-self: end;
  overflow: visible;
}

.feed-grid :deep(.filters-panel) {
  width: 100%;
}

.suggested-sidebar {
  width: 250px;
}

.sticky-suggestions {
  position: sticky;
  top: 88px;
  align-self: start;
  justify-self: start;
}

.feed-empty {
  min-height: 16rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-xl);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(var(--color-primary-rgb), 0.07);
  background: rgba(var(--color-surface-rgb), 0.72);
  color: rgba(var(--color-primary-rgb), 0.4);
  font-size: var(--font-size-sm);
  text-align: center;
}

.feed-empty p {
  margin: 0;
}

.suggested-students-card {
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(
      180deg,
      rgba(var(--color-surface-rgb), 0.52),
      rgba(var(--color-background-rgb), 0.84)
    );
  overflow: hidden;
}

.suggested-students-header {
  padding: 0.75rem var(--space-md);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.suggested-students-header h2 {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.9);
  font-size: var(--font-size-sm);
  font-weight: var(--font-bold);
}

.suggested-students-header p {
  margin: 0.25rem 0 0;
  color: rgba(var(--color-primary-rgb), 0.48);
  font-size: var(--font-size-xxs);
}

.suggested-students-list {
  display: grid;
  gap: 0.55rem;
  padding: 0.75rem;
}

.suggested-student {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.55rem;
  padding: 0.58rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.075);
  border-radius: var(--radius-md);
  background: rgba(var(--color-background-rgb), 0.28);
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    transform var(--transition-fast);
}

.suggested-student:hover {
  transform: translateY(-1px);
  background: rgba(var(--color-surface-rgb), 0.48);
  border-color: rgba(var(--color-primary-rgb), 0.12);
}

.suggested-avatar {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: rgba(var(--color-secondary-rgb), 0.95);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
}

.suggested-info {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.suggested-name-button {
  width: fit-content;
  max-width: 100%;
  border: 0;
  border-bottom: 1px solid transparent;
  background: transparent;
  padding: 0 0 1px;
  color: rgba(var(--color-primary-rgb), 0.86);
  font: inherit;
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.suggested-name-button:hover {
  border-bottom-color: currentColor;
  color: var(--color-primary);
}

.suggested-name-button:focus-visible {
  outline: none;
  border-bottom-color: currentColor;
}

.suggested-info > span {
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-xxs);
}

.suggested-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 3px;
}

.suggested-stack small {
  display: inline-flex;
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  border-radius: 999px;
  padding: 0.12rem 0.4rem;
  background: rgba(var(--color-primary-rgb), 0.025);
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: 9px;
  font-weight: var(--font-medium);
}

.follow-mini-button {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.28rem;
  width: 1.55rem;
  height: 1.55rem;
  border: 1.3px solid var(--color-primary);
  border-radius: 999px;
  padding: 0;
  background-color: var(--color-primary);
  color: var(--color-background);
  font-size: 9px;
  font-weight: var(--font-bold);
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.24);
  transition:
    width var(--transition-fast),
    background-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.follow-mini-button:hover {
  transform: translateY(-1px);
  background-color: rgba(var(--color-primary-rgb), 0.92);
  box-shadow: 0 5px 9px rgba(0, 0, 0, 0.22);
}

.follow-mini-button.is-following {
  width: auto;
  min-width: 4.7rem;
  height: 1.55rem;
  padding-inline: 0.55rem;
}

.follow-mini-button:focus-visible {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.15);
}

@media (max-width: 1250px) {
  .feed-content {
    max-width: 100%;
    padding-inline: var(--space-md);
  }

  .feed-grid {
    grid-template-columns: minmax(0, 700px) 270px;
  }

  .suggested-sidebar {
    display: none;
  }

  .sticky-filters {
    width: 270px;
  }
}

@media (max-width: 900px) {
  .feed-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .sticky-filters {
    display: none;
  }

  .feed-list {
    max-width: 100%;
  }
}

@media (max-width: 640px) {
  .feed-add-offer-button {
    position: static;
    margin-top: var(--space-sm);
  }

  .offers-row--with-action :deep(.offers-section-header) {
    padding-right: 0;
  }
}

/* === Scholar Highlight Style === */

.feed-list :deep(.project-card) {
  position: relative !important;
  border: 1px solid rgba(var(--color-primary-rgb), 0.13) !important;
  background:
    linear-gradient(
      135deg,
      rgba(var(--color-secondary-rgb), 0.09),
      rgba(var(--color-surface-rgb), 0.64) 36%,
      rgba(var(--color-background-rgb), 0.94) 100%
    ) !important;
  box-shadow:
    0 12px 34px rgba(0, 0, 0, 0.065),
    inset 0 1px 0 rgba(255, 255, 255, 0.58) !important;
  overflow: hidden !important;
  transition:
    transform var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast) !important;
}

.feed-list :deep(.project-card)::before {
  content: '';
  position: absolute;
  top: -3rem;
  right: -3rem;
  width: 9rem;
  height: 9rem;
  border-radius: 50%;
  background: rgba(var(--color-secondary-rgb), 0.1);
  pointer-events: none;
}

.feed-list :deep(.project-card:hover) {
  transform: translateY(-3px) !important;
  border-color: rgba(var(--color-secondary-rgb), 0.3) !important;
  box-shadow:
    0 22px 48px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.7) !important;
}

.feed-list :deep(.card-title) {
  color: var(--color-primary) !important;
  font-weight: var(--font-bold) !important;
  letter-spacing: -0.025em;
}

.feed-list :deep(.card-description) {
  color: rgba(var(--color-primary-rgb), 0.68) !important;
}

.feed-list :deep(.tag--domain) {
  border-color: rgba(var(--color-secondary-rgb), 0.3) !important;
  background: rgba(var(--color-secondary-rgb), 0.12) !important;
  color: rgba(var(--color-secondary-rgb), 0.98) !important;
}

.feed-list :deep(.tag--tech) {
  border-color: rgba(var(--color-primary-rgb), 0.12) !important;
  background: rgba(var(--color-background-rgb), 0.58) !important;
  color: rgba(var(--color-primary-rgb), 0.62) !important;
}

.feed-list :deep(.credibility-pill) {
  border-color: rgba(var(--color-secondary-rgb), 0.24) !important;
  background: rgba(var(--color-secondary-rgb), 0.09) !important;
  color: rgba(var(--color-secondary-rgb), 0.94) !important;
}

.suggested-students-card {
  border-color: rgba(var(--color-primary-rgb), 0.11) !important;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.04) !important;
}

.suggested-student {
  background: rgba(var(--color-background-rgb), 0.4) !important;
  border-color: rgba(var(--color-primary-rgb), 0.08) !important;
}

.suggested-student:hover {
  transform: translateY(-1px) !important;
  background: rgba(var(--color-surface-rgb), 0.68) !important;
  border-color: rgba(var(--color-secondary-rgb), 0.18) !important;
}

.suggested-avatar {
  background: rgba(var(--color-secondary-rgb), 0.13) !important;
  color: rgba(var(--color-secondary-rgb), 0.98) !important;
  border: 1px solid rgba(var(--color-secondary-rgb), 0.2) !important;
}

/* === Offers / Top students carousel style === */

.offers-row :deep(.recommendation-card) {
  background:
    linear-gradient(
      180deg,
      rgba(244, 249, 241, 0.96),
      rgba(var(--color-background-rgb), 0.95)
    ) !important;
  border-color: rgba(91, 128, 89, 0.18) !important;
  box-shadow:
    0 10px 24px rgba(91, 128, 89, 0.055),
    0 8px 20px rgba(0, 0, 0, 0.035) !important;
}

.offers-row :deep(.recommendation-card:hover) {
  border-color: rgba(91, 128, 89, 0.32) !important;
  box-shadow:
    0 14px 30px rgba(91, 128, 89, 0.095),
    0 10px 24px rgba(0, 0, 0, 0.045) !important;
}

.offers-row :deep(.recommendation-card)::before {
  background:
    linear-gradient(
      180deg,
      rgba(91, 128, 89, 0.62),
      rgba(var(--color-secondary-rgb), 0.32)
    ) !important;
}

.offers-row :deep(.offers-section),
.offers-row :deep(.offers-header),
.offers-row :deep(.offers-section-header),
.offers-row :deep(.offers-frame),
.offers-row :deep(.offers-scroller),
.offers-row :deep(.offers-list) {
  padding-inline: 0 !important;
  margin-inline: 0 !important;
}
</style>