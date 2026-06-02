<script setup>
import { ref } from 'vue';
import ShareProjectModal from '@/components/feed/ShareProjectModal.vue';
import {
  MessageCircle,
  Share2,
  Award,
  Github,
  ExternalLink,
} from 'lucide-vue-next';

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});
const showShareModal = ref(false);

function getProjectShareLink(project) {
  return project.shareUrl || `${window.location.origin}/projects/${project.id}`;
}
const DESCRIPTION_LIMIT = 420;

function formatDate(date) {
  if (!date) return '';

  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
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

function getProjectImages(project) {
  if (project.images?.length) return project.images;
  if (project.imagePreview) return [project.imagePreview];

  return [];
}
</script>

<template>
  <article class="feed-post-card">
    <header class="post-header">
      <div class="post-author">
        <div class="post-avatar">
          {{ getStudentName(project).charAt(0) }}
        </div>

        <div class="post-author-info">
          <div class="post-author-line">
            <span class="post-author-name">
              {{ getStudentName(project) }}
            </span>

            <span
              v-if="project.feedReason"
              class="post-feed-reason"
            >
              {{ project.feedReason }}
            </span>
          </div>

          <div class="post-author-meta">
            <span>{{ getSchoolName(project) }}</span>

            <template v-if="project.date">
              <span>•</span>
              <span>{{ formatDate(project.date) }}</span>
            </template>
          </div>
        </div>
      </div>

      <div
        v-if="hasCredibilityScore(project)"
        class="post-score"
      >
        <Award :size="15" />
        <span>{{ project.credibilityScore }}/100</span>
      </div>
    </header>

    <section class="post-body">
      <div class="post-title-row">
        <h3>{{ project.title }}</h3>

        <span
          v-if="project.isVerified"
          class="post-verified"
        >
          Verified by institution
        </span>
      </div>

      <p
        v-if="hasDescription(project)"
        class="post-description"
      >
        {{ getProjectDescription(project) }}
      </p>

      <div
        v-if="project.technologies?.length || project.domains?.length"
        class="post-tags"
      >
        <span
          v-for="technology in project.technologies?.slice(0, 5)"
          :key="technology"
        >
          {{ technology }}
        </span>

        <span
          v-for="domain in project.domains?.slice(0, 3)"
          :key="domain"
          class="post-tag-domain"
        >
          {{ domain }}
        </span>
      </div>
    </section>

    <section
      v-if="getProjectImages(project).length"
      class="post-media"
      :class="{
        'post-media--grid': getProjectImages(project).length > 1,
      }"
    >
      <img
        v-for="image in getProjectImages(project).slice(0, 4)"
        :key="image"
        :src="image"
        :alt="project.title ? `${project.title} preview` : 'Project preview'"
        draggable="false"
      >
    </section>

    <section class="post-stats">
      <span>{{ project.recommendationsCount || 0 }} recommendations</span>
      <span>{{ project.commentsCount || 0 }} comments</span>
      <span>{{ project.githubReposCount || 0 }} GitHub repos</span>
    </section>

    <footer class="post-actions">
      <button
        type="button"
        class="post-action post-action--primary"
      >
        <Award :size="16" />
        <span>Recommend</span>
      </button>

      <button
        type="button"
        class="post-action"
      >
        <MessageCircle :size="16" />
        <span>Comment</span>
      </button>

      <button
        type="button"
        class="post-action"
      >
        <ExternalLink :size="16" />
        <span>View portfolio</span>
      </button>

      <button
        type="button"
        class="post-action"
      >
        <Github :size="16" />
        <span>GitHub</span>
      </button>

            <button
        type="button"
        class="post-icon-action"
        aria-label="Share project"
        @click="showShareModal = true"
      >
        <Share2 :size="16" />
      </button>
    </footer>

    <ShareProjectModal
      :show="showShareModal"
      :share-link="getProjectShareLink(project)"
      @close="showShareModal = false"
    />
  </article>
</template>

<style scoped>
.feed-post-card {
  width: min(100%, 46rem);
  margin-inline: auto;
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-lg);
  background-color: rgba(var(--color-surface-rgb), 0.58);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.055);
  overflow: hidden;
  transition:
    transform var(--transition-normal),
    box-shadow var(--transition-normal);
}

.feed-post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.075);
}

.post-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-lg) var(--space-lg) var(--space-md);
}

