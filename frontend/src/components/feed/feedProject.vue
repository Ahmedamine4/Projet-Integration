<script setup>
import ExploreButton from '@/components/portfolio/shared/ExploreButton.vue';

defineProps({
  project: {
    type: Object,
    required: true,
  },
});

const DESCRIPTION_LIMIT = 300;

function formatDate(date) {
  if (!date) return '';

  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function getStudentName(project) {
  return project.student?.name || project.studentName || 'Unknown student';
}

function getSchoolName(project) {
  return project.student?.school || project.schoolName || 'Unknown school';
}

function getProjectDescription(project) {
  if (!project.description) return '';

  if (project.description.length <= DESCRIPTION_LIMIT) {
    return project.description;
  }

  return `${project.description.slice(0, DESCRIPTION_LIMIT).trim()}...`;
}

function hasDescription(project) {
  return Boolean(project.description?.trim());
}

function hasCredibilityScore(project) {
  return project.credibilityScore !== undefined && project.credibilityScore !== null;
}
</script>

<template>
  <article class="feed-project-card">
    <div class="project-preview">
      <img
        v-if="project.imagePreview"
        :src="project.imagePreview"
        :alt="project.title ? `${project.title} image` : 'Project image'"
        draggable="false"
      >

      <div
        v-else
        class="project-preview-placeholder"
      >
        Project preview
      </div>
    </div>

    <div class="project-content">
      <div class="project-owner">
        <div class="project-owner-avatar">
          {{ getStudentName(project).charAt(0) }}
        </div>

        <div class="project-owner-info">
          <span class="project-owner-name">
            {{ getStudentName(project) }}
          </span>

          <span class="project-owner-school">
            {{ getSchoolName(project) }}
            <template v-if="project.feedReason">
              · {{ project.feedReason }}
            </template>
          </span>
        </div>
      </div>

      <div class="project-header">
        <div class="project-title-area">
          <h3>{{ project.title }}</h3>

          <span
            v-if="hasCredibilityScore(project)"
            class="project-score"
          >
            Score {{ project.credibilityScore }}/100
          </span>
        </div>

        <span
          v-if="project.date"
          class="project-date"
        >
          {{ formatDate(project.date) }}
        </span>
      </div>

      <div class="project-badges">
        <span
          v-if="project.isVerified"
          class="project-badge project-badge--verified"
        >
          Verified by institution
        </span>
      </div>

      <p
        v-if="hasDescription(project)"
        class="project-description"
      >
        {{ getProjectDescription(project) }}
      </p>

      <div class="project-meta">
        <div
          v-if="project.technologies?.length"
          class="project-tags"
        >
          <span
            v-for="technology in project.technologies.slice(0, 4)"
            :key="technology"
          >
            {{ technology }}
          </span>

          <span v-if="project.technologies.length > 4">
            +{{ project.technologies.length - 4 }}
          </span>
        </div>

        <div
          v-if="project.domains?.length"
          class="project-tags"
        >
          <span
            v-for="domain in project.domains.slice(0, 3)"
            :key="domain"
          >
            {{ domain }}
          </span>

          <span v-if="project.domains.length > 3">
            +{{ project.domains.length - 3 }}
          </span>
        </div>
      </div>

      <div class="project-stats">
        <span>{{ project.recommendationsCount || 0 }} recommendations</span>
        <span>{{ project.commentsCount || 0 }} comments</span>
        <span>{{ project.githubReposCount || 0 }} GitHub repos</span>
      </div>

      <div class="project-footer">
        <ExploreButton experience-type="project" />

        <div class="project-actions">
          <button
            type="button"
            class="project-action"
          >
            View portfolio
          </button>

          <button
            type="button"
            class="project-action project-action--primary"
          >
            Recommend
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.feed-project-card {
  --border: 1px solid rgba(var(--color-primary-rgb), 0.08);

  position: relative;
  width: 100%;
  min-height: 18rem;
  display: flex;
  overflow: hidden;
  border: var(--border);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(
      135deg,
      rgba(var(--color-surface-rgb), 0.6),
      rgba(var(--color-secondary-rgb), 0.05)
    );
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.065);
  transition:
    transform var(--transition-normal),
    box-shadow var(--transition-normal);
}

