<script setup>
import { ref, computed, onMounted } from 'vue';
import Switcher from '@/components/common/forms/BaseSwitcher.vue';
import AdminInstitutionsTab from '@/components/admin/AdminInstitutionsTab.vue';
import AdminUsersTab from '@/components/admin/AdminUsersTab.vue';
import AdminProTab from '@/components/admin/AdminProTab.vue';
import AdminLoginHistoryTab from '@/components/admin/AdminLoginHistoryTab.vue';
import { useAdminStore } from '@/stores/admin';
import { useInstitutionStore } from '@/stores/institution';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

const adminStore = useAdminStore();
const institutionStore = useInstitutionStore();
const authStore = useAuthStore();

const { utilisateurs, professionnels } = storeToRefs(adminStore);
const { institutions } = storeToRefs(institutionStore);

const activeTab = ref('institutions');

const tabs = [
  { value: 'institutions', label: 'Institutions' },
  { value: 'users',        label: 'Users'         },
  { value: 'pro',          label: 'PRO'            },
  { value: 'history',      label: 'Login History'  },
];

const today = computed(() => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
});

onMounted(() => {
  adminStore.fetchUtilisateurs();
  adminStore.fetchProfessionnelsEnAttente();
  institutionStore.fetchInstitutions();
});
</script>

<template>
  <div class="admin-page">

    <!-- Page Header (matching the provided teacher dashboard image) -->
    <header class="admin-header">
      <div class="admin-header__left">
        <span class="admin-header__overline">ADMIN WORKSPACE</span>
        <h2 class="admin-header__title">Hello, Mr Admin</h2>
        <p class="admin-header__date">{{ today }}</p>
      </div>

      <div class="admin-header__stats">
        <div class="stat-card">
          <span class="stat-card__val">{{ utilisateurs.length || 0 }}</span>
          <span class="stat-card__lbl">Users<br/>registered</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__val">{{ professionnels.length || 0 }}</span>
          <span class="stat-card__lbl">Pending<br/>PRO</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__val">{{ institutions.length || 0 }}</span>
          <span class="stat-card__lbl">Institutions<br/>created</span>
        </div>
      </div>
    </header>

    <!-- Tab Switcher -->
    <div class="admin-switcher-wrap">
      <Switcher v-model="activeTab" :options="tabs" />
    </div>

    <!-- Tab Content -->
    <div class="admin-content">
      <AdminInstitutionsTab v-if="activeTab === 'institutions'" />
      <AdminUsersTab        v-else-if="activeTab === 'users'"   />
      <AdminProTab          v-else-if="activeTab === 'pro'"     />
      <AdminLoginHistoryTab v-else-if="activeTab === 'history'" />
    </div>

  </div>
</template>

<style scoped>
.admin-page {
  padding: var(--space-xl) 0;
  width: 90%;
  margin: 0 auto;
  font-family: var(--font-ui);
}

/* ── Header Layout matching image ────────────────────────────── */
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin-bottom: var(--space-xl); /* Increased spacing to 32px */
}

.admin-header__left {
  display: flex;
  flex-direction: column;
}

.admin-header__overline {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-secondary); /* Orange color */
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 4px;
}

.admin-header__title {
  font-family: var(--font-ui); /* Changed to UI sans-serif font */
  font-size: 32px;
  font-weight: 800;
  color: var(--color-primary); /* Black/Dark text */
  margin: 0 0 4px 0; /* Reduced margin */
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.admin-header__date {
  font-size: var(--font-size-sm);
  color: var(--color-primary-hover); /* Gray color */
  margin: 0;
  font-weight: 500;
}

/* ── Stats right side ─────────────────────────────────────── */
.admin-header__stats {
  display: flex;
  gap: var(--space-sm);
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-surface-rgb), 0.3); /* very light gray */
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-md);
  padding: 8px 14px; /* Reduced from 12px 20px */
  min-width: 90px;   /* Reduced from 110px */
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.stat-card__val {
  font-family: var(--font-ui);
  font-size: 20px; /* Reduced from 26px */
  font-weight: 700;
  color: var(--color-secondary); /* Orange numbers */
  line-height: 1;
  margin-bottom: 2px; /* Reduced from 4px */
}

.stat-card__lbl {
  font-size: 10px; /* Reduced from 11px */
  color: var(--color-primary-hover);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: center;
  line-height: 1.2;
  font-weight: 600;
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* ── Switcher override: max-width so it doesn't stretch ── */
.admin-switcher-wrap {
  max-width: 520px;
  margin-bottom: var(--space-md); /* Reduced from space-lg */
}

/* ── Content card ─────────────────────────── */
.admin-content {
  background: white;
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  box-shadow: var(--shadow-sm);
  min-height: 340px;
}
</style>
