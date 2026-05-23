<script setup>
import { MapPin } from 'lucide-vue-next';

defineProps({
  activity: {
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
  <article class="activity-card">
    <div class="activity-preview">
      <img
        v-if="activity.imagePreview"
        :src="activity.imagePreview"
        :alt="activity.title ? `${activity.title} image` : 'Activity image'"
        draggable="false"
      />
    </div>
    <div class="activity-content">
      <div class="activity-header">
        <h3>{{ activity.title }}</h3>
        <span>{{ formatDate(activity.date) }}</span>
      </div>

      <div class="activity-details">
        <span v-if="activity.activityType" class="activity-type">
          {{ activity.activityType }}
        </span>

        <span v-if="activity.location" class="activity-location">
          <MapPin :size="14" :stroke-width="2" />
          {{ activity.location }}
        </span>
      </div>

      <div v-if="activity.club" class="activity-club">
        {{ activity.club }}
      </div>

      <p>{{ activity.description }}</p>
      <div class="activity-meta">
        <div v-if="activity.technologies?.length" class="activity-tags">
          <span
            v-for="technology in activity.technologies.slice(0, 3)"
            :key="technology"
          >
            {{ technology }}
          </span>

          <span v-if="activity.technologies?.length > 3">
            +{{ activity.technologies.length - 3 }}
          </span>
        </div>

        <div v-if="activity.domains?.length" class="activity-tags">
          <span v-for="domain in activity.domains.slice(0, 2)" :key="domain">
            {{ domain }}
          </span>
          <span v-if="activity.domains?.length > 2">
            +{{ activity.domains.length - 2 }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.activity-card {
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

.activity-preview {
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

.activity-preview img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  pointer-events: none;
  -webkit-user-drag: none;
}

.activity-content {
  display: grid;
  gap: var(--space-lg);
  padding: var(--space-lg);
}

.activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.activity-header h3 {
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

.activity-header span {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  color: rgba(var(--color-primary-rgb), 0.68);
}

.activity-content p {
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

.activity-details {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.activity-type {
  width: fit-content;
  padding: 0.4rem 0.65rem;
  border-radius: var(--radius-sm);
  background-color: var(--color-secondary);
  color: var(--color-surface);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  line-height: 1;
  text-transform: uppercase;
}

.activity-club {
  width: fit-content;
  padding-inline-start: 0.65rem;
  border-left: 2px solid var(--color-secondary);
  color: rgba(var(--color-primary-rgb), 0.62);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  line-height: 1.3;
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

.activity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.activity-tags span {
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  background-color: rgba(var(--color-surface-rgb), 0.36);
  color: rgba(var(--color-primary-rgb), 0.46);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  line-height: 1;
}

.activity-meta {
  display: grid;
  gap: var(--space-sm);
}
</style>
