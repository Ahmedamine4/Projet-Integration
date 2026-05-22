<script setup>
import Project from '@/components/portfolio/Project.vue';
defineProps({
  projects: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <div class="projects-shell">
    <div class="projects">
      <template v-for="project in projects" :key="project.id">
        <Project :project />
      </template>
    </div>
  </div>
</template>

<style scoped>
.projects-shell {
  --border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  position: relative;
  width: 100%;
  height: fit-content;
  border: var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-background);
  padding: 0;
}

.projects {
  display: flex;
  position: relative;
  z-index: 1;
  gap: var(--space-lg);
  height: fit-content;
  width: 100%;
  overflow-x: auto;
  padding: var(--space-xl);
}

.projects-shell::before,
.projects-shell::after {
  content: '';
  position: absolute;
  width: var(--space-xl);
  pointer-events: none;
  z-index: 2;
}

.projects-shell::before {
  inset: 0 auto 0 0;
  background: linear-gradient(
    to right,
    var(--color-background) 60%,
    transparent
  );
}

.projects-shell::after {
  inset: 0 0 0 auto;
  background: linear-gradient(
    to left,
    var(--color-background) 60%,
    transparent
  );
}
</style>