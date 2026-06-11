<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useGithubStore } from '@/stores/github';
import PortfolioSectionShell from '@/components/portfolio/layout/PortfolioSectionShell.vue';
import BaseSpinner from '@/components/common/feedback/BaseSpinner.vue';
import { RefreshCw } from 'lucide-vue-next';

const props = defineProps({
  userId: {
    type: [String, Number],
    required: true,
  },
});

const githubStore = useGithubStore();
const isLoading = ref(false);
const error = ref(null);

const contributions = computed(() => githubStore.contributions);
const needsGithubConnection = computed(() => {
  const message = String(error.value || '').toLowerCase();
  return message.includes('token github') || message.includes('connect');
});

const contributionWeeks = computed(() => {
  const weeks = contributions.value?.contributionsCollection?.contributionCalendar?.weeks;
  return Array.isArray(weeks) ? weeks : [];
});

const totalContributions = computed(() =>
  contributions.value?.contributionsCollection?.contributionCalendar?.totalContributions ?? 0
);

const monthLabels = computed(() => {
  let previousMonth = '';

  return contributionWeeks.value.map((week) => {
    const firstDay = week.contributionDays?.[0];
    if (!firstDay?.date) return '';

    const month = new Date(firstDay.date).toLocaleDateString('en-US', {
      month: 'short',
    });

    if (month === previousMonth) return '';
    previousMonth = month;
    return month;
  });
});

const maxContributions = computed(() => {
  let max = 0;
  contributionWeeks.value.forEach(week => {
    week.contributionDays.forEach(day => {
      max = Math.max(max, day.contributionCount);
    });
  });
  return max || 1;
});

const allDays = computed(() => {
  const days = [];
  contributionWeeks.value.forEach(week => {
    days.push(...week.contributionDays);
  });
  return days;
});

const hasContributions = computed(() => allDays.value.length > 0);

function getTooltip(day) {
  const date = new Date(day.date);
  const formatted = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  return `${day.contributionCount} contributions on ${formatted}`;
}

function getOpacity(day) {
  if (day.contributionCount === 0) return 0.12;
  return Math.max(0.3, day.contributionCount / maxContributions.value);
}

function getGridRow(day) {
  return Number(day.weekday ?? 0) + 1;
}

async function loadContributions() {
  try {
    isLoading.value = true;
    error.value = null;
    await githubStore.fetchContributions(props.userId);
  } catch (err) {
    error.value = err.response?.data?.message ||
      githubStore.error ||
      err.message ||
      'Failed to load contributions';
  } finally {
    isLoading.value = false;
  }
}

async function syncAndLoad() {
  try {
    isLoading.value = true;
    error.value = null;
    await githubStore.syncRepositories();
    await githubStore.fetchContributions(props.userId);
  } catch (err) {
    error.value = err.response?.data?.message ||
      githubStore.error ||
      err.message ||
      'Failed to sync with GitHub';
  } finally {
    isLoading.value = false;
  }
}

async function connectGithub() {
  try {
    isLoading.value = true;
    error.value = null;
    await githubStore.connectGithub();
  } catch (err) {
    error.value = err.response?.data?.message ||
      githubStore.error ||
      err.message ||
      'Failed to connect GitHub';
    isLoading.value = false;
  }
}

onMounted(loadContributions);

watch(
  () => props.userId,
  () => {
    githubStore.contributions = null;
    loadContributions();
  }
);
</script>

