<script setup>
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import src from '@/assets/images/profile-photo.png'
import AboutMe from '@/components/portfolio/profile/AboutMe.vue';
import PortfolioEducation from '@/components/portfolio/profile/PortfolioEducation.vue';
import PortfolioSkills from '@/components/portfolio/profile/PortfolioSkills.vue';
import ProjectsSection from '@/components/portfolio/projects/ProjectsSection.vue';
import { QrCode } from 'lucide-vue-next';
import QRcodeModal from '@/components/portfolio/contact/QRcodeModal.vue';
import ExperienceModal from '@/components/portfolio/shared/ExperienceModal.vue';
import { useProjectStore } from '@/stores/project';
import { useActivityStore } from '@/stores/activity';
import { useCertificationStore } from '@/stores/certification';
import { usePortfolioStore } from '@/stores/portfolio';
import BaseError from '@/components/common/feedback/BaseError.vue';
import { useRoute, useRouter } from 'vue-router';
import ActivitiesSection from '@/components/portfolio/activities/ActivitiesSection.vue';
import CertificationsSection from '@/components/portfolio/certifications/CertificationsSection.vue';
import PortfolioContact from '@/components/portfolio/contact/PortfolioContact.vue';

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
const projectStore = useProjectStore();
const activityStore = useActivityStore();
const certificationStore = useCertificationStore();

const projects = ref([]);
const activities = ref([]);
const certifications = ref([]);

const userId = computed(() => authStore.user?.utilisateur_id);

const portfolio = computed(() => portfolioStore.portfolio);
const isResolvingPortfolio = ref(false);
const portfolioUserId = computed(() =>
  route.params.id ||
  portfolio.value?.id ||
  userId.value ||
  null
);
const isOwnPortfolio = computed(() => {
	return String(portfolioUserId.value) === String(userId.value);
});

const profile = computed(() => portfolio.value?.user ?? authStore.user ?? {});
const profileName = computed(() => {
  const firstName = profile.value?.firstName ?? '';
  const lastName = profile.value?.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || 'Name not provided';
});
const profileHeadline = computed(() => {
  const headline = portfolio.value?.headline;
  const school = portfolio.value?.school;

  if (headline && school) return `${headline} at ${school}`;
  if (headline) return headline;
  if (school) return `Student at ${school}`;

  return 'Student';
});
const profilePhoto = computed(() => profile.value?.photo || src);
const portfolioScore = computed(() => portfolio.value?.portfolio?.score_credibilite ?? 0);
const followersCount = computed(() => portfolio.value?.portfolio?.interactions?.length ?? 0);
const recommendationsCount = computed(() => portfolio.value?.recommendations?.length ?? 0);

watch(
  portfolio,
  (value) => {
    projects.value = value?.projects ?? [];
    activities.value = value?.activities ?? [];
    certifications.value = value?.certifications ?? [];
  },
  { immediate: true }
);

watch(
  portfolioUserId,
  async (id) => {
    if (!id) return;

    isResolvingPortfolio.value = true;

    try {
      await portfolioStore.fetchPortfolio(id);
    } catch (error) {
      if (error.response?.status === 404) {
        await router.replace({ name: 'not-found' });
      }
    } finally {
      isResolvingPortfolio.value = false;
    }
  },
  { immediate: true }
);

const visibleProjects = computed(() => {
	if (isOwnPortfolio.value) return projects.value;

	return projects.value.filter(project => project.visibleToEveryone);
});

const visibleActivities = computed(() => {
  if (isOwnPortfolio.value) return activities.value;

  return activities.value.filter(activity => activity.visibleToEveryone);
});

const visibleCertifications = computed(() => {
  if (isOwnPortfolio.value) return certifications.value;

  return certifications.value.filter(certification => certification.visibleToEveryone);
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

const experienceErrors = ref({
  project: '',
  activity: '',
  certificate: '',
});

const experienceModal = ref({
  open: false,
  type: 'project',
  mode: 'create',
  selected: null,
});

function openExperienceModal(type) {
  experienceErrors.value[type] = '';
  experienceModal.value = {
    open: true,
    type,
    mode: 'create',
    selected: null,
  };
}

function openEditExperienceModal(type, experience) {
  experienceErrors.value[type] = '';
  experienceModal.value = {
    open: true,
    type,
    mode: 'edit',
    selected: experience,
  };
}

function closeExperienceModal() {
  experienceModal.value = {
    ...experienceModal.value,
    open: false,
    mode: 'create',
    selected: null,
  };
}

async function handleExperienceSubmit(experience) {
  const type = experienceModal.value.type;
  experienceErrors.value[type] = '';

  try {
    const isEdit = experienceModal.value.mode === 'edit';
    const selectedId = experienceModal.value.selected?.id;

    if (type === 'project') {
      if (isEdit) {
        const index = projects.value.findIndex(item => item.id === selectedId);

        if (index !== -1) {
          projects.value[index] = {
            ...projects.value[index],
            ...experience,
            imagePreview: experience.image
              ? URL.createObjectURL(experience.image)
              : projects.value[index].imagePreview,
          };
        }

        closeExperienceModal();
        return;
      }

      const createdProject = await projectStore.createProject(experience);
      projects.value.unshift(createdProject);
      closeExperienceModal();
      return;
    }

    if (type === 'activity') {
      if (isEdit) {
        const index = activities.value.findIndex(item => item.id === selectedId);

        if (index !== -1) {
          activities.value = activities.value.map((activity, currentIndex) =>
            currentIndex === index
              ? {
                  ...activity,
                  ...experience,
                  imagePreview: experience.image
                    ? URL.createObjectURL(experience.image)
                    : activity.imagePreview,
                }
              : activity
          );
        }

        closeExperienceModal();
        return;
      }

      const createdActivity = await activityStore.createActivity(experience);
      activities.value = [createdActivity, ...activities.value];
      closeExperienceModal();
    }

    if (type === 'certificate') {
      if (isEdit) {
        const index = certifications.value.findIndex(item => item.id === selectedId);

        if (index !== -1) {
          certifications.value = certifications.value.map((certification, currentIndex) =>
            currentIndex === index
              ? {
                  ...certification,
                  ...experience,
                }
              : certification
          );
        }

        closeExperienceModal();
        return;
      }

      const createdCertification = await certificationStore.createCertification(experience);
      certifications.value = [createdCertification, ...certifications.value];
      closeExperienceModal();
    }
  }
  catch (error) {
    experienceErrors.value[type] = error.response?.data?.message ||
      error.message ||
      `Failed to save ${type}`;
  }
}

const isQRModalOpen = ref(false);
function openQRModal() {
  isQRModalOpen.value = true;
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
    href: profile.value?.twitter,
  },
  {
    platform: 'instagram',
    label: 'Instagram',
    href: profile.value?.instagram,
  },
].filter(link => link.href));

