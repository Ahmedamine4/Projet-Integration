<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import src from '@/assets/images/profile-photo.png'
import AboutMe from '@/components/portfolio/AboutMe.vue';
import PortfolioEducation from '@/components/portfolio/PortfolioEducation.vue';
import PortfolioSkills from '@/components/portfolio/PortfolioSkills.vue';
import ProjectsSection from '@/components/portfolio/ProjectsSection.vue';
import { QrCode } from 'lucide-vue-next';
import QRcodeModal from '@/components/portfolio/QRcodeModal.vue';
import ExperienceModal from '@/components/portfolio/ExperienceModal.vue';
import { useProjectStore } from '@/stores/project';
import { useActivityStore } from '@/stores/activity';
import BaseError from '@/components/common/BaseError.vue';
import { useRoute } from 'vue-router';
import ActivitiesSection from '@/components/portfolio/ActivitiesSection.vue';
import PortfolioContact from '@/components/portfolio/PortfolioContact.vue';

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

const projects = ref([
  {
    id: "cmpgz1ulc0003pn3vmqh9f6l8",
    type: "project",
    title: "TaskFlow Board",
    date: "2026-05-11T23:00:00.000Z",
    description: "A collaborative project management dashboard that helps teams organize tasks, track progress, manage deadlines, and centralize project files in one visual workspace. It includes board and table views, task assignments, due dates, status labels, and progress tracking to make team coordination easier and more transparent.",
    visibleToEveryone: true,
    githubLink: "https://github.com/sweta-devnani/taskflow-board",
    technologies: [],
    domains: ["Web Frontend", "Web Backend"],
    imagePreview: "https://xfnburehcqkcmebvpfqh.supabase.co/storage/v1/object/public/projets/1779457499504-54-Best-Project-Management-Tools-for-2023.webp",
  },
  {
    id: "cmph6v6c90005pn3vbyk3swuf",
    type: "project",
    title: "OpenPlan Suite",
    date: "2021-08-16T23:00:00.000Z",
    description: "A secure open-source project management platform designed to help teams plan, organize, and track complex workflows. It includes task scheduling, timeline visualization, milestone tracking, collaboration tools, and progress monitoring through an intuitive Gantt-style interface.",
    visibleToEveryone: true,
    githubLink: "https://github.com/mcpem/openplan-suite",
    technologies: ["Gantt"],
    domains: ["Web Frontend", "Web Backend"],
    imagePreview: "https://xfnburehcqkcmebvpfqh.supabase.co/storage/v1/object/public/projets/1779470624965-openproject-home-5ab8cc23.jpg",
  },
  {
    id: "cmph7hxhj0007pn3v91xci94u",
    type: "project",
    title: "MPP Project Viewer",
    date: "2018-05-15T00:00:00.000Z",
    description: "A project file viewer that allows users to open, browse, and manage Microsoft Project files from multiple sources. It supports recent project access, cloud storage integrations, local files, shared workspaces, and project server connections to make project planning files easier to access from anywhere.",
    visibleToEveryone: true,
    githubLink: "https://github.com/mcpem/mpp-project-viewer",
    technologies: ["Microsoft Project"],
    domains: ["Web Frontend", "Web Backend", "DevOps and Cloud Infrastructure"],
    imagePreview: "https://xfnburehcqkcmebvpfqh.supabase.co/storage/v1/object/public/projets/1779471686171-image.png",
  },
  {
    id: "cmph7mvph0009pn3v2pp6qr8l",
    type: "project",
    title: "BitrixFlow Workspace",
    date: "2019-05-21T00:00:00.000Z",
    description: "A collaborative task and project management workspace that helps teams organize deadlines, track project stages, assign responsibilities, and monitor progress across Kanban-style boards. The platform supports task prioritization, team communication, mobile access, and real-time workflow visibility.",
    visibleToEveryone: false,
    githubLink: "https://github.com/mcpem/bitrixflow-workspace",
    technologies: ["Kanban"],
    domains: ["Web Backend"],
    imagePreview: "https://xfnburehcqkcmebvpfqh.supabase.co/storage/v1/object/public/projets/1779471917635-Screenshot%202026-05-22%20184412.png",
  },
  {
    id: "cmphatcyz000bpn3vjzn4mly5",
    type: "project",
    title: "Creative Task Studio",
    date: "2024-08-07T23:00:00.000Z",
    description: "Creative Task Studio is a Vue.js and Pinia web application for project management and creative collaboration. It helps teams organize tasks, manage project assets, track deadlines, and monitor work progress through a clean dashboard. The backend is built with Express and PostgreSQL to support task storage, team workflows, and project data management.",
    visibleToEveryone: true,
    githubLink: "https://github.com/mcpem/creative-task-studio",
    technologies: ["Vue.js", "Pinia", "Express", "PostgreSQL"],
    domains: ["Web Frontend", "Web Backend"],
    imagePreview: "https://xfnburehcqkcmebvpfqh.supabase.co/storage/v1/object/public/projets/1779477258526-9a9cf2a5-2f09-4e63-ad2e-e1a4b893e7f0.avif",
  },
]);

