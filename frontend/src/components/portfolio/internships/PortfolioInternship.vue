<script setup>
import { CalendarDays, ExternalLink, Eye, EyeOff } from 'lucide-vue-next';
import { useDoubleTap } from '@/composables/useDoubleTap';
import { useRoute } from 'vue-router';

const route = useRoute();

const props = defineProps({
  internship: {
    type: Object,
    required: true,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['edit']);

function formatDate(date) {
  if (!date) return '';

  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function getYear(date) {
  if (!date) return '';

  return new Date(date).getFullYear();
}

const { handleDoubleTap } = useDoubleTap(() => {
  if (!props.canEdit) return;

  emit('edit', props.internship);
});

function getExperienceRoute(experienceId) {
  if (route.params.id) {
    return {
      name: 'portfolio-experience',
      params: {
        id: route.params.id,
        experienceId,
      },
    };
  }

  return {
    name: 'my-portfolio-experience',
    params: {
      experienceId,
    },
  };
}
</script>

<template>
  <article
    class="internship-card"
    :class="{ 'internship-card--editable': canEdit }"
    @dblclick="canEdit && emit('edit', internship)"
    @click="handleDoubleTap"
  >
    <div class="internship-card__year">
      {{ getYear(internship.startDate || internship.date) || 'Year' }}
    </div>

    <div class="internship-card__body">
      <div class="internship-card__header">
        <div class="internship-card__heading">
          <div class="internship-card__date">
            <CalendarDays :size="14" />
            <span>
              {{ formatDate(internship.startDate || internship.date) }}
              <template v-if="internship.endDate">
                - {{ formatDate(internship.endDate) }}
              </template>
            </span>
          </div>
          <h3>{{ internship.title }}</h3>
          <span v-if="internship.missions">{{ internship.missions }}</span>
        </div>
        <span
          v-if="canEdit"
          class="internship-card__visibility"
        >
          <Eye
            v-if="internship.visibleToEveryone"
            :size="14"
          />
          <EyeOff
            v-else
            :size="14"
          />
        </span>
      </div>

      <div
        v-if="internship.technologies?.length || internship.domains?.length"
        class="internship-card__tags"
      >
        <span
          v-for="technology in internship.technologies?.slice(0, 3)"
          :key="technology"
        >
          {{ technology }}
        </span>
        <span
          v-for="domain in internship.domains?.slice(0, 2)"
          :key="domain"
        >
          {{ domain }}
        </span>
      </div>

      <p>{{ internship.description }}</p>

      <img
        v-if="internship.imagePreview"
        class="internship-card__image"
        :src="internship.imagePreview"
        :alt="internship.title ? `${internship.title} image` : 'Internship image'"
        draggable="false"
      >

      <div class="internship-card__footer">
        <RouterLink
          class="internship-card__report"
          :to="getExperienceRoute(internship.id)"
          @click.stop
        >
          View internship details
          <ExternalLink :size="14" />
        </RouterLink>
        <span
          v-if="canEdit"
          class="internship-card__hint"
        >
          Double-click to edit
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.internship-card {
  --internship-title-offset: calc(var(--font-size-xs) * 1.45 + var(--space-sm));

  position: relative;
  display: grid;
  grid-template-columns: clamp(4.6rem, 10vw, 7rem) minmax(0, 1fr);
  gap: clamp(var(--space-lg), 4vw, calc(var(--space-xl) * 1.5));
}

.internship-card::before {
  content: '';
  position: absolute;
  top: calc(var(--internship-title-offset) + 0.58rem);
  left: calc(clamp(4.6rem, 10vw, 7rem) + 1px);
  width: 0.62rem;
  height: 0.62rem;
  border-radius: 50%;
  background: var(--color-secondary);
  box-shadow: 0 0 0 5px var(--color-background);
  transform: translateX(-50%);
  z-index: 1;
}

.internship-card--editable {
  cursor: pointer;
}

.internship-card__year {
  color: var(--color-secondary);
  font-family: var(--font-editorial);
  font-size: clamp(1.65rem, 4vw, 2.3rem);
  font-weight: var(--font-medium);
  line-height: 1;
  padding-top: var(--internship-title-offset);
}

.internship-card__body {
  display: grid;
  gap: var(--space-md);
  padding-bottom: calc(var(--space-xl) * 1.35);
}

.internship-card__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: var(--space-md);
}

.internship-card__heading {
  min-width: 0;
  display: grid;
  gap: var(--space-sm);
}

.internship-card__heading h3,
.internship-card p {
  margin: 0;
}

.internship-card__heading h3 {
  color: var(--color-primary);
  font-size: clamp(var(--font-size-lg), 2.4vw, 1.8rem);
  font-weight: var(--font-bold);
  line-height: 1.18;
  overflow-wrap: anywhere;
}

.internship-card__heading span {
  color: rgba(var(--color-primary-rgb), 0.58);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  line-height: 1.45;
}

.internship-card__date {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  color: rgba(var(--color-primary-rgb), 0.54);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
}

.internship-card__date span {
  color: inherit;
  font: inherit;
}

.internship-card__visibility {
  display: inline-flex;
  color: rgba(var(--color-primary-rgb), 0.56);
}

.internship-card p {
  color: rgba(var(--color-primary-rgb), 0.78);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  max-width: 56rem;
}

.internship-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.internship-card__tags span {
  padding: 0.38rem 0.7rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  border-radius: 999px;
  background-color: rgba(var(--color-secondary-rgb), 0.1);
  color: rgba(var(--color-primary-rgb), 0.58);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  line-height: 1;
}

.internship-card__image {
  width: min(100%, 48rem);
  aspect-ratio: 16 / 6;
  display: block;
  object-fit: cover;
  border-radius: var(--radius-md);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.12);
}

.internship-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.internship-card__report {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  text-decoration: none;
  transition:
    color var(--transition-fast),
    transform var(--transition-fast);
}

.internship-card__report:hover {
  color: var(--color-secondary);
  transform: translate(1px, -1px);
}

.internship-card__hint {
  margin-left: auto;
  color: rgba(var(--color-primary-rgb), 0.48);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
}

@media (max-width: 640px) {
  .internship-card {
    grid-template-columns: 4.2rem minmax(0, 1fr);
    gap: var(--space-lg);
  }

  .internship-card::before {
    left: calc(4.2rem + 1px);
  }

  .internship-card__year {
    font-size: 1.28rem;
  }
}
</style>
