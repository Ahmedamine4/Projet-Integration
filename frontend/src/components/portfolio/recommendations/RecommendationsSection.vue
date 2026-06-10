<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { MoveHorizontal, Repeat2 } from 'lucide-vue-next';
import PortfolioSectionShell from '@/components/portfolio/layout/PortfolioSectionShell.vue';
import RecommendationCard from '@/components/portfolio/recommendations/RecommendationCard.vue';
import { useHorizontalDragScroll } from '@/composables/useHorizontalDragScroll';

const props = defineProps({
  recommendations: {
    type: Array,
    default: () => [],
  },
  isOwner: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['toggle-visibility']);

const viewMode = ref('loop');
const hiddenRecommendationIds = ref(new Set());
const scrollerRef = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

const normalizedRecommendations = computed(() =>
  props.recommendations.map((recommendation, index) => ({
    id: recommendation.interaction_id ?? recommendation.id ?? `${recommendation.authorName}-${index}`,
    interaction_id: recommendation.interaction_id,
    authorName: recommendation.utilisateur?.prenom && recommendation.utilisateur?.nom
      ? `${recommendation.utilisateur.prenom} ${recommendation.utilisateur.nom}`
      : recommendation.authorName || 'Professor',
    authorRole: recommendation.utilisateur?.professionnel?.poste || recommendation.authorRole || 'Recommendation',
    content: recommendation.texte || recommendation.content || '',
    date: recommendation.date_interaction || recommendation.date || '',
    visibilite: recommendation.visibilite ?? true,
  })).filter((recommendation) => recommendation.content)
);

const publicRecommendations = computed(() =>
  normalizedRecommendations.value.filter((recommendation) => !hiddenRecommendationIds.value.has(recommendation.id))
);

const displayedRecommendations = computed(() =>
  props.isOwner ? normalizedRecommendations.value : publicRecommendations.value
);

const canLoop = computed(() => displayedRecommendations.value.length >= 4);
const isLoopMode = computed(() => viewMode.value === 'loop');
const isScrollMode = computed(() => viewMode.value === 'scroll');
const shouldLoop = computed(() => isLoopMode.value && canLoop.value);

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

function isRecommendationVisible(recommendation) {
  return !hiddenRecommendationIds.value.has(recommendation.id);
}

function toggleRecommendationVisibility(recommendation) {
  const nextHiddenIds = new Set(hiddenRecommendationIds.value);

  if (nextHiddenIds.has(recommendation.id)) {
    nextHiddenIds.delete(recommendation.id);
  }
  else {
    nextHiddenIds.add(recommendation.id);
  }

  hiddenRecommendationIds.value = nextHiddenIds;
  nextTick(updateScrollFades);

  emit('toggle-visibility', recommendation, !nextHiddenIds.has(recommendation.id));
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
  () => displayedRecommendations.value.length,
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
  <PortfolioSectionShell
    title="Recommendations"
    :is-empty="!displayedRecommendations.length"
    empty-label="No recommendations yet"
  >
    <template #actions>
      <button
        v-if="displayedRecommendations.length"
        type="button"
        class="recommendations-toggle"
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
    </template>

    <div
      class="recommendations-frame"
      :class="{
        'recommendations-frame--loop': isLoopMode,
        'recommendations-frame--scroll': isScrollMode,
        'recommendations-frame--moving': shouldLoop,
        'recommendations-frame--draggable': isScrollMode,
        'recommendations-frame--dragging': isDragging,
        'has-left-fade': canScrollLeft,
        'has-right-fade': canScrollRight,
      }"
    >
      <div
        ref="scrollerRef"
        class="recommendations-scroller"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerUp"
        @pointerleave="handlePointerUp"
        @scroll="updateScrollFades"
      >
        <div
          class="recommendations-track"
        >
          <template v-if="shouldLoop">
            <div
              v-for="copy in 2"
              :key="copy"
              class="recommendations-loop-set"
            >
              <RecommendationCard
                v-for="(recommendation, index) in displayedRecommendations"
                :key="`${recommendation.id}-${copy}-${index}`"
                :recommendation="recommendation"
                :can-manage-visibility="isOwner"
                :is-visible="isRecommendationVisible(recommendation)"
                @toggle-visibility="toggleRecommendationVisibility(recommendation)"
              />
            </div>
          </template>
          <template v-else>
            <RecommendationCard
              v-for="(recommendation, index) in displayedRecommendations"
              :key="`${recommendation.id}-${index}`"
              :recommendation="recommendation"
              :can-manage-visibility="isOwner"
              :is-visible="isRecommendationVisible(recommendation)"
              @toggle-visibility="toggleRecommendationVisibility(recommendation)"
            />
          </template>
        </div>
      </div>
    </div>
  </PortfolioSectionShell>
</template>

<style scoped>
.recommendations-toggle {
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
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.38);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.recommendations-toggle:hover {
  background-color: rgba(var(--color-primary-rgb), 0.92);
  box-shadow: 0 7px 12px rgba(0, 0, 0, 0.34);
  transform: translateY(-1px);
}

.recommendations-frame {
  --recommendation-fade-width: clamp(2rem, 6vw, 4rem);
  position: relative;
  padding-block: var(--padding-block);
  overflow: hidden;
}

.recommendations-frame::before,
.recommendations-frame::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  width: 0;
  pointer-events: none;
  transition: width var(--transition-normal);
}

.recommendations-frame::before {
  left: 0;
  background: linear-gradient(
    to right,
    var(--color-background),
    rgba(var(--color-background-rgb), 0)
  );
}

.recommendations-frame::after {
  right: 0;
  background: linear-gradient(
    to left,
    var(--color-background),
    rgba(var(--color-background-rgb), 0)
  );
}

.recommendations-frame--loop::before,
.recommendations-frame--loop::after,
.recommendations-frame--scroll.has-left-fade::before,
.recommendations-frame--scroll.has-right-fade::after {
  width: var(--recommendation-fade-width);
}

.recommendations-scroller {
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
}

.recommendations-scroller::-webkit-scrollbar {
  display: none;
}

.recommendations-track {
  display: flex;
  align-items: stretch;
  width: max-content;
  gap: var(--space-lg);
}

.recommendations-loop-set {
  display: flex;
  align-items: stretch;
  gap: var(--space-lg);
}

.recommendations-frame--moving .recommendations-track {
  animation: recommendations-marquee 42s linear infinite;
}

.recommendations-frame--moving .recommendations-scroller:hover .recommendations-track {
  animation-play-state: paused;
}

.recommendations-frame--scroll .recommendations-track {
  animation: none;
  transform: none;
}

.recommendations-frame--draggable .recommendations-scroller {
  cursor: grab;
}

.recommendations-frame--dragging .recommendations-scroller {
  cursor: grabbing;
}

@keyframes recommendations-marquee {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(calc(-50% - (var(--space-lg) / 2)));
  }
}

@media (max-width: 640px) {
  .recommendations-track,
  .recommendations-loop-set {
    gap: var(--space-md);
  }
}
</style>
