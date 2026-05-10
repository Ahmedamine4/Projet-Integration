<script setup>
import { computed, ref } from 'vue';
import { Pencil, Plus, Trash2 } from 'lucide-vue-next';
import Button from '@/components/common/Button.vue';
import ExperienceModal from '@/components/portfolio/ExperienceModal.vue';

import { getFilePreview, buildProjectFormData } from '@/utils/ExperienceUtils';
import api from '@/services/api';

const experienceTypes = [
  { value: 'project', label: 'Projects', singular: 'project' },
  { value: 'internship', label: 'Internships', singular: 'internship' },
  { value: 'activity', label: 'Activities', singular: 'activity' },
  { value: 'certificate', label: 'Certificates', singular: 'certificate' },
];

const experiences = ref([
  {
    id: 1,
    type: 'project',
    title: 'Portfolio Website',
    date: '2026-04-15',
    description: 'A personal portfolio built with Vue.',
    githubLink: 'https://github.com/example/portfolio',
    teacherEmail: 'teacher@example.com',
    isAcademic: true,
    visibleToEveryone: true,
    technologies: ['Vue.js', 'CSS', 'Axios'],
    domains: ['Web Development', 'Frontend'],
    imagePreview: '',
  },
  {
    id: 2,
    type: 'internship',
    title: 'Frontend Internship',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    description: 'Worked on UI components and API integration.',
    institution: 'Tech Company',
    location: 'Casablanca',
    missions: 'Built reusable Vue components.',
    technologies: ['Vue.js', 'JavaScript'],
    domains: ['Frontend'],
    imagePreview: '',
  },
  {
    id: 3,
    type: 'certificate',
    title: 'Vue Basics Certificate',
    date: '2026-02-10',
    description: 'Completed a Vue.js fundamentals course.',
    certificateURL: 'https://example.com/certificate',
    certificateCode: 'VUE-123',
    institution: 'Online Academy',
    technologies: ['Vue.js'],
    domains: ['Web Development'],
    imagePreview: '',
  },
  {
    id: 4,
    type: 'activity',
    title: 'Coding Club Workshop',
    date: '2026-03-20',
    description: 'Organized and presented a workshop about building small Vue applications.',
    activityType: 'Workshop',
    location: 'University Campus',
    club: 'Coding Club',
    technologies: ['Vue.js', 'JavaScript'],
    domains: ['Community', 'Web Development'],
    imagePreview: '',
  },
]);

const selectedType = ref('project');
const modalMode = ref('create');
const modalExperienceType = ref('project');
const selectedExperience = ref(null);
const isExperienceModalOpen = ref(false);
const isSubmittingExperience = ref(false);
const submitExperienceError = ref('');

const currentTypeConfig = computed(() =>
  experienceTypes.find((type) => type.value === selectedType.value)
);

const filteredExperiences = computed(() =>
  experiences.value.filter((experience) => experience.type === selectedType.value)
);

function openAddExperienceModal() {
  modalMode.value = 'create';
  modalExperienceType.value = selectedType.value;
  selectedExperience.value = null;
  isExperienceModalOpen.value = true;
}

function openEditExperienceModal(experience) {
  modalMode.value = 'edit';
  modalExperienceType.value = experience.type;
  selectedExperience.value = experience;
  isExperienceModalOpen.value = true;
}

function closeExperienceModal() {
  isExperienceModalOpen.value = false;
  selectedExperience.value = null;
  modalMode.value = 'create';
}

function deleteExperience(experienceId) {
  experiences.value = experiences.value.filter((experience) => experience.id !== experienceId);
}

function formatDate(experience) {
  if (experience.type === 'internship' && experience.startDate && experience.endDate) {
    return `${experience.startDate} to ${experience.endDate}`;
  }

  return experience.date || 'No date';
}

function getDetails(experience) {
  return [
    experience.githubLink && `GitHub: ${experience.githubLink}`,
    experience.certificateURL && `Certificate: ${experience.certificateURL}`,
    experience.certificateCode && `Code: ${experience.certificateCode}`,
    experience.institution && `Institution: ${experience.institution}`,
    experience.activityType && `Activity type: ${experience.activityType}`,
    experience.location && `Location: ${experience.location}`,
    experience.club && `Club: ${experience.club}`,
    experience.missions && `Missions: ${experience.missions}`,
    experience.report && `Report: ${experience.report}`,
    experience.teacherEmail && `Teacher: ${experience.teacherEmail}`,
    experience.visibleToEveryone ? 'Public' : 'Private',
  ].filter(Boolean);
}

