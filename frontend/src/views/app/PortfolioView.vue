<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import src from '@/assets/images/profile-photo.png'
import AboutMe from '@/components/portfolio/AboutMe.vue';
import Education from '@/components/portfolio/Education.vue';
import Skills from '@/components/portfolio/Skills.vue';
import ProjectsSection from '@/components/portfolio/ProjectsSection.vue';
import { QrCode } from 'lucide-vue-next';
import QRcodeModal from '@/components/portfolio/QRcodeModal.vue';
import ExperienceModal from '@/components/portfolio/ExperienceModal.vue';
import { useProjectStore } from '@/stores/project';

const projects = ref([
  {
    id: "cmpgz1ulc0003pn3vmqh9f6l8",
    type: "project",
    title: "TaskFlow Board",
    date: "2026-05-11T23:00:00.000Z",
    description: "A collaborative project management dashboard that helps teams organize tasks, track progress, manage deadlines, and centralize project files in one visual workspace. It includes board and table views, task assignments, due dates, status labels, and progress tracking to make team coordination easier and more transparent.",
    visibleToEveryone: true,
    githubLink: "https://github.com/sweta-devnani/taskflow-board",
    technologies: ["Vue.js", "Pinia", "Express", "Prisma"],
    domains: ["Project Management", "Team Collaboration"],
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
    visibleToEveryone: true,
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

const authStore = useAuthStore();
const userId = computed(() => authStore.user?.utilisateur_id);

const projectStore = useProjectStore();

const isProjectModalOpen = ref(false);
const projectError = ref('');

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

function openProjectModal() {
	projectError.value = '';
	isProjectModalOpen.value = true;
}

function closeProjectModal() {
	isProjectModalOpen.value = false;
}

async function handleProjectSubmit(project) {
	projectError.value = '';

	try {
		const createdProject = await projectStore.createProject(project);
		project.value.unshift(createdProject);
		closeProjectModal();
	}
	catch(error) {
		projectError.value = error.response?.data?.message ||
		error.message ||
		'Failed to create project';
	}
}

const isQRModalOpen = ref(false);
function openQRModal() {
  isQRModalOpen.value = true;
}
</script>

<template>
	<div class="portfolio">
		<div class="portfolio__banner" />
		<main v-if="userId">
			<div class="profile">
				<div class="profile__photo">
					<img :src alt="photo">
					<button class="qr-button" @click="openQRModal">
						<QrCode :size="15" :stroke-width="2.3" />
						<span>generate QR code</span>
					</button>
				</div>
				<div class="profile__info">
					<h2 class="name">Elon Musk</h2>
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
					<Education :user-id="userId" />
					<Skills :user-id="userId" />
				</div>
			</div>
			<ProjectsSection
				:projects
				@add-project="openProjectModal"
			/>
		</main>
	</div>
	<QRcodeModal
    :open="isQRModalOpen"
	title="Your Portfolio QR Code"
    @close="isQRModalOpen = false"
  />

	<ExperienceModal
		:open="isProjectModalOpen"
		mode="create"
		type="project"
		:loading="projectStore.loading"
		:school-options="[]"
		:professor-emails="professorEmails"
		@close="closeProjectModal"
		@submit="handleProjectSubmit"
	/>
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
	display: flex;
	flex-direction: column;
	gap: calc(var(--space-xl) * 2);
	padding-block: 0 6rem;
	padding-inline: clamp(var(--space-md), 12vw, calc(var(--space-xl) * 5));
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
    padding-inline: var(--space-md);
  }
}
</style>