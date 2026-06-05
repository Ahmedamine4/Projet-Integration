<script setup>
import { Award, TrendingUp, UserPlus, Activity } from 'lucide-vue-next';

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
  trendingTechs: {
    type: Array,
    default: () => [],
  },
  suggestions: {
    type: Array,
    default: () => [],
  },
  activities: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:filters', 'reset']);

function patchFilters(partial) {
  emit('update:filters', {
    ...props.filters,
    ...partial,
  });
}

function toggleTechnology(technology) {
  patchFilters({
    technology: props.filters.technology === technology ? null : technology,
  });
}

function toggleDomain(domain) {
  patchFilters({
    domain: props.filters.domain === domain ? null : domain,
  });
}
</script>

<template>
  <aside class="feed-right-panel">
    <section class="panel-card">
      <div class="panel-header">
        <h2>Filters</h2>

        <button
          type="button"
          @click="emit('reset')"
        >
          Reset
        </button>
      </div>

      <div class="filter-block">
        <label>Status</label>

        <div class="filter-toggle">
          <button
            type="button"
            :class="{ selected: !filters.certifiedOnly }"
            @click="patchFilters({ certifiedOnly: false })"
          >
            Tous les projets
          </button>

          <button
            type="button"
            :class="{ selected: filters.certifiedOnly }"
            @click="patchFilters({ certifiedOnly: true })"
          >
            <Award :size="14" />
            Certifiés
          </button>
        </div>
      </div>

      <div class="filter-block">
        <label>Filière</label>

        <select
          :value="filters.scope"
          @change="patchFilters({ scope: $event.target.value })"
        >
          <option value="speciality">Ma spécialité</option>
          <option value="school">Toute l'école</option>
        </select>
      </div>

      <div class="filter-block">
        <label>Tri</label>

        <select
          :value="filters.sort"
          @change="patchFilters({ sort: $event.target.value })"
        >
          <option value="trending">Tendances</option>
          <option value="recent">Plus récents</option>
          <option value="top_month">Top du mois</option>
        </select>
      </div>
    </section>

    <section class="panel-card">
      <div class="widget-title">
        <TrendingUp :size="16" />
        <h3>Trending techs</h3>
      </div>

      <div class="tech-list">
        <button
          v-for="tech in trendingTechs"
          :key="tech.name"
          type="button"
          :class="{ selected: filters.technology === tech.name }"
          @click="toggleTechnology(tech.name)"
        >
          #{{ tech.name }}
          <span>{{ tech.count }}</span>
        </button>
      </div>
    </section>

    <section class="panel-card">
      <div class="widget-title">
        <UserPlus :size="16" />
        <h3>Who to follow</h3>
      </div>

      <div class="suggestion-list">
        <div
          v-for="student in suggestions"
          :key="student.id"
          class="suggestion-item"
        >
          <div class="suggestion-avatar">
            {{ student.name.charAt(0) }}
          </div>

          <div>
            <strong>{{ student.name }}</strong>
            <span>{{ student.stack }}</span>
          </div>

          <button type="button">
            Follow
          </button>
        </div>
      </div>
    </section>

    <section
      v-if="activities.length"
      class="panel-card"
    >
      <div class="widget-title">
        <Activity :size="16" />
        <h3>Live activity</h3>
      </div>

      <div class="activity-list">
        <p
          v-for="activity in activities"
          :key="activity.id"
        >
          {{ activity.text }}
        </p>
      </div>
    </section>
  </aside>
</template>

<style scoped>
.feed-right-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.panel-card {
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  background-color: rgba(var(--color-surface-rgb), 0.56);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.045);
}

.panel-header,
.widget-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.widget-title {
  justify-content: flex-start;
}

.panel-header h2,
.widget-title h3 {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.94);
  font-size: var(--font-size-md);
  font-weight: var(--font-bold);
}

.panel-header button {
  border: none;
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.48);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-semibold);
  cursor: pointer;
}

.filter-block {
  display: grid;
  gap: var(--space-sm);
}

.filter-block + .filter-block {
  margin-top: var(--space-lg);
}

.filter-block label {
  color: rgba(var(--color-primary-rgb), 0.56);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.filter-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xs);
}

.filter-toggle button,
.tech-list button,
.suggestion-item button {
  border-radius: 999px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  background-color: rgba(var(--color-background-rgb), 0.48);
  color: rgba(var(--color-primary-rgb), 0.6);
  cursor: pointer;
  font-size: var(--font-size-xxs);
  font-weight: var(--font-semibold);
}

.filter-toggle button {
  height: 2.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
}

.filter-toggle button.selected,
.tech-list button.selected {
  border-color: rgba(var(--color-secondary-rgb), 0.3);
  background-color: rgba(var(--color-secondary-rgb), 0.16);
  color: rgba(var(--color-primary-rgb), 0.92);
}

.filter-block select {
  width: 100%;
  height: 2.45rem;
  padding: 0 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  background-color: rgba(var(--color-background-rgb), 0.5);
  color: rgba(var(--color-primary-rgb), 0.82);
  font-size: var(--font-size-sm);
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.tech-list button {
  padding: 0.45rem 0.65rem;
}

.tech-list button span {
  margin-left: 0.3rem;
  opacity: 0.55;
}

.suggestion-list,
.activity-list {
  display: grid;
  gap: var(--space-md);
}

.suggestion-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-sm);
}

.suggestion-avatar {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background-color: rgba(var(--color-primary-rgb), 0.06);
  color: rgba(var(--color-primary-rgb), 0.8);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
}

.suggestion-item strong {
  display: block;
  color: rgba(var(--color-primary-rgb), 0.86);
  font-size: var(--font-size-xs);
}

.suggestion-item span {
  display: block;
  color: rgba(var(--color-primary-rgb), 0.48);
  font-size: var(--font-size-xxs);
}

.suggestion-item button {
  padding: 0.35rem 0.6rem;
}

.activity-list p {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.56);
  font-size: var(--font-size-xxs);
  line-height: 1.45;
}
</style>