<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AboutMe from '@/components/portfolio/profile/AboutMe.vue';
import PortfolioEducation from '@/components/portfolio/profile/PortfolioEducation.vue';
import PortfolioSkills from '@/components/portfolio/profile/PortfolioSkills.vue';
import ProjectsSection from '@/components/portfolio/projects/ProjectsSection.vue';
import { Camera, QrCode, UserRound } from 'lucide-vue-next';
import QRcodeModal from '@/components/portfolio/contact/QRcodeModal.vue';
import ExperienceModal from '@/components/portfolio/shared/ExperienceModal.vue';
import FollowButton from '@/components/common/actions/FollowButton.vue';
import { useProjectStore } from '@/stores/project';
import { useActivityStore } from '@/stores/activity';
import { useCertificationStore } from '@/stores/certification';
import { useInternshipStore } from '@/stores/internship';
import { usePortfolioStore } from '@/stores/portfolio';
import { useInstitutionStore } from '@/stores/institution';
import api from '@/services/api';
import BaseNotification from '@/components/common/feedback/BaseNotification.vue';
import ConfirmDialog from '@/components/common/feedback/ConfirmDialog.vue';
import { useRoute, useRouter } from 'vue-router';
import ActivitiesSection from '@/components/portfolio/activities/ActivitiesSection.vue';
import CertificationsSection from '@/components/portfolio/certifications/CertificationsSection.vue';
import PortfolioContact from '@/components/portfolio/contact/PortfolioContact.vue';
import InternshipsSection from '@/components/portfolio/internships/InternshipsSection.vue';
import RecommendationsSection from '@/components/portfolio/recommendations/RecommendationsSection.vue';
import PortfolioRecommendationModal from '@/components/portfolio/recommendations/PortfolioRecommendationModal.vue';
import { placeholderRecommendations } from '@/tmp/portfolioRecommendations';
import AiOrb from '@/components/portfolio/shared/AiOrb.vue';
import SchoolPathModal from '@/components/getting-started/SchoolPathModal.vue';
import ImageCropperModal from '@/components/common/forms/ImageCropperModal.vue';

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
  'omar.benali@uae.ac.ma'
];

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const portfolioStore = usePortfolioStore();
const institutionStore = useInstitutionStore();
const projectStore = useProjectStore();
const activityStore = useActivityStore();
const certificationStore = useCertificationStore();
const internshipStore = useInternshipStore();

const projects = ref([]);
const activities = ref([]);
const certifications = ref([]);
const internships = ref([]);

const userId = computed(() => authStore.user?.utilisateur_id);

const portfolio = computed(() => portfolioStore.portfolio);
const isResolvingPortfolio = ref(false);
const isAuthResolving = computed(() => authStore.profileLoading || !authStore.profileChecked);
const isPortfolioLoading = computed(() =>
  isAuthResolving.value ||
  isResolvingPortfolio.value ||
  portfolioStore.loading
);
const portfolioUserId = computed(() =>
  route.params.id ||
  portfolio.value?.id ||
  userId.value ||
  null
);

const isOwnPortfolio = computed(() => {
  if (!portfolioUserId.value || !userId.value) return false;

  return String(portfolioUserId.value) === String(userId.value);
});

const profile = computed(() => portfolio.value?.user ?? authStore.user ?? {});
const profileName = computed(() => {
  const firstName = profile.value?.firstName ?? '';
  const lastName = profile.value?.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || 'Name not provided';
});
const recommenderName = computed(() => {
  const user = authStore.user ?? {};
  const firstName = user.firstName ?? user.prenom ?? '';
  const lastName = user.lastName ?? user.nom ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || user.email || 'You';
});
const recommenderRole = computed(() => {
  const role = authStore.user?.role;
  const labels = {
    etudiant: 'Student',
    professeur: 'Professor',
    professionnel: 'Professional',
    administrateur: 'Administrator',
    directeur: 'Director',
  };

  return labels[role] ?? 'Portfolio recommendation';
});
const profileHeadline = computed(() => {
  const headline = portfolio.value?.headline;
  const school = portfolio.value?.school;

  if (!school) return '';
  if (headline && school) return `${headline} at ${school}`;

  return `Student at ${school}`;
});
const profilePhoto = computed(() => profile.value?.photo || '');
const localProfilePhoto = ref('');
const profilePhotoInput = ref(null);
const selectedProfilePhotoFile = ref(null);
const displayedProfilePhoto = computed(() => localProfilePhoto.value || profilePhoto.value);
const portfolioScore = computed(() => portfolio.value?.portfolio?.score_credibilite ?? 0);
const loadedFollowersCount = ref(null);
const followersCount = computed(() => loadedFollowersCount.value ?? 0);
const isFollowing = ref(false);
const isFollowLoading = ref(false);
const localRecommendations = ref([]);
const displayRecommendations = computed(() => {
  const recommendations = [
    ...localRecommendations.value,
    ...(portfolio.value?.recommendations ?? []),
  ].filter((recommendation) => {
    return !recommendation.status || recommendation.status === 'valide';
  });

  return recommendations.length ? recommendations : placeholderRecommendations;
});
const recommendationsCount = computed(() => displayRecommendations.value.length);
const educationItems = computed(() => portfolio.value?.education ?? []);
const skillItems = computed(() => portfolio.value?.skills ?? []);
const domainItems = computed(() => portfolio.value?.domains ?? []);
const hasEducation = computed(() => educationItems.value.length > 0);
const hasSkills = computed(() => skillItems.value.length > 0 || domainItems.value.length > 0);
const shouldShowEducation = computed(() => isOwnPortfolio.value || hasEducation.value);
const shouldShowSkills = computed(() => isOwnPortfolio.value || hasSkills.value);
const hasProfileDetails = computed(() => shouldShowEducation.value || shouldShowSkills.value);
const schoolOptions = computed(() =>
  institutionStore.institutions.map((institution) => institution.nom).filter(Boolean)
);

