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
const lastX = ref(0);
const lastTime = ref(0);
const velocity = ref(0);
const animationFrame = ref(null);

const dragSpeed = 1.2;
const minReleaseVelocity = 0.05;
const frictionPerFrame = 0.95;
const targetFrameDuration = 16;

function handleMouseDown(event) {
  isDragging.value = true;
  velocity.value = 0;

  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
    animationFrame.value = null;
  }

  lastX.value = event.clientX;
  lastTime.value = performance.now();
}

function handleMouseMove(event) {
  if (!isDragging.value) return;

  event.preventDefault();

  const deltaX = event.clientX - lastX.value;

  projectsRef.value.scrollBy({
    left: -deltaX * dragSpeed,
  });

  const now = performance.now();
  const deltaTime = now - lastTime.value;

  if (deltaTime > 0) {
    velocity.value = deltaX / deltaTime;
  }

  lastX.value = event.clientX;
  lastTime.value = now;
}

function handleMouseUp() {
  if (!isDragging.value) return;

  isDragging.value = false;

  if (Math.abs(velocity.value) < minReleaseVelocity) return;

  lastTime.value = performance.now();
  animationFrame.value = requestAnimationFrame(applyMomentum);
}

function applyMomentum(currentTime) {
  if (Math.abs(velocity.value) < minReleaseVelocity) {
    animationFrame.value = null;
    return;
  }

  const deltaTime = currentTime - lastTime.value;

  projectsRef.value.scrollBy({
    left: -velocity.value * deltaTime,
  });

  velocity.value *= frictionPerFrame ** (deltaTime / targetFrameDuration);
  lastTime.value = currentTime;

  animationFrame.value = requestAnimationFrame(applyMomentum);
}
</script>

<template>
  <div class="projects-shell">
    <div class="title">Projects</div>
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
  --padding-inline: var(--space-xl);
  --border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  position: relative;
  width: 100%;
  height: fit-content;
  border-block: var(--border);
  border-radius: 0;
  background: var(--color-background);
  padding: 0;
}

.title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  line-height: 1;
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  background-color: var(--color-background);
  padding: 0 var(--space-md);
  color: rgba(var(--color-primary-rgb), 0.48);
  letter-spacing: 0.04em;
}

.projects {
  display: flex;
  position: relative;
  z-index: 1;
  gap: var(--space-lg);
  height: fit-content;
  width: 100%;
  overflow-x: auto;
  padding: var(--padding-inline);
  overscroll-behavior-x: contain;
  cursor: grab;
}

.projects:active {
  cursor: grabbing;
}

.projects::-webkit-scrollbar {
  display: none;
}

.projects-shell::before,
.projects-shell::after {
  content: '';
  position: absolute;
  width: var(--padding-inline);
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

@media (max-width: 640px) {
  .projects-shell {
    --padding-inline: var(--space-md);
  }

  .projects {
    gap: var(--space-md);
  }
}
</style>