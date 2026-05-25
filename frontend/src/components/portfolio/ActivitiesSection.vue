<script setup>
import { ref } from 'vue';
import { Plus } from 'lucide-vue-next';
import Activity from '@/components/portfolio/Activity.vue';
defineProps({
  activities: {
    type: Array,
    default: () => [],
  },
  canAdd: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['add-activity', 'edit-activity']);

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
  <div class="activities-shell">
    <div class="activities-header">
      <div class="title">Activities</div>
      <button
        v-if="canAdd"
        type="button"
        class="add-activity-button"
        @click="emit('add-activity')"
      >
        <Plus :size="15" />
        Add Activity
      </button>
    </div>
    <div
      v-if="activities.length"
      class="activities"
      ref="projectsRef"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    >
      <template v-for="activity in activities" :key="activity.id">
        <Activity
          :activity
          :can-edit="canAdd"
          @edit="activity => emit('edit-activity', activity)"
        />
      </template>
    </div>

    <div class="activities-empty" v-else>
      No activities yet
    </div>
  </div>
</template>

<style scoped>
.activities-shell {
  --padding-inline: var(--space-xl);
  --padding-block: calc(var(--padding-inline) * 1.5);
  --border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  position: relative;
  width: 100%;
  height: fit-content;
  border-bottom: var(--border);
  border-radius: 0;
  background: var(--color-background);
  padding: 0;
}

.activities-header {
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
  font-family: var(--font-ui);
  font-size: var(--font-size-xl);
  font-weight: var(--font-medium);
  line-height: 1;
}

.add-activity-button {
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

.add-activity-button:hover {
	background-color: rgba(var(--color-primary-rgb), 0.92);
  box-shadow: 0 7px 12px rgba(0, 0, 0, 0.34);
  transform: translateY(-1px);
}

.activities {
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

.activities:active {
  cursor: grabbing;
}

.activities::-webkit-scrollbar {
  display: none;
}

.activities-shell::before,
.activities-shell::after {
  content: '';
  position: absolute;
  width: var(--padding-inline);
  pointer-events: none;
  z-index: 2;
}

.activities-shell::before {
  inset: 0 auto 0 0;
  background: linear-gradient(
    to right,
    var(--color-background) 60%,
    transparent
  );
}

.activities-shell::after {
  inset: 0 0 0 auto;
  background: linear-gradient(
    to left,
    var(--color-background) 60%,
    transparent
  );
}

.activities-empty {
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
  .activities-shell {
    --padding-inline: var(--space-md);
  }

  .activities {
    gap: var(--space-md);
  }
}
</style>