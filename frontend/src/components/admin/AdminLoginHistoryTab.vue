<script setup>
import { ref, computed, onMounted } from 'vue';
import { Clock, LogIn, LogOut } from 'lucide-vue-next';
import { useAdminStore } from '@/stores/admin';
import { storeToRefs } from 'pinia';

const searchEmail   = ref('');
const currentPage   = ref(1);
const itemsPerPage  = 10;

const adminStore = useAdminStore();
const { connexions, loading } = storeToRefs(adminStore);

onMounted(() => {
  adminStore.fetchConnexions();
});

const filteredLogs = computed(() => {
  const q = searchEmail.value.toLowerCase().trim();
  if (!q) return connexions.value;
  return connexions.value.filter(c => (c.utilisateur?.email ?? '').toLowerCase().includes(q));
});

const totalPages   = computed(() => Math.max(1, Math.ceil(filteredLogs.value.length / itemsPerPage)));
const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredLogs.value.slice(start, start + itemsPerPage);
});

function formatTimestamp(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
</script>

<template>
  <div class="tab-section">

    <header class="tab-section__header">
      <Clock :size="18" class="tab-section__icon" />
      <div>
        <h2 class="tab-section__title">Login History</h2>
        <p class="tab-section__desc">
          Audit log of user sessions.
        </p>
      </div>
    </header>

    <!-- Search -->
    <div class="toolbar">
      <div class="search-box">
        <svg class="search-box__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="searchEmail"
          class="search-box__input"
          type="text"
          placeholder="Search by email…"
          @input="currentPage = 1"
        />
      </div>
      <span class="toolbar__count">{{ filteredLogs.length }} event(s)</span>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th class="th-center">Event</th>
            <th>Device / Location</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!paginatedLogs.length">
            <td colspan="4" class="state-msg">No results.</td>
          </tr>
          <tr v-for="c in paginatedLogs" :key="c.connexion_id">
            <!-- User column -->
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

            <!-- Event badge -->
            <td class="td-center">
              <span class="event-badge" :class="c.action === 'LOGIN' ? 'event-badge--login' : 'event-badge--logout'">
                <component :is="c.action === 'LOGIN' ? LogIn : LogOut" :size="11" />
                {{ c.action === 'LOGIN' ? 'LOGIN' : 'LOGOUT' }}
              </span>
            </td>

            <!-- Device / Location -->
            <td>
              <p class="device-info">{{ c.browser }} on {{ c.os }}</p>
              <p class="device-ip">IP: {{ c.ip ?? '—' }}</p>
            </td>

            <!-- Timestamp -->
            <td class="td-timestamp">{{ formatTimestamp(c.date_action) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button class="btn-page" :disabled="currentPage === 1" @click="currentPage--">← Previous</button>
      <span class="pagination__info">Page {{ currentPage }} of {{ totalPages }}</span>
      <button class="btn-page" :disabled="currentPage >= totalPages" @click="currentPage++">Next →</button>
    </div>

  </div>
</template>

<style scoped>
/* ── Shared header ─── */
.tab-section__header {
  display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-lg);
}
.tab-section__icon { color: var(--color-secondary); flex-shrink: 0; margin-top: 2px; }
.tab-section__title { font-size: var(--font-size-md); font-weight: var(--font-bold); color: var(--color-primary); margin: 0 0 2px; }
.tab-section__desc  { font-size: var(--font-size-xs); color: var(--color-primary-hover); margin: 0; display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap; }

.pending-badge {
  display: inline-block; padding: 1px 8px;
  background: #fef3c7; color: #92400e;
  border-radius: 999px; font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
}

/* ── Toolbar ── */
.toolbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--space-md); margin-bottom: var(--space-md);
}
.search-box {
  display: flex; align-items: center;
  background: var(--color-background); border: 1.5px solid var(--color-surface);
  border-radius: var(--radius-sm); padding: 0 var(--space-sm);
  gap: var(--space-xs); max-width: 280px;
  transition: border-color var(--transition-fast);
}
.search-box:focus-within { border-color: var(--color-secondary); }
.search-box__icon { width: 15px; height: 15px; color: var(--color-primary-hover); flex-shrink: 0; }
.search-box__input {
  border: none; outline: none; background: transparent;
  font-size: var(--font-size-sm); font-family: var(--font-ui);
  color: var(--color-primary); width: 100%; padding: 9px 0;
}
.toolbar__count { font-size: var(--font-size-xs); color: var(--color-primary-hover); white-space: nowrap; }

/* ── Table ── */
.table-wrap { overflow-x: auto; border: 1px solid var(--color-surface); border-radius: var(--radius-md); }
table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
thead tr { background: var(--color-background); }
th {
  padding: 10px var(--space-md); text-align: left;
  font-size: var(--font-size-xxs); font-weight: var(--font-bold);
  text-transform: uppercase; letter-spacing: 0.07em;
  color: var(--color-primary-hover); border-bottom: 1.5px solid var(--color-surface);
  white-space: nowrap;
}
.th-center { text-align: center; }
td {
  padding: 12px var(--space-md); border-bottom: 1px solid var(--color-surface);
  color: var(--color-primary); vertical-align: middle;
}
.td-center { text-align: center; }
.td-timestamp { color: var(--color-primary-hover); font-size: var(--font-size-xs); white-space: nowrap; }
tbody tr:nth-child(even) { background: rgba(var(--color-background-rgb), 0.6); }
tbody tr:hover td { background: rgba(var(--color-secondary-rgb), 0.04); }
tbody tr:last-child td { border-bottom: none; }

.state-msg { text-align: center; padding: var(--space-xl); color: var(--color-primary-hover); }

/* ── User cell ── */
.user-cell { display: flex; align-items: center; gap: var(--space-sm); }
.avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--color-primary); color: var(--color-background);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: var(--font-size-xxs); font-weight: var(--font-bold); flex-shrink: 0;
}
.user-cell__name  { font-size: var(--font-size-sm); font-weight: var(--font-medium); margin: 0 0 1px; }
.user-cell__email { font-size: var(--font-size-xs); color: var(--color-primary-hover); margin: 0; }

/* ── Event badge ── */
.event-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: 999px;
  font-size: var(--font-size-xxs); font-weight: var(--font-bold);
  letter-spacing: 0.05em;
}
.event-badge--login  { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
.event-badge--logout { background: var(--color-surface); color: var(--color-primary-hover); border: 1px solid var(--color-surface); }

/* ── Device info ── */
.device-info { margin: 0 0 2px; font-size: var(--font-size-xs); }
.device-ip   { margin: 0; font-size: var(--font-size-xxs); color: var(--color-primary-hover); }

/* ── Pagination ── */
.pagination {
  display: flex; align-items: center; justify-content: center;
  gap: var(--space-md); padding: var(--space-md) 0 0;
}
.btn-page {
  padding: 6px 14px; border: 1.5px solid var(--color-surface);
  background: white; border-radius: var(--radius-sm);
  font-size: var(--font-size-xs); font-family: var(--font-ui);
  color: var(--color-primary); cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.btn-page:hover:not(:disabled) { border-color: var(--color-secondary); color: var(--color-secondary); }
.btn-page:disabled { opacity: 0.4; cursor: not-allowed; }
.pagination__info { font-size: var(--font-size-xs); color: var(--color-primary-hover); }
</style>
