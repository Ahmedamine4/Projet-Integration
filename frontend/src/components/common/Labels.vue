<script setup>
import { X, Plus } from 'lucide-vue-next';

defineProps({
  title: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    required: true
  },
  colorRgb: {
    type: String,
    default: 'var(--color-secondary-rgb)'
  }
});

const emit = defineEmits(['toggle']);
</script>

<template>
  <div v-if="items.length" class="label-group">
    <p class="label-title">{{ title }}</p>

    <div class="label-tags">
      <span
        v-for="item in items"
        :key="item.name"
        class="label-tag"
        :class="{ inactive: !item.selected }"
        :style="{ '--label-color-rgb': colorRgb }"
      >
        {{ item.name }}

        <button type="button" @click="emit('toggle', item)">
          <X
            v-if="item.selected"
            :size="12"
            :stroke-width="2.5"
          />

          <Plus
            v-else
            :size="12"
            :stroke-width="3.2"
          />
        </button>
      </span>
    </div>
  </div>
</template>

<style scoped>
.label-group {
  display: grid;
  gap: 8px;
}

.label-title {
  margin: 0;
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  color: var(--color-primary-hover);
}

.label-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.label-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  border: 1px solid rgba(var(--label-color-rgb), 0.35);
  background: rgba(var(--label-color-rgb), 0.1);
  color: var(--color-primary);

  border-radius: 999px;
  padding: 5px 9px;

  font-size: 0.75rem;
  font-weight: var(--font-medium);
  transition: 0.2s ease;
}

.label-tag button {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-weight: var(--font-bold);
  font-size: 0.8rem;
  padding: 0;

  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* selected hover: red */
.label-tag:not(.inactive):hover {
  border-color: var(--color-error);
  background: rgba(189, 31, 30, 0.08);
  color: var(--color-error);
}

.label-tag:not(.inactive):hover button {
  color: var(--color-error);
}

/* inactive default: grey */
.label-tag.inactive {
  background: #eeeeee;
  border-color: #dddddd;
  color: #777777;
}

/* inactive button: green */
.label-tag.inactive button {
  color: var(--color-success);
}

/* inactive hover: green */
.label-tag.inactive:hover {
  border-color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 10%, transparent);
  color: var(--color-success);
}

.label-tag.inactive:hover button {
  color: var(--color-success);
}
</style>