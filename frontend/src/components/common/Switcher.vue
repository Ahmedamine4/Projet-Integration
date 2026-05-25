<script setup>
import { computed, ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue';

const model = defineModel({
  type: String,
  required: true,
});

const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
});

const activeIndex = computed(() =>
  props.options.findIndex((option) => option.value === model.value),
);

const root = ref(null);
const thumbLeft = ref('0px');
const thumbWidth = ref('0px');

function updateThumb() {
  if (!root.value) return;
  const labels = root.value.querySelectorAll('label');
  const idx = activeIndex.value >= 0 ? activeIndex.value : 0;
  const el = labels[idx];
  if (!el) return;
  const containerRect = root.value.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const left = Math.round(elRect.left - containerRect.left);
  const width = Math.round(elRect.width);
  thumbLeft.value = `${left}px`;
  thumbWidth.value = `${width}px`;
}

const thumbStyle = computed(() => ({
  '--thumb-left': thumbLeft.value,
  '--thumb-width': thumbWidth.value,
}));

onMounted(() => {
  nextTick(updateThumb);
  window.addEventListener('resize', updateThumb);
});

watch([
  () => model.value,
  () => props.options && props.options.length,
], () => nextTick(updateThumb));

onBeforeUnmount(() => window.removeEventListener('resize', updateThumb));
</script>

<template>
  <div class="switcher" ref="root">
    <span class="switcher__thumb" :style="thumbStyle" />

    <template v-for="option in options" :key="option.value">
      <input
        :id="`switcher-${option.value}`"
        v-model="model"
        :value="option.value"
        type="radio"
      />
        <label
          :for="`switcher-${option.value}`"
          :class="{ selected: model === option.value }"
        >
          {{ option.label }}
        </label>
    </template>
  </div>
</template>

<style scoped>
.switcher {
  position: relative;
  display: flex;
  width: auto;
  min-height: 2.625rem;
  margin: 0;
  padding: var(--space-xs);
  border: none;
  border-radius: 999px;
  background: rgba(var(--color-primary-rgb), 0.05);
  gap: var(--space-xs);
  isolation: isolate;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.switcher::-webkit-scrollbar {
  display: none;
}

.switcher::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 2rem;
  background: linear-gradient(90deg, transparent 0%, rgba(var(--color-primary-rgb), 0.05) 100%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 999px;
}

.switcher.has-overflow::after {
  opacity: 1;
}

.switcher input {
  display: none;
}

.switcher__thumb {
  position: absolute;
  top: 0.2rem;
  bottom: 0.2rem;
  left: var(--thumb-left, 0px);
  width: var(--thumb-width, 0px);
  border-radius: 999px;
  background-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
  transition: left 0.28s cubic-bezier(.2,.9,.33,1), width 0.28s ease, background-color var(--transition-fast);
  will-change: left, width;
  z-index: 0;
  scroll-snap-stop: always;
}

.switcher label {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  flex: 0 0 auto;
  flex-shrink: 0;
  cursor: pointer;
  min-width: 0;
  padding: 0 var(--space-md);
  border-radius: 999px;
  text-align: center;
  font-size: var(--font-size-xs);
  line-height: 1.2;
  color: var(--color-primary);
  user-select: none;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: color var(--transition-normal), transform var(--transition-fast);
  scroll-snap-align: start;
}

.switcher label:hover {
  transform: translateY(-1px);
}

.switcher label:active {
  transform: translateY(0);
}

.switcher label.selected {
  color: var(--color-background);
  font-weight: var(--font-bold);
}

@media (max-width: 600px) {
  .switcher {
    width: 100%;
    max-width: 100%;
  }
}
</style>