<template>
  <PortfolioSectionShell
    title="GitHub Contributions"
    :can-add="false"
  >
    <div v-if="isLoading" class="contributions-loading">
      <BaseSpinner />
    </div>

    <div v-else-if="error" class="contributions-error">
      <div class="error-container">
        <p>{{ error }}</p>
        <button
          type="button"
          class="action-button secondary"
          @click="needsGithubConnection ? connectGithub() : syncAndLoad()"
          :disabled="isLoading"
        >
          <RefreshCw :size="16" />
          <span>{{ needsGithubConnection ? 'Connect GitHub' : 'Sync' }}</span>
        </button>
      </div>
    </div>

    <div v-else-if="!hasContributions" class="contributions-empty">
      <div class="empty-container">
        <p>No GitHub contributions found.</p>
        <button
          type="button"
          class="action-button secondary"
          @click="connectGithub"
          :disabled="isLoading"
        >
          <RefreshCw :size="16" />
          <span>Connect GitHub</span>
        </button>
      </div>
    </div>

    <div v-else class="contributions-grid">
      <div class="contributions-header">
        <div>
          <span class="contributions-label">{{ contributions?.login || 'Contributions' }}</span>
          <span class="contributions-stats">
            {{ totalContributions }} contributions in the last year
          </span>
        </div>
        <button
          type="button"
          class="refresh-btn-small"
          @click="loadContributions"
          :disabled="isLoading"
          title="Refresh contributions"
        >
          <RefreshCw :size="16" />
        </button>
      </div>

      <div class="calendar-shell">
        <div
          class="calendar-board"
          :style="{ '--weeks-count': contributionWeeks.length }"
        >
          <div class="month-labels" aria-hidden="true">
            <span class="weekday-spacer" />
            <span
              v-for="(label, index) in monthLabels"
              :key="`month-${index}`"
            >
              {{ label }}
            </span>
          </div>

          <div class="calendar-layout">
            <div class="weekday-labels" aria-hidden="true">
              <span />
              <span>Mon</span>
              <span />
              <span>Wed</span>
              <span />
              <span>Fri</span>
              <span />
            </div>

            <div
              class="calendar"
              role="img"
              :aria-label="`${totalContributions} GitHub contributions in the last year`"
            >
              <div
                v-for="(week, weekIndex) in contributionWeeks"
                :key="`week-${weekIndex}`"
                class="calendar-week"
              >
                <div
                  v-for="day in week.contributionDays"
                  :key="day.date"
                  class="day"
                  :title="getTooltip(day)"
                  :style="{
                    gridRow: getGridRow(day),
                    backgroundColor: day.color,
                    opacity: getOpacity(day)
                  }"
                />
              </div>
            </div>
          </div>

          <div class="calendar-legend" aria-hidden="true">
            <span>Less</span>
            <i class="legend-box legend-box--empty" />
            <i class="legend-box legend-box--low" />
            <i class="legend-box legend-box--mid" />
            <i class="legend-box legend-box--high" />
            <i class="legend-box legend-box--max" />
            <span>More</span>
          </div>
        </div>
      </div>

      <div class="contributions-stats-list">
        <div class="stat">
          <span class="stat-label">Pull Requests</span>
          <span class="stat-value">{{ contributions?.contributionsCollection?.totalPullRequestContributions }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Issues</span>
          <span class="stat-value">{{ contributions?.contributionsCollection?.totalIssueContributions }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Reviews</span>
          <span class="stat-value">{{ contributions?.contributionsCollection?.totalPullRequestReviewContributions }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Repos</span>
          <span class="stat-value">{{ contributions?.contributionsCollection?.totalRepositoryContributions }}</span>
        </div>
      </div>
    </div>
  </PortfolioSectionShell>
</template>

<style scoped>
.contributions-grid {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  width: 100%;
  margin-block: var(--space-xl);
}

.contributions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
  gap: 1rem;
}

.contributions-header > div {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.contributions-label {
  font-weight: 700;
  color: var(--color-primary);
  font-size: var(--font-size-md);
}

.contributions-stats {
  font-size: var(--font-size-xs);
  color: rgba(var(--color-primary-rgb), 0.7);
}

.calendar-shell {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.75rem 0 0.15rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--color-primary-rgb), 0.22) transparent;
  -webkit-overflow-scrolling: touch;
}

.calendar-shell::-webkit-scrollbar {
  height: 0.45rem;
}

.calendar-shell::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(var(--color-primary-rgb), 0.18);
}

.calendar-board {
  --day-gap: 4px;
  --weekday-column: 2.2rem;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  border-radius: var(--radius-md);
  padding: 1.25rem 1.35rem 1rem;
  background: rgba(var(--color-background-rgb), 0.42);
}

.month-labels {
  display: grid;
  grid-template-columns: var(--weekday-column) repeat(var(--weeks-count, 53), minmax(0, 1fr));
  gap: var(--day-gap);
  width: 100%;
  margin-bottom: 0.5rem;
  color: rgba(var(--color-primary-rgb), 0.54);
  font-size: var(--font-size-xxs);
}

