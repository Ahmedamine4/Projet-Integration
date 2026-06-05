<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { MapPin } from 'lucide-vue-next';

defineProps({
  offers: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['select-offer']);

const offersRef = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const isDragging = ref(false);
const hasMoved = ref(false);
const lastX = ref(0);
const lastTime = ref(0);
const velocity = ref(0);
const animationFrame = ref(null);

const dragSpeed = 1.2;
const minReleaseVelocity = 0.05;
const frictionPerFrame = 0.95;
const targetFrameDuration = 16;

function updateScrollFades() {
  const el = offersRef.value;
  if (!el) return;

  const maxScrollLeft = el.scrollWidth - el.clientWidth;
  canScrollLeft.value = el.scrollLeft > 1;
  canScrollRight.value = el.scrollLeft < maxScrollLeft - 1;
}

function handleMouseDown(event) {
  isDragging.value = true;
  hasMoved.value = false;
  velocity.value = 0;

  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
    animationFrame.value = null;
  }

  lastX.value = event.clientX;
  lastTime.value = performance.now();
}

function handleMouseMove(event) {
  if (!isDragging.value || !offersRef.value) return;

  event.preventDefault();

  const deltaX = event.clientX - lastX.value;

  if (Math.abs(deltaX) > 3) {
    hasMoved.value = true;
  }

  offersRef.value.scrollBy({
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
  if (!offersRef.value || Math.abs(velocity.value) < minReleaseVelocity) {
    animationFrame.value = null;
    return;
  }

  const deltaTime = currentTime - lastTime.value;

  offersRef.value.scrollBy({
    left: -velocity.value * deltaTime,
  });

  velocity.value *= frictionPerFrame ** (deltaTime / targetFrameDuration);
  lastTime.value = currentTime;

  animationFrame.value = requestAnimationFrame(applyMomentum);
}

function handleOfferClick(offer) {
  if (hasMoved.value) {
    hasMoved.value = false;
    return;
  }

  emit('select-offer', offer);
}

onMounted(() => {
  nextTick(updateScrollFades);
});

onBeforeUnmount(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
  }
});
</script>

<template>
  <section
    v-if="offers.length"
    class="offers-section"
  >
    <div class="offers-section-header">
      <div>
        <h2>Recommended opportunities</h2>
        <p>Internships and jobs matching your portfolio.</p>
      </div>
    </div>

    <div
      class="offers-scroll-frame"
      :class="{
        'has-left-fade': canScrollLeft,
        'has-right-fade': canScrollRight,
      }"
    >
      <div
        ref="offersRef"
        class="offers-list"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @scroll="updateScrollFades"
      >
        <article
          v-for="offer in offers"
          :key="offer.id"
          class="offer-card"
          @click="handleOfferClick(offer)"
        >
          <div class="offer-card-top">
            <span class="offer-location">
              <MapPin :size="11" />
              {{ offer.location }}
            </span>
          </div>

          <div class="offer-card-content">
            <h3>{{ offer.title }}</h3>

            <p class="offer-company">
              {{ offer.company }}
            </p>
          </div>

          <div class="offer-techs">
            <span
              v-for="tech in (offer.technologies || []).slice(0, 3)"
              :key="tech"
            >
              {{ tech }}
            </span>

            <span v-if="(offer.technologies || []).length > 3">
              +{{ offer.technologies.length - 3 }}
            </span>
          </div>

          <span class="offer-hint">
            Click to view details
          </span>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.offers-section {
  width: 100%;
  max-width: none;
  margin-inline: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.offers-section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-md);
}

.offers-section-header h2 {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.92);
  font-size: var(--font-size-sm);
  font-weight: var(--font-bold);
}

.offers-section-header p {
  margin: 2px 0 0;
  color: rgba(var(--color-primary-rgb), 0.48);
  font-size: var(--font-size-xxs);
}

.offers-scroll-frame {
  --offer-fade-width: clamp(2rem, 6vw, 4rem);
  position: relative;
}

.offers-scroll-frame::before,
.offers-scroll-frame::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  width: 0;
  pointer-events: none;
  transition: width var(--transition-normal);
}

.offers-scroll-frame::before {
  left: 0;
  background: linear-gradient(
    to right,
    var(--color-background),
    rgba(var(--color-background-rgb), 0)
  );
}

.offers-scroll-frame::after {
  right: 0;
  background: linear-gradient(
    to left,
    var(--color-background),
    rgba(var(--color-background-rgb), 0)
  );
}

.offers-scroll-frame.has-left-fade::before,
.offers-scroll-frame.has-right-fade::after {
  width: var(--offer-fade-width);
}

.offers-list {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  gap: var(--space-lg);
  height: fit-content;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding-block: var(--space-sm);
  overscroll-behavior-x: contain;
  cursor: grab;
  scrollbar-width: none;
  scroll-behavior: smooth;
}

.offers-list:active {
  cursor: grabbing;
}

.offers-list::-webkit-scrollbar {
  display: none;
}

.offer-card {
  flex: 0 0 17rem;
  min-height: 9.5rem;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-sm);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  background-color: rgba(var(--color-surface-rgb), 0.92);
  box-shadow: 0 10px 16px rgba(0, 0, 0, 0.04);
  text-align: left;
  user-select: none;
  cursor: pointer;
  transition:
    transform var(--transition-normal),
    box-shadow var(--transition-normal),
    border-color var(--transition-normal),
    background-color var(--transition-normal);
}

.offer-card:hover {
  transform: scale(1.008);
  border-color: rgba(var(--color-secondary-rgb), 0.22);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.06);
  background-color: rgba(var(--color-surface-rgb), 0.98);
}

.offer-card-top {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-xs);
}

.offer-location {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  white-space: nowrap;
  color: rgba(var(--color-primary-rgb), 0.42);
  font-size: 9px;
  font-weight: var(--font-semibold);
}

.offer-card-content {
  display: grid;
  gap: 2px;
}

.offer-card h3 {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.92);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  line-height: 1.25;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.offer-company {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.56);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
}

.offer-techs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: auto;
}

.offer-techs span {
  padding: 0.14rem 0.45rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.09);
  background: rgba(var(--color-background-rgb), 0.52);
  color: rgba(var(--color-primary-rgb), 0.58);
  font-size: 9px;
  font-weight: var(--font-medium);
}

.offer-hint {
  margin-top: var(--space-xs);
  color: rgba(var(--color-secondary-rgb), 0.95);
  font-size: 10px;
  font-weight: var(--font-semibold);
}

@media (max-width: 640px) {
  .offers-list {
    gap: var(--space-md);
  }

  .offer-card {
    flex-basis: 14rem;
  }
}
</style>