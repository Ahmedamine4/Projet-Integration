<script setup>
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['update:currentPage']);

function goTo(page) {
  if (page < 1 || page > props.totalPages || page === props.currentPage) return;
  emit('update:currentPage', page);
}

const pages = computed(() => {
  const total = props.totalPages;
  const current = props.currentPage;

  if (total <= 1) return [1];

  const items = [];

  items.push(1);

  if (current > 3) {
    items.push('...');
  } else if (current === 3) {
    items.push(2);
  }

  const rangeStart = Math.max(2, current - 1);
  const rangeEnd = Math.min(total - 1, current + 1);

  for (let i = rangeStart; i <= rangeEnd; i++) {
    if (!items.includes(i)) items.push(i);
  }

  if (current < total - 2) {
    items.push('...');
  } else if (current === total - 2) {
    if (!items.includes(total - 1)) items.push(total - 1);
  }

  if (total > 1 && !items.includes(total)) {
    items.push(total);
  }

  return items;
});
</script>

<template>
  <nav
    class="pagination"
    aria-label="Pagination"
  >
    <!-- Prev arrow -->
    <button
      type="button"
      class="pagination__arrow"
      :disabled="currentPage <= 1"
      aria-label="Previous page"
      @click="goTo(currentPage - 1)"
    >
      <ChevronLeft :size="15" />
    </button>

    <!-- Page numbers -->
    <template
      v-for="(item, index) in pages"
      :key="index"
    >
      <span
        v-if="item === '...'"
        class="pagination__ellipsis"
      >
        &hellip;
      </span>
      <button
        v-else
        type="button"
        class="pagination__page"
        :class="{ 'pagination__page--active': item === currentPage }"
        :aria-current="item === currentPage ? 'page' : undefined"
        @click="goTo(item)"
      >
        {{ item }}
      </button>
    </template>

    <!-- Next arrow -->
    <button
      type="button"
      class="pagination__arrow"
      :disabled="currentPage >= totalPages"
      aria-label="Next page"
      @click="goTo(currentPage + 1)"
    >
      <ChevronRight :size="15" />
    </button>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination__arrow,
.pagination__page {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  font: inherit;
  font-size: var(--font-size-sm);
  cursor: pointer;
  border-radius: 0.55rem;
  color: var(--color-primary);
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
}

.pagination__arrow {
  width: 2rem;
  height: 2rem;
  color: rgba(var(--color-primary-rgb), 0.55);
}

.pagination__arrow:hover:not(:disabled) {
  background: rgba(var(--color-primary-rgb), 0.06);
  color: var(--color-primary);
  transform: translateY(-1px);
}

.pagination__arrow:disabled {
  opacity: 0.28;
  cursor: not-allowed;
}

.pagination__page {
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.4rem;
  font-weight: var(--font-medium);
  color: rgba(var(--color-primary-rgb), 0.65);
}

.pagination__page:hover:not(.pagination__page--active) {
  background: rgba(var(--color-primary-rgb), 0.06);
  color: var(--color-primary);
  transform: translateY(-1px);
}

.pagination__page--active {
  background: var(--color-primary);
  color: var(--color-background);
  font-weight: var(--font-bold);
  cursor: default;
}

.pagination__ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  font-size: var(--font-size-sm);
  color: rgba(var(--color-primary-rgb), 0.35);
  user-select: none;
  letter-spacing: 0.05em;
}
</style>