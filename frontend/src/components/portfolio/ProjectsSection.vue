<script setup>
import { ref } from 'vue';
import { Plus } from 'lucide-vue-next';
import Project from '@/components/portfolio/Project.vue';
defineProps({
  projects: {
    type: Array,
    default: () => [],
  },
  canAdd: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['add-project', 'edit-project']);

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
    <div class="projects-header">
      <div class="title">Projects</div>
      <button
        v-if="canAdd"
        type="button"
        class="add-project-button"
        @click="emit('add-project')"
      >
        <Plus :size="15" />
        Add Project
      </button>
    </div>
    <div
      v-if="projects.length"
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
          :can-edit="canAdd"
          @edit="project => emit('edit-project', project)"
        />
      </template>
    </div>

    <div class="projects-empty" v-else>
      No projects yet
    </div>
  </div>
</template>

<style scoped>
.projects-shell {
  --padding-inline: var(--portfolio-section-bleed, var(--space-xl));
  --fade-width: var(--padding-inline);
  --padding-block: calc(var(--space-xl) * 1.5);
  --border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  position: relative;
  width: 100%;
  height: fit-content;
  border-bottom: var(--border);
  border-radius: 0;
  background: var(--color-background);
  padding: 0;
}

.projects-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-lg);
}

.title {
  position: relative;
  padding-inline: var(--padding-inline);
  background: transparent;
  color: var(--color-primary);
  font-family: var(--font-editorial);
  font-size: 2.45rem;
  font-weight: var(--font-medium);
  line-height: 1;
  letter-spacing: 0;
}

.add-project-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  border: none;
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  border-radius: var(--radius-sm);
  background-color: var(--color-primary);
  color: var(--color-background);
  padding-block: var(--space-sm);
  padding-inline: 0.75rem var(--space-md);
  margin-right: var(--padding-inline);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.38);
  cursor: pointer;
	transition:
		background-color var(--transition-fast),
		box-shadow var(--transition-fast),
		transform var(--transition-fast);
}

.add-project-button:hover {
	background-color: rgba(var(--color-primary-rgb), 0.92);
  box-shadow: 0 7px 12px rgba(0, 0, 0, 0.34);
  transform: translateY(-1px);
}

.projects {
  box-sizing: border-box;
  display: flex;
  position: relative;
  z-index: 1;
  gap: var(--space-lg);
  height: fit-content;
  width: 100%;
  overflow-x: auto;
  padding-inline: var(--padding-inline);
  padding-block: var(--padding-block);
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
  width: var(--fade-width);
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

.projects-empty {
  display: grid;
  place-items: center;
  min-height: 12rem;
  padding-inline: var(--padding-inline);
  padding-block: var(--padding-block);
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  text-align: center;
}

@media (max-width: 640px) {
  .title {
    font-size: 2.15rem;
  }

  .projects {
    gap: var(--space-md);
  }
}
</style>