onMounted(() => {
  institutionStore.fetchInstitutions();
});

watch(
  portfolio,
  (value) => {
    projects.value = value?.projects ?? [];
    activities.value = value?.activities ?? [];
    certifications.value = value?.certifications ?? [];
    internships.value = value?.internships ?? [];
  },
  { immediate: true }
);

watch(
  portfolioUserId,
  async (id) => {
    if (!id) return;

    isResolvingPortfolio.value = true;

    try {
      clearNotification();
      await portfolioStore.fetchPortfolio(id);
    } catch (error) {
      showNotification('error', portfolioStore.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch portfolio');

      if (error.response?.status === 404) {
        await router.replace({ name: 'not-found' });
      }
    } finally {
      isResolvingPortfolio.value = false;
    }
  },
  { immediate: true }
);

watch(portfolioUserId, () => {
  localRecommendations.value = [];
  closeRecommendationModal();
});

watch(
  [portfolioUserId, userId, isOwnPortfolio],
  () => {
    loadFollowState();
  },
  { immediate: true }
);

function sortVisibleHighlightedExperiences(list, isVisible = (experience) => experience.effectiveVisibleToEveryone) {
  return [...list].sort((firstProject, secondProject) => {
    const firstIsVisibleHighlight = Boolean(
      firstProject.highlighted && isVisible(firstProject)
    );
    const secondIsVisibleHighlight = Boolean(
      secondProject.highlighted && isVisible(secondProject)
    );

    if (firstIsVisibleHighlight !== secondIsVisibleHighlight) {
      return firstIsVisibleHighlight ? -1 : 1;
    }

    if (firstIsVisibleHighlight && secondIsVisibleHighlight) {
      return (secondProject.score ?? 0) - (firstProject.score ?? 0);
    }

    return new Date(secondProject.date) - new Date(firstProject.date);
  });
}

const visibleProjects = computed(() => {
	if (isOwnPortfolio.value) return sortVisibleHighlightedExperiences(projects.value);

	return sortVisibleHighlightedExperiences(
    projects.value.filter(project => project.effectiveVisibleToEveryone)
  );
});

const visibleActivities = computed(() => {
  if (isOwnPortfolio.value) return sortVisibleHighlightedExperiences(activities.value);

  return sortVisibleHighlightedExperiences(
    activities.value.filter(activity => activity.effectiveVisibleToEveryone)
  );
});

const visibleCertifications = computed(() => {
  if (isOwnPortfolio.value) {
    return sortVisibleHighlightedExperiences(
      certifications.value,
      certification => certification.visibleToEveryone
    );
  }

  return sortVisibleHighlightedExperiences(
    certifications.value.filter(certification => certification.visibleToEveryone),
    certification => certification.visibleToEveryone
  );
});

const visibleInternships = computed(() => {
  if (isOwnPortfolio.value) return internships.value;

  return internships.value.filter(internship => internship.effectiveVisibleToEveryone);
});

const shouldShowProjectSection = computed(() => {
	return isOwnPortfolio.value || visibleProjects.value.length > 0;
});

const shouldShowActivitySection = computed(() => {
  return isOwnPortfolio.value || visibleActivities.value.length > 0;
});

const shouldShowCertificationSection = computed(() => {
  return isOwnPortfolio.value || visibleCertifications.value.length > 0;
});

const shouldShowInternshipSection = computed(() => {
  return isOwnPortfolio.value || visibleInternships.value.length > 0;
});

const notification = ref({
  type: 'error',
  message: '',
});
let notificationTimer = null;
const isSchoolModalOpen = ref(false);

const experienceModal = ref({
  open: false,
  type: 'project',
  mode: 'create',
  selected: null,
});
const isDeleteConfirmOpen = ref(false);

const isExperienceSubmitting = ref(false);

const experienceLoadingByType = computed(() => ({
  project: projectStore.loading,
  activity: activityStore.loading,
  internship: internshipStore.loading,
  certificate: certificationStore.loading,
}));

const experienceModalLoading = computed(() =>
  isExperienceSubmitting.value ||
  (experienceLoadingByType.value[experienceModal.value.type] ?? false)
);

function clearNotification() {
  notification.value.message = '';
}

function showNotification(type, message) {
  notification.value = { type, message };
}

function openExperienceModal(type) {
  clearNotification();
  experienceModal.value = {
    open: true,
    type,
    mode: 'create',
    selected: null,
  };
}

function openEditExperienceModal(type, experience) {
  if (isRejectedExperience(experience)) return;

  clearNotification();
  experienceModal.value = {
    open: true,
    type,
    mode: 'edit',
    selected: experience,
  };
}

function isRejectedExperience(experience) {
  return experience?.validationStatus === 'refuse';
}

function closeExperienceModal() {
  isDeleteConfirmOpen.value = false;
  experienceModal.value = {
    ...experienceModal.value,
    open: false,
    mode: 'create',
    selected: null,
  };
}

function openDeleteConfirm() {
  isDeleteConfirmOpen.value = true;
}

function closeDeleteConfirm() {
  if (isExperienceSubmitting.value) return;

  isDeleteConfirmOpen.value = false;
}

async function handleExperienceSubmit(experience) {
  const type = experienceModal.value.type;
  clearNotification();
  isExperienceSubmitting.value = true;

  try {
    const isEdit = experienceModal.value.mode === 'edit';
    const selectedId = experienceModal.value.selected?.id;

    if (type === 'project') {
      if (isEdit) {
        const updatedProject = await projectStore.editProject({
          ...experience,
          id: selectedId,
        });

        projects.value = projects.value.map((project) =>
          project.id === selectedId ? updatedProject : project
        );

        closeExperienceModal();
        showNotification('success', 'Experience updated successfully.');
        return;
      }

      const createdProject = await projectStore.createProject(experience);
      projects.value.unshift(createdProject);
      closeExperienceModal();
      showNotification('success', 'Experience created successfully.');
      return;
    }

    if (type === 'activity') {
      if (isEdit) {
        const updatedActivity = await activityStore.editActivity({
          ...experience,
          id: selectedId,
        });

        activities.value = activities.value.map((activity) =>
          activity.id === selectedId ? updatedActivity : activity
        );

        closeExperienceModal();
        showNotification('success', 'Experience updated successfully.');
        return;
      }

      const createdActivity = await activityStore.createActivity(experience);
      activities.value = [createdActivity, ...activities.value];
      closeExperienceModal();
      showNotification('success', 'Experience created successfully.');
    }

    if (type === 'internship') {
      if (isEdit) {
        const updatedInternship = await internshipStore.editInternship({
          ...experience,
          id: selectedId,
        });

        internships.value = internships.value.map((internship) =>
          internship.id === selectedId ? updatedInternship : internship
        );
        closeExperienceModal();
        showNotification('success', 'Experience updated successfully.');
        return;
      }

      const createdInternship = await internshipStore.createInternship(experience);
      internships.value = [createdInternship, ...internships.value];
      closeExperienceModal();
      showNotification('success', 'Experience created successfully.');
      return;
    }

    if (type === 'certificate') {
      if (isEdit) {
        const updatedCertification = await certificationStore.editCertification({
          ...experience,
          id: selectedId,
        });

        certifications.value = certifications.value.map((certification) =>
          certification.id === selectedId ? updatedCertification : certification
        );

        closeExperienceModal();
        showNotification('success', 'Experience updated successfully.');
        return;
      }

      const createdCertification = await certificationStore.createCertification(experience);
      certifications.value = [createdCertification, ...certifications.value];
      closeExperienceModal();
      showNotification('success', 'Experience created successfully.');
    }
  }
  catch (error) {
    showNotification('error', error.response?.data?.message ||
      error.message ||
      `Failed to save ${type}`);
  }
  finally {
    isExperienceSubmitting.value = false;
  }
}

async function handleExperienceDelete() {
  const type = experienceModal.value.type;
  const selectedId = experienceModal.value.selected?.id;

  if (!selectedId) return;

  clearNotification();
  isExperienceSubmitting.value = true;

  try {
    if (type === 'project') {
      await projectStore.deleteProject(selectedId);
      projects.value = projects.value.filter((project) => project.id !== selectedId);
    }
    else if (type === 'activity') {
      await activityStore.deleteActivity(selectedId);
      activities.value = activities.value.filter((activity) => activity.id !== selectedId);
    }
    else if (type === 'internship') {
      await internshipStore.deleteInternship(selectedId);
      internships.value = internships.value.filter((internship) => internship.id !== selectedId);
    }
    else if (type === 'certificate') {
      await certificationStore.deleteCertification(selectedId);
      certifications.value = certifications.value.filter((certification) => certification.id !== selectedId);
    }

    closeExperienceModal();
    isDeleteConfirmOpen.value = false;
    showNotification('success', 'Experience deleted successfully.');
  }
  catch (error) {
    showNotification('error', error.response?.data?.message ||
      error.message ||
      `Failed to delete ${type}`);
  }
  finally {
    isExperienceSubmitting.value = false;
  }
}

const isQRModalOpen = ref(false);
function openQRModal() {
  isQRModalOpen.value = true;
}

const isRecommendationModalOpen = ref(false);

function openRecommendationModal() {
  if (isOwnPortfolio.value) return;

  isRecommendationModalOpen.value = true;
}

function closeRecommendationModal() {
  isRecommendationModalOpen.value = false;
}

async function loadFollowState() {
  loadedFollowersCount.value = null;
  isFollowing.value = false;

  if (!portfolioUserId.value || !userId.value) return;

  try {
    const followersResponse = await api.get(`/follow/${portfolioUserId.value}/followers`);
    const followers = followersResponse.data?.data ?? [];
    loadedFollowersCount.value = followers.length;

    if (isOwnPortfolio.value) return;

    const followingResponse = await api.get(`/follow/${userId.value}/following`);
    const following = followingResponse.data?.data ?? [];
    isFollowing.value = following.some((user) =>
      String(user.utilisateur_id) === String(portfolioUserId.value)
    );
  }
  catch (error) {
    loadedFollowersCount.value = null;
  }
}

async function toggleFollow() {
  if (!portfolioUserId.value || isOwnPortfolio.value || isFollowLoading.value) return;

  isFollowLoading.value = true;
  clearNotification();

  const nextIsFollowing = !isFollowing.value;
  const previousIsFollowing = isFollowing.value;
  const previousFollowersCount = loadedFollowersCount.value;

  isFollowing.value = nextIsFollowing;
  loadedFollowersCount.value = Math.max(
    0,
    (loadedFollowersCount.value ?? followersCount.value) + (nextIsFollowing ? 1 : -1)
  );

  try {
    if (nextIsFollowing) {
      await api.post('/follow', { targetId: portfolioUserId.value });
      showNotification('success', `You are now following ${profileName.value}.`);
      return;
    }

    await api.delete(`/follow/${portfolioUserId.value}`);
    showNotification('success', `You unfollowed ${profileName.value}.`);
  }
  catch (error) {
    isFollowing.value = previousIsFollowing;
    loadedFollowersCount.value = previousFollowersCount;
    showNotification('error', error.response?.data?.message ||
      error.message ||
      'Failed to update follow status.');
  }
  finally {
    isFollowLoading.value = false;
  }
}

function handlePortfolioRecommendationSubmit(recommendation) {
  if (!portfolioUserId.value) return;

  localRecommendations.value = [
    {
      id: `local-recommendation-${Date.now()}`,
      authorName: recommenderName.value,
      authorRole: recommenderRole.value,
      content: recommendation.content,
      date: new Date().toISOString(),
      status: 'valide',
      portfolioOwnerId: portfolioUserId.value,
    },
    ...localRecommendations.value,
  ];

  closeRecommendationModal();
}

function openSchoolModal() {
  if (!isOwnPortfolio.value) return;

  clearNotification();
  isSchoolModalOpen.value = true;
}

async function completeSchoolPath(schoolData) {
  clearNotification();

  try {
    institutionStore.setSchoolPath(schoolData.schoolPath);

    const institutionIds = [
      ...new Set(
        Object.values(schoolData.schoolPath ?? {})
          .map((school) => school?.institutionId)
          .filter(Boolean)
      ),
    ];

    if (institutionIds.length && userId.value) {
      await api.post('/select-institutions', {
        etudiantId: userId.value,
        institutionId: institutionIds,
      });
    }

    isSchoolModalOpen.value = false;

    if (portfolioUserId.value) {
      await portfolioStore.fetchPortfolio(portfolioUserId.value);
    }

    showNotification('success', 'Academic path saved successfully.');
  }
  catch (error) {
    showNotification('error', error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to save academic path');
  }
}

const links = computed(() => [
  {
    platform: 'github',
    label: 'GitHub',
    href: profile.value?.github,
  },
  {
    platform: 'linkedin',
    label: 'LinkedIn',
    href: profile.value?.linkedin,
  },
  {
    platform: 'x',
    label: 'Twitter / X',
    href: profile.value?.x,
  },
  {
    platform: 'instagram',
    label: 'Instagram',
    href: profile.value?.instagram,
  },
].filter(link => link.href || isOwnPortfolio.value));

async function handleLinkUpdated() {
  if (!portfolioUserId.value) return;

  await portfolioStore.fetchPortfolio(portfolioUserId.value);
}

const activityMaxCardHeight = ref(0);

function updateActivityMaxCardHeight(height) {
  activityMaxCardHeight.value = height;
}

function openProfilePhotoPicker() {
  if (!isOwnPortfolio.value) return;

  profilePhotoInput.value?.click();
}

function handleProfilePhotoChange(event) {
  const file = event.target.files?.[0];
  event.target.value = '';

  if (!file) return;
  selectedProfilePhotoFile.value = file;
}

function handleProfilePhotoCropped(file) {
  if (localProfilePhoto.value) {
    URL.revokeObjectURL(localProfilePhoto.value);
  }

  localProfilePhoto.value = URL.createObjectURL(file);
  selectedProfilePhotoFile.value = null;
}

function closeProfilePhotoCropper() {
  selectedProfilePhotoFile.value = null;
}

onUnmounted(() => {
  if (localProfilePhoto.value) {
    URL.revokeObjectURL(localProfilePhoto.value);
  }

  if (notificationTimer) {
    clearTimeout(notificationTimer);
  }
});

watch(
  () => notification.value.message,
  (message) => {
    if (notificationTimer) {
      clearTimeout(notificationTimer);
      notificationTimer = null;
    }

    if (!message) return;

    notificationTimer = setTimeout(() => {
      clearNotification();
      notificationTimer = null;
    }, 4500);
  }
);

async function handleAiFiltersDetected(filters) {
  if (!portfolioUserId.value) return;

  await portfolioStore.fetchPortfolio(portfolioUserId.value, filters);
}
</script>

<template>
  <div
    v-if="isPortfolioLoading"
    class="portfolio portfolio--loading"
    aria-busy="true"
  >
    <div class="portfolio__banner" />

    <main>
      <div class="profile profile--skeleton">
        <div class="profile__photo skeleton" />
        <div class="profile__info profile__info--skeleton">
          <span class="skeleton skeleton-line skeleton-line--name" />
          <span class="skeleton skeleton-line skeleton-line--headline" />
          <div class="statistics statistics--skeleton">
            <div
              v-for="item in 3"
              :key="item"
            >
              <span class="skeleton skeleton-line skeleton-line--stat-label" />
              <span class="skeleton skeleton-line skeleton-line--stat-value" />
            </div>
          </div>
        </div>
      </div>

      <div class="about">
        <section class="skeleton-panel skeleton-panel--about">
          <span class="skeleton skeleton-line skeleton-line--section-title" />
          <span
            v-for="line in 4"
            :key="`about-${line}`"
            class="skeleton skeleton-line"
            :class="`skeleton-line--copy-${line}`"
          />
        </section>

        <div class="education-skills-wrapper">
          <section class="skeleton-panel skeleton-panel--compact">
            <span class="skeleton skeleton-line skeleton-line--section-title" />
            <span
              v-for="line in 3"
              :key="`education-${line}`"
              class="skeleton skeleton-line"
            />
          </section>

          <section class="skeleton-panel skeleton-panel--compact">
            <span class="skeleton skeleton-line skeleton-line--section-title" />
            <div class="skeleton-tags">
              <span
                v-for="tag in 8"
                :key="`tag-${tag}`"
                class="skeleton skeleton-tag"
              />
            </div>
          </section>
        </div>
      </div>

      <section
        v-for="section in 3"
        :key="`portfolio-section-${section}`"
        class="skeleton-section"
      >
        <div class="skeleton-section__header">
          <span class="skeleton skeleton-line skeleton-line--section-heading" />
          <span class="skeleton skeleton-button" />
        </div>
        <div class="skeleton-card-grid">
          <article
            v-for="card in 3"
            :key="`section-${section}-card-${card}`"
            class="skeleton-card"
          >
            <span class="skeleton skeleton-line skeleton-line--card-title" />
            <span class="skeleton skeleton-line" />
            <span class="skeleton skeleton-line skeleton-line--copy-2" />
            <span class="skeleton skeleton-line skeleton-line--copy-3" />
          </article>
        </div>
      </section>
    </main>
  </div>
  <div
    v-else
    class="portfolio"
  >
    <div class="portfolio__banner" />
    <BaseNotification
      :message="notification.message"
      :type="notification.type"
      @close="clearNotification"
    />

    <main>
      <div class="profile">
        <div
          class="profile__photo"
          :class="{ 'profile__photo--editable': isOwnPortfolio }"
          @click="openProfilePhotoPicker"
        >
          <img
            v-if="displayedProfilePhoto"
            :src="displayedProfilePhoto"
            alt="photo"
          >
          <div
            v-else
            class="profile__photo-fallback"
          >
            <UserRound
              :size="54"
              :stroke-width="1.55"
            />
          </div>
          <div
            v-if="isOwnPortfolio"
            class="profile__photo-overlay"
          >
            <Camera
              :size="22"
              :stroke-width="2"
            />
            <span>Change photo</span>
          </div>
          <input
            v-if="isOwnPortfolio"
            ref="profilePhotoInput"
            class="profile__photo-input"
            type="file"
            accept="image/*"
            @click.stop
            @change="handleProfilePhotoChange"
          >
          <button
            class="qr-button"
            @click.stop="openQRModal"
          >
            <QrCode
              :size="15"
              :stroke-width="2.3"
            />
            <span>generate QR code</span>
          </button>
        </div>
        <div class="profile__info">
          <h2 class="name">
            {{ profileName }}
          </h2>
          <span class="profile__headline">{{ profileHeadline }}</span>
          <div class="statistics">
            <div>
              <span>Followers</span>
              <h2>{{ followersCount }}</h2>
            </div>
            <div>
              <span>Recommendations</span>
              <h2>{{ recommendationsCount }}</h2>
            </div>
            <div>
              <span>Score</span>
              <h2>{{ portfolioScore }}</h2>
            </div>
          </div>
          <div
            v-if="!isOwnPortfolio"
            class="actions"
          >
            <FollowButton
              :following="isFollowing"
              :loading="isFollowLoading"
              @toggle="toggleFollow"
            />
            <button
              type="button"
              class="recommend-button"
              @click="openRecommendationModal"
            >
              Recommend
            </button>
          </div>
        </div>
      </div>
      <div
        v-if="portfolioUserId"
        class="about"
        :class="{ 'about--solo': !hasProfileDetails }"
      >
        <AboutMe :user-id="portfolioUserId" />
        <div
          v-if="hasProfileDetails"
          class="education-skills-wrapper"
        >
          <PortfolioEducation
            v-if="shouldShowEducation"
            :user-id="portfolioUserId"
            :items="educationItems"
            :can-add="isOwnPortfolio"
            @add-education="openSchoolModal"
          />
          <PortfolioSkills
            v-if="shouldShowSkills"
            :user-id="portfolioUserId"
            :skills="skillItems"
            :domains="domainItems"
          />
        </div>
      </div>
      <div
        v-if="shouldShowProjectSection"
        class="portfolio-section-wrapper"
      >
        <ProjectsSection
          :projects="visibleProjects"
          :can-add="isOwnPortfolio"
          @add-project="openExperienceModal('project')"
          @edit-project="project => openEditExperienceModal('project', project)"
        />
      </div>
      <div
        v-if="shouldShowInternshipSection"
        class="portfolio-section-wrapper"
      >
        <InternshipsSection
          :internships="visibleInternships"
          :can-add="isOwnPortfolio"
          @add-internship="openExperienceModal('internship')"
          @edit-internship="internship => openEditExperienceModal('internship', internship)"
        />
      </div>
      <div
        v-if="shouldShowActivitySection || shouldShowCertificationSection"
        class="portfolio-split-sections"
      >
        <div
          v-if="shouldShowActivitySection"
          class="portfolio-section-wrapper"
        >
          <ActivitiesSection
            :activities="visibleActivities"
            :can-add="isOwnPortfolio"
            @add-activity="openExperienceModal('activity')"
            @edit-activity="activity => openEditExperienceModal('activity', activity)"
            @update-max-card-height="updateActivityMaxCardHeight"
          />
        </div>

        <div
          v-if="shouldShowCertificationSection"
          class="portfolio-section-wrapper"
        >
          <CertificationsSection
            :certifications="visibleCertifications"
            :can-add="isOwnPortfolio"
            :max-card-height="activityMaxCardHeight"
            @add-certification="openExperienceModal('certificate')"
            @edit-certification="certification => openEditExperienceModal('certificate', certification)"
          />
        </div>
      </div>
      <RecommendationsSection
        :recommendations="displayRecommendations"
        :is-owner="isOwnPortfolio"
      />
    </main>

    <footer>
      <PortfolioContact
        :email="profile?.email"
        :canedit="isOwnPortfolio"
        :user-id="portfolioUserId"
        :links
        @link-updated="handleLinkUpdated"
      />
    </footer>

    <QRcodeModal
      :open="isQRModalOpen"
      title="Share your portfolio"
      :username="portfolioUserId"
      @close="isQRModalOpen = false"
    />

    <PortfolioRecommendationModal
      :open="isRecommendationModalOpen"
      :portfolio-owner-name="profileName"
      :recommender-name="recommenderName"
      :recommender-role="recommenderRole"
      @close="closeRecommendationModal"
      @submit="handlePortfolioRecommendationSubmit"
    />

    <ExperienceModal
      v-if="isOwnPortfolio"
      :open="experienceModal.open"
      :mode="experienceModal.mode"
      :type="experienceModal.type"
      :initial-value="experienceModal.selected"
      :loading="experienceModalLoading"
      :school-options="schoolOptions"
      :professor-emails="professorEmails"
      @close="closeExperienceModal"
      @submit="handleExperienceSubmit"
      @delete="openDeleteConfirm"
    />
    <ConfirmDialog
      :open="isDeleteConfirmOpen"
      title="Delete experience?"
      message="This experience will be permanently removed from your portfolio."
      confirm-text="Delete"
      :loading="isExperienceSubmitting"
      @cancel="closeDeleteConfirm"
      @confirm="handleExperienceDelete"
    />

    <SchoolPathModal
      v-if="isOwnPortfolio"
      :open="isSchoolModalOpen"
      :schools="institutionStore.institutions"
      @close="isSchoolModalOpen = false"
      @complete="completeSchoolPath"
    />

    <ImageCropperModal
      :open="Boolean(selectedProfilePhotoFile)"
      :file="selectedProfilePhotoFile"
      title="Crop profile photo"
      :output-width="760"
      :output-height="820"
      @close="closeProfilePhotoCropper"
      @crop="handleProfilePhotoCropped"
    />
  </div>
  <div class="ai-orb-container">
    <AiOrb @filters-detected="handleAiFiltersDetected" />
  </div>
</template>

<style scoped>
.portfolio__banner {
	width: 100%;
	height: 7.5rem;
  background:
    linear-gradient(
      165deg,
      rgba(var(--color-secondary-rgb), 0.34),
      transparent 45%
    ),
    linear-gradient(
      180deg,
      rgba(var(--color-background-rgb), 0.95),
      var(--color-surface)
    );
}

.portfolio {
  width: 100%;
  overflow-x: hidden;
}

.portfolio--loading {
  min-height: 100vh;
}

.portfolio main {
	--portfolio-padding-inline: clamp(var(--space-md), 12vw, calc(var(--space-xl) * 5));
  --portfolio-section-gap: clamp(calc(var(--space-xl) * 2), 7vw, calc(var(--space-xl) * 3));
	display: flex;
	flex-direction: column;
	gap: var(--portfolio-section-gap);
	padding-block: 0 6rem;
	padding-inline: var(--portfolio-padding-inline);
}

.profile {
  margin-top: var(--space-md);
	display: flex;
	gap: 2.5rem;
}

.profile__photo {
	--photo-diameter: 9.6rem;
	position: relative;
	display: flex;
	justify-content: center;
	flex: 0 0 var(--photo-diameter);
	width: var(--photo-diameter);
	height: var(--photo-diameter);
	transform: translateY(calc(var(--space-lg) * -1.46));
	background-color: var(--color-surface);
	border-radius: 42%;
	border: 1px solid var(--color-background);
  box-shadow: 0 18px 38px rgba(var(--color-primary-rgb), 0.12);
}

.profile__photo img {
	border-radius: inherit;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
	object-position: center top;
}

.profile__photo img,
.profile__photo-fallback {
  transition: filter 220ms ease;
}

.profile__photo--editable {
  cursor: pointer;
}

.profile__photo--editable:hover:not(:has(.qr-button:hover)) img,
.profile__photo--editable:hover:not(:has(.qr-button:hover)) .profile__photo-fallback {
  filter: saturate(1.04) contrast(1.02);
}

.profile__photo-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  gap: 0.35rem;
  align-content: center;
  border-radius: inherit;
  background:
    linear-gradient(
      180deg,
      rgba(var(--color-primary-rgb), 0.04),
      rgba(var(--color-primary-rgb), 0.52)
    );
  color: var(--color-background);
  font-size: 0.78rem;
  font-weight: 700;
  opacity: 0;
  pointer-events: none;
  transform: translateY(0.35rem);
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.profile__photo--editable:hover:not(:has(.qr-button:hover)) .profile__photo-overlay {
  opacity: 1;
  transform: translateY(0);
}

.profile__photo-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.profile__photo-fallback {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background:
    linear-gradient(
      145deg,
      rgba(var(--color-secondary-rgb), 0.26),
      rgba(var(--color-surface-rgb), 0.88) 58%,
      rgba(var(--color-background-rgb), 0.92)
    );
  color: rgba(var(--color-primary-rgb), 0.58);
}


.profile__info {
	display: flex;
	font-family: var(--font-ui);
	flex-direction: column;
	gap: var(--space-xs);
	padding: var(--space-sm) 0;
}

.profile__info--skeleton {
  width: min(100%, 25rem);
  gap: var(--space-sm);
}

.name {
	margin: 0;
	font-size: calc(var(--font-size-lg));
	font-weight: var(--font-bold);
	color: var(--color-primary);
	line-height: 1;
}

.profile__headline {
	display: block;
	min-height: var(--font-size-xs);
	font-size: var(--font-size-xs);
	line-height: 1;
	color: rgba(var(--color-primary-rgb), 0.7);
}

.profile__info strong {
	color: rgba(var(--color-primary-rgb), 0.86);
	font-weight: var(--font-bold);
}

.statistics {
	margin-top: var(--space-sm);
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 2rem;
}

.statistics > div {
	display: flex;
	flex-direction: column;
	gap: var(--space-xs);
}

.statistics span {
	color: rgba(var(--color-primary-rgb), 0.7);
	font-size: var(--font-size-xxs);
	font-weight: var(--font-bold);
}

.statistics h2 {
	margin: 0;
	font-size: var(--font-size-md);
	font-weight: var(--font-bold);
	color: var(--color-primary);
}

.statistics--skeleton {
  justify-content: flex-start;
}

.statistics--skeleton > div {
  width: 6.5rem;
}

.about {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: var(--space-lg);
}

.about--solo {
	grid-template-columns: 1fr;
}

.actions {
	margin-top: var(--space-xs);
	display: flex;
	align-items: center;
	gap: var(--space-lg);
}

.qr-button {
	display: grid;
	grid-template-columns: 0.5rem 1fr;
	align-items: center;
	gap: 0.7rem;
	position: absolute;
	bottom: calc(0.78rem * -1);
	border: 1.5px solid var(--color-primary);
	border-radius: 999px;
	padding-block: 0.34rem;
	padding-inline: var(--space-sm) 1rem;
	color: var(--color-primary);
	font-size: var(--font-size-xxs);
	font-weight: var(--font-bold);
	white-space: nowrap;
	background: var(--color-background);
	cursor: pointer;
  z-index: 2;
	transition: transform var(--transition-fast);
}

.qr-button:hover {
	transform: translateY(-1px);
}

:is(.qr-button, .recommend-button):focus-visible {
	outline: none;
	border-color: var(--color-secondary);
	box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.15);
}

:is(.qr-button, .recommend-button):not(:disabled):hover {
	transform: translateY(-1px);
}

.qr-button svg {
	color: var(--color-primary);
}

.recommend-button {
	font-size: var(--font-size-xxs);
	padding: 0.45rem var(--space-md);
	border-radius: var(--radius-md);
	cursor: pointer;
}

.recommend-button {
	min-width: 8.4rem;
	font-weight: var(--font-bold);
	border: 1.5px solid rgba(var(--color-primary-rgb), 0.78);
	background-color: var(--color-background);
	color: rgba(var(--color-primary-rgb), 0.78);
	transition: transform var(--transition-fast);
}

.education-skills-wrapper {
	display: grid;
	grid-template-rows: auto 1fr;
	gap: var(--space-lg);
}

.portfolio-split-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 26rem), 1fr));
  align-items: stretch;
  column-gap: calc(var(--space-xl) * 2);
  row-gap: var(--portfolio-section-gap);
}

