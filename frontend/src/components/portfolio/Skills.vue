<script setup>
import { BadgeCheck, Layers } from 'lucide-vue-next';

const props = defineProps({
  userId: { type: String, required: true },
});

const skills = [
  'React',
  'Node.js',
  'PostgreSQL',
  'Docker',
  'GitHub Actions',
  'Python',
];

const domains = [
  'Web Frontend',
  'Web Backend',
  'DevOps and Cloud Infrastructure',
  'Machine Learning and AI',
];
</script>

<template>
  <div class="skills">
    <header>
      <h2>Skills & domains</h2>
    </header>
    <div class="skills__body">
      <section class="skills__group">
        <div class="skills__title">
          <BadgeCheck :size="20" :stroke-width="1.9" />
          <h3>Skills</h3>
        </div>

        <div class="skills__chips">
          <span
            v-for="skill in skills"
            :key="skill"
          >
            {{ skill }}
          </span>
        </div>
      </section>

      <section class="skills__group">
        <div class="skills__title">
          <Layers :size="20" :stroke-width="1.9" />
          <h3>Domains</h3>
        </div>

        <ul class="domains">
          <li
            v-for="domain in domains"
            :key="domain"
          >
            {{ domain }}
          </li>
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
  border-radius: var(--radius-md);
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
</style>
