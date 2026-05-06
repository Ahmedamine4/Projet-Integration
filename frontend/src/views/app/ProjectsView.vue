<script setup>
import { ref } from 'vue';
import { Edit3, Plus, Trash2 } from 'lucide-vue-next';
import Button from '@/components/common/Button.vue';
import Card from '@/components/common/Card.vue';
import Input from '@/components/common/Input.vue';
import DatePicker from '@/components/common/DatePicker.vue';
import AddProjectModal from '@/components/projects/AddProjectModal.vue';

const isAddProjectModalOpen = ref(false);
const editingProjectId = ref(null);

const projects = ref([
  {
    id: 1,
    projectTitle: 'Student portfolio',
    projectDate: '2026-05-06',
    description: 'A personal portfolio for presenting academic and web projects.',
    githubLink: 'https://github.com/student/portfolio',
    technologies: ['Vue.js', 'CSS'],
    domains: ['Web'],
    projectType: 'personal',
    visibleToEveryone: true,
  },
  {
    id: 2,
    projectTitle: 'Library dashboard',
    projectDate: '2026-04-18',
    description: 'A simple dashboard for tracking library books and borrowing status.',
    githubLink: 'https://github.com/student/library-dashboard',
    technologies: ['Vue.js', 'API'],
    domains: ['Education'],
    projectType: 'certified',
    visibleToEveryone: false,
  },
]);

const editDraft = ref({
  projectTitle: '',
  projectDate: '',
  description: '',
  githubLink: '',
});

const openAddProjectModal = () => {
  isAddProjectModalOpen.value = true;
};

const closeAddProjectModal = () => {
  isAddProjectModalOpen.value = false;
};

const handleProjectSubmit = (project) => {
  projects.value.unshift({
    id: Date.now(),
    ...project,
  });
  closeAddProjectModal();
};

const startEdit = (project) => {
  editingProjectId.value = project.id;
  editDraft.value = {
    projectTitle: project.projectTitle,
    projectDate: project.projectDate,
    description: project.description,
    githubLink: project.githubLink,
  };
};

const cancelEdit = () => {
  editingProjectId.value = null;
};

const saveEdit = (projectId) => {
  projects.value = projects.value.map((project) => {
    if (project.id !== projectId) return project;

    return {
      ...project,
      ...editDraft.value,
    };
  });

  cancelEdit();
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
        <template v-if="editingProjectId === project.id">
          <div class="project-edit">
            <Input
              v-model="editDraft.projectTitle"
              label="Project title"
              placeholder="Project title"
            />

            <DatePicker
              v-model="editDraft.projectDate"
              label="Project date"
              placeholder="Select project date"
            />

            <Input
              v-model="editDraft.githubLink"
              label="GitHub link"
              type="url"
              placeholder="https://github.com/username/project-name"
            />

            <div class="project-edit__field">
              <label for="edit-description">Description</label>
              <textarea
                id="edit-description"
                v-model="editDraft.description"
                placeholder="Describe your project"
              />
            </div>

            <div class="project-card__actions">
              <Button variant="ghost" type="button" @click="cancelEdit">
                Cancel
              </Button>
              <Button variant="submit" type="button" @click="saveEdit(project.id)">
                Save
              </Button>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="project-card__main">
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
                class="icon-button"
                type="button"
                aria-label="Edit project"
                @click="startEdit(project)"
              >
                <Edit3 :size="15" />
              </button>

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
        </template>
      </Card>

      <div v-if="!projects.length" class="empty-state">
        <p>No projects yet.</p>
      </div>
    </div>

    <AddProjectModal
      v-if="isAddProjectModalOpen"
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
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-md);
}

.project-card__content {
  display: grid;
  gap: var(--space-sm);
  min-width: 0;
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

.project-edit {
  display: grid;
  gap: var(--space-md);
}

.project-edit__field {
  display: grid;
  gap: var(--space-xs);
}

.project-edit__field label {
  color: var(--color-primary-hover);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

textarea {
  width: 100%;
  min-height: 6.5rem;
  resize: vertical;
  border: 1px solid rgba(var(--color-primary-rgb), 0.18);
  border-radius: 0.8rem;
  padding: 0.75rem;
  background: rgba(var(--color-surface-rgb), 0.32);
  color: var(--color-primary);
  font-family: var(--font-ui);
  font-size: var(--font-size-sm);
}

textarea:focus {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.15);
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
