<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { storeToRefs } from 'pinia';

// ── Existing components (mandatory) ──────────────────────────────
import BaseInput        from '@/components/common/forms/BaseInput.vue';
import FilterDropdown   from '@/components/common/forms/FilterDropdown.vue';
import PaginationComponent from '@/components/dashboard/PaginationComponent.vue';
import BaseSpinner      from '@/components/common/feedback/BaseSpinner.vue';
import BaseError        from '@/components/common/feedback/BaseError.vue';
import BaseNotification from '@/components/common/feedback/BaseNotification.vue';
import { Clock, LogIn, LogOut } from 'lucide-vue-next';

const adminStore = useAdminStore();
const { connexions, loading, errors } = storeToRefs(adminStore);

// ── Filter state ──────────────────────────────────────────────────
const searchEmail  = ref('');

/**
 * FilterDropdown uses defineModel (v-model string).
 * We store the full label string and compare with !== sentinel values.
 */
const filterRole   = ref('');  // '' = all
const filterAction = ref('');  // '' | 'LOGIN' | 'LOGOUT'

// ── Pagination ────────────────────────────────────────────────────
const currentPage  = ref(1);
const itemsPerPage = 10;

// ── Notification ──────────────────────────────────────────────────
const notification = ref({ message: '', type: 'success' });

// ── Dropdown options ──────────────────────────────────────────────
const ALL_ROLES   = 'All Roles';
const ALL_ACTIONS = 'All Actions';

const roleOptions   = [ALL_ROLES, 'etudiant', 'professeur', 'professionnel', 'directeur', 'administrateur'];
const actionOptions = [ALL_ACTIONS, 'LOGIN', 'LOGOUT'];

onMounted(() => adminStore.fetchConnexions());

// Reset page when any filter changes
watch([searchEmail, filterRole, filterAction], () => {
  currentPage.value = 1;
});

// ── Filtering ─────────────────────────────────────────────────────
const filteredLogs = computed(() => {
  let list = connexions.value;

  // Email / name search
  const q = searchEmail.value.toLowerCase().trim();
  if (q) {
    list = list.filter((c) =>
      (c.utilisateur?.email ?? '').toLowerCase().includes(q) ||
      (`${c.utilisateur?.prenom ?? ''} ${c.utilisateur?.nom ?? ''}`).toLowerCase().includes(q)
    );
  }

  // Role filter — only apply when a real role is selected (not the sentinel)
  const role = filterRole.value.trim();
  if (role && role !== ALL_ROLES) {
    list = list.filter((c) => c.utilisateur?.role === role);
  }

  // Action filter — LOGIN or LOGOUT
  const action = filterAction.value.trim().toUpperCase();
  if (action && action !== ALL_ACTIONS.toUpperCase()) {
    list = list.filter((c) => {
      const cAction = (c.action || 'LOGIN').toUpperCase();
      return cAction === action;
    });
  }

  return list;
});

const totalPages    = computed(() => Math.max(1, Math.ceil(filteredLogs.value.length / itemsPerPage)));
const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredLogs.value.slice(start, start + itemsPerPage);
});

