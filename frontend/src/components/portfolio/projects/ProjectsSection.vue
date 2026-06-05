<script setup>
import { nextTick, onMounted, ref } from 'vue';
import PortfolioSectionShell from '@/components/portfolio/layout/PortfolioSectionShell.vue';
import PortfolioProject from '@/components/portfolio/projects/PortfolioProject.vue';
import { useHorizontalDragScroll } from '@/composables/useHorizontalDragScroll';
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

function updateScrollFades() {
  const el = projectsRef.value;
  if (!el) return;

  const maxScrollLeft = el.scrollWidth - el.clientWidth;
  canScrollLeft.value = el.scrollLeft > 1;
  canScrollRight.value = el.scrollLeft < maxScrollLeft - 1;
}

const {
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
} = useHorizontalDragScroll(projectsRef, {
  onScroll: updateScrollFades,
});

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
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerUp"
        @pointerleave="handlePointerUp"
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
