<template>
  <div class="feed-shell">
    <Sidebar :user="mockUser" />

    <main class="feed-page">
      <FeedHeader
        class="sticky-header"
        :userName="mockUser.prenom"
        :search="search"
        @update:search="search = $event"
        @create-project="handleCreateProject"
      />

      <div class="feed-content">
        <section class="offers-row">
          <FeedOffersCarousel
            :offers="mockOffers"
            @select-offer="openOfferDetail"
          />
        </section>

        <div class="feed-grid">
          <section class="feed-list">
            <template v-if="filteredProjects.length">
              <FeedProjectCard
                v-for="project in filteredProjects"
                :key="project.id"
                :project="project"
                @click="openProjectDetail(project)"
                @share="shareProject = $event"
              />
            </template>

            <div
              v-else
              class="feed-empty"
            >
              <SearchX :size="32" />
              <p>Aucun projet ne correspond à vos filtres.</p>
            </div>
          </section>

          <aside class="feed-sidebar sticky-filters">
            <FeedFiltersPanel
              :filters="filters"
              :technologies="allTechnologies"
              :domains="allDomains"
              :trending-techs="trendingTechs"
              :suggested-students="[]"
              @update:filters="filters = $event"
              @reset="resetFilters"
            />

            <section class="suggested-students-card">
              <header class="suggested-students-header">
                <h2>Suggested students</h2>
                <p>Profiles you may want to follow.</p>
              </header>

              <div class="suggested-students-list">
                <article
                  v-for="student in suggestedStudents"
                  :key="student.id"
                  class="suggested-student"
                >
                  <div class="suggested-avatar">
                    {{ student.initials }}
                  </div>

                  <div class="suggested-info">
                    <strong>{{ student.name }}</strong>
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
                  >
                    Follow
                  </button>
                </article>
              </div>
            </section>
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
    />
    <ExperienceModal
  :open="projectModal.open"
  mode="create"
  type="project"
  :initial-value="null"
  :loading="false"
  :school-options="[]"
  :professor-emails="professorEmails"
  @close="closeProjectModal"
  @submit="handleProjectSubmit"
/>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { SearchX } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import ExperienceModal from '@/components/portfolio/shared/ExperienceModal.vue';
import Sidebar from '@/components/layout/AppSidebar.vue';
import FeedHeader from '@/components/feed/feedHeader.vue';
import FeedFiltersPanel from '@/components/feed/FeedFiltersPanel.vue';
import FeedProjectCard from '@/components/feed/feedProject.vue';
import ShareProjectModal from '@/components/feed/ShareProjectModal.vue';
import FeedOffersCarousel from '@/components/feed/FeedOffersCarousel.vue';
import FeedOfferDetailModal from '@/components/feed/FeedOfferDetailModal.vue';

const router = useRouter();

const mockUser = {
  prenom: 'Wissam',
  nom: 'Bakkali',
};

const trendingTechs = [
  { name: 'Vue 3', projectsCount: 18 },
  { name: 'FastAPI', projectsCount: 14 },
  { name: 'PostgreSQL', projectsCount: 11 },
  { name: 'Docker', projectsCount: 9 },
];

const suggestedStudents = [
  {
    id: 1,
    initials: 'SI',
    name: 'Sara Idrissi',
    speciality: 'Dev Web',
    stack: ['Vue', 'Node'],
  },
  {
    id: 2,
    initials: 'YK',
    name: 'Yassine Karim',
    speciality: 'IA & Data',
    stack: ['Python', 'FastAPI'],
  },
  {
    id: 3,
    initials: 'AB',
    name: 'Amal Benali',
    speciality: 'DevOps',
    stack: ['Docker', 'CI/CD'],
  },
];

const search = ref('');
const shareProject = ref(null);
const selectedOffer = ref(null);
const professorEmails = [
  'ahmed.elamrani@ensat.ac.ma',
  'fatima.zahra@ensat.ac.ma',
  'youssef.bennani@uae.ac.ma',
  'sara.lahlou@fstt.ac.ma',
  'nour.chaoui@encgt.ac.ma',
  'karim.boukhari@ensate.uae.ac.ma',
  'amina.tazi@fs-tanger.ac.ma',
  'mehdi.elidrissi@ensah.ma',
  'salma.aitali@fstt.ac.ma',
  'omar.benali@uae.ac.ma',
];

const projectModal = ref({
  open: false,
});

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

const defaultFilters = () => ({
  certifiedOnly: false,
  source: 'all',
  sort: 'trending',
  technology: null,
  domain: null,
});

const filters = ref(defaultFilters());

function resetFilters() {
  filters.value = defaultFilters();
}

function handleCreateProject() {
  projectModal.value.open = true;
}

function closeProjectModal() {
  projectModal.value.open = false;
}

function handleProjectSubmit(project) {
  console.log('Project submitted:', project);
  closeProjectModal();
}

