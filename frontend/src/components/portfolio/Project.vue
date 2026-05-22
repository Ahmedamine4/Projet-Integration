<script setup>
import { ArrowUpRight } from 'lucide-vue-next';

defineProps({
  project: {
    type: Object,
    required: true,
  }
});

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <article class="project-card">
    <div class="project-preview">
      <img
        v-if="project.imagePreview"
        :src="project.imagePreview"
        :alt="project.title ? `${project.title} image` : 'Project image'"
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

      <a
        v-if="project.githubLink"
        class="project-link"
        :href="project.githubLink"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>Explore project</span>
        <ArrowUpRight :size="14" />
      </a>
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
}

.project-content {
  display: grid;
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
  line-clamp: 4;
  -webkit-line-clamp: 4;
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
}

.project-link {
  display: flex;
  width: fit-content;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-secondary);
  text-decoration: underline;
  transition:
    color var(--transition-fast),
    transform var(--transition-fast);
}

.project-link span {
  font-size: var(--font-size-xs);
}

.project-link:is(:hover, :focus-visible) {
  outline: none;
  color: color-mix(
    in srgb,
    var(--color-secondary) 58%,
    red    
  );
  transform: translateY(-1px);
}
</style>
