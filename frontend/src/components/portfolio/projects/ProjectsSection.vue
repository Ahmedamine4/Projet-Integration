<script setup>
import { nextTick, onMounted, ref } from 'vue';
import PortfolioSectionShell from '@/components/portfolio/layout/PortfolioSectionShell.vue';
import PortfolioProject from '@/components/portfolio/projects/PortfolioProject.vue';
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
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const isDragging = ref(false);
const lastX = ref(0);
const lastTime = ref(0);
const velocity = ref(0);
const animationFrame = ref(null);

const dragSpeed = 1.2;
const minReleaseVelocity = 0.05;
const frictionPerFrame = 0.95;
const targetFrameDuration = 16;

function updateScrollFades() {
  const el = projectsRef.value;
  if (!el) return;

  const maxScrollLeft = el.scrollWidth - el.clientWidth;
  canScrollLeft.value = el.scrollLeft > 1;
  canScrollRight.value = el.scrollLeft < maxScrollLeft - 1;
}

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

onMounted(() => {
  nextTick(updateScrollFades);
});
</script>

<template>
  <PortfolioSectionShell
    title="Projects"
    add-label="Add Project"
    :can-add="canAdd"
    :is-empty="!projects.length"
    empty-label="No projects yet"
    @add="emit('add-project')"
  >
    <div
      class="projects-scroll-frame"
      :class="{
        'has-left-fade': canScrollLeft,
        'has-right-fade': canScrollRight,
      }"
    >
      <div
        ref="projectsRef"
        class="projects"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @scroll="updateScrollFades"
      >
        <template
          v-for="project in projects"
          :key="project.id"
        >
          <PortfolioProject
            :project
            :can-edit="canAdd"
            @edit="project => emit('edit-project', project)"
          />
        </template>
      </div>
    </div>
  </PortfolioSectionShell>
</template>

<style scoped>
.projects {
  display: flex;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  gap: var(--space-lg);
  height: fit-content;
  width: 100%;
  overflow-x: auto;
  padding-block: var(--padding-block);
  overscroll-behavior-x: contain;
  cursor: grab;
  scrollbar-width: none;
}

.projects-scroll-frame {
  --project-fade-width: clamp(2rem, 6vw, 4rem);
  position: relative;
}

.projects-scroll-frame::before,
.projects-scroll-frame::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  width: 0;
  pointer-events: none;
  transition: width var(--transition-normal);
}

.projects-scroll-frame::before {
  left: 0;
  background: linear-gradient(
    to right,
    var(--color-background),
    rgba(var(--color-background-rgb), 0)
  );
}

.projects-scroll-frame::after {
  right: 0;
  background: linear-gradient(
    to left,
    var(--color-background),
    rgba(var(--color-background-rgb), 0)
  );
}

.projects-scroll-frame.has-left-fade::before,
.projects-scroll-frame.has-right-fade::after {
  width: var(--project-fade-width);
}

.projects:active {
  cursor: grabbing;
}

.projects::-webkit-scrollbar {
  display: none;
}

@media (max-width: 640px) {
  .projects {
    gap: var(--space-md);
  }
}
</style>
