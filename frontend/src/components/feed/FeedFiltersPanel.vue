<script setup>
import { computed } from 'vue';
import BaseSelect from '@/components/common/forms/BaseSelect.vue';
import BaseLabelGroup from '@/components/common/forms/BaseLabels.vue';

import {
  ChevronDown,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-vue-next';

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
});

const emit = defineEmits(['update:filters', 'reset']);

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
    return props.filters.technology || null;
  },
  set(value) {
    emit('update:filters', {
      ...props.filters,
      technology: value || null,
    });
  },
});

const technologyItems = computed(() => {
  return props.technologies.map((technology) => {
    const name =
      typeof technology === 'string'
        ? technology
        : technology.name || technology.label || technology.title || '';

    return {
      name,
      selected: selectedTechnology.value === name,
    };
  }).filter((technology) => technology.name);
});

function updateDirectFilter(key, value) {
  emit('update:filters', {
    ...props.filters,
    [key]: value,
  });
}

function toggleTechnology(item) {
  selectedTechnology.value = item.selected ? null : item.name;
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

          <BaseSelect
            v-model="selectedDomain"
            :options="domains"
            placeholder="Select a domain"
          />
        </section>

        <section class="filter-group">
          <BaseLabelGroup
            title="Technologies"
            :items="technologyItems"
            color-rgb="var(--color-secondary-rgb)"
            @toggle="toggleTechnology"
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
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: 1.1rem var(--space-lg);
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
  gap: var(--space-lg);
  padding: var(--space-lg);
}

.filter-group {
  display: grid;
  gap: var(--space-sm);
}

.filter-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: rgba(var(--color-primary-rgb), 0.72);
}

.filter-title h3 {
  margin: 0;
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-bold);
  line-height: 1;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-width: 5.2rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.16);
  border-radius: 999px;
  padding: 0.3rem 0.85rem;
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.76);
  font-size: var(--font-size-xs);
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
</style>