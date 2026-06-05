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

      <div class="feed-grid">
        <section class="feed-list">
          <!-- Offers carousel -->
          <FeedOffersCarousel
            :offers="mockOffers"
            @select-offer="selectedOffer = $event"
          />

          <!-- Projects feed -->
          <template v-if="filteredProjects.length">
            <FeedProjectCard
              v-for="project in filteredProjects"
              :key="project.id"
              :project="project"
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

        <FeedFiltersPanel
          class="sticky-filters"
          :filters="filters"
          :technologies="allTechnologies"
          :domains="allDomains"
          :trending-techs="trendingTechs"
          :suggested-students="suggestedStudents"
          @update:filters="filters = $event"
          @reset="resetFilters"
        />
      </div>
    </main>

    <ShareProjectModal
      :project="shareProject"
      @close="shareProject = null"
    />

    <FeedOfferDetailModal
      :offer="selectedOffer"
      @close="selectedOffer = null"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { SearchX } from 'lucide-vue-next';
import Sidebar from '@/components/layout/AppSidebar.vue';
import FeedHeader from '@/components/feed/feedHeader.vue';
import FeedFiltersPanel from '@/components/feed/FeedFiltersPanel.vue';
import FeedProjectCard from '@/components/feed/feedProject.vue';
import ShareProjectModal from '@/components/feed/ShareProjectModal.vue';
import FeedOffersCarousel from '@/components/feed/FeedOffersCarousel.vue';
import FeedOfferDetailModal from '@/components/feed/FeedOfferDetailModal.vue';

// ─── Mock user ────────────────────────────────────────────────────────────────
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
  { id: 1, initials: 'SI', name: 'Sara Idrissi', speciality: 'Dev Web', stack: ['Vue', 'Node'] },
  { id: 2, initials: 'YK', name: 'Yassine Karim', speciality: 'IA & Data', stack: ['Python', 'FastAPI'] },
  { id: 3, initials: 'AB', name: 'Amal Benali', speciality: 'DevOps', stack: ['Docker', 'CI/CD'] },
];

// ─── Page state ───────────────────────────────────────────────────────────────
const search = ref('');
const shareProject = ref(null);

const defaultFilters = () => ({
  certifiedOnly: false,
  source: 'all',
  sort: 'trending',
  technology: null,
  domain: null,
});
const selectedOffer = ref(null);
const filters = ref(defaultFilters());

function resetFilters() {
  filters.value = defaultFilters();
}