.post-author {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.post-avatar {
  width: 2.35rem;
  height: 2.35rem;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  background-color: rgba(var(--color-primary-rgb), 0.06);
  color: rgba(var(--color-primary-rgb), 0.88);
  font-size: var(--font-size-sm);
  font-weight: var(--font-bold);
  text-transform: uppercase;
}

.post-author-info {
  min-width: 0;
  display: grid;
  gap: 0.15rem;
}

.post-author-line {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  min-width: 0;
}

.post-author-name {
  color: rgba(var(--color-primary-rgb), 0.92);
  font-size: var(--font-size-sm);
  font-weight: var(--font-bold);
  line-height: 1.2;
}

.post-feed-reason {
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  background-color: rgba(var(--color-secondary-rgb), 0.12);
  color: rgba(var(--color-primary-rgb), 0.7);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-semibold);
  line-height: 1;
  white-space: nowrap;
}

.post-author-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
}

.post-score {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-secondary-rgb), 0.28);
  background-color: rgba(var(--color-secondary-rgb), 0.13);
  color: rgba(var(--color-primary-rgb), 0.88);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
}

.post-body {
  display: grid;
  gap: var(--space-md);
  padding: 0 var(--space-lg) var(--space-md);
}

.post-title-row {
  display: grid;
  gap: var(--space-xs);
}

.post-title-row h3 {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.97);
  font-size: clamp(1.25rem, 2.3vw, 1.7rem);
  font-weight: var(--font-bold);
  line-height: 1.18;
  overflow-wrap: anywhere;
}

.post-verified {
  width: fit-content;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-secondary-rgb), 0.24);
  background-color: rgba(var(--color-secondary-rgb), 0.09);
  color: rgba(var(--color-primary-rgb), 0.72);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-semibold);
  line-height: 1;
}

.post-description {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.82);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  display: -webkit-box;
  line-clamp: 5;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.post-tags span {
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.11);
  background-color: rgba(var(--color-background-rgb), 0.45);
  color: rgba(var(--color-primary-rgb), 0.55);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  line-height: 1;
}

.post-tags .post-tag-domain {
  color: rgba(var(--color-primary-rgb), 0.66);
}

.post-media {
  width: 100%;
  max-height: 27rem;
  overflow: hidden;
  border-block: 1px solid rgba(var(--color-primary-rgb), 0.08);
  background-color: rgba(var(--color-primary-rgb), 0.04);
}

.post-media img {
  width: 100%;
  height: 100%;
  max-height: 27rem;
  display: block;
  object-fit: cover;
  -webkit-user-drag: none;
}

.post-media--grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2px;
}

.post-media--grid img {
  height: 13rem;
}

.post-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  color: rgba(var(--color-primary-rgb), 0.54);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.07);
}

.post-actions {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-lg);
}

.post-action,
.post-icon-action {
  height: 2.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-radius: 999px;
  border: 1px solid transparent;
  background-color: transparent;
  color: rgba(var(--color-primary-rgb), 0.62);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    background-color var(--transition-fast),
    color var(--transition-fast),
    border-color var(--transition-fast);
}

.post-action {
  padding: 0 0.8rem;
}

.post-icon-action {
  width: 2.35rem;
  flex-shrink: 0;
  margin-left: auto;
}

.post-icon-action + .post-icon-action {
  margin-left: 0;
}

.post-action:hover,
.post-icon-action:hover {
  transform: translateY(-1px);
  background-color: rgba(var(--color-primary-rgb), 0.055);
  color: rgba(var(--color-primary-rgb), 0.9);
}

.post-action--primary {
  border-color: rgba(var(--color-secondary-rgb), 0.28);
  background-color: rgba(var(--color-secondary-rgb), 0.15);
  color: rgba(var(--color-primary-rgb), 0.95);
  box-shadow: 0 8px 18px rgba(var(--color-secondary-rgb), 0.13);
}

.post-action--primary:hover {
  background-color: rgba(var(--color-secondary-rgb), 0.24);
}

@media (max-width: 760px) {
  .feed-post-card {
    width: 100%;
  }

  .post-header {
    flex-direction: column;
  }

  .post-actions {
    flex-wrap: wrap;
  }

  .post-icon-action {
    margin-left: 0;
  }

  .post-media--grid {
    grid-template-columns: 1fr;
  }

  .post-media--grid img {
    height: 12rem;
  }
}
</style>