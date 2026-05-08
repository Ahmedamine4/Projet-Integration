<script setup>
import api from '@/services/api';
import { ref } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import Button from '@/components/common/Button.vue';
import Card from '@/components/common/Card.vue';
import AddProjectModal from '@/components/projects/AddProjectModal.vue';

const isAddProjectModalOpen = ref(false);
const isSubmittingProject = ref(false);
const submitProjectError = ref('');

const projects = ref([
  {
    id: 1,
    projectTitle: 'Student portfolio',
    projectDate: '2026-05-06',
    projectImage: null,
    projectImagePreview: null,
    description: 'A personal portfolio for presenting academic and web projects.',
    githubLink: 'https://github.com/student/portfolio',
    technologies: ['Vue.js', 'CSS'],
    domains: ['Web'],
    projectType: 'personnel',
    visibleToEveryone: true,
  },
  {
    id: 2,
    projectTitle: 'Library dashboard',
    projectDate: '2026-04-18',
    projectImage: null,
    projectImagePreview: null,
    description: 'A simple dashboard for tracking library books and borrowing status.',
    githubLink: 'https://github.com/student/library-dashboard',
    technologies: ['Vue.js', 'API'],
    domains: ['Education'],
    projectType: 'academique',
    visibleToEveryone: false,
  },
]);

const openAddProjectModal = () => {
  isAddProjectModalOpen.value = true;
};

const closeAddProjectModal = () => {
  isAddProjectModalOpen.value = false;
};

const handleProjectSubmit = async (project) => {
  submitProjectError.value = '';
  isSubmittingProject.value = true;

  try {
    const projectImagePreview = project.projectImage
      ? URL.createObjectURL(project.projectImage)
      : null;
    
    const formData = new FormData();

    ['projectTitle', 'projectDate', 'description', 'githubLink']
      .forEach(key => formData.append(key, project[key]));
    formData.append('projetType', project.projectType);
    formData.append('professorEmail', project.teacherEmail);
    formData.append('visibleToEveryone', String(project.visibleToEveryone));
    formData.append('technologies', JSON.stringify(project.technologies));
    formData.append('domains', JSON.stringify(project.domains));
    if (project.projectImage) {
      formData.append('img', project.projectImage);
    }

    await api.post('/add-projet', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    projects.value.unshift({
      id: Date.now(),
      ...project,
      projectImagePreview,
    });

    closeAddProjectModal();
  }
  catch(error) {
    submitProjectError.value = error.response?.data?.message || 'Failed to create project';
  }
  finally {
    isSubmittingProject.value = false;
  }
};

const deleteProject = (projectId) => {
  projects.value = projects.value.filter((project) => project.id !== projectId);
};
</script>

<template>
  <section class="projects-page">
    <header class="projects-header">
      <div>
        <h1>Projects</h1>
      </div>

      <Button variant="submit" @click="openAddProjectModal">
        <Plus :size="16" />
        Add project
      </Button>
    </header>

    <div class="projects-list">
      <Card
        v-for="project in projects"
        :key="project.id"
        class="project-card"
        full-width
      >
        <div class="project-card__main">
          <img
            v-if="project.projectImagePreview"
            class="project-card__image"
            :src="project.projectImagePreview"
            :alt="project.projectTitle"
          />
          <div class="project-card__content">
            <div class="project-card__title-row">
              <h2>{{ project.projectTitle }}</h2>
              <span class="project-card__type">
                {{ project.projectType }}
              </span>
            </div>

            <p class="project-card__date">{{ project.projectDate }}</p>
            <p class="project-card__description">{{ project.description }}</p>

            <div class="project-card__meta">
              <a :href="project.githubLink" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <span>
                {{ project.visibleToEveryone ? 'Public' : 'Private' }}
              </span>
            </div>

            <div class="project-card__tags">
              <span
                v-for="technology in project.technologies"
                :key="technology"
              >
                {{ technology }}
              </span>
            </div>
          </div>

          <div class="project-card__actions">
            <button
              class="icon-button icon-button--danger"
              type="button"
              aria-label="Delete project"
              @click="deleteProject(project.id)"
            >
              <Trash2 :size="15" />
            </button>
          </div>
        </div>
      </Card>

      <div v-if="!projects.length" class="empty-state">
        <p>No projects yet.</p>
      </div>
    </div>

    <AddProjectModal
      :open="isAddProjectModalOpen"
      :loading="isSubmittingProject"
      @close="closeAddProjectModal"
      @submit="handleProjectSubmit"
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
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.projects-header h1 {
  margin: 0;
  color: var(--color-primary);
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  line-height: 1;
}

.projects-list {
  display: grid;
  gap: var(--space-md);
}

.project-card {
  padding: var(--space-lg);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  border-radius: var(--radius-lg);
  background: var(--color-background);
  box-shadow: 0 12px 28px rgba(var(--color-primary-rgb), 0.06);
}

.project-card__main {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--space-md);
  align-items: start;
}

.project-card__content {
  display: grid;
  gap: var(--space-sm);
  min-width: 0;
}

.project-card__image {
  width: 8rem;
  height: 6rem;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
}

.project-card__title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.project-card h2 {
  margin: 0;
  color: var(--color-primary);
  font-size: var(--font-size-lg);
  line-height: 1.2;
}

.project-card__type,
.project-card__tags span {
  border-radius: 999px;
  padding: 0.25rem 0.55rem;
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
}

.project-card__date,
.project-card__description,
.project-card__meta {
  margin: 0;
  color: var(--color-primary-hover);
  font-size: var(--font-size-sm);
  line-height: 1.45;
}

.project-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.project-card__meta a {
  color: var(--color-secondary);
  font-weight: var(--font-medium);
  text-decoration: none;
}

.project-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.project-card__actions {
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

@media (max-width: 700px) {
  .projects-page {
    padding: var(--space-md);
  }

  .projects-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .project-card__main {
    grid-template-columns: 1fr;
  }

  .project-card__actions {
    justify-content: flex-start;
  }
}
</style>
