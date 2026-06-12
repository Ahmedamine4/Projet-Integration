<template>
  <div class="feed-shell">
    <Sidebar :user="sidebarUser" />

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
  <div
    v-if="isLoadingFeed"
    class="feed-empty"
  >
    <p>Chargement du feed...</p>
  </div>

  <div
    v-else-if="feedError"
    class="feed-empty"
  >
    <SearchX :size="32" />
    <p>{{ feedError }}</p>
  </div>

  <template v-else-if="feedItems.length">
    <FeedProjectCard
      v-for="project in feedItems"
      :key="project.feedKey || project.id"
      :project="project"
      @click="openProjectDetail(project)"
      @share="shareProject = $event"
      @open-student="openProjectOwnerPortfolio"
    />

    <!--<div
      v-if="feedExperienceStore.hasMore && !feedExperienceStore.loadingMore"
      ref="loadMoreTrigger"
      class="load-more-trigger"
    ></div>

    <div
      v-if="feedExperienceStore.loadingMore"
      class="feed-loading-more"
    >
      Chargement du feed...
    </div>-->
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { Check, Plus, SearchX } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Sidebar from '@/components/layout/AppSidebar.vue';
import FeedHeader from '@/components/feed/feedHeader.vue';
import FeedFiltersPanel from '@/components/feed/FeedFiltersPanel.vue';
import FeedProjectCard from '@/components/feed/feedProject.vue';
import ShareProjectModal from '@/components/feed/ShareProjectModal.vue';
import FeedOffersCarousel from '@/components/feed/FeedOffersCarousel.vue';
import FeedOfferDetailModal from '@/components/feed/FeedOfferDetailModal.vue';
import ApplyOfferModal from '@/components/feed/ApplyOfferModal.vue';
import { useFeedStore } from '@/stores/feed';

const feedStore = useFeedStore();

onMounted(() => {
  feedStore.fetchInitialFeed();
});
const router = useRouter();
const authStore = useAuthStore();


const sidebarUser = computed(() => {
  const user = authStore.user || {};

  return {
    ...user,
    prenom: user.prenom || user.firstName || '',
    nom: user.nom || user.lastName || '',
    role: String(user.role || 'etudiant').toLowerCase(),
  };
});

const currentRole = computed(() => sidebarUser.value.role || 'etudiant');
const isRecruiter = computed(() => currentRole.value === 'professionnel');
const isProfessor = computed(() => currentRole.value === 'professeur');
const feedItems = computed(() => {
  const query = search.value.trim().toLowerCase();
  const items = feedStore.experiences.map((experience) => ({
    feedKey: experience.experience_id || experience.id,
    id: experience.experience_id || experience.id,

    title: experience.titre || experience.title || '',
    description: experience.description || '',
    image: experience.photo || experience.image || '',
    imagePreview: experience.photo || experience.imagePreview || experience.image || '',

    type: experience.type,
    specificType: experience.type_specifique || experience.specificType,
    date: experience.date || experience.date_experience,

    studentName:
      experience.studentName ||
      `${experience.auteur?.prenom || ''} ${experience.auteur?.nom || ''}`.trim(),
    schoolName: experience.schoolName || experience.auteur?.institution || '',
    portfolioUserId:
      experience.portfolioUserId ||
      experience.auteur?.utilisateur_id ||
      experience.utilisateur_id,

    technologies: experience.technologies || [],
    domains: experience.domaines || experience.domains || [],

    likes: experience.stats?.likes || experience.likes || 0,
    comments: experience.stats?.commentaires || experience.comments || 0,

    score: experience.score || 0,
    credibilityScore: experience.portfolio_score ?? experience.credibilityScore ?? experience.score ?? 0,
    isFollowingAuthor: experience.is_following_auteur || false,

    raw: experience,
  }));

  if (!query) return items;

  return items.filter((project) => {
    return [
      project.title,
      project.description,
      project.studentName,
      project.schoolName,
      ...(project.technologies || []),
      ...(project.domains || []),
    ].some((value) => String(value || '').toLowerCase().includes(query));
  });
});

