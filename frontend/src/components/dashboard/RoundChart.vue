<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  techStack: {
    type: Array,
    required: true
  }
})

const hoveredTech = ref(null)
const CIRCUMFERENCE = 2 * Math.PI * 70

const donutSegments = computed(() => {
  let offset = CIRCUMFERENCE * 0.25
  return props.techStack.map(tech => {
    const dash = (tech.percent / 100) * CIRCUMFERENCE
    const gap = CIRCUMFERENCE - dash
    const seg = { ...tech, dash, gap, offset: -offset }
    offset += dash
    return seg
  })
})
</script>

<template>
  <div class="chart-wrapper">
    <div class="donut-container">
      <svg viewBox="0 0 200 200" class="donut-svg">
        <circle
          v-for="tech in donutSegments"
          :key="tech.name"
          cx="100"
          cy="100"
          r="70"
          fill="none"
          :stroke="tech.color"
          stroke-width="30"
          :stroke-dasharray="`${tech.dash} ${tech.gap}`"
          :stroke-dashoffset="tech.offset"
          class="donut-segment"
          :class="{ dimmed: hoveredTech && hoveredTech !== tech.name }"
          @mouseenter="hoveredTech = tech.name"
          @mouseleave="hoveredTech = null"
        />
      </svg>

      <div class="donut-center">
        <template v-if="hoveredTech">
          <span
            class="donut-total"
            :style="{ color: techStack.find(t => t.name === hoveredTech)?.color }"
          >
            {{ techStack.find(t => t.name === hoveredTech)?.percent }}%
          </span>
          <span class="donut-label">{{ hoveredTech }}</span>
        </template>
        <template v-else>
          <span class="donut-total">{{ techStack.length }}</span>
          <span class="donut-label">techs</span>
        </template>
      </div>
    </div>

    <ul class="donut-legend">
      <li
        v-for="tech in techStack"
        :key="tech.name"
        class="legend-item"
        :class="{ dimmed: hoveredTech && hoveredTech !== tech.name }"
        @mouseenter="hoveredTech = tech.name"
        @mouseleave="hoveredTech = null"
      >
        <span class="legend-dot" :style="{ background: tech.color }"></span>
        <span class="legend-name">{{ tech.name }}</span>
        <span class="legend-percent">{{ tech.percent }}%</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.chart-wrapper {
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
}

.donut-container {
  position: relative;
  width: 180px;
  height: 180px;
  flex-shrink: 0;
}

.donut-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.donut-segment {
  transition: opacity 0.2s;
  cursor: pointer;
}

.donut-segment.dimmed,
.legend-item.dimmed {
  opacity: 0.2;
  transition: opacity 0.25s;
}

.donut-center .donut-total,
.donut-center .donut-label {
  transition: all 0.2s ease;
}

.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.donut-total {
  font-size: 2rem;
  font-weight: 700;
  font-family: var(--font-ui);
  color: var(--color-primary);
  line-height: 1;
}

.donut-label {
  font-size: var(--font-size-xs);
  opacity: 0.5;
  margin-top: 4px;
}

.donut-legend {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-name {
  font-size: var(--font-size-sm);
  flex: 1;
}

.legend-percent {
  font-size: var(--font-size-xs);
  font-weight: 700;
  opacity: 0.6;
}
</style>