async function handleExperienceSubmit(experience) {
  submitExperienceError.value = '';
  isSubmittingExperience.value = true;

  try {
    const experienceToSave = {
      ...experience,
      id: selectedExperience.value?.id ?? Date.now(),
      type: modalExperienceType.value,
      imagePreview: getFilePreview(experience.image) || selectedExperience.value?.imagePreview || '',
    };

    if (modalMode.value === 'edit') {
      experiences.value = experiences.value.map((item) =>
        item.id === experienceToSave.id ? experienceToSave : item
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
}
</script>

<template>
  <section class="projects-page">
    <header class="projects-header">
      <div>
        <h1>Experience Modal Test</h1>
        <p>Select a type, open the modal, submit, edit, and inspect the saved payload.</p>
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
        <img
          v-if="experience.imagePreview"
          class="experience-card__image"
          :src="experience.imagePreview"
          :alt="experience.title"
        />

        <div class="experience-card__body">
          <div class="experience-card__header">
            <div>
              <h2>{{ experience.title }}</h2>
              <p>{{ formatDate(experience) }}</p>
            </div>

            <span>{{ experience.type }}</span>
          </div>

          <p class="experience-card__description">
            {{ experience.description }}
          </p>

          <div class="experience-card__details">
            <span
              v-for="detail in getDetails(experience)"
              :key="detail"
            >
              {{ detail }}
            </span>
          </div>

          <div class="experience-card__tags">
            <span
              v-for="technology in experience.technologies"
              :key="`tech-${technology}`"
            >
              {{ technology }}
            </span>
            <span
              v-for="domain in experience.domains"
              :key="`domain-${domain}`"
            >
              {{ domain }}
            </span>
          </div>
        </div>

        <div class="experience-card__actions">
          <button
            type="button"
            aria-label="Edit experience"
            @click="openEditExperienceModal(experience)"
          >
            <Pencil :size="15" />
          </button>

          <button
            type="button"
            aria-label="Delete experience"
            @click="deleteExperience(experience.id)"
          >
            <Trash2 :size="15" />
          </button>
        </div>
      </article>

      <p v-if="!filteredExperiences.length" class="empty-state">
        No {{ currentTypeConfig?.label.toLowerCase() }} yet.
      </p>
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
  font-size: 1.8rem;
  line-height: 1.1;
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
  margin-bottom: var(--space-lg);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.1);
}

.experience-tab {
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--color-primary-hover);
  cursor: pointer;
  font: inherit;
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  padding: 0.7rem 0.25rem;
}

.experience-tab:hover,
.experience-tab:focus-visible,
.experience-tab--active {
  outline: none;
  color: var(--color-primary);
  border-bottom-color: var(--color-secondary);
}

.experience-list {
  display: grid;
  gap: var(--space-md);
}

.experience-card {
  display: grid;
  grid-template-columns: minmax(0, 8rem) minmax(0, 1fr) auto;
  gap: var(--space-md);
  align-items: start;
  padding-bottom: var(--space-md);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.experience-card__image {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.submit-error {
  margin: 0 0 var(--space-md);
  color: var(--color-error);
  font-size: var(--font-size-sm);
}

.experience-card__body {
  display: grid;
  gap: var(--space-sm);
  min-width: 0;
}

.experience-card__header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
}

.experience-card__header h2 {
  margin: 0;
  color: var(--color-primary);
  font-size: 1rem;
}

.experience-card__header p,
.experience-card__description {
  margin: 0;
  color: var(--color-primary-hover);
  font-size: var(--font-size-sm);
  line-height: 1.45;
}

.experience-card__header span,
.experience-card__details span,
.experience-card__tags span {
  width: fit-content;
  border-radius: 999px;
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  padding: 0.25rem 0.55rem;
}

.experience-card__details,
.experience-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.experience-card__details span {
  max-width: 100%;
  overflow-wrap: anywhere;
}

.experience-card__actions {
  display: flex;
  gap: var(--space-xs);
}

.experience-card__actions button {
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
}

.experience-card__actions button:hover,
.experience-card__actions button:focus-visible {
  outline: none;
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: var(--color-secondary);
}

.empty-state {
  margin: 0;
  padding: var(--space-lg);
  border: 1px dashed rgba(var(--color-primary-rgb), 0.18);
  border-radius: var(--radius-md);
  color: var(--color-primary-hover);
  font-size: var(--font-size-sm);
}

@media (max-width: 700px) {
  .projects-page {
    padding: var(--space-md);
  }

  .projects-header,
  .experience-card {
    grid-template-columns: 1fr;
  }

  .experience-card__image {
    max-height: 11rem;
  }

  .projects-header {
    flex-direction: column;
  }
}
</style>
