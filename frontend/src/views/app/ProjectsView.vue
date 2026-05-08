<script setup>
import api from '@/services/api';
import { computed, ref } from 'vue';
import {
  Award,
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  MapPin,
  Pencil,
  Plus,
  Tag,
  Trash2,
} from 'lucide-vue-next';
import Button from '@/components/common/Button.vue';
import ExperienceModal from '@/components/projects/ExperienceModal.vue';

const experienceTypes = [
  { value: 'project', label: 'Projects', singular: 'project' },
  { value: 'internship', label: 'Internships', singular: 'internship' },
  { value: 'activity', label: 'Activities', singular: 'activity' },
  { value: 'certificate', label: 'Certificates', singular: 'certificate' },
];

const typeMeta = {
  project: {
    label: 'Project',
    backendType: 'projet',
    icon: BriefcaseBusiness,
  },
  internship: {
    label: 'Internship',
    backendType: 'stage',
    icon: GraduationCap,
  },
  activity: {
    label: 'Activity',
    backendType: 'activite',
    icon: MapPin,
  },
  certificate: {
    label: 'Certificate',
    backendType: 'certification',
    icon: Award,
  },
};

const experiences = ref([
  {
    id: 1,
    type: 'project',
    title: 'Student portfolio',
    date: '2026-05-06',
    image: null,
    imagePreview: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1100&auto=format&fit=crop',
    description: 'A Vue portfolio for presenting academic work, web projects, skills, and achievements in a clean student profile.',
    githubLink: 'https://github.com/student/portfolio',
    youtubeLink: '',
    result: 'Published portfolio with project cards and profile sections.',
    role: 'Frontend developer',
    technologies: ['Vue.js', 'CSS', 'Node.js'],
    domains: ['Web', 'Portfolio'],
    isAcademic: false,
    institution: '',
    teacherEmail: '',
    visibleToEveryone: true,
  },
  {
    id: 2,
    type: 'project',
    title: 'Library dashboard',
    date: '2026-04-18',
    image: null,
    imagePreview: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1100&auto=format&fit=crop',
    description: 'A dashboard for managing books, borrowers, availability, late returns, and library activity statistics.',
    githubLink: 'https://github.com/student/library-dashboard',
    youtubeLink: '',
    result: 'Reduced manual tracking with a searchable dashboard.',
    role: 'Full-stack developer',
    technologies: ['Vue.js', 'Express', 'PostgreSQL'],
    domains: ['Education', 'Management'],
    isAcademic: true,
    institution: 'ENSA Tanger',
    teacherEmail: 'ahmed.elamrani@ensat.ac.ma',
    visibleToEveryone: false,
  },
  {
    id: 3,
    type: 'internship',
    title: 'Frontend internship at Atlas Digital',
    date: '2026-03-01',
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    duration: '92 days',
    image: null,
    imagePreview: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1100&auto=format&fit=crop',
    description: 'Contributed to an internal admin product and improved reusable Vue components.',
    missions: 'Built responsive views, fixed UI bugs, integrated REST endpoints, and documented frontend patterns.',
    report: 'internship-report-atlas.pdf',
    technologies: ['Vue.js', 'REST API', 'Figma'],
    domains: ['SaaS', 'Frontend'],
    isAcademic: true,
    institution: 'ENSA Tanger',
    teacherEmail: 'fatima.zahra@ensat.ac.ma',
    visibleToEveryone: true,
  },
  {
    id: 4,
    type: 'activity',
    title: 'Open source club hacknight',
    date: '2026-02-14',
    image: null,
    imagePreview: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1100&auto=format&fit=crop',
    description: 'Organized a club session for students to contribute to small open-source issues.',
    activityType: 'Club event',
    location: 'ENSA Tanger',
    club: 'Open Source Club',
    technologies: ['Git', 'GitHub', 'JavaScript'],
    domains: ['Community', 'Open Source'],
    visibleToEveryone: true,
  },
  {
    id: 5,
    type: 'certificate',
    title: 'Vue.js fundamentals certificate',
    date: '2026-01-20',
    image: null,
    imagePreview: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1100&auto=format&fit=crop',
    description: 'Completed a structured certification covering Vue components, reactivity, routing, and app organization.',
    document: 'vue-fundamentals-certificate.pdf',
    certificateUrl: 'https://example.com/certificates/vue-fundamentals',
    certificateCode: 'VUE-2026-ENSA-041',
    institution: 'Vue School',
    technologies: ['Vue.js'],
    domains: ['Frontend'],
    visibleToEveryone: true,
  },
]);

