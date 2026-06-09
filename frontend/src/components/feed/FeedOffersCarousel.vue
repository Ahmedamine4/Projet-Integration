<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { MoveHorizontal, Repeat2 } from 'lucide-vue-next';
import RecommendationCard from '@/components/portfolio/recommendations/RecommendationCard.vue';
import { useHorizontalDragScroll } from '@/composables/useHorizontalDragScroll';

const props = defineProps({
  offers: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['select-offer']);

const viewMode = ref('loop');
const scrollerRef = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

const normalizedOffers = computed(() =>
  props.offers
    .map((offer, index) => ({
      id: offer.id ?? `${offer.title}-${index}`,
      originalOffer: offer,
      recommendation: {
        id: offer.id ?? `${offer.title}-${index}`,
        authorName: offer.company || 'Company',
        authorRole: [offer.title, offer.location].filter(Boolean).join(' · '),
        content:
          offer.description ||
          `${offer.duration || 'Duration not specified'} · ${offer.level || 'Level not specified'}`,
      },
    }))
    .filter((offer) => offer.recommendation.content)
);

const canLoop = computed(() => normalizedOffers.value.length >= 2);
const isLoopMode = computed(() => viewMode.value === 'loop');
const isScrollMode = computed(() => viewMode.value === 'scroll');
const shouldLoop = computed(() => isLoopMode.value && canLoop.value);

const loopCopies = computed(() => {
  return shouldLoop.value ? [0, 1, 2, 3] : [0];
});

const modeButtonLabel = computed(() =>
  isLoopMode.value ? 'Scroll' : 'Loop'
);

function updateScrollFades() {
  const scroller = scrollerRef.value;

  if (!scroller || !isScrollMode.value) {
    canScrollLeft.value = false;
    canScrollRight.value = false;
    return;
  }

  const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;

  canScrollLeft.value = scroller.scrollLeft > 1;
  canScrollRight.value = scroller.scrollLeft < maxScrollLeft - 1;
}

function prepareScrollMode() {
  const scroller = scrollerRef.value;
  if (!scroller) return;

  scroller.scrollLeft = 0;
  updateScrollFades();
}

function toggleViewMode() {
  if (isLoopMode.value) {
    viewMode.value = 'scroll';
    nextTick(prepareScrollMode);
    return;
  }

  viewMode.value = 'loop';
  updateScrollFades();
}

function selectOffer(offer) {
  emit('select-offer', offer);
}

const {
  isDragging,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
} = useHorizontalDragScroll(scrollerRef, {
  enabled: isScrollMode,
  onScroll: updateScrollFades,
});

watch(
  () => normalizedOffers.value.length,
  () => nextTick(updateScrollFades)
);

watch(isScrollMode, (scrollMode) => {
  if (!scrollMode) {
    updateScrollFades();
    return;
  }

  nextTick(prepareScrollMode);
});

onMounted(() => {
  nextTick(updateScrollFades);
});
</script>

<template>
  <section
    v-if="normalizedOffers.length"
    class="offers-section"
  >
    <div class="offers-section-header">
      <div>
        <h2>Recommended opportunities</h2>
        <p>Internships and jobs matching your portfolio.</p>
      </div>

      <button
        type="button"
        class="offers-toggle"
        :aria-pressed="isScrollMode"
        @click="toggleViewMode"
      >
        <MoveHorizontal
          v-if="isLoopMode"
          :size="15"
        />

        <Repeat2
          v-else
          :size="15"
        />

        {{ modeButtonLabel }}
      </button>
    </div>

    <div
      class="offers-frame"
      :class="{
        'offers-frame--loop': isLoopMode,
        'offers-frame--scroll': isScrollMode,
        'offers-frame--moving': shouldLoop,
        'offers-frame--draggable': isScrollMode,
        'offers-frame--dragging': isDragging,
        'has-left-fade': canScrollLeft,
        'has-right-fade': canScrollRight,
      }"
    >
      <div
        ref="scrollerRef"
        class="offers-scroller"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerUp"
        @pointerleave="handlePointerUp"
        @scroll="updateScrollFades"
      >
        <div class="offers-track">
          <template v-if="shouldLoop">
            <div
              v-for="copyIndex in loopCopies"
              :key="copyIndex"
              class="offers-loop-set"
            >
              <button
                v-for="(offer, index) in normalizedOffers"
                :key="`${copyIndex}-${offer.id}-${index}`"
                type="button"
                class="offer-card-button"
                @click.stop="selectOffer(offer.originalOffer)"
              >
                <RecommendationCard
                  :recommendation="offer.recommendation"
                  :can-manage-visibility="false"
                  :is-visible="true"
                />
              </button>
            </div>
          </template>

          <template v-else>
            <button
              v-for="(offer, index) in normalizedOffers"
              :key="`${offer.id}-${index}`"
              type="button"
              class="offer-card-button"
              @click.stop="selectOffer(offer.originalOffer)"
            >
              <RecommendationCard
                :recommendation="offer.recommendation"
                :can-manage-visibility="false"
                :is-visible="true"
              />
            </button>
          </template>
        </div>
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

