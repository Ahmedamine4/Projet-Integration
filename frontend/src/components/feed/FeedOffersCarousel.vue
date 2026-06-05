<script setup>
import { MapPin } from 'lucide-vue-next';
import HorizontalScroll from '@/components/feed/HorizontalScroll.vue';

defineProps({
  offers: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['select-offer']);

function handleOfferClick(offer) {
  emit('select-offer', offer);
}
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

    <HorizontalScroll>
      <button
        v-for="offer in offers"
        :key="offer.id"
        type="button"
        class="offer-card"
        @click="handleOfferClick(offer)"
      >
        <div class="offer-card-top">
          <span class="offer-type">{{ offer.duration }}</span>
          <span class="offer-location">
            <MapPin :size="11" />
            {{ offer.location }}
          </span>
        </div>

        <div class="offer-card-content">
          <h3>{{ offer.title }}</h3>
          <p class="offer-company">{{ offer.company }}</p>
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

        <span class="offer-hint">View details →</span>
      </button>
    </HorizontalScroll>
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  text-align: left;
  user-select: none;
  cursor: pointer;
  appearance: none;
  font: inherit;
  transition:
    transform 150ms ease,
    box-shadow 150ms ease,
    border-color 150ms ease;
}

.offer-card:hover {
  transform: translateY(-4px);
  border-color: rgba(var(--color-secondary-rgb), 0.28);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

.offer-card:active {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.07);
  transition-duration: 80ms;
}

.offer-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-xs);
}

.offer-type {
  display: inline-flex;
  align-items: center;
  padding: 0.12rem 0.4rem;
  border-radius: 999px;
  background: rgba(var(--color-secondary-rgb), 0.08);
  border: 1px solid rgba(var(--color-secondary-rgb), 0.16);
  color: rgba(var(--color-secondary-rgb), 0.85);
  font-size: 9px;
  font-weight: var(--font-semibold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 8rem;
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
  flex: 1;
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
  color: rgba(var(--color-secondary-rgb), 0.8);
  font-size: 10px;
  font-weight: var(--font-semibold);
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 150ms ease, transform 150ms ease;
}

.offer-card:hover .offer-hint {
  opacity: 1;
  transform: translateX(0);
}

@media (max-width: 640px) {
  .offer-card {
    flex-basis: 14rem;
  }
}
</style>