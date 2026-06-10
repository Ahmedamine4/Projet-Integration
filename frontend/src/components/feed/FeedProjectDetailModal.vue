<script setup>
import { Github, MessageCircle, Star, X } from 'lucide-vue-next';

defineProps({
  project: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close']);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="project"
      class="project-backdrop"
      @click.self="emit('close')"
    >
      <article class="project-modal">
        <button
          type="button"
          class="close-button"
          aria-label="Close"
          @click="emit('close')"
        >
          <X :size="18" />
        </button>

        <img
          v-if="project.imagePreview"
          class="project-image"
          :src="project.imagePreview"
          :alt="project.title"
        >

        <div class="project-content">
          <div class="project-header">
            <span
              v-if="project.feedReason"
              class="project-reason"
            >
              {{ project.feedReason }}
            </span>

            <h2>{{ project.title }}</h2>

            <p class="project-meta">
              {{ project.studentName }} · {{ project.schoolName }}
            </p>
          </div>

          <p class="project-description">
            {{ project.description }}
          </p>

          <div
            v-if="project.technologies?.length"
            class="tag-list"
          >
            <span
              v-for="tech in project.technologies"
              :key="tech"
            >
              {{ tech }}
            </span>
          </div>

          <div
            v-if="project.domains?.length"
            class="tag-list domains"
          >
            <span
              v-for="domain in project.domains"
              :key="domain"
            >
              {{ domain }}
            </span>
          </div>

          <div class="project-stats">
            <div>
              <Star :size="15" />
              <span>{{ project.recommendationsCount || 0 }} recommendations</span>
            </div>

            <div>
              <MessageCircle :size="15" />
              <span>{{ project.commentsCount || 0 }} comments</span>
            </div>

            <div>
              <Github :size="15" />
              <span>{{ project.githubReposCount || 0 }} repositories</span>
            </div>
          </div>

          <div class="score-box">
            <span>Credibility score</span>
            <strong>{{ project.credibilityScore || '-' }}</strong>
          </div>
        </div>
      </article>
    </div>
  </Teleport>
</template>

<style scoped>
.project-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: grid;
  place-items: center;
  padding: var(--space-lg);
  background: rgba(var(--color-primary-rgb), 0.34);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.project-modal {
  position: relative;
  width: min(100%, 44rem);
  max-height: min(92vh, 48rem);
  overflow-y: auto;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  background: rgba(var(--color-surface-rgb), 0.98);
  box-shadow: 0 24px 70px rgba(var(--color-primary-rgb), 0.24);
}

.close-button {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  z-index: 2;
  width: 2.1rem;
  height: 2.1rem;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 999px;
  background: rgba(var(--color-surface-rgb), 0.9);
  color: rgba(var(--color-primary-rgb), 0.7);
  cursor: pointer;
}

.project-image {
  display: block;
  width: 100%;
  height: 15rem;
  object-fit: cover;
}

.project-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg);
}

.project-header {
  display: grid;
  gap: var(--space-xs);
}

.project-reason {
  width: fit-content;
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: rgba(var(--color-secondary-rgb), 0.95);
  font-size: 10px;
  font-weight: var(--font-bold);
}

.project-header h2 {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.96);
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
  line-height: 1.2;
}

.project-meta {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.55);
  font-size: var(--font-size-xs);
}

.project-description {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.68);
  font-size: var(--font-size-sm);
  line-height: 1.65;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-list span {
  padding: 0.22rem 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.09);
  background: rgba(var(--color-background-rgb), 0.58);
  color: rgba(var(--color-primary-rgb), 0.62);
  font-size: 10px;
  font-weight: var(--font-medium);
}

.tag-list.domains span {
  border-color: rgba(var(--color-secondary-rgb), 0.14);
  background: rgba(var(--color-secondary-rgb), 0.07);
  color: rgba(var(--color-secondary-rgb), 0.92);
}

.project-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.project-stats div {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.4rem 0.65rem;
  border-radius: 999px;
  background: rgba(var(--color-background-rgb), 0.65);
  color: rgba(var(--color-primary-rgb), 0.62);
  font-size: 10px;
  font-weight: var(--font-semibold);
}

.score-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-lg);
  background: rgba(var(--color-secondary-rgb), 0.08);
  color: rgba(var(--color-primary-rgb), 0.72);
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);
}

.score-box strong {
  color: rgba(var(--color-secondary-rgb), 0.96);
  font-size: var(--font-size-md);
}

@media (max-width: 640px) {
  .project-backdrop {
    padding: var(--space-sm);
  }

  .project-image {
    height: 11rem;
  }

  .project-content {
    padding: var(--space-md);
  }
}
</style>