.month-labels span:not(.weekday-spacer) {
  min-width: 0;
}

.calendar-layout {
  display: grid;
  grid-template-columns: var(--weekday-column) minmax(0, 1fr);
  gap: var(--day-gap);
  width: 100%;
}

.weekday-labels {
  display: grid;
  grid-template-rows: repeat(7, minmax(0, 1fr));
  align-items: center;
  gap: var(--day-gap);
  color: rgba(var(--color-primary-rgb), 0.54);
  font-size: var(--font-size-xxs);
  line-height: 1;
}

.calendar {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: var(--day-gap);
  width: 100%;
  min-width: 0;
}

.calendar-week {
  display: grid;
  grid-template-rows: repeat(7, minmax(0, 1fr));
  gap: var(--day-gap);
}

.day {
  width: 100%;
  min-height: 8px;
  aspect-ratio: 1;
  border-radius: 3px;
  cursor: pointer;
  transition: transform 150ms ease;
  box-shadow: inset 0 0 0 1px rgba(var(--color-primary-rgb), 0.04);
}

.day:hover {
  transform: scale(1.18);
  box-shadow:
    inset 0 0 0 1px rgba(var(--color-primary-rgb), 0.12),
    0 2px 8px rgba(var(--color-primary-rgb), 0.16);
}

.calendar-legend {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.9rem;
  color: rgba(var(--color-primary-rgb), 0.58);
  font-size: var(--font-size-xxs);
}

.legend-box {
  display: block;
  width: 13px;
  height: 13px;
  border-radius: 3px;
  box-shadow: inset 0 0 0 1px rgba(var(--color-primary-rgb), 0.04);
}

.legend-box--empty {
  background: #ebedf0;
}

.legend-box--low {
  background: #9be9a8;
}

.legend-box--mid {
  background: #40c463;
}

.legend-box--high {
  background: #30a14e;
}

.legend-box--max {
  background: #216e39;
}

.contributions-loading,
.contributions-error,
.contributions-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: rgba(var(--color-primary-rgb), 0.7);
  font-size: var(--font-size-sm);
  text-align: center;
}

.contributions-empty p,
.contributions-error p {
  max-width: 400px;
}

.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
  border: 1.5px solid transparent;
}

.action-button.secondary {
  background: var(--color-surface);
  color: var(--color-primary);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}

.action-button.secondary:hover:not(:disabled) {
  background: rgba(var(--color-primary-rgb), 0.05);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.retry-button,
.refresh-btn-small {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.3);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
}

.retry-button:hover:not(:disabled),
.refresh-btn-small:hover:not(:disabled) {
  background: rgba(var(--color-primary-rgb), 0.05);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.retry-button:disabled,
.refresh-btn-small:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-btn-small {
  padding: 0.5rem;
  width: auto;
}

.contributions-stats-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-sm);
  padding: 0.8rem 0.9rem;
  background: rgba(var(--color-background-rgb), 0.34);
}

.stat-label {
  font-size: var(--font-size-xxs);
  font-weight: 600;
  color: rgba(var(--color-primary-rgb), 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-primary);
}

@media (max-width: 640px) {
  .contributions-grid {
    gap: 1rem;
  }

  .calendar-board {
    --day-gap: 3px;
    --weekday-column: 1.65rem;
    width: 46rem;
    min-width: 46rem;
    padding: 0.9rem;
  }

  .month-labels,
  .weekday-labels,
  .calendar-legend {
    font-size: 0.62rem;
  }

  .calendar-shell {
    margin-inline: calc(var(--space-sm) * -1);
    padding-inline: var(--space-sm);
  }

  .calendar-legend {
    justify-content: flex-start;
  }

  .contributions-stats-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .contributions-header {
    align-items: flex-start;
  }
}

@media (max-width: 420px) {
  .calendar-board {
    --weekday-column: 1.45rem;
    width: 42rem;
    min-width: 42rem;
    padding: 0.75rem;
  }

  .contributions-stats-list {
    grid-template-columns: 1fr;
  }

  .contributions-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
