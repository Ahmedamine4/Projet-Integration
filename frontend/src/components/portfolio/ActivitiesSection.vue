<script setup>
import { Plus } from 'lucide-vue-next';
import PortfolioActivity from '@/components/portfolio/PortfolioActivity.vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
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

const swipeDistance = {
  ratio: 0.3,
  min: 100,
  max: 200,
  fallbackCardWidth: 400,
};

const visibleDepth = 2;
const animationDuration = 420;
const stackOffsetY = 20;
const stackHeightBuffer = 96;
let moveTimer = null;

const activityCards = ref([...props.activities]);
const isDragging = ref(false);
const isMovingToBack = ref(false);
const startX = ref(0);
const startY = ref(0);
const currentX = ref(0);
const currentY = ref(0);
const cardRefs = ref([]);
const maxCardHeight = ref(0);

const dragX = computed(() => currentX.value - startX.value);
const dragY = computed(() => currentY.value - startY.value);
const rotation = computed(() => dragX.value * 0.08);
const stackHeight = computed(() => {
  if (!maxCardHeight.value) return null;

  return maxCardHeight.value + (visibleDepth * stackOffsetY) + stackHeightBuffer;
});

function updateMaxCardHeight() {
  cardRefs.value = cardRefs.value.slice(0, activityCards.value.length);

  const heights = cardRefs.value.map((card) => {
    const activityCard = card?.firstElementChild;

    return activityCard?.scrollHeight ?? 0;
  });

  maxCardHeight.value = Math.max(0, ...heights);
}

function scheduleHeightUpdate() {
  maxCardHeight.value = 0;
  nextTick(updateMaxCardHeight);
}

function setCardRef(element, index) {
  if (element) cardRefs.value[index] = element;
}

function startDrag(event, index) {
  const topIndex = isMovingToBack.value ? 1 : 0;
  if (index !== topIndex) return;
  if (isMovingToBack.value) {
    finishMove();
  };

  isDragging.value = true;
  startX.value = event.clientX;
  startY.value = event.clientY;
  currentX.value = event.clientX;
  currentY.value = event.clientY;

  window.addEventListener('pointermove', onDrag);
  window.addEventListener('pointerup', stopDrag);
}

function onDrag(event) {
  if (!isDragging.value) return;

  currentX.value = event.clientX;
  currentY.value = event.clientY;
}

function resetDrag() {
  isDragging.value = false;
  isMovingToBack.value = false;
  startX.value = 0;
  startY.value = 0;
  currentX.value = 0;
  currentY.value = 0;
}

function moveTopActivityToBack() {
  if (activityCards.value.length < 2) return;

  const firstActivity = activityCards.value.shift();
  activityCards.value.push(firstActivity);
}

function finishMove() {
  if (moveTimer) {
    clearTimeout(moveTimer);
    moveTimer = null;
  }

  if (isMovingToBack.value) {
    moveTopActivityToBack();
    resetDrag();
  }
}

function stopDrag() {
  if (!isDragging.value) return;

  const cardWidth = cardRefs.value[0]?.offsetWidth ?? swipeDistance.fallbackCardWidth;
  const requiredSwipeDistance = Math.min(
    swipeDistance.max,
    Math.max(swipeDistance.min, cardWidth * swipeDistance.ratio)
  );

  const shouldMove = Math.abs(dragX.value) > requiredSwipeDistance;
  if (shouldMove) {
    isDragging.value = false;
    isMovingToBack.value = true;

    moveTimer = setTimeout(() => {
      moveTopActivityToBack();
      resetDrag();
      moveTimer = null;
    }, animationDuration);
  }
  else resetDrag();

  window.removeEventListener('pointermove', onDrag);
  window.removeEventListener('pointerup', stopDrag);
}

function getStackTransform(index) {
  const direction = index % 2 === 0 ? 1 : -1;

  return `
    translateX(-50%)
    translateY(${index * stackOffsetY}px)
    rotate(${direction * index * 3}deg)
    scale(${1 - index * 0.04})
  `;
}

