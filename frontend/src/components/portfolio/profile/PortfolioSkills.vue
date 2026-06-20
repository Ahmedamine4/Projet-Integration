<script setup>
import { computed, ref, watch } from 'vue';
import { BadgeCheck, ChevronDown, ChevronUp, Layers } from 'lucide-vue-next';
import PortfolioEmptyState from '@/components/portfolio/shared/PortfolioEmptyState.vue';

const props = defineProps({
  userId: { type: String, required: true },
  skills: {
    type: Array,
    default: () => [],
  },
  domains: {
    type: Array,
    default: () => [],
  },
});

const SKILLS_PREVIEW_LIMIT = 8;
const DOMAINS_PREVIEW_LIMIT = 5;

const areSkillsExpanded = ref(false);
const areDomainsExpanded = ref(false);

const hiddenSkillsCount = computed(() =>
  Math.max(props.skills.length - SKILLS_PREVIEW_LIMIT, 0)
);
const hiddenDomainsCount = computed(() =>
  Math.max(props.domains.length - DOMAINS_PREVIEW_LIMIT, 0)
);
const visibleSkills = computed(() =>
  areSkillsExpanded.value
    ? props.skills
    : props.skills.slice(0, SKILLS_PREVIEW_LIMIT)
);
const visibleDomains = computed(() =>
  areDomainsExpanded.value
    ? props.domains
    : props.domains.slice(0, DOMAINS_PREVIEW_LIMIT)
);

watch(
  () => props.skills,
  () => {
    areSkillsExpanded.value = false;
  }
);

watch(
  () => props.domains,
  () => {
    areDomainsExpanded.value = false;
  }
);
</script>

<template>
  <div class="skills">
    <header>
      <h2>Skills & domains</h2>
    </header>
    <div class="skills__body">
      <section class="skills__group">
        <div class="skills__title">
          <BadgeCheck
            :size="20"
            :stroke-width="1.9"
          />
          <h3>Skills</h3>
        </div>

        <div class="skills__chips">
          <span
            v-for="skill in visibleSkills"
            :key="skill"
          >
            {{ skill }}
          </span>
          <PortfolioEmptyState
            v-if="!skills.length"
            class="skills__empty"
            message="No skills have been detected yet."
          />
        </div>
        <button
          v-if="hiddenSkillsCount"
          class="skills-list-toggle"
          type="button"
          @click="areSkillsExpanded = !areSkillsExpanded"
        >
          <span>
            {{ areSkillsExpanded ? 'Show fewer skills' : `View all skills (${skills.length})` }}
          </span>
          <ChevronUp
            v-if="areSkillsExpanded"
            :size="15"
          />
          <ChevronDown
            v-else
            :size="15"
          />
        </button>
      </section>

      <section class="skills__group">
        <div class="skills__title">
          <Layers
            :size="20"
            :stroke-width="1.9"
          />
          <h3>Domains</h3>
        </div>

        <ul class="domains">
          <li
            v-for="domain in visibleDomains"
            :key="domain"
          >
            {{ domain }}
          </li>
          <li
            v-if="hiddenDomainsCount"
            class="domains__toggle-item"
          >
            <button
              class="skills-list-toggle domains__more"
              type="button"
              @click="areDomainsExpanded = !areDomainsExpanded"
            >
              <span>
                {{ areDomainsExpanded ? 'Show fewer domains' : `View all domains (${domains.length})` }}
              </span>
              <ChevronUp
                v-if="areDomainsExpanded"
                :size="15"
              />
              <ChevronDown
                v-else
                :size="15"
              />
            </button>
          </li>
          <PortfolioEmptyState
            v-if="!domains.length"
            as="li"
            class="domains__empty"
            message="No domains have been detected yet."
          />
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.skills {
  --border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  display: flex;
  flex-direction: column;
  border: var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 16px rgba(0, 0, 0, 0.04);
  background-color: rgba(var(--color-surface-rgb), 0.3);
}

.skills header {
  border-bottom: var(--border);
  padding: 1.38rem var(--space-xl);
}

.skills header h2 {
  margin: 0;
  font-weight: var(--font-bold);
  line-height: 1;
  font-size: var(--font-size-lg);
}

.skills__body {
  display: grid;
  gap: var(--space-lg);
  padding: var(--space-lg) var(--space-xl);
}

.skills__group {
  display: grid;
  gap: var(--space-sm);
}

.skills__title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: rgba(var(--color-primary-rgb), 0.72);
}

.skills__title h3 {
  margin: 0;
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-bold);
  line-height: 1;
}

.skills__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.skills__chips span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 5.4rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.16);
  border-radius: 999px;
  padding: 0.3rem 0.85rem;
  color: rgba(var(--color-primary-rgb), 0.76);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  line-height: 1;
}

.skills-list-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  width: fit-content;
  border: 0;
  padding: 0.25rem 0;
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.56);
  font-family: inherit;
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  line-height: 1;
  cursor: pointer;
  justify-self: start;
}

.skills-list-toggle:hover {
  color: rgba(var(--color-primary-rgb), 0.78);
}

.domains {
  display: grid;
  gap: var(--space-xs);
  margin: 0;
  padding: 0;
  list-style: none;
}

.domains li {
  position: relative;
  padding-left: 1.2rem;
  color: rgba(var(--color-primary-rgb), 0.72);
  font-size: var(--font-size-xs);
  line-height: 1.25;
}

.domains li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5em;
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 50%;
  background-color: var(--color-secondary);
}

.domains .domains__toggle-item {
  padding-left: 0;
}

.domains .domains__toggle-item::before {
  display: none;
}

.domains__empty::before {
  display: none;
}

.skills__empty {
  flex: 1 0 100%;
}
</style>