.offers-toggle {
  position: relative;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  border: none;
  border-radius: var(--radius-sm);
  padding-block: var(--space-sm);
  padding-inline: 0.75rem var(--space-md);
  background-color: var(--color-primary);
  color: var(--color-background);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.26);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.offers-toggle:hover {
  background-color: rgba(var(--color-primary-rgb), 0.92);
  box-shadow: 0 7px 12px rgba(0, 0, 0, 0.28);
  transform: translateY(-1px);
}

.offers-frame {
  --offer-fade-width: clamp(2rem, 6vw, 4rem);
  position: relative;
  padding-block: var(--space-xs) var(--space-sm);
  overflow: hidden;
  background: var(--color-background);
}

.offers-frame::before,
.offers-frame::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  width: 0;
  pointer-events: none;
  transition: width var(--transition-normal);
}

.offers-frame::before {
  left: 0;
  background:
    linear-gradient(
      to right,
      var(--color-background),
      rgba(var(--color-background-rgb), 0)
    );
}

.offers-frame::after {
  right: 0;
  background:
    linear-gradient(
      to left,
      var(--color-background),
      rgba(var(--color-background-rgb), 0)
    );
}

.offers-frame--loop::before,
.offers-frame--loop::after,
.offers-frame--scroll.has-left-fade::before,
.offers-frame--scroll.has-right-fade::after {
  width: var(--offer-fade-width);
}

.offers-scroller {
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
}

.offers-scroller::-webkit-scrollbar {
  display: none;
}

.offers-track {
  display: flex;
  width: max-content;
  gap: 0;
  align-items: stretch;
  will-change: transform;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
}

.offers-loop-set {
  display: flex;
  flex: 0 0 auto;
  gap: var(--space-md);
  align-items: stretch;
  padding-right: var(--space-md);
}

.offer-card-button {
  flex: 0 0 15rem;
  width: 15rem;
  height: 10rem;
  display: block;
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

.offer-card-button :deep(.recommendation-card) {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: var(--space-sm);
  padding: var(--space-md);
  padding-left: calc(var(--space-md) + 0.45rem);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition:
    transform var(--transition-normal),
    box-shadow var(--transition-normal),
    border-color var(--transition-normal),
    background-color var(--transition-normal);
}

.offer-card-button :deep(.recommendation-card::before) {
  width: 0.22rem;
}

.offer-card-button :deep(.recommendation-card header) {
  min-height: 0;
  padding-bottom: var(--space-sm);
  gap: var(--space-sm);
}

.offer-card-button :deep(.recommendation-card__author) {
  min-width: 0;
}

.offer-card-button :deep(.recommendation-card span) {
  font-size: var(--font-size-xs);
  line-height: 1.2;
  display: -webkit-box;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.offer-card-button :deep(.recommendation-card small) {
  font-size: 10px;
  line-height: 1.25;
  display: -webkit-box;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.offer-card-button :deep(.recommendation-card p) {
  font-size: var(--font-size-xxs);
  line-height: 1.45;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.offer-card-button:hover :deep(.recommendation-card) {
  transform: translateY(-2px);
  border-color: rgba(var(--color-secondary-rgb), 0.2);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.055);
}

.offers-frame--moving .offers-track {
  animation: offers-marquee 42s linear infinite;
}

.offers-frame--moving:hover .offers-track {
  animation-play-state: paused;
}

.offers-frame--scroll .offers-track {
  animation: none;
  transform: none;
}

.offers-frame--draggable .offers-scroller {
  cursor: grab;
}

.offers-frame--dragging .offers-scroller {
  cursor: grabbing;
}

@keyframes offers-marquee {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(-25%, 0, 0);
  }
}

@media (max-width: 640px) {
  .offers-loop-set {
    gap: var(--space-sm);
    padding-right: var(--space-sm);
  }

  .offer-card-button {
    flex-basis: 13.8rem;
    width: 13.8rem;
    height: 9.5rem;
  }

  .offer-card-button :deep(.recommendation-card) {
    padding: var(--space-sm);
    padding-left: calc(var(--space-sm) + 0.45rem);
  }
}
</style>