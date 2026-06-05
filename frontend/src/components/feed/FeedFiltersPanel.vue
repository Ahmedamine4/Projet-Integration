<template>
  <aside class="filters-panel">
    <div class="filters-card">
      <div class="panel-header">
        <h2 class="panel-title">Filtres</h2>

        <button
          type="button"
          class="btn-reset"
          @click="handleReset"
        >
          Réinitialiser
        </button>
      </div>

      <div class="filters-content">
        <div class="filter-group">
          <span class="group-label">Domaines</span>

          <div class="tags-cloud">
            <button
              v-for="domain in domains"
              :key="domain"
              type="button"
              class="tag-badge"
              :class="{ 'is-active': localFilters.domain === domain }"
              @click="toggleDomain(domain)"
            >
              {{ domain }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <span class="group-label">Technologies (Top du moment)</span>

          <div class="tags-cloud">
            <button
              v-for="tech in technologies"
              :key="tech"
              type="button"
              class="tag-badge"
              :class="{ 'is-active': localFilters.technology === tech }"
              @click="toggleTechnology(tech)"
            >
              {{ tech }}
            </button>
          </div>
        </div>

        <button
          type="button"
          class="btn-apply"
          @click="handleApply"
        >
          Appliquer
        </button>
      </div>
    </div>

    <div class="discover-section">
      <div class="discover-header">
        <h2 class="discover-title">Découvrir</h2>
        <span class="discover-subtitle">Étudiants à suivre</span>
      </div>

      <div class="suggestions-list">
        <div
          v-for="student in suggestedStudents"
          :key="student.id"
          class="student-card"
        >
          <div class="student-avatar">
            {{ student.initials }}
          </div>

          <div class="student-info">
            <span class="student-name">{{ student.name }}</span>
            <span class="student-speciality">{{ student.speciality }}</span>

            <div class="student-stack">
              <span
                v-for="tech in student.stack"
                :key="tech"
                class="micro-badge"
              >
                {{ tech }}
              </span>
            </div>
          </div>

          <button
            type="button"
            class="btn-follow"
            :class="{ 'is-following': followedStudents.has(student.id) }"
            :title="followedStudents.has(student.id) ? 'Déjà suivi' : 'Suivre l’étudiant'"
            @click="handleFollow(student.id)"
          >
            <span class="follow-icon">
              {{ followedStudents.has(student.id) ? '✓' : '+' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
  technologies: {
    type: Array,
    default: () => [],
  },
  domains: {
    type: Array,
    default: () => [],
  },
  suggestedStudents: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:filters', 'reset']);

const localFilters = ref({ ...props.filters });
const followedStudents = ref(new Set());

watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = { ...newFilters };
  },
  { deep: true }
);

function toggleDomain(domain) {
  localFilters.value.domain =
    localFilters.value.domain === domain ? null : domain;
}

function toggleTechnology(tech) {
  localFilters.value.technology =
    localFilters.value.technology === tech ? null : tech;
}

function handleApply() {
  emit('update:filters', { ...localFilters.value });
}

function handleReset() {
  emit('reset');
}

function handleFollow(studentId) {
  const next = new Set(followedStudents.value);

  if (next.has(studentId)) {
    next.delete(studentId);
  } else {
    next.add(studentId);
  }

  followedStudents.value = next;
}
</script>

<style scoped>
.filters-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: 0;
  background: transparent;
  border: none;
}

/* Main filters card */
.filters-card,
.discover-section {
  border-radius: var(--radius-lg);
  border: 1px solid rgba(var(--color-primary-rgb), 0.075);
  background: rgba(var(--color-surface-rgb), 0.82);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.04);
}

.filters-card {
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-md) var(--space-sm);
}

.panel-title,
.discover-title {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-bold);
  color: rgba(var(--color-primary-rgb), 0.9);
}

.btn-reset {
  border: none;
  background: transparent;
  padding: 0;
  color: rgba(var(--color-secondary-rgb), 0.95);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.btn-reset:hover {
  opacity: 0.72;
}

.filters-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: 0 var(--space-md) var(--space-md);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.group-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: var(--font-bold);
  color: rgba(var(--color-primary-rgb), 0.42);
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-badge {
  border: 1px solid rgba(var(--color-primary-rgb), 0.09);
  border-radius: 999px;
  padding: 5px 10px;
  background: rgba(var(--color-background-rgb), 0.5);
  color: rgba(var(--color-primary-rgb), 0.62);
  font-size: 10px;
  font-weight: var(--font-medium);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
}

.tag-badge:hover {
  transform: translateY(-1px);
  background: rgba(var(--color-primary-rgb), 0.055);
  color: rgba(var(--color-primary-rgb), 0.85);
}

.tag-badge.is-active {
  border-color: rgba(var(--color-secondary-rgb), 0.34);
  background: rgba(var(--color-secondary-rgb), 0.12);
  color: rgba(var(--color-secondary-rgb), 0.98);
  font-weight: var(--font-semibold);
}

.btn-apply {
  width: fit-content;
  align-self: center;
  margin-top: var(--space-xs);
  padding: 0.55rem 1.4rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.9);
  border-radius: 999px;
  background: rgba(var(--color-primary-rgb), 0.92);
  color: var(--color-background);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.btn-apply:hover {
  transform: translateY(-1px);
  background: rgba(var(--color-primary-rgb), 1);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.09);
}

/* Discover card */
.discover-section {
  display: flex;
  flex-direction: column;
  padding: var(--space-md);
}

.discover-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: var(--space-md);
}

.discover-subtitle {
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  color: rgba(var(--color-primary-rgb), 0.48);
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.student-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-sm);
  padding: 6px;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.student-card:hover {
  background: rgba(var(--color-primary-rgb), 0.035);
}

.student-avatar {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 999px;
  background: rgba(var(--color-secondary-rgb), 0.12);
  color: rgba(var(--color-secondary-rgb), 0.96);
  font-size: 10px;
  font-weight: var(--font-bold);
}

.student-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.student-name {
  font-size: var(--font-size-xxs);
  font-weight: var(--font-semibold);
  color: rgba(var(--color-primary-rgb), 0.86);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.student-speciality {
  font-size: 10px;
  color: rgba(var(--color-primary-rgb), 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.student-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}

.micro-badge {
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(var(--color-primary-rgb), 0.055);
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: 9px;
  font-weight: var(--font-medium);
}

.btn-follow {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.58);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
}

.btn-follow:hover {
  transform: translateY(-1px);
  border-color: rgba(var(--color-secondary-rgb), 0.34);
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: rgba(var(--color-secondary-rgb), 0.96);
}

.btn-follow.is-following {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.12);
  color: rgb(22, 163, 74);
}

.btn-follow.is-following:hover {
  border-color: rgba(34, 197, 94, 0.45);
  background: rgba(34, 197, 94, 0.16);
  color: rgb(21, 128, 61);
}

.follow-icon {
  font-size: var(--font-size-sm);
  font-weight: var(--font-bold);
  line-height: 1;
}
</style>