const offers = computed(() => {
  return (feedStore.offres || []).map((offer) => {
    const company =
      offer.entreprise ||
      offer.company ||
      offer.utilisateur?.professionnel?.entreprise ||
      [offer.utilisateur?.prenom, offer.utilisateur?.nom].filter(Boolean).join(' ');

    return {
      ...offer,
      id: offer.offre_id || offer.id,
      title: offer.title || offer.titre || offer.type || 'Offer',
      company: company || '',
      location: offer.localisation || offer.location || '',
      duration: offer.duration || offer.duree || '',
      level: offer.level || offer.niveau || offer.type || '',
      technologies: offer.technologies || [],
      description: offer.description || '',
    };
  });
});

const suggestedStudents = computed(() => {
  return feedStore.utilisateursSuggeres.map((user) => {
    const fullName = `${user.prenom || ''} ${user.nom || ''}`.trim();

    return {
      id: user.utilisateur_id,
      userId: user.utilisateur_id,
      portfolioUserId: user.utilisateur_id,

      name: fullName,
      initials: `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() || 'U',

      speciality: user.sous_titre || user.role || '',
      schoolName: user.sous_titre || '',
      role: user.role,

      photo: user.photo,
      stack: [],
      technologies: [],
      domains: [],

      isFollowing: false,
      portfolioScore: 0,
      rankScore: 0,

      raw: user,
    };
  });
});

const studentsFromSchool = computed(() => suggestedStudents.value);

const isLoadingFeed = computed(() => feedStore.loading);
const feedError = computed(() => feedStore.error);
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
    sidebarTitle: 'Students from your school',
    sidebarSubtitle: 'Profiles you may want to follow.',
    emptyMessage: 'Aucun élément ne correspond à vos filtres.',
    showAddOfferButton: false,
  },
};

const feedConfig = computed(() => {
  return feedConfigByRole[currentRole.value] || feedConfigByRole.etudiant;
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

const topStudents = computed(() => {
  return [...suggestedStudents.value].sort((a, b) => {
    return (b.rankScore || b.portfolioScore || 0) - (a.rankScore || a.portfolioScore || 0);
  });
});

const sidebarStudents = computed(() => {
  if (isRecruiter.value) return topStudents.value;
  if (isProfessor.value) return studentsFromSchool.value;

  return suggestedStudents.value;
});

let filtersTimer = null;


function buildExperienceParams() {
  return {
    source: filters.value.source !== 'all' ? filters.value.source : undefined,
    sort: filters.value.sort || 'trending',
    technology: filters.value.technology || undefined,
    domain: filters.value.domain || undefined,
  };
}

async function fetchFeedExperiences() {
  await feedStore.fetchFeedExperiences(buildExperienceParams());
}
watch(
  filters,
  () => {
    if (filtersTimer) {
      clearTimeout(filtersTimer);
    }

    filtersTimer = setTimeout(() => {
      fetchFeedExperiences();
    }, 350);
  },
  { deep: true }
);

onUnmounted(() => {
  if (filtersTimer) {
    clearTimeout(filtersTimer);
  }
});
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

  return offers.value.map((offer) => ({
  ...offer,
  carouselType: 'offer',
}));
});

const allTechnologies = computed(() => {
  return feedStore.technologies
    .map((technology) => {
      if (typeof technology === 'string') return technology;
      return technology.nom || technology.name || technology.label || '';
    })
    .filter(Boolean);
});

const allDomains = computed(() => {
  return feedStore.domaines
    .map((domain) => {
      if (typeof domain === 'string') return domain;
      return domain.nom || domain.name || domain.label || '';
    })
    .filter(Boolean);
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

function resetFilters() {
  filters.value = defaultFilters();
  search.value = '';
  feedStore.resetFilters();
}

function handleTopCarouselSelect(item) {
  if (item.carouselAction === 'open-profile') {
    openStudentPortfolio(item);
    return;
  }

  if (item.carouselType === 'student-profile') {
    openStudentPortfolio(item);
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

  if (ownerId && router.hasRoute?.('feed-project-detail')) {
    router.push({
      name: 'feed-project-detail',
      params: {
        id: ownerId,
        experienceId: project.id,
      },
    });

    return;
  }

  if (ownerId) {
    router.push(`/portfolio/${ownerId}`);
  }
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

async function handleApplyOfferSubmit(payload) {
  if (!applyingOffer.value?.id) return;

  console.log('Apply offer payload:', {
    offer: applyingOffer.value,
    payload,
  });

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

.load-more-trigger {
  width: 100%;
  min-height: 2rem;
}

.feed-loading-more {
  justify-self: center;
  color: rgba(var(--color-primary-rgb), 0.48);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
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