const activities = ref([
  {
    id: 'cmpinjxs9000dpn3vy78amjjl',
    type: 'activity',
    title: 'Territory Development Challenge',
    date: '2024-06-12',
    description: 'Participated in the Territory Development Challenge, an international community innovation competition focused on proposing creative solutions for territorial development in the Tanger-Tetouan-Al Hoceima region.',
    visibleToEveryone: true,
    activityType: 'Competition',
    location: 'Tanger, Morocco',
    club: 'Open Innovation Club',
    technologies: [
      'Digital Innovation',
      'Open Innovation',
    ],
    domains: [
      'Territorial Development',
      'Community Innovation',
      'Sustainable Development',
      'Entrepreneurship',
    ],
    imagePreview: 'https://xfnburehcqkcmebvpfqh.supabase.co/storage/v1/object/public/activites/1779559120094-maroc-Lancement-premier-concours-international-communautaire-innovation-Tanger-Tetouan-Al-Hoceima-696x385.png',
  },
	{
		id: "cmplih13f0001nj3u0e7ftmc6",
		type: "activity",
		title: "Hackathon Sportech 2025-2030",
		date: "2025-08-07",
		description: "I participated in a SportTech hackathon for CAN 2025 where I worked on a digital sports innovation project. The project used Vue.js, React, Express.js, Node.js, PostgreSQL, Supabase, artificial intelligence, data analysis, Figma, and Blender to design and prototype a smart sports platform. The main domains were sports technology, web development, UI/UX design, artificial intelligence, event management, fan engagement, digital innovation, and entrepreneurship.",
		visibleToEveryone: true,
		activityType: "Hackathon",
		location: "Cité de l'Innovation, Marrakech",
		club: "",
		technologies: [
			"Vue.js",
			"Express",
			"Node.js",
			"PostgreSQL",
			"Supabase",
			"Figma"
		],
		domains: [
			"Web Frontend",
			"Web Backend",
			"DevOps and Cloud Infrastructure"
		],
		imagePreview: "https://xfnburehcqkcmebvpfqh.supabase.co/storage/v1/object/public/activites/1779731984359-MAFIorhaZdSYcGV0OQ2LzP9tkCVobKpJI2irJjun.jpg"
	},
	{
		id: "cmpljioa7000onj3unqh65d4n",
		type: "activity",
		title: "Python Coding Workshop",
		date: "2021-08-11",
		description: "Participated in a Python coding workshop focused on learning programming fundamentals and building practical scripts using Python. The workshop covered variables, functions, loops, data structures, problem solving, debugging, and beginner-friendly automation tasks. It helped improve skills in software development, computational thinking, and practical coding.",
		visibleToEveryone: true,
		activityType: "Workshop",
		location: "Marrakech, Morocco",
		club: "",
		technologies: [
			"Python"
		],
		domains: [
			"High Performance and Quantum Computing"
		],
		imagePreview: "https://xfnburehcqkcmebvpfqh.supabase.co/storage/v1/object/public/activites/1779734528830-python-coding-workshop.webp"
	},
	{
		id: "cmpljsjbx000tnj3uusx5yaw7",
		type: "activity",
		title: "Programming Contest 2026",
		date: "2021-05-05",
		description: "Participated in the Programming Contest 2026 organized by CSTE Club at the Department of CSTE. The contest focused on algorithmic problem solving, competitive programming, coding challenges, debugging, data structures, and efficient solution design using programming languages such as C++, Python, and Java.",
		visibleToEveryone: true,
		activityType: "Competition",
		location: "Department of CSTE",
		club: "",
		technologies: [
			"C++",
			"Python",
			"Java"
		],
		domains: [
			"Web Backend",
			"Machine Learning and AI"
		],
		imagePreview: "https://xfnburehcqkcmebvpfqh.supabase.co/storage/v1/object/public/activites/1779734201639-688618993_1843327400402382_5603243728201965829_n.jpg"
	},
	{
		id: "cmplk9oew0011nj3u6b1ptlvp",
		type: "activity",
		title: "Morocco Social Tech Hackathon 2018: Smart Region",
		date: "2018-01-01",
		description: "Participated in the Morocco Social Tech Hackathon 2018 focused on Smart Region solutions at Technopark Casablanca. The hackathon centered on designing digital solutions for smart cities, connected regions, social innovation, IoT systems, mobile applications, web platforms, data analysis, and civic technology to improve regional services and community impact.",
		visibleToEveryone: false,
		activityType: "Hackathon",
		location: "Technopark Casablanca",
		club: "",
		technologies: [
			"Technopark",
			"Casablanca"
		],
		domains: [
			"Mobile Development"
		],
		imagePreview: "https://xfnburehcqkcmebvpfqh.supabase.co/storage/v1/object/public/activites/1779735001446-maxresdefault.jpg"
	},
]);