function getActivityCardStyle(index) {
  if (index === 0 && isDragging.value)
    return {
      zIndex: activityCards.value.length + 10,
      transform: `
        translateX(-50%)
        translate(${dragX.value}px, ${dragY.value}px)
        rotate(${rotation.value}deg)
      `,
      transition: 'none',
    };

  if (index === 0 && isMovingToBack.value)
    return {
      zIndex: activityCards.value.length - visibleDepth,
      transform: getStackTransform(visibleDepth),
      opacity: 1,
      pointerEvents: 'none',
      transition: `
        transform ${animationDuration}ms cubic-bezier(.22, 1, .36, 1),
        opacity 300ms ease
      `,
    };

  const visualIndex = isMovingToBack.value ? index - 1 : index;
  const safeIndex = Math.max(visualIndex, 0);

  if (visualIndex <= visibleDepth)
    return {
      zIndex: activityCards.value.length - index,
      transform: getStackTransform(safeIndex),
      opacity: 1,
      transition: `
        transform ${animationDuration}ms cubic-bezier(.22, 1, .36, 1),
        opacity 300ms ease
      `,
    };

  return {
    zIndex: 0,
    transform: getStackTransform(visibleDepth),
    opacity: 0,
    pointerEvents: 'none',
    transition: `
      transform ${animationDuration}ms cubic-bezier(.22, 1, .36, 1),
      opacity 300ms ease
    `,
  };
}

watch(
  () => props.activities,
  (activities) => {
    if (isDragging.value || isMovingToBack.value) return;
    activityCards.value = [...activities];
    scheduleHeightUpdate();
  },
);

onMounted(() => {
  scheduleHeightUpdate();
  window.addEventListener('resize', scheduleHeightUpdate);
});

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onDrag);
  window.removeEventListener('pointerup', stopDrag);
  window.removeEventListener('resize', scheduleHeightUpdate);

  if (moveTimer) {
    clearTimeout(moveTimer);
    moveTimer = null;
  }
});
</script>

<template>
  <div class="activities-shell">
    <div class="activities-header">
      <div class="title">
        Activities
      </div>
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
      v-if="activityCards.length"
      class="activities"
      :style="{
        '--activity-card-height': maxCardHeight ? `${maxCardHeight}px` : undefined,
        '--activity-stack-height': stackHeight ? `${stackHeight}px` : undefined,
      }"
    >
      <article
        v-for="(activity, index) in activityCards"
        :key="activity.id"
        :ref="element => setCardRef(element, index)"
        class="activity-stack-card"
        :class="{ 'is-dragging': isDragging && index === 0 }"
        :style="getActivityCardStyle(index)"
        @pointerdown="startDrag($event, index)"
      >
        <PortfolioActivity
          :activity
          :can-edit="canAdd"
          @edit="activity => emit('edit-activity', activity)"
        />
      </article>
    </div>

    <div
      v-else
      class="activities-empty"
    >
      <div class="empty-state">
        <p>No activities yet</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activities-shell {
  --padding-inline: var(--portfolio-section-bleed, var(--space-xl));
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
  font-family: var(--font-editorial);
  font-size: 2.45rem;
  font-weight: var(--font-medium);
  line-height: 1;
  letter-spacing: 0;
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
  box-sizing: border-box;
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 48rem);
  min-height: var(--activity-stack-height, 32rem);
  overflow: visible;
  margin-inline: auto;
  padding-inline: var(--padding-inline);
  padding-block: var(--padding-block);
}

.activities-empty {
  display: grid;
  place-items: center;
  min-height: 12rem;
  padding-inline: var(--padding-inline);
  padding-block: var(--padding-block);
  text-align: center;
}

.empty-state {
  display: grid;
  place-items: center;
  width: min(100%, 28rem);
  padding: var(--space-xl);
  border: 1px dashed rgba(var(--color-primary-rgb), 0.18);
  border-radius: var(--radius-md);
  background: rgba(var(--color-surface-rgb), 0.22);
}

.empty-state p {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.52);
  font-family: var(--font-editorial);
  font-size: 1.45rem;
  font-weight: var(--font-medium);
}

.activity-stack-card {
  position: absolute;
  top: var(--padding-block);
  left: 50%;
  width: min(calc(100% - (var(--padding-inline) * 2)), 38rem);
  height: var(--activity-card-height, auto);
  display: flex;
  cursor: grab;
  user-select: none;
  touch-action: none;
  will-change: transform, opacity;
}

.activity-stack-card.is-dragging {
  cursor: grabbing;
}

@media (max-width: 820px) {
  .title {
    font-size: 2.15rem;
  }

  .activity-stack-card {
    width: min(calc(100% - 2rem), 27rem);
  }
}
</style>