// ── Helpers ───────────────────────────────────────────────────────
function formatTimestamp(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function clearFilters() {
  searchEmail.value  = '';
  filterRole.value   = '';
  filterAction.value = '';
}

const hasActiveFilter = computed(
  () => searchEmail.value ||
        (filterRole.value   && filterRole.value   !== ALL_ROLES)   ||
        (filterAction.value && filterAction.value !== ALL_ACTIONS)
);
</script>

<template>
  <div class="history-tab">

    <Teleport to="body">
      <BaseNotification
        :message="notification.message"
        :type="notification.type"
        @close="notification.message = ''"
      />
    </Teleport>

    <!-- ── Header ──────────────────────────────────────────── -->
    <header class="tab-header">
      <Clock :size="20" class="tab-header__icon" />
      <div>
        <h2 class="tab-header__title">Login / Logout History</h2>
        <p class="tab-header__desc">Audit log of all user session events (login &amp; logout).</p>
      </div>
    </header>

    <!-- Store error -->
    <BaseError v-if="errors.sessions" variant="global" style="margin-bottom: 12px;">
      {{ errors.sessions }}
    </BaseError>

    <!-- ── Filter bar ─────────────────────────────────────── -->
    <div class="filters-bar">
      <!-- Email / name search (BaseInput) -->
      <div class="filters-bar__search">
        <BaseInput
          v-model="searchEmail"
          placeholder="Search by email or name…"
          size="sm"
        />
      </div>

      <!-- Role filter (FiltreDashboard) -->
      <div class="filters-bar__dropdown">
        <FilterDropdown
          v-model="filterRole"
          :options="roleOptions"
          :placeholder="ALL_ROLES"
          label=""
          :visible-options="6"
        />
      </div>

      <!-- Action filter: LOGIN / LOGOUT (FiltreDashboard) -->
      <div class="filters-bar__dropdown filters-bar__dropdown--sm">
        <FilterDropdown
          v-model="filterAction"
          :options="actionOptions"
          :placeholder="ALL_ACTIONS"
          label=""
          :visible-options="3"
        />
      </div>

      <!-- Reset -->
      <button v-if="hasActiveFilter" class="btn-reset" @click="clearFilters">
        Clear filters ×
      </button>

      <span class="filters-bar__count">{{ filteredLogs.length }} event(s)</span>
    </div>

    <!-- ── Loading ────────────────────────────────────────── -->
    <div v-if="loading.sessions" class="state-center">
      <BaseSpinner size="lg" />
      <p>Loading history…</p>
    </div>

    <!-- ── Table ─────────────────────────────────────────── -->
    <template v-else>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th class="th-center">Login / Logout</th>
              <th>Device / IP</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!paginatedLogs.length">
              <td colspan="5" class="state-center">No results with current filters.</td>
            </tr>
            <tr v-for="c in paginatedLogs" :key="c.connexion_id ?? c.session_id">

              <!-- User cell -->
              <td>
                <div class="user-cell">
                  <span class="avatar">
                    {{ (c.utilisateur?.prenom?.[0] ?? '') + (c.utilisateur?.nom?.[0] ?? '') }}
                  </span>
                  <div>
                    <p class="user-cell__name">{{ c.utilisateur?.prenom }} {{ c.utilisateur?.nom }}</p>
                    <p class="user-cell__email">{{ c.utilisateur?.email ?? '—' }}</p>
                  </div>
                </div>
              </td>

              <!-- Role badge -->
              <td>
                <span
                  v-if="c.utilisateur?.role"
                  class="role-badge"
                  :class="`role-badge--${c.utilisateur.role}`"
                >
                  {{ c.utilisateur.role }}
                </span>
                <span v-else class="td-muted">—</span>
              </td>

              <!-- Action badge (LOGIN / LOGOUT) -->
              <td class="td-center">
                <span
                  class="event-badge"
                  :class="c.action?.toUpperCase() === 'LOGOUT' ? 'event-badge--logout' : 'event-badge--login'"
                >
                  <component :is="c.action?.toUpperCase() === 'LOGOUT' ? LogOut : LogIn" :size="11" />
                  {{ c.action?.toUpperCase() === 'LOGOUT' ? 'Logout' : 'Login' }}
                </span>
              </td>

              <!-- Device / IP -->
              <td>
                <p class="device-info">{{ c.browser ?? '—' }}{{ c.os ? ` – ${c.os}` : '' }}</p>
                <p class="device-ip">IP: {{ c.ip ?? '—' }}</p>
              </td>

              <!-- Timestamp -->
              <td class="td-muted td-nowrap">{{ formatTimestamp(c.date_connexion ?? c.date_action ?? c.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination (existing PaginationComponent) -->
      <div class="pagination-wrap">
        <PaginationComponent
          :current-page="currentPage"
          :total-pages="totalPages"
          @update:current-page="currentPage = $event"
        />
      </div>
    </template>

  </div>
</template>

<style scoped>
.history-tab { font-family: var(--font-ui); }

/* ── Header ── */
.tab-header { display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-lg); }
.tab-header__icon  { color: var(--color-secondary); margin-top: 2px; flex-shrink: 0; }
.tab-header__title { font-size: var(--font-size-md); font-weight: var(--font-bold); color: var(--color-primary); margin: 0 0 2px; }
.tab-header__desc  { font-size: var(--font-size-xs); color: var(--color-primary-hover); margin: 0; }

/* ── Filters bar ── */
.filters-bar {
  display: flex; align-items: center; gap: var(--space-sm);
  flex-wrap: wrap; margin-bottom: var(--space-md);
}
.filters-bar__search         { width: 240px; }
.filters-bar__dropdown       { width: 180px; }
.filters-bar__dropdown--sm   { width: 150px; }
.filters-bar__count          { margin-left: auto; font-size: var(--font-size-xs); color: var(--color-primary-hover); white-space: nowrap; }

.btn-reset {
  padding: 6px 12px;
  background: rgba(var(--color-error-rgb), 0.08);
  color: var(--color-error);
  border: 1px solid rgba(var(--color-error-rgb), 0.18);
  border-radius: 999px;
  font-size: var(--font-size-xs); font-family: var(--font-ui);
  cursor: pointer; transition: background var(--transition-fast); white-space: nowrap;
}
.btn-reset:hover { background: rgba(var(--color-error-rgb), 0.15); }

/* ── States ── */
.state-center {
  display: flex; flex-direction: column; align-items: center;
  gap: var(--space-sm); padding: var(--space-xl) 0;
  color: var(--color-primary-hover); font-size: var(--font-size-sm); text-align: center;
}

/* ── Table ── */
.table-wrap { overflow-x: auto; border: 1px solid var(--color-surface); border-radius: var(--radius-md); }
table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
thead tr { background: var(--color-background); }
th {
  padding: 10px var(--space-md); text-align: left; font-size: 10px;
  font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--color-primary-hover); border-bottom: 1.5px solid var(--color-surface);
  white-space: nowrap;
}
.th-center { text-align: center; }
td {
  padding: 12px var(--space-md); border-bottom: 1px solid var(--color-surface);
  color: var(--color-primary); vertical-align: middle;
}
.td-center { text-align: center; }
.td-muted  { color: var(--color-primary-hover); font-size: var(--font-size-xs); }
.td-nowrap { white-space: nowrap; }
tbody tr:nth-child(even) { background: rgba(var(--color-background-rgb), 0.5); }
tbody tr:hover td { background: rgba(var(--color-secondary-rgb), 0.04); }
tbody tr:last-child td { border-bottom: none; }

/* ── User cell ── */
.user-cell { display: flex; align-items: center; gap: var(--space-sm); }
.avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--color-primary); color: var(--color-background);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; flex-shrink: 0; text-transform: uppercase;
}
.user-cell__name  { font-size: var(--font-size-sm); font-weight: var(--font-medium); margin: 0 0 1px; }
.user-cell__email { font-size: 11px; color: var(--color-primary-hover); margin: 0; }

/* ── Role badge ── */
.role-badge {
  display: inline-block; padding: 2px 8px; border-radius: 999px;
  font-size: 10px; font-weight: 600; text-transform: capitalize;
  background: var(--color-surface); color: var(--color-primary);
}
.role-badge--administrateur { background: #ede9fe; color: #5b21b6; }
.role-badge--etudiant       { background: #e0f2fe; color: #075985; }
.role-badge--professeur     { background: #fef3c7; color: #92400e; }
.role-badge--professionnel  { background: #d1fae5; color: #065f46; }
.role-badge--directeur      { background: #fce7f3; color: #9d174d; }

/* ── Event badge (Login / Logout) ── */
.event-badge {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 4px; padding: 3px 10px; border-radius: 999px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
  white-space: nowrap;
}
.event-badge--login  { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
.event-badge--logout { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

/* ── Device info ── */
.device-info { margin: 0 0 2px; font-size: var(--font-size-xs); }
.device-ip   { margin: 0; font-size: 11px; color: var(--color-primary-hover); }

/* ── Pagination ── */
.pagination-wrap { display: flex; justify-content: center; padding-top: var(--space-md); }
</style>
