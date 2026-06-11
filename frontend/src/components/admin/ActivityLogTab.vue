<template>
  <div>
    <div class="toolbar">
      <div class="search-container">
        <input
          type="text"
          v-model="searchEmail"
          class="search-input"
          placeholder="Search by user email..."
        />
      </div>
      <button class="btn-refresh" @click="adminStore.fetchConnexions()">
        Refresh
      </button>
    </div>

    <div v-if="adminStore.loading" class="state-msg">Loading...</div>
    <div v-else-if="!adminStore.connexions.length" class="state-msg">No logs found.</div>

    <div v-else class="table-wrap">
      <table class="striped-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Action / Event</th>
            <th>Location & Device</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in paginatedLogs" :key="c.connexion_id">
            <td>
              <div class="user-info">
                <strong>{{ c.utilisateur?.prenom }} {{ c.utilisateur?.nom }}</strong>
                <span class="user-email">{{ c.utilisateur?.email || '—' }}</span>
              </div>
            </td>
            <td>
              <span class="event-badge" :class="c.statut ? 'login' : 'logout'">
                {{ c.statut ? '[ LOGIN ]' : '[ LOGOUT ]' }}
              </span>
            </td>
            <td>
              <div class="device-info">
                {{ c.device_info || 'Unknown device' }} - IP: {{ c.ip_address || '—' }}
              </div>
            </td>
            <td>{{ formatDateTime(c.date_de_connexion) }}</td>
          </tr>
          <tr v-if="paginatedLogs.length === 0">
            <td colspan="4" class="state-msg">No results match your search.</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Controls -->
      <div class="pagination">
        <button
          class="btn-page"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          Previous
        </button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages || 1 }}</span>
        <button
          class="btn-page"
          :disabled="currentPage >= totalPages"
          @click="currentPage++"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()
const searchEmail = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

onMounted(() => {
  adminStore.fetchConnexions()
})

const filteredLogs = computed(() => {
  const q = searchEmail.value.toLowerCase().trim()
  if (!q) return adminStore.connexions
  return adminStore.connexions.filter(c =>
    (c.utilisateur?.email || '').toLowerCase().includes(q)
  )
})

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / itemsPerPage))

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredLogs.value.slice(start, end)
})

function formatDateTime(d) {
  if (!d) return '—'
  const dateObj = new Date(d)
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  return dateObj.toLocaleDateString('en-US', options).replace(',', ' -')
}
</script>

<style scoped>
.toolbar {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 1rem;
}
.search-container { flex: 1; margin-right: 1rem; }
.search-input {
  padding: 8px 14px; border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 0.875rem; width: 100%; max-width: 300px;
  outline: none; transition: border 0.15s;
}
.search-input:focus { border-color: #6366f1; }

.btn-refresh {
  padding: 8px 16px; background: #f3f4f6; color: #374151;
  border: 1px solid #e5e7eb; border-radius: 8px;
  font-size: 0.875rem; font-weight: 500; cursor: pointer;
}
.btn-refresh:hover { background: #e5e7eb; }

.state-msg { text-align: center; padding: 2rem; color: #9ca3af; }

.table-wrap { overflow-x: auto; background: white; border-radius: 8px; border: 1px solid #e5e7eb; }
.striped-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.striped-table thead tr { background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
.striped-table th {
  padding: 12px 16px; text-align: left; font-weight: 600;
  color: #4b5563; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em;
}
.striped-table td { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #111827; }

/* Striped rows */
.striped-table tbody tr:nth-child(even) { background-color: #f9fafb; }
.striped-table tbody tr:hover { background-color: #f3f4f6; }

.user-info { display: flex; flex-direction: column; gap: 2px; }
.user-email { color: #6b7280; font-size: 0.8rem; }
.device-info { color: #4b5563; }

.event-badge {
  font-size: 0.75rem; font-weight: 600;
  padding: 4px 10px; border-radius: 6px; display: inline-block;
}
.event-badge.login  { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
.event-badge.logout { background: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb; }

/* Pagination Controls */
.pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 1rem; padding: 1rem; border-top: 1px solid #e5e7eb;
}
.btn-page {
  padding: 6px 12px; background: white; border: 1px solid #d1d5db;
  border-radius: 6px; font-size: 0.875rem; color: #374151;
  cursor: pointer; transition: background 0.15s;
}
.btn-page:hover:not(:disabled) { background: #f9fafb; }
.btn-page:disabled { opacity: 0.5; cursor: not-allowed; }
.page-info { font-size: 0.875rem; color: #6b7280; font-weight: 500; }
</style>