<script setup>
import { MapPin, CalendarDays } from 'lucide-vue-next';

defineProps({
  activity: {
    type: Object,
    required: true,
  },
});

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}
</script>

<template>
  <article class="activity-card">
    <div class="activity-top">
      <div class="activity-info">
        <div class="activity-kicker">
          <span v-if="activity.activityType" class="activity-type">
            {{ activity.activityType }}
          </span>

          <span class="activity-date">
            <CalendarDays :size="13" :stroke-width="2" />
            {{ formatDate(activity.date) }}
          </span>
        </div>

        <h3>{{ activity.title }}</h3>

        <div class="activity-details">
          <span v-if="activity.location" class="activity-location">
            <MapPin :size="14" :stroke-width="2" />
            {{ activity.location }}
          </span>

          <span v-if="activity.club" class="activity-club">
            {{ activity.club }}
          </span>
        </div>
      </div>

      <div class="activity-image">
        <img
          v-if="activity.imagePreview"
          :src="activity.imagePreview"
          :alt="activity.title ? `${activity.title} image` : 'Activity image'"
          draggable="false"
        />
      </div>
    </div>

    <p class="activity-description">
      {{ activity.description }}
    </p>

    <div class="activity-footer">
      <div v-if="activity.technologies?.length" class="activity-tags">
        <span
          v-for="technology in activity.technologies.slice(0, 4)"
          :key="technology"
        >
          {{ technology }}
        </span>

        <span v-if="activity.technologies?.length > 4">
          +{{ activity.technologies.length - 4 }}
        </span>
      </div>

      <div v-if="activity.domains?.length" class="activity-tags muted">
        <span
          v-for="domain in activity.domains.slice(0, 3)"
          :key="domain"
        >
          {{ domain }}
        </span>

        <span v-if="activity.domains?.length > 3">
          +{{ activity.domains.length - 3 }}
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.activity-card {
  --border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  flex-shrink: 0;
  flex-grow: 0;
  width: min(100%, 38rem);
  aspect-ratio: 7 / 5;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: var(--space-xl);
  background:
    radial-gradient(
      circle at top right,
      rgba(var(--color-secondary-rgb), 0.08),
      transparent 32%
    ),
    rgba(var(--color-surface-rgb), 0.3);
  border: var(--border);
  border-radius: 2rem;
  box-shadow: 0 1.4rem 3.2rem rgba(0, 0, 0, 0.08);
  overflow: hidden;
  user-select: none;
}

.activity-top {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 16rem;
  gap: 1rem;
  align-items: start;
}

.activity-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-kicker {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
}

.activity-type,
.activity-date {
  width: fit-content;
  padding: 0.4rem 0.64rem;
  border-radius: 999px;
  font-size: var(--font-size-xxs);
  line-height: 1;
  white-space: nowrap;
}

.activity-type {
  background-color: var(--color-secondary);
  color: var(--color-surface);
  font-weight: var(--font-bold);
  text-transform: uppercase;
}

.activity-date {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background-color: rgba(var(--color-primary-rgb), 0.055);
  color: rgba(var(--color-primary-rgb), 0.62);
  font-family: var(--font-mono);
  font-weight: var(--font-medium);
}

.activity-date svg {
  flex-shrink: 0;
}

.activity-info h3 {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.96);
  font-size: clamp(1.45rem, 2.5vw, 2rem);
  font-weight: var(--font-bold);
  line-height: 1.04;
  letter-spacing: -0.045em;
  overflow-wrap: anywhere;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.activity-details {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.activity-location {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  min-width: 0;
  color: rgba(var(--color-primary-rgb), 0.58);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  line-height: 1.2;
}

.activity-location svg {
  flex-shrink: 0;
  color: var(--color-secondary);
}

.activity-club {
  width: fit-content;
  padding: 0.35rem 0.56rem;
  border-radius: 999px;
  background-color: rgba(var(--color-primary-rgb), 0.045);
  color: rgba(var(--color-primary-rgb), 0.56);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  line-height: 1.2;
}

.activity-image {
  width: 100%;
  aspect-ratio: 5 / 3;
  overflow: hidden;
  border-radius: 1.35rem;
  background:
    linear-gradient(
      135deg,
      rgba(var(--color-secondary-rgb), 0.16),
      rgba(var(--color-primary-rgb), 0.055)
    );
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.activity-image img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  pointer-events: none;
  -webkit-user-drag: none;
}

.activity-description {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.7);
  font-size: var(--font-size-sm);
  line-height: 1.52;
  display: -webkit-box;
  line-clamp: 4;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-footer {
  display: grid;
  gap: 0.45rem;
  margin-top: auto;
}

.activity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.activity-tags span {
  padding: 0.36rem 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  background-color: rgba(var(--color-surface-rgb), 0.58);
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  line-height: 1;
}

.activity-tags.muted span {
  color: rgba(var(--color-primary-rgb), 0.42);
}

@media (max-width: 520px) {
  .activity-card {
    width: min(100%, 27rem);
    aspect-ratio: auto;
    min-height: 27rem;
    padding: 1.15rem;
  }

  .activity-top {
    grid-template-columns: 1fr;
  }

  .activity-image {
    aspect-ratio: 16 / 9;
    width: 100%;
  }

  .activity-info h3 {
    font-size: 1.55rem;
  }
}
</style>