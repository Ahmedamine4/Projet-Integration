<script setup>
import { nextTick, onMounted, ref } from 'vue';

const scrollRef = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

const isPointerDown = ref(false);
const isDragging = ref(false);
const hasDragged = ref(false);

const startX = ref(0);
const startScrollLeft = ref(0);

const dragSpeed = 1.35;
const dragThreshold = 6;

function updateScrollFades() {
  const el = scrollRef.value;
  if (!el) return;

  const maxScrollLeft = el.scrollWidth - el.clientWidth;
  canScrollLeft.value = el.scrollLeft > 1;
  canScrollRight.value = el.scrollLeft < maxScrollLeft - 1;
}

function handlePointerDown(event) {
  if (event.button !== undefined && event.button !== 0) return;

  const el = scrollRef.value;
  if (!el) return;

  isPointerDown.value = true;
  isDragging.value = false;
  hasDragged.value = false;

  startX.value = event.clientX;
  startScrollLeft.value = el.scrollLeft;

  el.setPointerCapture?.(event.pointerId);
}

function handlePointerMove(event) {
  const el = scrollRef.value;
  if (!isPointerDown.value || !el) return;

  const deltaX = event.clientX - startX.value;

  if (Math.abs(deltaX) > dragThreshold) {
    isDragging.value = true;
    hasDragged.value = true;
  }

  if (!isDragging.value) return;

  el.scrollLeft = startScrollLeft.value - deltaX * dragSpeed;
  updateScrollFades();
}

function handlePointerUp(event) {
  const el = scrollRef.value;
  if (!el) return;

  isPointerDown.value = false;
  isDragging.value = false;

  el.releasePointerCapture?.(event.pointerId);

  // Reset after the click event has fired in the same tick cycle
  requestAnimationFrame(() => {
    hasDragged.value = false;
  });
}

function handleClickCapture(event) {
  if (!hasDragged.value) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}

function handleWheel(event) {
  const el = scrollRef.value;
  if (!el) return;
  if (el.scrollWidth <= el.clientWidth) return;

  const scrollAmount =
    Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;

  if (!scrollAmount) return;

  event.preventDefault();
  el.scrollLeft += scrollAmount;
  updateScrollFades();
}

onMounted(() => {
  nextTick(updateScrollFades);
});
</script>

<template>
  <div
    class="horizontal-scroll-frame"
    :class="{
      'has-left-fade': canScrollLeft,
      'has-right-fade': canScrollRight,
    }"
  >
    <div
      ref="scrollRef"
      class="horizontal-scroll"
      :class="{ 'is-dragging': isDragging }"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerUp"
      @click.capture="handleClickCapture"
      @wheel.passive="handleWheel"
      @scroll="updateScrollFades"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.horizontal-scroll-frame {
  --scroll-fade-width: clamp(2rem, 6vw, 4rem);
  position: relative;
  width: 100%;
  min-width: 0;
}

.horizontal-scroll-frame::before,
.horizontal-scroll-frame::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  width: 0;
  pointer-events: none;
  transition: width var(--transition-normal);
}

.horizontal-scroll-frame::before {
  left: 0;
  background: linear-gradient(
    to right,
    var(--color-background),
    rgba(var(--color-background-rgb), 0)
  );
}

.horizontal-scroll-frame::after {
  right: 0;
  background: linear-gradient(
    to left,
    var(--color-background),
    rgba(var(--color-background-rgb), 0)
  );
}

.horizontal-scroll-frame.has-left-fade::before,
.horizontal-scroll-frame.has-right-fade::after {
  width: var(--scroll-fade-width);
}

.horizontal-scroll {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  gap: var(--space-lg);
  width: 100%;
  min-width: 0;
  height: fit-content;
  overflow-x: auto;
  overflow-y: hidden;
  padding-block: var(--space-sm);
  overscroll-behavior-x: contain;
  cursor: grab;
  scrollbar-width: none;
  user-select: none;
  touch-action: pan-y;
}

.horizontal-scroll.is-dragging {
  cursor: grabbing;
}

.horizontal-scroll::-webkit-scrollbar {
  display: none;
}

@media (max-width: 640px) {
  .horizontal-scroll {
    gap: var(--space-md);
  }
}
</style>