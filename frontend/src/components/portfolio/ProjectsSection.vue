<script setup>
import { ref } from 'vue';
import Project from '@/components/portfolio/Project.vue';
defineProps({
  projects: {
    type: Array,
    default: () => [],
  },
});

const projectsRef = ref(null);
const isDragging = ref(false);
const startX = ref(0);
const scrollLeft = ref(0);

function handleMouseDown(event) {
  isDragging.value = true;

  const rect = projectsRef.value.getBoundingClientRect();
  startX.value = event.clientX - rect.left;

  scrollLeft.value = projectsRef.value.scrollLeft;
}

function handleMouseMove(event) {
  if (!isDragging.value) return;

  const rect = projectsRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left;

  const DeltaX = x - startX.value;

  projectsRef.value.scrollLeft = scrollLeft.value - DeltaX;
}

function handleMouseUp() {
  isDragging.value = false;
}
</script>

<template>
  <div class="projects-shell">
    <div
      class="projects"
      ref="projectsRef"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    >
      <template v-for="project in projects" :key="project.id">
        <Project
          :project
        />
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