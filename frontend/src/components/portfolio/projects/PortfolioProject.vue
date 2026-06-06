<script setup>
import { BadgeCheck, Clock3, Eye, EyeOff, Sparkles, XCircle } from 'lucide-vue-next';
import { computed } from 'vue';
import { useDoubleTap } from '@/composables/useDoubleTap';
import ExploreButton from '@/components/portfolio/shared/ExploreButton.vue';

const props = defineProps({
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

const canEditExperience = computed(() => {
  return props.canEdit && props.project.validationStatus !== 'refuse';
});

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

const { handleDoubleTap } = useDoubleTap(() => {
  if (!canEditExperience.value) return;

  emit('edit', props.project);
});
</script>

<template>
  <article 
    class="project-card"
    :class="{
      'project-card--editable': canEditExperience,
      'project-card--hidden': !project.effectiveVisibleToEveryone,
      'project-card--highlighted': project.highlighted,
    }"
    @dblclick="canEditExperience && emit('edit', project)"
    @click="handleDoubleTap"
  >
    <div
      v-if="project.isAcademic && project.validationStatus"
      class="project-validation-badge"
      :class="`project-validation-badge--${project.validationStatus}`"
      :title="`Academic experience ${project.validationStatus === 'en_attente' ? 'pending validation' : project.validationStatus === 'valide' ? 'validated' : 'rejected'}`"
    >
      <BadgeCheck
        v-if="project.validationStatus === 'valide'"
        :size="22"
        :stroke-width="2.3"
      />
      <Clock3
        v-else-if="project.validationStatus === 'en_attente'"
        :size="21"
        :stroke-width="2.3"
      />
      <XCircle
        v-else
        :size="21"
        :stroke-width="2.3"
      />
    </div>
    <div
      v-if="project.highlighted"
      class="project-match-badge"
      title="Matched by the current filter"
    >
      <Sparkles
        :size="14"
        :stroke-width="2.2"
      />
      <span>{{ project.score ? `${project.score}% match` : 'Match' }}</span>
    </div>
    <div class="project-preview">
      <img
        v-if="project.imagePreview"
        :src="project.imagePreview"
        :alt="project.title ? `${project.title} image` : 'Project image'"
        draggable="false"
      >
    </div>
    <div class="project-content">
      <div class="project-header">
        <h3>{{ project.title }}</h3>
        <div class="project-header-meta">
          <span
            v-if="canEdit"
            class="project-visibility"
          >
            <Eye
              v-if="project.effectiveVisibleToEveryone"
              :size="14"
            />
            <EyeOff
              v-else
              :size="14"
            />
          </span>

          <span class="project-date">{{ formatDate(project.date) }}</span>
        </div>
      </div>

      <p>{{ project.description }}</p>
      <div class="project-meta">
        <div
          v-if="project.technologies?.length"
          class="project-tags"
        >
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

        <div
          v-if="project.domains?.length"
          class="project-tags"
        >
          <span
            v-for="domain in project.domains.slice(0, 2)"
            :key="domain"
          >
            {{ domain }}
          </span>
          <span v-if="project.domains?.length > 2">
            +{{ project.domains.length - 2 }}
          </span>
        </div>
      </div>
      <div class="project-footer">
        <ExploreButton
          experience-type="project"
          :experience-id="project.id"
        />
        <span
          v-if="canEditExperience"
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
  position: relative;
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
    opacity var(--transition-fast),
    transform var(--transition-normal),
    box-shadow var(--transition-normal);
}

.project-card--hidden {
  opacity: 0.58;
}

.project-card--highlighted {
  --border: 1px solid rgba(var(--color-secondary-rgb), 0.55);
  background:
    linear-gradient(
      145deg,
      rgba(var(--color-secondary-rgb), 0.12),
      rgba(var(--color-surface-rgb), 0.46) 46%,
      rgba(var(--color-background-rgb), 0.84)
    );
  box-shadow:
    0 12px 22px rgba(var(--color-secondary-rgb), 0.14),
    0 10px 16px rgba(0, 0, 0, 0.04);
}

.project-card:hover {
  transform: scale(1.008);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.06);
}

.project-card--highlighted:hover {
  box-shadow:
    0 14px 26px rgba(var(--color-secondary-rgb), 0.18),
    0 10px 18px rgba(0, 0, 0, 0.06);
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

.project-header-meta {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
}

.project-date {
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  color: rgba(var(--color-primary-rgb), 0.68);
}

.project-validation-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.project-validation-badge {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  z-index: 2;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  border: 1px solid currentColor;
  background: color-mix(in srgb, currentColor 12%, var(--color-background));
  box-shadow: 0 0.65rem 1.35rem rgba(var(--color-primary-rgb), 0.12);
}

.project-validation-badge--valide {
  color: var(--color-success);
}

.project-validation-badge--en_attente {
  color: rgb(245, 158, 11);
}

.project-validation-badge--refuse {
  color: var(--color-error);
}

.project-match-badge {
  position: absolute;
  top: 0.85rem;
  left: 0.85rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid rgba(var(--color-secondary-rgb), 0.44);
  border-radius: 999px;
  padding: 0.38rem 0.58rem;
  background: rgba(var(--color-background-rgb), 0.9);
  color: var(--color-primary);
  box-shadow: 0 0.65rem 1.35rem rgba(var(--color-primary-rgb), 0.12);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  line-height: 1;
}

.project-match-badge svg {
  color: var(--color-secondary);
  flex-shrink: 0;
}

.project-visibility {
  width: 1rem;
  height: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(var(--color-primary-rgb), 0.56);
}

.project-visibility svg {
  flex-shrink: 0;
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
  background-color: rgba(var(--color-surface-rgb), 0.36);
  color: rgba(var(--color-primary-rgb), 0.46);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  line-height: 1;
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
