<script setup>
import {
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useDoubleTap } from '@/composables/useDoubleTap';
import { useRoute } from 'vue-router';

const route = useRoute();

const props = defineProps({
  certification: {
    type: Object,
    required: true,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['edit']);

const isExpanded = ref(false);

const issuedDate = computed(() => {
  return new Date(props.certification.date);
});

const issuedYear = computed(() => {
  return issuedDate.value.getFullYear();
});

const issueDateLabel = computed(() => {
  return issuedDate.value.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
});

const shortDescription = computed(() => {
  const description = props.certification.description || '';
  const limit = 170;

  if (description.length <= limit) return description;

  return `${description.slice(0, limit).trim()}...`;
});

function toggleExpanded() {
  isExpanded.value = !isExpanded.value;
}

const { handleDoubleTap } = useDoubleTap(() => {
  if (!props.canEdit) return;

  emit('edit', props.certification);
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
    class="certification"
    :class="{ 'is-expanded': isExpanded }"
  >
    <button
      type="button"
      class="certification-summary"
      @click="toggleExpanded"
    >
      <span class="certification-year">
        {{ issuedYear }}
      </span>

      <span class="certification-main">
        <span class="certification-issuer">
          <BadgeCheck
            :size="14"
            :stroke-width="2.2"
          />
          {{ certification.institution || 'Unknown issuer' }}
        </span>

        <span class="certification-title">
          {{ certification.title }}
        </span>
      </span>

      <span class="certification-controls">
        <span class="certification-date">
          <CalendarDays
            :size="13"
            :stroke-width="2"
          />
          {{ issueDateLabel }}
        </span>

        <span
          v-if="canEdit"
          class="certification-visibility"
        >
          <Eye
            v-if="certification.visibleToEveryone"
            :size="14"
            :stroke-width="2"
          />
          <EyeOff
            v-else
            :size="14"
            :stroke-width="2"
          />
        </span>

        <ChevronDown
          class="certification-chevron"
          :size="18"
          :stroke-width="2.15"
        />
      </span>
    </button>

    <div
      class="certification-details-track"
      @dblclick="canEdit && emit('edit', certification)"
      @click="handleDoubleTap"
    >
      <div class="certification-details">
        <p v-if="certification.description">
          {{ shortDescription }}
        </p>

        <div
          v-if="certification.certificateCode || certification.institution"
          class="certification-facts"
        >
          <div
            v-if="certification.certificateCode"
            class="certification-fact"
          >
            <span class="certification-fact-label">
              Credential ID
            </span>
            <span class="certification-fact-value">
              {{ certification.certificateCode }}
            </span>
          </div>

          <div
            v-if="certification.institution"
            class="certification-fact"
          >
            <span class="certification-fact-label">
              Issuer
            </span>
            <span class="certification-fact-value">
              {{ certification.institution }}
            </span>
          </div>
        </div>

        <div
          v-if="certification.technologies?.length"
          class="certification-tags"
        >
          <span
            v-for="technology in certification.technologies.slice(0, 3)"
            :key="technology"
          >
            {{ technology }}
          </span>

          <span v-if="certification.technologies?.length > 3">
            +{{ certification.technologies.length - 3 }}
          </span>
        </div>

        <div
          v-if="certification.domains?.length"
          class="certification-tags muted"
        >
          <span
            v-for="domain in certification.domains.slice(0, 2)"
            :key="domain"
          >
            {{ domain }}
          </span>

          <span v-if="certification.domains?.length > 2">
            +{{ certification.domains.length - 2 }}
          </span>
        </div>

        <div class="certification-footer">
          <RouterLink
            class="certification-link"
            :to="getExperienceRoute(certification.id)"
            @click.stop
          >
            Verify certification
            <ExternalLink
              :size="14"
              :stroke-width="2"
            />
          </RouterLink>

          <span
            v-if="canEdit"
            class="certification-edit-hint"
          >
            Double-click to edit
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.certification {
  container-type: inline-size;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-md);
  background:
    linear-gradient(
      135deg,
      rgba(var(--color-secondary-rgb), 0.1),
      transparent 36%
    ),
    rgba(var(--color-surface-rgb), 0.34);
  box-shadow: 0 0.85rem 2rem rgba(0, 0, 0, 0.075);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.certification::before {
  content: "";
  position: absolute;
  inset-block: 0;
  left: 0;
  width: 0.28rem;
  background: rgba(var(--color-secondary-rgb), 0.82);
}

.certification:hover {
  border-color: rgba(var(--color-primary-rgb), 0.14);
  box-shadow: 0 1rem 2.4rem rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.certification-summary {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-md);
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--color-primary);
  padding: 0.95rem 1rem 0.95rem 1.25rem;
  text-align: left;
  cursor: pointer;
}

.certification-year {
  display: grid;
  place-items: center;
  min-width: 3.3rem;
  min-height: 2.5rem;
  border-radius: var(--radius-sm);
  background: rgba(var(--color-primary-rgb), 0.065);
  color: rgba(var(--color-primary-rgb), 0.66);
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
}

.certification-main {
  display: grid;
  min-width: 0;
  gap: 0.25rem;
}

.certification-issuer {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: var(--space-xs);
  color: rgba(var(--color-primary-rgb), 0.54);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
}

.certification-issuer svg {
  flex-shrink: 0;
  color: var(--color-secondary);
}

.certification-title {
  color: rgba(var(--color-primary-rgb), 0.94);
  font-size: var(--font-size-sm);
  font-weight: var(--font-bold);
  line-height: 1.22;
  overflow-wrap: anywhere;
  display: -webkit-box;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.certification-controls {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  color: rgba(var(--color-primary-rgb), 0.58);
}

.certification-date,
.certification-visibility {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.5rem;
  border-radius: 999px;
  background: rgba(var(--color-primary-rgb), 0.045);
  font-family: var(--font-mono);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  white-space: nowrap;
}

.certification-visibility {
  justify-content: center;
  width: 2rem;
  padding-inline: 0;
}

.certification-chevron {
  flex-shrink: 0;
  transition: transform 0.32s cubic-bezier(.22, 1, .36, 1);
}

.certification.is-expanded .certification-chevron {
  transform: rotate(180deg);
}

.certification-details-track {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.36s cubic-bezier(.22, 1, .36, 1);
}

.certification.is-expanded .certification-details-track {
  grid-template-rows: 1fr;
}

.certification-details {
  display: grid;
  gap: var(--space-md);
  min-height: 0;
  overflow: hidden;
  padding-inline: calc(1.25rem + 0.28rem) 1.25rem;
  opacity: 0;
  transform: translateY(-0.35rem);
  transition:
    opacity var(--transition-fast),
    padding-bottom 0.36s cubic-bezier(.22, 1, .36, 1),
    transform 0.36s cubic-bezier(.22, 1, .36, 1);
}

.certification.is-expanded .certification-details {
  padding-bottom: 1.1rem;
  opacity: 1;
  transform: translateY(0);
}

.certification-details p {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.68);
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

.certification-facts {
  display: grid;
  gap: var(--space-sm);
  margin: 0;
}

.certification-fact {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-md);
  padding-block: var(--space-xs);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.06);
}

.certification-fact-label {
  color: rgba(var(--color-primary-rgb), 0.5);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
}

.certification-fact-value {
  color: rgba(var(--color-primary-rgb), 0.76);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  text-align: right;
}

.certification-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.certification-tags span {
  padding: 0.34rem 0.55rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: 999px;
  background: rgba(var(--color-background-rgb), 0.5);
  color: rgba(var(--color-primary-rgb), 0.54);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  line-height: 1;
}

.certification-tags.muted span {
  color: rgba(var(--color-primary-rgb), 0.42);
}

.certification-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.certification-link {
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

.certification-link:hover {
  color: var(--color-secondary);
  transform: translate(1px, -1px);
}

.certification-edit-hint {
  justify-self: end;
  color: rgba(var(--color-primary-rgb), 0.48);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
}

@container (max-width: 32rem) {
  .certification-summary {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .certification-controls {
    grid-column: 1 / -1;
    justify-self: end;
  }
}

@media (max-width: 820px) {
  .certification-summary {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .certification-controls {
    grid-column: 1 / -1;
    justify-self: end;
  }
}
</style>
