<script setup>
import PortfolioSectionShell from '@/components/portfolio/layout/PortfolioSectionShell.vue';
import PortfolioInternship from '@/components/portfolio/internships/PortfolioInternship.vue';

defineProps({
  internships: {
    type: Array,
    default: () => [],
  },
  canAdd: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['add-internship', 'edit-internship']);
</script>

<template>
  <PortfolioSectionShell
    title="Internships"
    add-label="Add Internship"
    :can-add="canAdd"
    :is-empty="!internships.length"
    empty-label="No internships yet"
    @add="emit('add-internship')"
  >
    <div class="internships">
      <PortfolioInternship
        v-for="internship in internships"
        :key="internship.id"
        :internship
        :can-edit="canAdd"
        @edit="internship => emit('edit-internship', internship)"
      />
    </div>
  </PortfolioSectionShell>
</template>

<style scoped>
.internships {
  --internship-gap: calc(var(--space-xl) * 1.2);
  position: relative;
  display: grid;
  gap: var(--internship-gap);
  padding-block: var(--padding-block);
}

.internships::before {
  content: none;
}

@media (max-width: 640px) {
  .internships::before {
    left: calc(4.2rem + 1px);
  }
}
</style>
