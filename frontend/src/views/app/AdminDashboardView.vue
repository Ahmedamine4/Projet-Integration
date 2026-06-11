<script setup>
import { ref, computed, onMounted } from 'vue';
import BaseSwitcher from '@/components/common/forms/BaseSwitcher.vue';
import BaseSpinner from '@/components/common/feedback/BaseSpinner.vue';
import AdminInstitutionsTab from '@/components/admin/AdminInstitutionsTab.vue';
import AdminUsersTab from '@/components/admin/AdminUsersTab.vue';
import AdminProTab from '@/components/admin/AdminProTab.vue';
import AdminLoginHistoryTab from '@/components/admin/AdminLoginHistoryTab.vue';
import AdminStatsBar from '@/components/admin/AdminStatsBar.vue';
import { useAdminStore } from '@/stores/admin';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { Users, Building2, BadgeCheck, ShieldCheck } from 'lucide-vue-next';

const adminStore = useAdminStore();
const authStore = useAuthStore();

const { utilisateurs, professionnels, adminInstitutions, loading } = storeToRefs(adminStore);
const isStatsLoading = computed(() => loading.value.users || loading.value.pro || loading.value.institutions);
const { user } = storeToRefs(authStore);

const activeTab = ref('institutions');

const tabs = [
  { value: 'institutions', label: 'Institutions' },
  { value: 'users', label: 'Users' },
  { value: 'pro', label: 'PRO' },
  { value: 'history', label: 'Login History' },
];

const today = computed(() => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
});

const adminName = computed(() => {
  if (user.value?.firstName) return user.value.firstName;
  return 'Admin';
});

const stats = computed(() => [
  {
    icon: Users,
    value: utilisateurs.value.length,
    label: 'Users',
    sub: 'registered',
    color: 'blue',
  },
  {
    icon: BadgeCheck,
    value: professionnels.value.length,
    label: 'Pending',
    sub: 'PRO requests',
    color: 'orange',
  },
  {
    icon: Building2,
    value: adminInstitutions.value.length,
    label: 'Institutions',
    sub: 'created',
    color: 'purple',
  },
]);

onMounted(async () => {
  adminStore.fetchUtilisateurs();
  adminStore.fetchProfessionnelsEnAttente();
  adminStore.fetchAdminInstitutions();
});
</script>

<template>
  <div class="admin-page">

    <!-- ── Header ────────────────────────────────── -->
    <header class="admin-header">
      <div class="admin-header__left">
        <div class="admin-header__badge">
          <ShieldCheck :size="14" />
          ADMIN WORKSPACE
        </div>
        <h1 class="admin-header__title">Hello, {{ adminName }}</h1>
        <p class="admin-header__date">{{ today }}</p>
      </div>

      <div class="admin-header__stats">
        <AdminStatsBar :stats="stats" :loading="isStatsLoading" />
      </div>
    </header>

    <!-- ── Tab Switcher ──────────────────────────── -->
    <div class="admin-switcher-wrap">
      <BaseSwitcher v-model="activeTab" :options="tabs" />
    </div>

    <!-- ── Tab Content ───────────────────────────── -->
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
  padding: var(--space-xl) var(--space-xl) var(--space-xl) var(--space-lg);
  max-width: 1280px;
  margin: 0 auto;
  font-family: var(--font-ui);
}

/* ── Header ──────────────────────────────────────────── */
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.admin-header__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  color: var(--color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 6px;
}

.admin-header__title {
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 800;
  color: var(--color-primary);
  margin: 0 0 4px;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.admin-header__date {
  font-size: var(--font-size-sm);
  color: var(--color-primary-hover);
  margin: 0;
  text-transform: capitalize;
}

/* ── Stats ──────────────────────────────────────────── */
.admin-header__stats {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
}

/* ── Switcher ────────────────────────────────────────── */
.admin-switcher-wrap {
  width: 100%;
  margin-bottom: var(--space-lg);
}

/* ── Content card ────────────────────────────────────── */
.admin-content {
  background: white;
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  box-shadow: var(--shadow-sm);
  min-height: 360px;
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .admin-page {
    padding: var(--space-md);
  }
}
</style>