const selectedType = ref('project');
const isExperienceModalOpen = ref(false);
const isSubmittingExperience = ref(false);
const submitExperienceError = ref('');
const modalMode = ref('create');
const modalExperienceType = ref('project');
const selectedExperience = ref(null);

const currentTypeConfig = computed(() =>
  experienceTypes.find((type) => type.value === selectedType.value)
);

const filteredExperiences = computed(() =>
  experiences.value.filter((experience) => experience.type === selectedType.value)
);

const openAddExperienceModal = (type = selectedType.value) => {
  modalMode.value = 'create';
  modalExperienceType.value = type;
  selectedExperience.value = null;
  isExperienceModalOpen.value = true;
};

const openEditExperienceModal = (experience) => {
  modalMode.value = 'edit';
  modalExperienceType.value = experience.type;
  selectedExperience.value = experience;
  isExperienceModalOpen.value = true;
};

const closeExperienceModal = () => {
  isExperienceModalOpen.value = false;
  selectedExperience.value = null;
  modalMode.value = 'create';
};

const getImagePreview = (experience) => {
  if (experience.image) return URL.createObjectURL(experience.image);
  return experience.imagePreview || null;
};

const buildProjectFormData = (experience) => {
  const formData = new FormData();

  formData.append('projectTitle', experience.title);
  formData.append('projectDate', experience.date);
  formData.append('description', experience.description);
  formData.append('githubLink', experience.githubLink);
  formData.append('projetType', experience.isAcademic ? 'academique' : 'personnel');
  formData.append('professorEmail', experience.teacherEmail);
  formData.append('visibleToEveryone', String(experience.visibleToEveryone));
  formData.append('technologies', JSON.stringify(experience.technologies));
  formData.append('domains', JSON.stringify(experience.domains));

  if (experience.image) {
    formData.append('img', experience.image);
  }

  return formData;
};

