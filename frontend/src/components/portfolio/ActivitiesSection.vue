<script setup>
import SwipeHint from '@/components/common/SwipeHint.vue';
import PortfolioActivity from '@/components/portfolio/PortfolioActivity.vue';
import PortfolioSectionShell from '@/components/portfolio/PortfolioSectionShell.vue';
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
const stackHeightBuffer = 140;
let moveTimer = null;
let mountMeasureTimer = null;

const activityCards = ref([...props.activities]);
const isDragging = ref(false);
const isMovingToBack = ref(false);
const startX = ref(0);
const startY = ref(0);
const currentX = ref(0);
const currentY = ref(0);
const cardRefs = ref([]);
const maxCardHeight = ref(0);
const activitiesShellRef = ref(null);
let resizeObserver = null;

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
  }

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
  mountMeasureTimer = setTimeout(scheduleHeightUpdate);
  window.addEventListener('resize', scheduleHeightUpdate);

  resizeObserver = new ResizeObserver(() => {
    scheduleHeightUpdate();
  });

  if (activitiesShellRef.value) {
    resizeObserver.observe(activitiesShellRef.value);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onDrag);
  window.removeEventListener('pointerup', stopDrag);
  window.removeEventListener('resize', scheduleHeightUpdate);

  resizeObserver?.disconnect();
  resizeObserver = null;

  if (moveTimer) {
    clearTimeout(moveTimer);
    moveTimer = null;
  }

  if (mountMeasureTimer) {
    clearTimeout(mountMeasureTimer);
    mountMeasureTimer = null;
  }
});
</script>

<template>
  <PortfolioSectionShell
    title="Activities"
    add-label="Add Activity"
    :can-add="canAdd"
    :is-empty="!activityCards.length"
    empty-label="No activities yet"
    @add="emit('add-activity')"
  >
    <div
      ref="activitiesShellRef"
      class="activities-shell"
    >
      <div
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
        <SwipeHint class="activities-swipe-hint" />
      </div>
    </div>
  </PortfolioSectionShell>
</template>

<style scoped>
.activities-shell {
  width: min(100%, 48rem);
  margin-inline: auto;
}

.activities {
  box-sizing: border-box;
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  min-height: var(--activity-stack-height, 32rem);
  overflow: visible;
  padding-block: var(--padding-block);
  user-select: none;
}

.activity-stack-card {
  container-type: inline-size;
  position: absolute;
  top: var(--padding-block);
  left: 50%;
  width: min(100%, 38rem);
  height: var(--activity-card-height, auto);
  display: flex;
  cursor: grab;
  touch-action: none;
  will-change: transform, opacity;
}

.activity-stack-card.is-dragging {
  cursor: grabbing;
}

.activities-swipe-hint {
  position: absolute;
  left: 50%;
  bottom: var(--space-xl);
  transform: translateX(-50%);
}

@media (max-width: 820px) {
  .activity-stack-card {
    width: min(calc(100% - 2rem), 27rem);
  }
}
</style>
