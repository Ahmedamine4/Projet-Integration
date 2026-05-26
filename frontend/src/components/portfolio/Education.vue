<script setup>
import { GraduationCap } from 'lucide-vue-next';

const props = defineProps({
  userId: { type: String, required: true },
});

const educationItems = [
  {
    id: 'institution_ensa_tanger_master',
    school: 'ENSA Tanger',
    level: 'Master',
    description: 'Advanced software engineering and information systems studies.',
    period: '2025 - Present',
  },
  {
    id: 'institution_ensa_tanger',
    school: 'ENSA Tanger',
    level: 'Bachelor / Licence',
    description: 'Computer science and software engineering studies.',
    period: '2023 - 2025',
  },
];
</script>

<template>
  <div class="education">
    <header>
      <h2>Education</h2>
    </header>
    <div class="education__body">
      <article
        v-for="item in educationItems"
        :key="item.id"
        class="education__item"
      >
        <div class="education__icon" aria-hidden="true">
          <GraduationCap :size="18" :stroke-width="1.9" />
        </div>
        <div class="education__content">
          <div class="education__heading">
            <h3>{{ item.school }}</h3>
            <span>{{ item.period }}</span>
          </div>
          <p class="education__degree">{{ item.level }}</p>
          <p class="education__description">{{ item.description }}</p>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.education {
  --border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  display: flex;
  flex-direction: column;
  border: var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 16px rgba(0, 0, 0, 0.04);
  background-color: rgba(var(--color-surface-rgb), 0.3);
}

.education header {
  border-bottom: var(--border);
  padding: 1.38rem var(--space-xl);
}

.education header h2 {
  margin: 0;
  font-weight: var(--font-bold);
  line-height: 1;
  font-size: var(--font-size-lg);
}

.education__body {
  display: grid;
  gap: var(--space-md);
  padding: var(--space-lg) var(--space-xl);
}

.education__item {
  display: grid;
  grid-template-columns: 2.35rem 1fr;
  gap: var(--space-lg);
  align-items: start;
}

.education__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.35rem;
  height: 2.35rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.18);
  border-radius: 50%;
  color: rgba(var(--color-primary-rgb), 0.68);
}

.education__content {
  display: grid;
  gap: var(--space-xs);
  min-width: 0;
}

.education__heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-md);
}

.education__heading h3,
.education__content p {
  margin: 0;
}

.education__heading h3 {
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-bold);
  line-height: 1.2;
}

.education__heading span {
  flex: 0 0 auto;
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
}

.education__degree {
  color: rgba(var(--color-primary-rgb), 0.76);
  font-size: var(--font-size-xs);
  font-weight: var(--font-regular);
}

.education__description {
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-xs);
  font-weight: var(--font-light);
  line-height: 1.3;
}
</style>
