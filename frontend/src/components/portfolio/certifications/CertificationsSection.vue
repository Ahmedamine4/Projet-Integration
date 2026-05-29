<script setup>
import { nextTick, onMounted, ref } from 'vue';
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

const certificationsRef = ref(null);
const canScrollTop = ref(false);
const canScrollBottom = ref(false);

function updateScrollFades() {
  const el = certificationsRef.value;
  if (!el) return;

  const maxScrollTop = el.scrollHeight - el.clientHeight;
  canScrollTop.value = el.scrollTop > 1;
  canScrollBottom.value = el.scrollTop < maxScrollTop - 1;
}

onMounted(() => {
  nextTick(updateScrollFades);
});
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
      class="activities-scroll-frame"
      :class="{
        'has-top-fade': canScrollTop,
        'has-bottom-fade': canScrollBottom,
      }"
    >
      <div
        ref="certificationsRef"
        class="certifications"
        :style="{ '--certifications-max-height': maxCardHeight ? `${maxCardHeight}px` : undefined }"
        @scroll="updateScrollFades"
      >
        <PortfolioCertification
          v-for="certification in certifications"
          :key="certification.id"
          :certification
          :can-edit="canAdd"
          @edit="certification => emit('edit-certification', certification)"
        />
      </div>
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

.activities-scroll-frame {
  --project-fade-height: clamp(1rem, 2vw, 2rem);
  position: relative;
}

.activities-scroll-frame::before,
.activities-scroll-frame::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  z-index: 2;
  height: 0;
  pointer-events: none;
  transition: height var(--transition-normal);
}

.activities-scroll-frame::before {
  top: 0;
  backdrop-filter: blur(4px);
  mask-image: linear-gradient(
    to bottom,
    black,
    transparent
  );
}

.activities-scroll-frame::after {
  bottom: 0;
  backdrop-filter: blur(4px);
  mask-image: linear-gradient(
    to top,
    black,
    transparent
  );
}

.activities-scroll-frame.has-top-fade::before,
.activities-scroll-frame.has-bottom-fade::after {
  height: var(--project-fade-height);
}

@media (max-width: 820px) {
  .certifications {
    max-height: 34rem;
  }
}
</style>