const handleExperienceSubmit = async (experience) => {
  submitExperienceError.value = '';
  isSubmittingExperience.value = true;

  try {
    const experienceToSave = {
      ...experience,
      id: selectedExperience.value?.id ?? Date.now(),
      type: modalExperienceType.value,
      imagePreview: getImagePreview(experience),
    };

    if (modalMode.value === 'edit') {
      experiences.value = experiences.value.map((item) =>
        item.id === experienceToSave.id
          ? { ...item, ...experienceToSave }
          : item
      );
      closeExperienceModal();
      return;
    }

    if (experienceToSave.type === 'project') {
      await api.post('/add-projet', buildProjectFormData(experienceToSave), {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    experiences.value.unshift(experienceToSave);
    closeExperienceModal();
  }
  catch(error) {
    submitExperienceError.value = error.response?.data?.message || 'Failed to save experience';
  }
  finally {
    isSubmittingExperience.value = false;
  }
};

const deleteExperience = (experienceId) => {
  experiences.value = experiences.value.filter((experience) => experience.id !== experienceId);
};

const formatDateRange = (experience) => {
  if (experience.type === 'internship' && experience.startDate && experience.endDate) {
    return `${experience.startDate} - ${experience.endDate}`;
  }

  return experience.date;
};

const getPrimaryMeta = (experience) => {
  if (experience.type === 'project') {
    return experience.isAcademic ? 'Academic project' : 'Personal project';
  }

  if (experience.type === 'internship') {
    return experience.duration || 'Internship';
  }

  if (experience.type === 'activity') {
    return experience.activityType || 'Activity';
  }

  return experience.institution || 'Certificate';
};

const getSecondaryMeta = (experience) => {
  if (experience.type === 'project') return experience.role;
  if (experience.type === 'internship') return experience.institution;
  if (experience.type === 'activity') return experience.location;
  return experience.certificateCode;
};
</script>

<template>
  <section class="projects-page">
    <header class="projects-header">
      <div>
        <h1>Experiences</h1>
        <p>Projects, internships, activities, and certificates from your portfolio.</p>
      </div>

      <Button variant="submit" @click="openAddExperienceModal()">
        <Plus :size="16" />
        Add {{ currentTypeConfig?.singular }}
      </Button>
    </header>

    <div class="experience-tabs" role="tablist" aria-label="Experience type">
      <button
        v-for="type in experienceTypes"
        :key="type.value"
        type="button"
        class="experience-tab"
        :class="{ 'experience-tab--active': selectedType === type.value }"
        @click="selectedType = type.value"
      >
        {{ type.label }}
      </button>
    </div>

    <p v-if="submitExperienceError" class="submit-error">
      {{ submitExperienceError }}
    </p>

    <div class="experience-list">
      <article
        v-for="experience in filteredExperiences"
        :key="experience.id"
        class="experience-card"
      >
        <div class="experience-card__media">
          <img
            v-if="experience.imagePreview"
            :src="experience.imagePreview"
            :alt="experience.title"
          />
          <div v-else class="experience-card__placeholder">
            <component :is="typeMeta[experience.type].icon" :size="32" />
          </div>
        </div>

        <div class="experience-card__body">
          <div class="experience-card__heading">
            <div>
              <h2>{{ experience.title }}</h2>
              <div class="experience-card__meta">
                <span>
                  <CalendarDays :size="14" />
                  {{ formatDateRange(experience) }}
                </span>
                <span>
                  <Tag :size="14" />
                  {{ getPrimaryMeta(experience) }}
                </span>
                <span v-if="getSecondaryMeta(experience)">
                  {{ getSecondaryMeta(experience) }}
                </span>
              </div>
            </div>

            <span class="experience-card__type">
              {{ typeMeta[experience.type].label }}
            </span>
          </div>

          <p class="experience-card__description">
            {{ experience.description }}
          </p>

          <div class="experience-card__links">
            <a
              v-if="experience.githubLink"
              :href="experience.githubLink"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              v-if="experience.certificateUrl"
              :href="experience.certificateUrl"
              target="_blank"
              rel="noreferrer"
            >
              Certificate
            </a>
            <span>{{ experience.visibleToEveryone ? 'Public' : 'Private' }}</span>
          </div>

          <div class="experience-card__tags">
            <span
              v-for="technology in experience.technologies"
              :key="technology"
            >
              {{ technology }}
            </span>
            <span
              v-for="domain in experience.domains"
              :key="domain"
              class="experience-card__tag--domain"
            >
              {{ domain }}
            </span>
          </div>
        </div>

        <div class="experience-card__actions">
          <button
            class="icon-button"
            type="button"
            aria-label="Edit experience"
            @click="openEditExperienceModal(experience)"
          >
            <Pencil :size="15" />
          </button>

          <button
            class="icon-button icon-button--danger"
            type="button"
            aria-label="Delete experience"
            @click="deleteExperience(experience.id)"
          >
            <Trash2 :size="15" />
          </button>
        </div>
      </article>

      <div v-if="!filteredExperiences.length" class="empty-state">
        <p>No {{ currentTypeConfig?.label.toLowerCase() }} yet.</p>
      </div>
    </div>

    <ExperienceModal
      :mode="modalMode"
      :type="modalExperienceType"
      :initial-value="selectedExperience"
      :open="isExperienceModalOpen"
      :loading="isSubmittingExperience"
      @close="closeExperienceModal"
      @submit="handleExperienceSubmit"
    />
  </section>
</template>

<style scoped>
.projects-page {
  min-height: 100vh;
  padding: var(--space-xl);
}

.projects-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.projects-header h1 {
  margin: 0;
  color: var(--color-primary);
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  line-height: 1;
}

.projects-header p {
  margin: 0.5rem 0 0;
  color: var(--color-primary-hover);
  font-size: var(--font-size-sm);
}

.experience-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-bottom: var(--space-xl);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.1);
}

.experience-tab {
  position: relative;
  border: none;
  background: transparent;
  color: var(--color-primary-hover);
  cursor: pointer;
  font: inherit;
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  padding: 0.7rem 0.15rem;
}

.experience-tab::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: transparent;
  border-radius: 999px;
}

