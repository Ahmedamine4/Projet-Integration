<script setup>
import {
  BadgeCheck,
  ChevronDown,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Users,
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
  trendingTechs: {
    type: Array,
    default: () => [],
  },
  suggestedStudents: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:filters', 'reset']);

function updateFilter(key, value) {
  emit('update:filters', {
    ...props.filters,
    [key]: props.filters[key] === value ? null : value,
  });
}

function updateDirectFilter(key, value) {
  emit('update:filters', {
    ...props.filters,
    [key]: value,
  });
}

function toggleCertifiedOnly() {
  emit('update:filters', {
    ...props.filters,
    certifiedOnly: !props.filters.certifiedOnly,
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

            <button
              type="button"
              class="filter-chip"
              :class="{ 'is-active': filters.sort === 'top-month' }"
              @click="updateDirectFilter('sort', 'top-month')"
            >
              Top month
            </button>
          </div>
        </section>

        <section class="filter-group">
          <div class="filter-title">
            <BadgeCheck
              :size="20"
              :stroke-width="1.9"
            />
            <h3>Skills</h3>
          </div>

          <div class="filter-chips">
            <button
              type="button"
              class="filter-chip"
              :class="{ 'is-active': filters.certifiedOnly }"
              @click="toggleCertifiedOnly"
            >
              Certified only
            </button>

            <button
              v-for="technology in technologies"
              :key="technology"
              type="button"
              class="filter-chip"
              :class="{ 'is-active': filters.technology === technology }"
              @click="updateFilter('technology', technology)"
            >
              {{ technology }}
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

          <ul
            v-if="domains.length"
            class="domains-list"
          >
            <li
              v-for="domain in domains"
              :key="domain"
            >
              <button
                type="button"
                class="domain-button"
                :class="{ 'is-active': filters.domain === domain }"
                @click="updateFilter('domain', domain)"
              >
                {{ domain }}
              </button>
            </li>
          </ul>

          <div
            v-else
            class="empty-box"
          >
            No domains available yet.
          </div>
        </section>

        <section
          v-if="trendingTechs.length"
          class="filter-group"
        >
          <div class="filter-title">
            <Sparkles
              :size="20"
              :stroke-width="1.9"
            />
            <h3>Trending skills</h3>
          </div>

          <div class="trending-list">
            <button
              v-for="tech in trendingTechs"
              :key="tech.name"
              type="button"
              class="trending-item"
              :class="{ 'is-active': filters.technology === tech.name }"
              @click="updateFilter('technology', tech.name)"
            >
              <span>{{ tech.name }}</span>
              <small>{{ tech.projectsCount }} projects</small>
            </button>
          </div>
        </section>

        <section
          v-if="suggestedStudents.length"
          class="filter-group"
        >
          <div class="filter-title">
            <Users
              :size="20"
              :stroke-width="1.9"
            />
            <h3>Suggested students</h3>
          </div>

          <div class="students-list">
            <article
              v-for="student in suggestedStudents"
              :key="student.id"
              class="student-card"
            >
              <div class="student-avatar">
                {{ student.initials }}
              </div>

              <div class="student-info">
                <strong>{{ student.name }}</strong>
                <span>{{ student.speciality }}</span>

                <div class="student-stack">
                  <small
                    v-for="item in student.stack"
                    :key="item"
                  >
                    {{ item }}
                  </small>
                </div>
              </div>
            </article>
          </div>
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

.domains-list {
  display: grid;
  gap: var(--space-xs);
  margin: 0;
  padding: 0;
  list-style: none;
}

.domains-list li {
  position: relative;
  padding-left: 1.2rem;
}

.domains-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.72rem;
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 50%;
  background-color: var(--color-secondary);
}

.domain-button {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0.2rem 0;
  color: rgba(var(--color-primary-rgb), 0.72);
  font: inherit;
  font-size: var(--font-size-xs);
  line-height: 1.35;
  text-align: left;
  cursor: pointer;
  transition:
    color var(--transition-fast),
    transform var(--transition-fast);
}

.domain-button:hover {
  transform: translateX(2px);
  color: rgba(var(--color-primary-rgb), 0.92);
}

.domain-button.is-active {
  color: rgba(var(--color-secondary-rgb), 0.98);
  font-weight: var(--font-bold);
}

.empty-box {
  border: 1px dashed rgba(var(--color-primary-rgb), 0.18);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  color: rgba(var(--color-primary-rgb), 0.58);
  font-size: var(--font-size-xs);
}

.trending-list {
  display: grid;
  gap: var(--space-xs);
}

.trending-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-md);
  padding: var(--space-sm);
  background: rgba(var(--color-background-rgb), 0.36);
  color: rgba(var(--color-primary-rgb), 0.72);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    transform var(--transition-fast);
}

.trending-item span {
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);
}

.trending-item small {
  color: rgba(var(--color-primary-rgb), 0.46);
  font-size: 10px;
  white-space: nowrap;
}

.trending-item:hover {
  transform: translateY(-1px);
  background: rgba(var(--color-primary-rgb), 0.04);
}

.trending-item.is-active {
  border-color: rgba(var(--color-secondary-rgb), 0.24);
  background: rgba(var(--color-secondary-rgb), 0.08);
}

.students-list {
  display: grid;
  gap: var(--space-sm);
}

.student-card {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-md);
  background: rgba(var(--color-background-rgb), 0.36);
}

.student-avatar {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 999px;
  background: rgba(var(--color-secondary-rgb), 0.12);
  color: rgba(var(--color-secondary-rgb), 0.96);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
}

.student-info {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.student-info strong {
  color: rgba(var(--color-primary-rgb), 0.86);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.student-info > span {
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-xxs);
}

.student-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}

.student-stack small {
  display: inline-flex;
  width: fit-content;
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  border-radius: 999px;
  padding: 0.16rem 0.45rem;
  color: rgba(var(--color-primary-rgb), 0.58);
  font-size: 9px;
  font-weight: var(--font-medium);
}
</style>