.skeleton {
  position: relative;
  display: block;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: rgba(var(--color-primary-rgb), 0.08);
}

.profile__photo.skeleton {
  border-radius: 42%;
}

.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(var(--color-background-rgb), 0.72),
    transparent
  );
  animation: skeleton-shimmer 1.35s ease-in-out infinite;
}

.skeleton-line {
  width: 100%;
  height: 0.85rem;
}

.skeleton-line--name {
  width: min(15rem, 78%);
  height: 1.6rem;
}

.skeleton-line--headline {
  width: min(20rem, 92%);
}

.skeleton-line--stat-label {
  width: 5.6rem;
  height: 0.65rem;
}

.skeleton-line--stat-value {
  width: 2.4rem;
  height: 1.25rem;
}

.skeleton-line--section-title,
.skeleton-line--section-heading {
  width: min(13rem, 70%);
  height: 1.85rem;
  border-radius: var(--radius-sm);
}

.skeleton-line--section-heading {
  height: 2.2rem;
}

.skeleton-line--card-title {
  width: 72%;
  height: 1.15rem;
}

.skeleton-line--copy-1 {
  width: 94%;
}

.skeleton-line--copy-2 {
  width: 82%;
}

.skeleton-line--copy-3 {
  width: 64%;
}

.skeleton-line--copy-4 {
  width: 74%;
}