.feed-project-card::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  z-index: 2;
  width: 0.25rem;
  background-color: rgba(var(--color-secondary-rgb), 0.7);
}

.feed-project-card:hover {
  transform: scale(1.004);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.085);
}

.project-preview {
  width: clamp(18rem, 32vw, 27rem);
  flex-shrink: 0;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    rgba(var(--color-secondary-rgb), 0.16),
    rgba(var(--color-primary-rgb), 0.06)
  );
  border-right: var(--border);
}

.project-preview img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  pointer-events: none;
  -webkit-user-drag: none;
}

.project-preview-placeholder {
  width: 100%;
  height: 100%;
  min-height: 18rem;
  display: grid;
  place-items: center;
  color: rgba(var(--color-primary-rgb), 0.36);
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
}

.project-content {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-xl);
}

.project-owner {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.07);
}

.project-owner-avatar {
  width: 2.1rem;
  height: 2.1rem;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  background-color: rgba(var(--color-primary-rgb), 0.06);
  color: rgba(var(--color-primary-rgb), 0.82);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
}

.project-owner-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.project-owner-name {
  color: rgba(var(--color-primary-rgb), 0.9);
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  line-height: 1.2;
}

.project-owner-school {
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  line-height: 1.2;
}

.project-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-lg);
}

.project-title-area {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.project-header h3 {
  min-width: 0;
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.96);
  font-size: clamp(var(--font-size-lg), 2vw, 1.65rem);
  font-weight: var(--font-bold);
  line-height: 1.2;
  overflow-wrap: anywhere;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-date {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  color: rgba(var(--color-primary-rgb), 0.68);
  white-space: nowrap;
}

.project-score {
  width: fit-content;
  padding: 0.38rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-secondary-rgb), 0.3);
  background-color: rgba(var(--color-secondary-rgb), 0.13);
  color: rgba(var(--color-primary-rgb), 0.88);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  line-height: 1;
}

.project-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.project-badge {
  width: fit-content;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  background-color: rgba(var(--color-surface-rgb), 0.5);
  color: rgba(var(--color-primary-rgb), 0.62);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-semibold);
  line-height: 1;
}

.project-badge--verified {
  background-color: rgba(var(--color-secondary-rgb), 0.1);
  border-color: rgba(var(--color-secondary-rgb), 0.24);
  color: rgba(var(--color-primary-rgb), 0.78);
}

.project-description {
  min-height: 4.6rem;
  max-width: 95%;
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.87);
  font-size: var(--font-size-sm);
  line-height: 1.55;
  display: -webkit-box;
  line-clamp: 4;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  display: grid;
  gap: var(--space-sm);
  margin-top: auto;
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
  background-color: rgba(var(--color-surface-rgb), 0.44);
  color: rgba(var(--color-primary-rgb), 0.5);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  line-height: 1;
}

.project-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.07);
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
}

.project-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.project-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.project-action {
  padding: 0.6rem 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  background-color: rgba(var(--color-surface-rgb), 0.45);
  color: rgba(var(--color-primary-rgb), 0.72);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.project-action--primary {
  padding-inline: 1.1rem;
  border-color: rgba(var(--color-secondary-rgb), 0.35);
  background-color: rgba(var(--color-secondary-rgb), 0.18);
  color: rgba(var(--color-primary-rgb), 0.95);
  box-shadow: 0 8px 18px rgba(var(--color-secondary-rgb), 0.14);
}

.project-action:hover {
  transform: translateY(-1px);
  border-color: rgba(var(--color-primary-rgb), 0.22);
}

.project-action--primary:hover {
  background-color: rgba(var(--color-secondary-rgb), 0.26);
}

@media (max-width: 760px) {
  .feed-project-card {
    flex-direction: column;
  }

  .project-preview {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-right: 0;
    border-bottom: var(--border);
  }

  .project-header {
    flex-direction: column;
    gap: var(--space-sm);
  }

  .project-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .project-actions {
    flex-wrap: wrap;
  }
}
</style>