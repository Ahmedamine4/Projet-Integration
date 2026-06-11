<script setup>
/**
 * AdminStatsBar
 * ─────────────────────────────────────────────────────────────────
 * Reusable stats navbar for admin pages.
 * Accepts an array of stat objects: { icon, value, label, sub, color, loading? }
 * color is one of: 'blue' | 'orange' | 'purple' | 'green' | 'red'
 */
import BaseSpinner from '@/components/common/feedback/BaseSpinner.vue';

defineProps({
  stats: {
    type: Array,
    required: true,
    // [{ icon: Component, value: Number|String, label: String, sub: String, color: String, loading?: Boolean }]
  },
  /** If true all cards show a skeleton shimmer */
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="stats-bar">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="stat-card"
      :class="`stat-card--${stat.color ?? 'blue'}`"
    >
      <div class="stat-card__icon">
        <component :is="stat.icon" :size="18" />
      </div>
      <div class="stat-card__body">
        <span class="stat-card__value">
          <BaseSpinner v-if="loading || stat.loading" size="md" />
          <span v-else>{{ stat.value }}</span>
        </span>
        <span class="stat-card__label">
          {{ stat.label }}
          <small>{{ stat.sub }}</small>
        </span>
      </div>
      <!-- optional trend badge -->
      <span v-if="stat.trend != null" class="stat-card__trend" :class="stat.trend >= 0 ? 'trend--up' : 'trend--down'">
        {{ stat.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
      </span>
    </div>
  </div>
</template>

<style scoped>
.stats-bar {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: white;
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-md);
  padding: 12px 18px;
  min-width: 130px;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  overflow: hidden;
}

/* subtle left-border accent */
.stat-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* icon circle */
.stat-card__icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* body */
.stat-card__body {
  display: flex;
  flex-direction: column;
}

.stat-card__value {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
  min-height: 22px;
  display: flex;
  align-items: center;
}

.stat-card__label {
  display: flex;
  flex-direction: column;
  font-size: 11px;
  color: var(--color-primary-hover);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
  margin-top: 3px;
  line-height: 1.3;
}

.stat-card__label small {
  font-weight: 400;
  text-transform: none;
  font-size: 10px;
  letter-spacing: 0;
}

/* trend pill */
.stat-card__trend {
  position: absolute;
  top: 8px; right: 10px;
  font-size: 9px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 999px;
}
.trend--up   { background: #d1fae5; color: #065f46; }
.trend--down { background: #fee2e2; color: #991b1b; }

/* ── Color variants ── */
.stat-card--blue::before   { background: #2563eb; }
.stat-card--orange::before { background: var(--color-secondary, #f97316); }
.stat-card--purple::before { background: #7c3aed; }
.stat-card--green::before  { background: #16a34a; }
.stat-card--red::before    { background: #dc2626; }

.stat-card--blue   .stat-card__icon { background: #eff6ff; color: #2563eb; }
.stat-card--orange .stat-card__icon { background: #fff7ed; color: var(--color-secondary, #f97316); }
.stat-card--purple .stat-card__icon { background: #f5f3ff; color: #7c3aed; }
.stat-card--green  .stat-card__icon { background: #f0fdf4; color: #16a34a; }
.stat-card--red    .stat-card__icon { background: #fff1f2; color: #dc2626; }
</style>