.experience-tab:hover,
.experience-tab:focus-visible,
.experience-tab--active {
  outline: none;
  color: var(--color-primary);
}

.experience-tab--active::after {
  background: var(--color-secondary);
}

.submit-error {
  margin: 0 0 var(--space-md);
  color: var(--color-error);
  font-size: var(--font-size-sm);
}

.experience-list {
  display: grid;
  gap: var(--space-lg);
}

.experience-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(16rem, 24rem) minmax(0, 1fr) auto;
  gap: var(--space-md);
  align-items: start;
}

.experience-card__media {
  overflow: hidden;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-md);
  background: rgba(var(--color-surface-rgb), 0.35);
}

.experience-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.experience-card__placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: rgba(var(--color-primary-rgb), 0.42);
}

.experience-card__body {
  min-width: 0;
  display: grid;
  gap: var(--space-sm);
  padding-top: 0.15rem;
}

.experience-card__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.experience-card h2 {
  margin: 0;
  color: var(--color-primary);
  font-size: clamp(1rem, 1.5vw, 1.3rem);
  line-height: 1.25;
}

.experience-card__type,
.experience-card__tags span {
  border-radius: 999px;
  padding: 0.25rem 0.55rem;
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  white-space: nowrap;
}

.experience-card__type {
  flex-shrink: 0;
}

.experience-card__meta,
.experience-card__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  color: var(--color-primary-hover);
  font-size: var(--font-size-xs);
  line-height: 1.4;
}

.experience-card__meta span,
.experience-card__links span {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.experience-card__description {
  margin: 0;
  color: var(--color-primary-hover);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.experience-card__links a {
  color: var(--color-secondary);
  font-weight: var(--font-medium);
  text-decoration: none;
}

.experience-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.experience-card__tags .experience-card__tag--domain {
  background: rgba(245, 158, 11, 0.12);
  color: rgb(180, 83, 9);
}

.experience-card__actions {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: var(--space-sm);
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.7);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.icon-button:hover,
.icon-button:focus-visible {
  outline: none;
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: var(--color-secondary);
}

.icon-button--danger:hover,
.icon-button--danger:focus-visible {
  background: rgba(var(--color-error-rgb), 0.08);
  color: var(--color-error);
}

.empty-state {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg);
  border: 1px dashed rgba(var(--color-primary-rgb), 0.18);
  border-radius: var(--radius-lg);
  color: var(--color-primary-hover);
}

.empty-state p {
  margin: 0;
  font-size: var(--font-size-sm);
}

@media (max-width: 900px) {
  .experience-card {
    grid-template-columns: minmax(13rem, 18rem) minmax(0, 1fr);
  }

  .experience-card__actions {
    grid-column: 2;
    justify-content: flex-start;
  }
}

@media (max-width: 700px) {
  .projects-page {
    padding: var(--space-md);
  }

  .projects-header {
    flex-direction: column;
  }

  .experience-card {
    grid-template-columns: 1fr;
  }

  .experience-card__actions {
    grid-column: auto;
  }
}
</style>
