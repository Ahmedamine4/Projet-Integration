<template>
  <article class="project-card">
    <!-- Author header -->
    <div class="card-author">
      <div
        class="avatar"
        :class="avatarToneClass"
      >
        {{ initials }}
      </div>

      <div class="author-info">
        <span class="author-name">{{ project.studentName }}</span>
        <span class="author-meta">{{ project.schoolName }} · {{ formattedDate }}</span>
      </div>

      <span class="feed-reason-pill">{{ project.feedReason }}</span>

      <span class="credibility-pill">
        {{ project.credibilityScore }}
      </span>
    </div>

    <!-- Title and certification -->
    <div class="card-title-row">
      <h3 class="card-title">
        {{ project.title }}
      </h3>

      <span
        v-if="project.isVerified"
        class="certified-pill"
      >
        <BadgeCheck :size="13" />
        Certified project
      </span>
    </div>

    <p class="card-description">
      {{ project.description }}
    </p>

    <div
      v-if="project.imagePreview"
      class="post-media"
    >
      <img
        :src="project.imagePreview"
        :alt="project.title"
        loading="lazy"
      >
    </div>

    <!-- Tags -->
    <div
      v-if="project.technologies?.length || project.domains?.length"
      class="card-tags"
    >
      <span
        v-for="tech in project.technologies"
        :key="'t-' + tech"
        class="tag tag--tech"
      >
        {{ tech }}
      </span>

      <span
        v-for="domain in project.domains"
        :key="'d-' + domain"
        class="tag tag--domain"
      >
        {{ domain }}
      </span>
    </div>

    <!-- Stats -->
    <div class="card-stats">
      <span class="stat">
        <ThumbsUp :size="13" />
        {{ project.recommendationsCount }}
      </span>

      <span class="stat">
        <MessageCircle :size="13" />
        {{ project.commentsCount }}
      </span>

      <span class="stat">
        <GitBranch :size="13" />
        {{ project.githubReposCount }}
      </span>
    </div>

    <div class="card-divider" />

    <!-- Actions -->
    <div class="card-actions">
      <button
        type="button"
        class="action-btn"
      >
        <ThumbsUp :size="14" />
        <span>Recommend</span>
      </button>

      <button
        type="button"
        class="action-btn"
      >
        <MessageCircle :size="14" />
        <span>Comment</span>
      </button>

      <button
        type="button"
        class="action-btn action-btn--primary"
      >
        <ExternalLink :size="14" />
        <span>View project</span>
      </button>

      <button
        v-if="project.githubReposCount > 0"
        type="button"
        class="action-btn"
        aria-label="Open GitHub repository"
      >
        <Github :size="14" />
      </button>

      <button
        type="button"
        class="action-btn action-btn--icon"
        aria-label="Share project"
        @click="emit('share', project)"
      >
        <Share2 :size="14" />
      </button>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import {
  ThumbsUp,
  MessageCircle,
  GitBranch,
  ExternalLink,
  Github,
  Share2,
  BadgeCheck,
} from 'lucide-vue-next';

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['share']);

const initials = computed(() => {
  const parts = (props.project.studentName || '').split(' ');

  return parts
    .map((part) => part[0]?.toUpperCase() || '')
    .slice(0, 2)
    .join('');
});

const avatarToneClass = computed(() => {
  const toneIndex = Number(props.project.id || 0) % 4;

  return `avatar--tone-${toneIndex + 1}`;
});

const formattedDate = computed(() => {
  if (!props.project.date) return '';

  const date = new Date(props.project.date);

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
});
</script>

<style scoped>
.project-card {
  width: 100%;
  max-width: 580px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(var(--color-primary-rgb), 0.07);
  background: rgba(var(--color-surface-rgb), 0.96);
  box-shadow: 0 6px 16px rgba(var(--color-primary-rgb), 0.04);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.project-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(var(--color-primary-rgb), 0.06);
}

