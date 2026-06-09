<template>
  <div class="admin-page">

    <!-- Header -->
    <div class="admin-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <h1 class="header-title">Administration</h1>
          <p class="header-sub">Platform Management</p>
        </div>
      </div>
      <span class="badge-admin">
        <span class="badge-dot"></span>
        Administrator
      </span>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in stats" :key="stat.label">
        <div class="stat-icon">
          <span v-html="stat.icon"></span>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-wrapper">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        <span v-html="tab.icon"></span>
        {{ tab.label }}
        <span v-if="tab.key === 'pro' && adminStore.professionnels.length" class="badge-count">
          {{ adminStore.professionnels.length }}
        </span>
      </button>
    </div>

    <!-- Content -->
    <div class="tab-content">
      <ProRequestsTab  v-if="activeTab === 'pro'"       />
      <InstitutionsTab v-if="activeTab === 'institutions'" />
      <UsersTab        v-if="activeTab === 'users'"     />
      <ActivityLogTab  v-if="activeTab === 'activity'"  />
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore }       from '@/stores/admin'
import { useInstitutionStore } from '@/stores/institution'
import ProRequestsTab from '@/components/admin/ProRequestsTab.vue'
import InstitutionsTab from '@/components/admin/InstitutionsTab.vue'
import UsersTab       from '@/components/admin/UsersTab.vue'
import ActivityLogTab from '@/components/admin/ActivityLogTab.vue'

const adminStore       = useAdminStore()
const institutionStore = useInstitutionStore()
const activeTab        = ref('pro')

const stats = computed(() => [
  {
    label: 'Users',
    value: adminStore.utilisateurs.length || '—',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  },
  {
    label: 'PRO Requests',
    value: adminStore.professionnels.length || '0',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  },
  {
    label: 'Institutions',
    value: institutionStore.institutions.length || '—',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  },
  {
    label: 'Logins',
    value: adminStore.connexions.length || '—',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  },
])

const tabs = [
  {
    key: 'pro',
    label: 'PRO Requests',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  },
  {
    key: 'institutions',
    label: 'Institutions',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  },
  {
    key: 'users',
    label: 'Users',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
  },
  {
    key: 'activity',
    label: 'Login History',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  },
]

onMounted(() => {
  adminStore.fetchProfessionnelsEnAttente()
  institutionStore.fetchInstitutions()
})
</script>

<style scoped>
.admin-page {
  padding: var(--space-xl);
  max-width: 1200px;
  margin: 0 auto;
  font-family: var(--font-ui);
}

/* ── Header ─────────────────────────────────── */
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
  gap: var(--space-md);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.header-icon {
  width: 46px;
  height: 46px;
  background: var(--color-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-background);
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
}

.header-title {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  margin: 0;
  line-height: 1;
}

.header-sub {
  font-size: var(--font-size-xs);
  color: var(--color-primary-hover);
  margin: 4px 0 0;
  font-family: var(--font-ui);
}

.badge-admin {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  background: var(--color-surface);
  color: var(--color-primary);
  border: 1px solid var(--color-surface);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  padding: 6px 14px;
  border-radius: var(--radius-lg);
  font-family: var(--font-ui);
}

.badge-dot {
  width: 7px;
  height: 7px;
  background: var(--color-success);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1);   }
  50%       { opacity: 0.5; transform: scale(0.85); }
}

/* ── Stats ──────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

.stat-card {
  background: white;
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  transition: var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-secondary);
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: var(--color-background);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-secondary);
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  font-family: var(--font-display);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-size-xxs);
  color: var(--color-primary-hover);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ── Tabs ───────────────────────────────────── */
.tabs-wrapper {
  display: flex;
  gap: var(--space-xs);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 5px;
  margin-bottom: var(--space-lg);
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px var(--space-md);
  border: none;
  background: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  font-family: var(--font-ui);
  color: var(--color-primary-hover);
  cursor: pointer;
  transition: var(--transition-fast);
  white-space: nowrap;
  flex: 1;
  justify-content: center;
}

.tab-btn:hover:not(.active) {
  background: var(--color-background);
  color: var(--color-primary);
}

.tab-btn.active {
  background: var(--color-primary);
  color: var(--color-background);
  box-shadow: var(--shadow-sm);
}

.badge-count {
  background: var(--color-secondary);
  color: white;
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  min-width: 18px;
  height: 18px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

/* ── Content ────────────────────────────────── */
.tab-content {
  background: white;
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  box-shadow: var(--shadow-sm);
  min-height: 300px;
}
</style>