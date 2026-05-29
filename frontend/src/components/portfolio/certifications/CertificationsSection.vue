<script setup>
import PortfolioCertification from '@/components/portfolio/certifications/PortfolioCertification.vue';
import PortfolioSectionShell from '@/components/portfolio/layout/PortfolioSectionShell.vue';

defineProps({
  certifications: {
    type: Array,
    default: () => [],
  },
  canAdd: {
    type: Boolean,
    default: false,
  },
  maxCardHeight: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['add-certification', 'edit-certification']);
</script>

<template>
  <PortfolioSectionShell
    class="certifications-section"
    title="Certifications"
    add-label="Add Certification"
    :can-add="canAdd"
    :is-empty="!certifications.length"
    empty-label="No certifications yet"
    @add="emit('add-certification')"
  >
    <div
      class="certifications"
      :style="{ '--certifications-max-height': maxCardHeight ? `${maxCardHeight}px` : undefined }"
    >
      <PortfolioCertification
        v-for="certification in certifications"
        :key="certification.id"
        :certification
        :can-edit="canAdd"
        @edit="certification => emit('edit-certification', certification)"
      />
    </div>
  </PortfolioSectionShell>
</template>

<style scoped>
.certifications-section {
  height: 100%;
  min-height: 0;
}

.certifications {
  margin-top: 48px;
  display: grid;
  gap: var(--space-md);
  max-height: var(--certifications-max-height, 32rem);
  min-height: 0;
  overflow-y: auto;
  padding-right: var(--space-sm);
}

@media (max-width: 820px) {
  .certifications {
    max-height: 34rem;
  }
}
</style>