/* Author */
.card-author {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.avatar {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 999px;
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
}

.avatar--tone-1 {
  background: rgba(var(--color-secondary-rgb), 0.14);
  color: rgba(var(--color-secondary-rgb), 0.95);
}

.avatar--tone-2 {
  background: rgba(var(--color-primary-rgb), 0.07);
  color: rgba(var(--color-primary-rgb), 0.78);
}

.avatar--tone-3 {
  background: rgba(var(--color-surface-rgb), 0.72);
  color: rgba(var(--color-primary-rgb), 0.72);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.avatar--tone-4 {
  background: rgba(var(--color-background-rgb), 0.72);
  color: rgba(var(--color-secondary-rgb), 0.9);
  border: 1px solid rgba(var(--color-secondary-rgb), 0.16);
}

.author-info {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.author-name {
  color: rgba(var(--color-primary-rgb), 0.9);
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.author-meta {
  color: rgba(var(--color-primary-rgb), 0.42);
  font-size: var(--font-size-xxs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feed-reason-pill,
.credibility-pill,
.certified-pill {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  flex-shrink: 0;
  border-radius: 999px;
  white-space: nowrap;
}

.feed-reason-pill {
  padding: 0.15rem 0.45rem;
  background: rgba(var(--color-primary-rgb), 0.055);
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: 9px;
  font-weight: var(--font-medium);
}

.credibility-pill {
  padding: 0.18rem 0.45rem;
  border: 1px solid rgba(var(--color-secondary-rgb), 0.22);
  background: rgba(var(--color-secondary-rgb), 0.09);
  color: rgba(var(--color-secondary-rgb), 0.95);
  font-size: 9px;
  font-weight: var(--font-semibold);
}

/* Title */
.card-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.card-title {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.92);
  font-size: var(--font-size-sm);
  font-weight: var(--font-bold);
  line-height: 1.24;
}

.certified-pill {
  gap: 4px;
  padding: 0.15rem 0.45rem;
  border: 1px solid rgba(var(--color-secondary-rgb), 0.28);
  background: rgba(var(--color-secondary-rgb), 0.08);
  color: rgba(var(--color-secondary-rgb), 0.95);
  font-size: 9px;
  font-weight: var(--font-semibold);
}

/* Description */
.card-description {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.68);
  font-size: var(--font-size-xs);
  line-height: 1.45;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Image */
.post-media {
  width: 100%;
  aspect-ratio: 2.35 / 1;
  overflow: hidden;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  border: 1px solid rgba(var(--color-primary-rgb), 0.06);
  background: rgba(var(--color-background-rgb), 0.75);
}

.post-media img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center 20%;
  transition: transform var(--transition-normal);
}

.project-card:hover .post-media img {
  transform: scale(1.015);
}

/* Tags */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  font-size: 9px;
  font-weight: var(--font-medium);
  white-space: nowrap;
}

.tag--tech {
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  background: rgba(var(--color-primary-rgb), 0.055);
  color: rgba(var(--color-primary-rgb), 0.6);
}

.tag--domain {
  border: 1px solid rgba(var(--color-secondary-rgb), 0.2);
  background: rgba(var(--color-secondary-rgb), 0.08);
  color: rgba(var(--color-secondary-rgb), 0.85);
}

/* Stats */
.card-stats {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: rgba(var(--color-primary-rgb), 0.45);
  font-size: var(--font-size-xxs);
}

.card-divider {
  height: 1px;
  background: rgba(var(--color-primary-rgb), 0.07);
}

/* Actions */
.card-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.62);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
}

.action-btn:hover {
  transform: translateY(-1px);
  background: rgba(var(--color-primary-rgb), 0.05);
  color: rgba(var(--color-primary-rgb), 0.86);
}

.action-btn--primary {
  border-color: rgba(var(--color-secondary-rgb), 0.25);
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: rgba(var(--color-secondary-rgb), 0.98);
}

.action-btn--primary:hover {
  background: rgba(var(--color-secondary-rgb), 0.16);
}

.action-btn--icon {
  margin-left: auto;
  padding-inline: 0.45rem;
}
</style>