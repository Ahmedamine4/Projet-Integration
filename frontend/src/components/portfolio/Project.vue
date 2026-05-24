<script setup>
import { ArrowUpRight } from 'lucide-vue-next';

defineProps({
  project: {
    type: Object,
    required: true,
  },
  canEdit: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['edit']);

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <article 
    class="project-card"
    :class="{ 'project-card--editable': canEdit }"
    @dblclick="canEdit && emit('edit', project)"
  >
    <div class="project-preview">
      <img
        v-if="project.imagePreview"
        :src="project.imagePreview"
        :alt="project.title ? `${project.title} image` : 'Project image'"
        draggable="false"
      />
    </div>
    <div class="project-content">
      <div class="project-header">
        <h3>{{ project.title }}</h3>
        <span>{{ formatDate(project.date) }}</span>
      </div>

      <p>{{ project.description }}</p>
      <div class="project-meta">
        <div v-if="project.technologies?.length" class="project-tags">
          <span
            v-for="technology in project.technologies.slice(0, 3)"
            :key="technology"
          >
            {{ technology }}
          </span>

          <span v-if="project.technologies?.length > 3">
            +{{ project.technologies.length - 3 }}
          </span>
        </div>

        <div v-if="project.domains?.length" class="project-tags">
          <span v-for="domain in project.domains.slice(0, 2)" :key="domain">
            {{ domain }}
          </span>
          <span v-if="project.domains?.length > 2">
            +{{ project.domains.length - 2 }}
          </span>
        </div>
      </div>
      <div class="project-footer">
        <a
          v-if="project.githubLink"
          class="project-button"
          :href="project.githubLink"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Explore project</span>
          <ArrowUpRight :size="14" />
        </a>

        <span
          v-if="canEdit"
          class="project-edit-hint"
        >
          Double-click to edit
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.project-card {
  --border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  flex-shrink: 0;
  flex-grow: 0;
  width: min(100%, 26rem);
  display: flex;
  flex-direction: column;
  background-color: rgba(var(--color-surface-rgb), 0.3);
  border-radius: var(--radius-lg);
  border: var(--border);
  box-shadow: 0 10px 16px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  user-select: none;
  transition:
    transform var(--transition-normal),
    box-shadow var(--transition-normal);
}

.project-card:hover {
  transform: scale(1.008);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.06);
}

.project-preview {
  aspect-ratio: 16 / 9;
  flex-grow: 0;
  flex-shrink: 0;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    rgba(var(--color-secondary-rgb), 0.14),
    rgba(var(--color-primary-rgb), 0.05)
  );
  border-bottom: var(--border);
}

.project-preview img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  pointer-events: none;
  -webkit-user-drag: none;
}

.project-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
}

.project-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.project-header h3 {
  min-width: 0;
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
  line-height: 1.2;
  overflow-wrap: anywhere;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-header span {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  color: rgba(var(--color-primary-rgb), 0.68);
}

.project-content p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: rgba(var(--color-primary-rgb), 0.87);
  line-height: 1.5;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.project-tags span {
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  background-color: rgba(var(--color-surface-rgb), 0.36);
  color: rgba(var(--color-primary-rgb), 0.46);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  line-height: 1;
}

.project-meta {
  display: grid;
  gap: var(--space-sm);
  margin-top: auto;
}

.project-button {
  --button-size: 2rem;
  --icon-size: 14px;
  --icon-center-offset: calc((var(--button-size) - var(--icon-size)) / 2);
  --label-width: 5.8rem;
  --expanded-button-width: calc(
    var(--button-size) + var(--label-width) + var(--icon-center-offset)
  );
  display: inline-flex;
  width: var(--button-size);
  height: var(--button-size);
  align-items: center;
  justify-content: center;
  gap: 0;
  overflow: hidden;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-secondary-rgb), 0.14);
  background-color: rgba(var(--color-secondary-rgb), 0.08);
  color: var(--color-secondary);
  text-decoration: none;
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  transition:
    width var(--transition-normal),
    gap var(--transition-fast),
    padding-inline var(--transition-normal),
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    transform var(--transition-fast);
}

.project-button span {
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  white-space: nowrap;
  transition:
    max-width var(--transition-normal),
    opacity var(--transition-fast);
}

.project-button svg {
  flex-shrink: 0;
}

.project-button:is(:hover, :focus-visible) {
  width: var(--expanded-button-width);
  justify-content: center;
  gap: var(--icon-center-offset);
  padding-inline: 0.8rem var(--icon-center-offset);
  outline: none;
  border-color: rgba(var(--color-secondary-rgb), 0.16);
  background-color: rgba(var(--color-secondary-rgb), 0.14);
  transform: translateY(-1px);
}

.project-button:is(:hover, :focus-visible) span {
  max-width: var(--label-width);
  opacity: 1;
}

.project-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.project-edit-hint {
  margin-left: auto;
  color: rgba(var(--color-primary-rgb), 0.48);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  white-space: nowrap;
  cursor: pointer;
}
</style>