.skeleton-panel {
  display: flex;
  min-height: 17rem;
  flex-direction: column;
  gap: var(--space-md);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
  padding-block: var(--space-sm) var(--space-xl);
}

.skeleton-panel--compact {
  min-height: 8.5rem;
}

.skeleton-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.skeleton-tag {
  width: 5.5rem;
  height: 1.7rem;
  border-radius: 999px;
}

.skeleton-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
  padding-bottom: var(--space-xl);
}

.skeleton-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.skeleton-button {
  width: 7.25rem;
  height: 2.1rem;
  border-radius: var(--radius-sm);
}

.skeleton-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-lg);
}

.skeleton-card {
  display: flex;
  min-height: 10.5rem;
  flex-direction: column;
  gap: var(--space-md);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-md);
  background: rgba(var(--color-surface-rgb), 0.28);
  padding: var(--space-lg);
}

@keyframes skeleton-shimmer {
  100% {
    transform: translateX(100%);
  }
}
.ai-orb-container {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  width: 64px;
  height: 64px;
  z-index: 700;
  overflow: visible;
}

@media (max-width: 980px) {
	.profile {
		flex-direction: column;
		text-align: center;
		align-items: center;
		gap: 0;
	}

	.profile__photo {
		--photo-diameter: 8rem;
	}

	.about {
		grid-template-columns: 1fr;
		gap: var(--space-lg);
	}

  .profile__info--skeleton {
    align-items: center;
  }

  .skeleton-card-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .ai-orb-container {
    right: 1.4rem;
    bottom: 1rem;
    width: 56px;
    height: 56px;
  }

  .portfolio main {
    --portfolio-padding-inline: var(--space-md);
    padding-bottom: 5rem;
  }

  .statistics {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.2rem;
  }

  .actions {
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  .qr-button {
    font-size: 10px;
    padding-inline: 0.7rem 0.85rem;
  }

  .skeleton-section__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .skeleton-button {
    width: 6.5rem;
  }
}

@media (max-width: 380px) {
  .ai-orb-container {
    right: 0.75rem;
    bottom: 0.75rem;
  }
}
</style>
