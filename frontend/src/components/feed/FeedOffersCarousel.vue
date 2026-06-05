<script setup>
import { MapPin } from 'lucide-vue-next';

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

    <div class="offers-scroll-frame">
      <div class="offers-list">
        <button
          v-for="offer in offers"
          :key="offer.id"
          type="button"
          class="offer-card"
          @click.stop="handleOfferClick(offer)"
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
        </button>
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
  width: 100%;
  min-width: 0;
  overflow: hidden;
}

.offers-list {
  width: 100%;
  max-width: none;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: var(--space-lg);
  overflow-x: auto;
  overflow-y: hidden;
  padding-block: var(--space-sm);
  overscroll-behavior-x: contain;
  scrollbar-width: none;
  scroll-behavior: smooth;
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
  appearance: none;
  font: inherit;
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
  .offer-card {
    flex-basis: 14rem;
  }

  .offers-list {
    gap: var(--space-md);
  }
}
</style>