const mockProjects = [
  {
    id: 'cmq2w34ze000dug4a8r9byuqb',
    portfolioUserId: 1,
    campusRankScore: 94,
    credibilityScore: 4.8,
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
    domains: ['EdTech', 'IA'],
  },
  {
    id: 2,
    portfolioUserId: 2,
    campusRankScore: 88,
    credibilityScore: 4.5,
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
    domains: ['IA', 'Carrière'],
  },
  {
    id: 3,
    portfolioUserId: 3,
    campusRankScore: 72,
    credibilityScore: 3.9,
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
    domains: ['Mobile', 'Événements'],
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

const allTechnologies = computed(() => {
  const set = new Set();

  mockProjects.forEach((project) => {
    project.technologies.forEach((technology) => set.add(technology));
  });

  return [...set];
});

const allDomains = computed(() => {
  const set = new Set();

  mockProjects.forEach((project) => {
    project.domains.forEach((domain) => set.add(domain));
  });

  return [...set];
});

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
        ...(project.technologies || []),
        ...(project.domains || []),
      ]
        .join(' ')
        .toLowerCase();

      if (!searchableText.includes(keyword)) return false;
    }

    if (currentFilters.certifiedOnly && !project.isVerified) return false;

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

    if (
      currentFilters.technology &&
      !project.technologies.includes(currentFilters.technology)
    ) {
      return false;
    }

    if (
      currentFilters.domain &&
      !project.domains.includes(currentFilters.domain)
    ) {
      return false;
    }

    return true;
  });

  if (currentFilters.sort === 'trending') {
    result = [...result].sort(
      (a, b) => b.campusRankScore - a.campusRankScore
    );
  } else if (currentFilters.sort === 'recent') {
    result = [...result].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  } else if (currentFilters.sort === 'top-month') {
    result = [...result].sort(
      (a, b) => b.recommendationsCount - a.recommendationsCount
    );
  }

  return result;
});
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
  max-width: 1220px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-xl) var(--space-xl);
}

.offers-row {
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

.feed-grid {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 680px) 320px;
  justify-content: center;
  align-items: start;
  gap: var(--space-xl);
}

.feed-list {
  width: 100%;
  max-width: 680px;
  justify-self: stretch;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  min-width: 0;
}

.feed-list :deep(.project-card) {
  width: 100%;
  max-width: 680px;
  margin-inline: auto;
}

.sticky-filters {
  width: 320px;
  position: sticky;
  top: 90px;
  align-self: start;
  justify-self: end;
  max-height: calc(100vh - 110px);
  overflow-y: auto;
  scrollbar-width: thin;
  padding-bottom: var(--space-md);
}

.feed-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.feed-grid :deep(.filters-panel) {
  width: 100%;
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
  padding: 1rem var(--space-lg);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.suggested-students-header h2 {
  margin: 0;
  color: var(--color-primary);
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
  gap: var(--space-sm);
  padding: var(--space-md);
}

.suggested-student {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  background: rgba(var(--color-background-rgb), 0.36);
}

.suggested-avatar {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(var(--color-secondary-rgb), 0.12);
  color: rgba(var(--color-secondary-rgb), 0.96);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
}

.suggested-info {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.suggested-info strong {
  color: rgba(var(--color-primary-rgb), 0.88);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggested-info > span {
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-xxs);
}

.suggested-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}

.suggested-stack small {
  display: inline-flex;
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  border-radius: 999px;
  padding: 0.14rem 0.4rem;
  color: rgba(var(--color-primary-rgb), 0.58);
  font-size: 9px;
  font-weight: var(--font-medium);
}

.follow-mini-button {
  border: 1px solid rgba(var(--color-secondary-rgb), 0.22);
  border-radius: 999px;
  padding: 0.26rem 0.55rem;
  background: rgba(var(--color-secondary-rgb), 0.08);
  color: rgba(var(--color-secondary-rgb), 0.96);
  font-size: 10px;
  font-weight: var(--font-bold);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    transform var(--transition-fast);
}

.follow-mini-button:hover {
  transform: translateY(-1px);
  background: rgba(var(--color-secondary-rgb), 0.14);
}

@media (max-width: 1050px) {
  .feed-content {
    max-width: 720px;
    padding-inline: var(--space-md);
  }

  .feed-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .sticky-filters {
    display: none;
  }

  .feed-list,
  .feed-list :deep(.project-card) {
    max-width: 100%;
  }
}

@media (max-width: 1050px) {
  .feed-content {
    max-width: 100%;
    padding-inline: var(--space-md);
  }

  .feed-grid {
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: var(--space-md);
  }

  .sticky-filters {
    display: flex;
    width: 300px;
  }

  .feed-list,
  .feed-list :deep(.project-card) {
    max-width: 100%;
  }
}
</style>