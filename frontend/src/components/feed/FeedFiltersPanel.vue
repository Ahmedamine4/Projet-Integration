<script setup>
import { computed } from 'vue';
import BaseInput from '@/components/common/forms/BaseInput.vue';
import BaseDropdown from '@/components/common/forms/BaseDropdown.vue';
import {
  ChevronDown,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Cpu,
} from 'lucide-vue-next';

const props = defineProps({
  search: {
    type: String,
    default: '',
  },
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
});

const emit = defineEmits(['update:filters', 'update:search', 'reset']);

const searchModel = computed({
  get() {
    return props.search;
  },
  set(value) {
    emit('update:search', value);
  },
});

const selectedDomain = computed({
  get() {
    return props.filters.domain || '';
  },
  set(value) {
    emit('update:filters', {
      ...props.filters,
      domain: value || null,
    });
  },
});

const selectedTechnology = computed({
  get() {
    return props.filters.technology || '';
  },
  set(value) {
    emit('update:filters', {
      ...props.filters,
      technology: value || null,
    });
  },
});

const domainOptions = computed(() => {
  return props.domains
    .map((domain) => {
      if (typeof domain === 'string') return domain;

      return (
        domain.nom ||
        domain.name ||
        domain.label ||
        domain.title ||
        ''
      );
    })
    .filter(Boolean);
});

const technologyOptions = computed(() => {
  return props.technologies
    .map((technology) => {
      if (typeof technology === 'string') return technology;

      return (
        technology.nom ||
        technology.name ||
        technology.label ||
        technology.title ||
        ''
      );
    })
    .filter(Boolean);
});

function updateDirectFilter(key, value) {
  emit('update:filters', {
    ...props.filters,
    [key]: value,
  });
}

function handleReset() {
  emit('reset');
}
</script>

<template>
  <aside class="filters-panel">
    <div class="filters-card">
      <header class="panel-header">
        <div class="panel-title-wrap">
          <SlidersHorizontal
            :size="20"
            :stroke-width="1.9"
          />

          <h2 class="panel-title">
            Filters
          </h2>
        </div>

        <button
          type="button"
          class="btn-reset"
          @click="handleReset"
        >
          <RotateCcw :size="13" />
          Reset
        </button>
      </header>

      <div class="filters-body">
        <section class="filter-group">
          <BaseInput
            v-model="searchModel"
            label="Search"
            placeholder="Search projects, students, technologies..."
          />
        </section>

        <section class="filter-group">
          <div class="filter-title">
            <Sparkles
              :size="20"
              :stroke-width="1.9"
            />

            <h3>Discovery</h3>
          </div>

          <div class="filter-chips">
            <button
              type="button"
              class="filter-chip"
              :class="{ 'is-active': filters.source === 'all' }"
              @click="updateDirectFilter('source', 'all')"
            >
              All projects
            </button>

            <button
              type="button"
              class="filter-chip"
              :class="{ 'is-active': filters.source === 'same-school' }"
              @click="updateDirectFilter('source', 'same-school')"
            >
              Same school
            </button>

            <button
              type="button"
              class="filter-chip"
              :class="{ 'is-active': filters.source === 'following' }"
              @click="updateDirectFilter('source', 'following')"
            >
              Following
            </button>
          </div>
        </section>

        <section class="filter-group">
          <div class="filter-title">
            <ChevronDown
              :size="20"
              :stroke-width="1.9"
            />

            <h3>Sort by</h3>
          </div>

          <div class="filter-chips">
            <button
              type="button"
              class="filter-chip"
              :class="{ 'is-active': filters.sort === 'trending' }"
              @click="updateDirectFilter('sort', 'trending')"
            >
              Trending
            </button>

            <button
              type="button"
              class="filter-chip"
              :class="{ 'is-active': filters.sort === 'recent' }"
              @click="updateDirectFilter('sort', 'recent')"
            >
              Recent
            </button>
          </div>
        </section>

        <section class="filter-group">
          <div class="filter-title">
            <Layers
              :size="20"
              :stroke-width="1.9"
            />

            <h3>Domains</h3>
          </div>

          <BaseDropdown
            v-model="selectedDomain"
            :options="domainOptions"
            placeholder="Search or select a domain"
            :visible-options="5"
          />
        </section>

        <section class="filter-group">
          <div class="filter-title">
            <Cpu
              :size="20"
              :stroke-width="1.9"
            />

            <h3>Technologies</h3>
          </div>

          <BaseDropdown
            v-model="selectedTechnology"
            :options="technologyOptions"
            placeholder="Search or select a technology"
            :visible-options="5"
          />
        </section>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.filters-panel {
  width: 100%;
}

.filters-card {
  --border: 1px solid rgba(var(--color-primary-rgb), 0.08);

  display: flex;
  flex-direction: column;
  border: var(--border);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(
      180deg,
      rgba(var(--color-surface-rgb), 0.52),
      rgba(var(--color-background-rgb), 0.84)
    );
  box-shadow: none;
  overflow: visible;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  padding: 0.75rem var(--space-md);
  border-bottom: var(--border);
}

.panel-title-wrap {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  color: rgba(var(--color-primary-rgb), 0.72);
}

.panel-title {
  margin: 0;
  color: var(--color-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-bold);
  line-height: 1;
}

.btn-reset {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  border-radius: 999px;
  padding: 0.3rem 0.65rem;
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.58);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  line-height: 1;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
}

.btn-reset:hover {
  transform: translateY(-1px);
  background: rgba(var(--color-primary-rgb), 0.05);
  color: rgba(var(--color-primary-rgb), 0.82);
}

.filters-body {
  display: grid;
  gap: 0.9rem;
  padding: 0.9rem var(--space-md);
}

.filter-group {
  display: grid;
  gap: 0.45rem;
  position: relative;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: rgba(var(--color-primary-rgb), 0.72);
}

.filter-title h3 {
  margin: 0;
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  line-height: 1;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-width: auto;
  border: 1px solid rgba(var(--color-primary-rgb), 0.16);
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.76);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  line-height: 1;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
}

.filter-chip:hover {
  transform: translateY(-1px);
  background: rgba(var(--color-primary-rgb), 0.04);
  color: rgba(var(--color-primary-rgb), 0.9);
}

.filter-chip.is-active {
  border-color: rgba(var(--color-secondary-rgb), 0.28);
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: rgba(var(--color-secondary-rgb), 0.98);
}

.filter-group :deep(.dropdown__list) {
  z-index: 9999;
}
</style>