const certifications = ref([]);

const authStore = useAuthStore();
const userId = computed(() => authStore.user?.utilisateur_id);

const route = useRoute();
const portfolioUserId = computed(() => route.params.id ?? userId.value);
const isOwnPortfolio = computed(() => {
	return String(portfolioUserId.value) === String(userId.value);
});

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

const projectStore = useProjectStore();
const activityStore = useActivityStore();

const experienceErrors = ref({
  project: '',
  activity: '',
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
    href: "https://github.com",
  },
  {
    platform: 'linkedin',
    label: 'LinkedIn',
    href: "https://linkedin.com",
  },
  {
    platform: 'x',
    label: 'Twitter / X',
    href: authStore.user?.twitter,
  },
  {
    platform: 'instagram',
    label: 'Instagram',
    href: authStore.user?.instagram,
  },
].filter(link => link.href));

</script>

<template>
  <div class="portfolio">
    <div class="portfolio__banner" />

    <main>
      <div class="profile">
        <div class="profile__photo">
          <img
            :src
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
            Elon Musk
          </h2>
          <span>Engineering Student at <strong>ENSAT</strong></span>
          <div class="statistics">
            <div>
              <span>Followers</span>
              <h2>439</h2>
            </div>
            <div>
              <span>Followings</span>
              <h2>102</h2>
            </div>
            <div>
              <span>Score</span>
              <h2>152</h2>
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
      <div class="about">
        <AboutMe :user-id="userId" />
        <div class="education-skills-wrapper">
          <PortfolioEducation :user-id="userId" />
          <PortfolioSkills :user-id="userId" />
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
          />

          <BaseError v-if="experienceErrors.activity">
            {{ experienceErrors.activity }}
          </BaseError>
        </div>

        <div
          v-if="shouldShowCertificationSection"
          class="portfolio-section-wrapper"
        />
      </div>
    </main>

    <footer>
      <PortfolioContact
        :email="authStore.user?.email"
        :canedit="isOwnPortfolio"
        :links="links"
      />
    </footer>

    <QRcodeModal
      :open="isQRModalOpen"
      title="Share your portfolio"
      :username="authStore.user?.utilisateur_id"
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
        : activityStore.loading"
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
	display: grid;
	grid-template-columns: 1fr 1.3fr;
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