function handleCreateProject() {
  console.log('Create project clicked');
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const mockProjects = [
  {
    id: 1,
    campusRankScore: 94,
    credibilityScore: 4.8,
    title: 'SmartStudyRoom Platform',
    description: 'Une plateforme collaborative qui utilise l\'IA pour optimiser les espaces d\'étude partagés. Les étudiants peuvent réserver des salles, former des groupes d\'étude et recevoir des recommandations de ressources personnalisées en fonction de leur cours et de leurs objectifs.',
    date: '2025-05-18',
    imagePreview: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80',
    shareUrl: null,
    studentName: 'Amine Kettani',
    schoolName: 'ENSA Casablanca',
    feedReason: 'Même école',
    isVerified: true,
    recommendationsCount: 128,
    commentsCount: 34,
    githubReposCount: 3,
    technologies: ['Vue 3', 'FastAPI', 'PostgreSQL'],
    domains: ['EdTech', 'IA'],
  },
  {
    id: 2,
    campusRankScore: 88,
    credibilityScore: 4.5,
    title: 'AI Portfolio Recommendation System',
    description: 'Un système intelligent qui analyse les projets académiques des étudiants et propose des recommandations de compétences à acquérir, ainsi que des profils d\'entreprises susceptibles d\'être intéressées par leur profil. Utilise des embeddings NLP pour comparer les portfolios.',
    date: '2025-06-02',
    imagePreview: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    shareUrl: null,
    studentName: 'Sara Idrissi',
    schoolName: 'ENSIAS Rabat',
    feedReason: 'Abonnement',
    isVerified: true,
    recommendationsCount: 97,
    commentsCount: 21,
    githubReposCount: 2,
    technologies: ['Python', 'LangChain', 'React'],
    domains: ['IA', 'Carrière'],
  },
  {
    id: 3,
    campusRankScore: 72,
    credibilityScore: 3.9,
    title: 'Campus Event Aggregator',
    description: 'Application mobile et web qui centralise tous les événements du campus — workshops, hackathons, séminaires — et envoie des notifications personnalisées aux étudiants selon leurs centres d\'intérêt et leur parcours académique.',
    date: '2025-04-30',
    imagePreview: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    shareUrl: null,
    studentName: 'Youssef Benmoussa',
    schoolName: 'ENSA Casablanca',
    feedReason: 'Même école',
    isVerified: false,
    recommendationsCount: 54,
    commentsCount: 12,
    githubReposCount: 1,
    technologies: ['Flutter', 'Node.js', 'Firebase'],
    domains: ['Mobile', 'Événements'],
  },
];
const mockOffers = [
  {
    id: 1,
    type: 'Internship',
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
    type: 'Job',
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
    type: 'Internship',
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
    type: 'Internship',
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
// ─── Derived filter options ───────────────────────────────────────────────────
const allTechnologies = computed(() => {
  const set = new Set();
  mockProjects.forEach((p) => p.technologies.forEach((t) => set.add(t)));
  return [...set];
});

const allDomains = computed(() => {
  const set = new Set();
  mockProjects.forEach((p) => p.domains.forEach((d) => set.add(d)));
  return [...set];
});

// ─── Filtered + sorted projects ───────────────────────────────────────────────
const filteredProjects = computed(() => {
  const kw = search.value.trim().toLowerCase();
  const f = filters.value;

  let result = mockProjects.filter((p) => {
    // Keyword search
    if (kw) {
      const hay = [
        p.title, p.description, p.studentName, p.schoolName,
        ...(p.technologies || []), ...(p.domains || [])
      ].join(' ').toLowerCase();
      if (!hay.includes(kw)) return false;
    }
    // Certified only
    if (f.certifiedOnly && !p.isVerified) return false;
    // Source
    if (f.source === 'same-school' && p.feedReason !== 'Même école') return false;
    if (f.source === 'following' && p.feedReason !== 'Abonnement') return false;
    // Technology
    if (f.technology && !p.technologies.includes(f.technology)) return false;
    // Domain
    if (f.domain && !p.domains.includes(f.domain)) return false;

    return true;
  });

  // Sort
  if (f.sort === 'trending') {
    result = [...result].sort((a, b) => b.campusRankScore - a.campusRankScore);
  } else if (f.sort === 'recent') {
    result = [...result].sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (f.sort === 'top-month') {
    result = [...result].sort((a, b) => b.recommendationsCount - a.recommendationsCount);
  }

  return result;
});
</script>

<style scoped>
.feed-shell {
  height: 100vh;
  display: flex;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    rgba(var(--color-primary-rgb), 0.045),
    rgba(var(--color-primary-rgb), 0.07)
  );
}

/* Le scroll s'effectue maintenant sur TOUTE la page centrale */
.feed-page {
  flex: 1;
  min-width: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto; 
  overflow-x: hidden;
  background-color: rgba(var(--color-primary-rgb), 0.018);
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--color-primary-rgb), 0.18) transparent;
}

/* Scrollbar custom pour la zone centrale */
.feed-page::-webkit-scrollbar { width: 6px; }
.feed-page::-webkit-scrollbar-thumb { background: rgba(var(--color-primary-rgb), 0.18); border-radius: 999px; }
.feed-page::-webkit-scrollbar-track { background: transparent; }

/* Le Header reste fixé en haut de l'écran pendant le scroll */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 50;
}

.feed-grid {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 660px) 300px;
  justify-content: center;
  align-items: start; /* Permet aux colonnes de ne pas s'étirer et rend le sticky possible */
  gap: calc(var(--space-xl) * 1.15);
  padding: var(--space-md) var(--space-xl) var(--space-xl);
}

/* La liste des projets grandit naturellement selon son contenu */
.feed-list {
  width: 100%;
  max-width: 660px;
  justify-self: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.feed-list :deep(.project-card) {
  width: 100%;
  max-width: 660px;
  margin-inline: auto;
}

/* Les filtres restent visibles (fixés) pendant la lecture des projets */
.feed-grid :deep(.filters-panel),
.sticky-filters {
  width: 300px;
  position: sticky;
  top: 90px; /* Ajuste cette valeur si ton header est plus ou moins haut */
  max-height: calc(100vh - 110px);
  align-self: start;
  justify-self: end;
  overflow-y: auto;
  scrollbar-width: thin;
}

/* Empty state */
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

/* Tablet */
@media (max-width: 1050px) {
  .feed-grid {
    grid-template-columns: minmax(0, 660px);
    justify-content: center;
    padding-inline: var(--space-md);
  }

  .feed-grid :deep(.filters-panel),
  .sticky-filters {
    display: none;
  }

  .feed-list, .feed-list :deep(.project-card) {
    max-width: 660px;
  }
}

/* Mobile */
@media (max-width: 760px) {
  .feed-shell {
    height: 100vh;
    display: flex;
    overflow: hidden;
  }

  .feed-page {
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .feed-grid {
    grid-template-columns: 1fr;
    padding: var(--space-sm);
    gap: var(--space-sm);
  }

  .feed-list, .feed-list :deep(.project-card) {
    max-width: 100%;
  }
}
</style>