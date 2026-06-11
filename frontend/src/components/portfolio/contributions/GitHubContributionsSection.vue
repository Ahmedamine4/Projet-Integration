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

const contributionWeeks = computed(() => {
  if (!contributions.value?.contributionCalendar?.weeks) return [];
  return contributions.value.contributionCalendar.weeks;
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

async function loadContributions() {
  try {
    isLoading.value = true;
    error.value = null;
    await githubStore.fetchContributions();
  } catch (err) {
    error.value = err.message || 'Failed to load contributions';
  } finally {
    isLoading.value = false;
  }
}

async function syncAndLoad() {
  try {
    isLoading.value = true;
    error.value = null;
    await githubStore.syncRepositories();
    await githubStore.fetchContributions();
  } catch (err) {
    error.value = err.message || 'Failed to sync with GitHub';
  } finally {
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
          @click="syncAndLoad"
          :disabled="isLoading"
        >
          <RefreshCw :size="16" />
          <span>Sync</span>
        </button>
      </div>
    </div>

    <div v-else-if="!hasContributions" class="contributions-empty">
      <div class="empty-container">
        <p>No GitHub contributions found.</p>
        <button
          type="button"
          class="action-button secondary"
          @click="syncAndLoad"
          :disabled="isLoading"
        >
          <RefreshCw :size="16" />
          <span>Sync</span>
        </button>
      </div>
    </div>

    <div v-else class="contributions-grid">
      <div class="contributions-header">
        <div>
          <span class="contributions-label">{{ contributions?.login || 'Contributions' }}</span>
          <span class="contributions-stats">
            {{ contributions?.contributionsCollection?.totalCommitContributions }} commits
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

      <div class="calendar">
        <div
          v-for="day in allDays"
          :key="day.date"
          class="day"
          :title="getTooltip(day)"
          :style="{
            backgroundColor: day.color,
            opacity: getOpacity(day)
          }"
        />
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
  gap: 2rem;
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
  font-weight: 600;
  color: var(--color-primary);
  font-size: var(--font-size-sm);
}

.contributions-stats {
  font-size: var(--font-size-xs);
  color: rgba(var(--color-primary-rgb), 0.7);
}

.calendar {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12px, 1fr));
  gap: 3px;
  padding: 1rem 0;
}

.day {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  cursor: pointer;
  transition: transform 150ms ease;
}

.day:hover {
  transform: scale(1.2);
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
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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
  .calendar {
    grid-template-columns: repeat(auto-fill, minmax(10px, 1fr));
  }

  .day {
    width: 10px;
    height: 10px;
  }

  .contributions-stats-list {
    grid-template-columns: repeat(2, 1fr);
  }

  .contributions-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