const activityMaxCardHeight = ref(0);

function updateActivityMaxCardHeight(height) {
  activityMaxCardHeight.value = height;
}
</script>

<template>
  <div
    v-if="!isResolvingPortfolio"
    class="portfolio"
  >
    <div class="portfolio__banner" />

    <main>
      <BaseError v-if="portfolioStore.error">
        {{ portfolioStore.error }}
      </BaseError>
      <div class="profile">
        <div class="profile__photo">
          <img
            :src="profilePhoto"
            alt="photo"
          >
          <button
            class="qr-button"
            @click="openQRModal"
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
          <span>{{ profileHeadline }}</span>
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
          <div class="actions">
            <button class="follow-button">
              Follow
            </button>
            <button class="recommend-button">
              Recommend
            </button>
          </div>
        </div>
      </div>
      <div
        v-if="portfolioUserId"
        class="about"
      >
        <AboutMe :user-id="portfolioUserId" />
        <div class="education-skills-wrapper">
          <PortfolioEducation
            :user-id="portfolioUserId"
            :items="portfolio?.education ?? []"
          />
          <PortfolioSkills
            :user-id="portfolioUserId"
            :skills="portfolio?.skills ?? []"
            :domains="portfolio?.domains ?? []"
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

        <BaseError v-if="experienceErrors.project">
          {{ experienceErrors.project }}
        </BaseError>
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

          <BaseError v-if="experienceErrors.activity">
            {{ experienceErrors.activity }}
          </BaseError>
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

          <BaseError v-if="experienceErrors.certificate">
            {{ experienceErrors.certificate }}
          </BaseError>
        </div>
      </div>
    </main>

    <footer>
      <PortfolioContact
        :email="profile?.email"
        :canedit="isOwnPortfolio"
        :links="links"
      />
    </footer>

    <QRcodeModal
      :open="isQRModalOpen"
      title="Share your portfolio"
      :username="portfolioUserId"
      @close="isQRModalOpen = false"
    />

    <ExperienceModal
      v-if="isOwnPortfolio"
      :open="experienceModal.open"
      :mode="experienceModal.mode"
      :type="experienceModal.type"
      :initial-value="experienceModal.selected"
      :loading="experienceModal.type === 'project'
        ? projectStore.loading
        : experienceModal.type === 'activity'
          ? activityStore.loading
          : certificationStore.loading"
      :school-options="[]"
      :professor-emails="professorEmails"
      @close="closeExperienceModal"
      @submit="handleExperienceSubmit"
    />
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
}

.profile__photo img {
	border-radius: inherit;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
	object-position: center top;
}

.profile__info {
	display: flex;
	font-family: var(--font-ui);
	flex-direction: column;
	gap: var(--space-xs);
	padding: var(--space-sm) 0;
}

.name {
	margin: 0;
	font-size: calc(var(--font-size-lg));
	font-weight: var(--font-bold);
	color: var(--color-primary);
	line-height: 1;
}

.profile__info > span {
	font-size: var(--font-size-xs);
	color: rgba(var(--color-primary-rgb), 0.7);
}

.profile__info strong {
	color: rgba(var(--color-primary-rgb), 0.86);
	font-weight: var(--font-bold);
}

.statistics {
	margin-top: var(--space-sm);
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
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

.about {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: var(--space-lg);
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
	transition: transform var(--transition-fast);
}

.qr-button:hover {
	transform: translateY(-1px);
}

:is(.qr-button, .follow-button, .recommend-button):focus-visible {
	outline: none;
	border-color: var(--color-secondary);
	box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.15);
}

:is(.qr-button, .follow-button, .recommend-button):hover {
	transform: translateY(-1px);
}

.qr-button svg {
	color: var(--color-primary);
}

.follow-button,
.recommend-button {
	font-size: var(--font-size-xxs);
	padding: 0.45rem var(--space-md);
	border-radius: var(--radius-md);
	cursor: pointer;
}

.follow-button {
	min-width: 6.2rem;
	border: 1.5px solid var(--color-primary);
	background-color: var(--color-primary);
	color: var(--color-background);
	box-shadow: 0 6px 10px rgba(0, 0, 0, 0.38);
	transition:
		background-color var(--transition-fast),
		box-shadow var(--transition-fast),
		transform var(--transition-fast);
}

.follow-button:hover {
	background-color: rgba(var(--color-primary-rgb), 0.92);
  box-shadow: 0 7px 12px rgba(0, 0, 0, 0.34);
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
}

@media (max-width: 640px) {
  .portfolio main {
    --portfolio-padding-inline: var(--space-md);
  }
}
</style>
