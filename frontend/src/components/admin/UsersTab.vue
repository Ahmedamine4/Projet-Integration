<template>
  <div>
    <div class="toolbar">
      <input
        v-model="search"
        class="search"
        placeholder="Search by name or email..."
      />
      <span class="total">{{ filteredUsers.length }} user(s)</span>
    </div>

    <div v-if="adminStore.loading" class="state-msg">Loading...</div>

    <div v-else-if="!adminStore.utilisateurs.length" class="state-msg">
      No users found.
    </div>

    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Registered On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.utilisateur_id">
            <td>{{ u.prenom }} {{ u.nom }}</td>
            <td class="email-cell">{{ u.email }}</td>
            <td>
              <span class="role-badge" :class="u.role">{{ u.role }}</span>
            </td>
            <td>
              <span class="status-badge" :class="u.bloque ? 'blocked' : 'active'">
                {{ u.bloque ? 'Blocked' : 'Active' }}
              </span>
            </td>
            <td>{{ formatDate(u.date_de_creation) }}</td>
            <td class="actions">
              <button
                v-if="!u.bloque"
                class="btn-warn"
                @click="toggleBloquer(u)"
              >Block</button>
              <button
                v-else
                class="btn-success"
                @click="toggleBloquer(u)"
              >Unblock</button>
              <button
                class="btn-danger"
                @click="confirmerSuppression(u)"
              >Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="userASupprimer" class="modal-overlay" @click.self="userASupprimer = null">
      <div class="modal">
        <h3 class="modal-title">Confirm Deletion</h3>
        <p class="modal-body">
          Delete the account of
          <strong>{{ userASupprimer.prenom }} {{ userASupprimer.nom }}</strong>?
        </p>
        <p class="modal-warn">This action cannot be undone.</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="userASupprimer = null">Cancel</button>
          <button class="btn-danger" @click="supprimer">Confirm Deletion</button>
        </div>
      </div>
    </div>

    <div v-if="toast" class="toast" :class="toast.type">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore     = useAdminStore()
const search         = ref('')
const userASupprimer = ref(null)
const toast          = ref(null)

onMounted(() => adminStore.fetchUtilisateurs())

const filteredUsers = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return adminStore.utilisateurs
  return adminStore.utilisateurs.filter(u =>
    `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(q)
  )
})

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US')
}

function showToast(message, type = 'success') {
  toast.value = { message, type }
  setTimeout(() => { toast.value = null }, 3000)
}

async function toggleBloquer(u) {
  try {
    if (u.bloque) {
      await adminStore.debloquerUtilisateur(u.utilisateur_id)
      showToast(`${u.prenom} ${u.nom} unblocked`)
    } else {
      await adminStore.bloquerUtilisateur(u.utilisateur_id)
      showToast(`${u.prenom} ${u.nom} blocked`, 'warn')
    }
  } catch (e) {
    showToast(e.response?.data?.error || 'Error', 'error')
  }
}

function confirmerSuppression(u) {
  userASupprimer.value = u
}

async function supprimer() {
  const u = userASupprimer.value
  try {
    await adminStore.supprimerUtilisateur(u.utilisateur_id)
    showToast(`Account of ${u.prenom} ${u.nom} deleted`)
  } catch (e) {
    showToast(e.response?.data?.error || 'Error', 'error')
  } finally {
    userASupprimer.value = null
  }
}
</script>

<style scoped>
.toolbar {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 1rem; gap: 12px;
}
.search {
  padding: 8px 14px; border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 0.875rem; width: 300px; outline: none;
}
.search:focus { border-color: #6366f1; }
.total { font-size: 0.8rem; color: #9ca3af; white-space: nowrap; }

.state-msg  { text-align: center; padding: 2rem; color: #9ca3af; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
th {
  padding: 10px 12px; text-align: left; font-weight: 500;
  color: #374151; background: #f9fafb; border-bottom: 1px solid #e5e7eb;
}
td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
.email-cell { color: #6b7280; font-size: 0.8rem; }
tr:hover td { background: #fafafa; }

.role-badge, .status-badge {
  font-size: 0.75rem; font-weight: 500;
  padding: 2px 8px; border-radius: 99px; white-space: nowrap;
}
.role-badge.administrateur { background: #ede9fe; color: #5b21b6; }
.role-badge.etudiant        { background: #e0f2fe; color: #075985; }
.role-badge.professeur      { background: #fef3c7; color: #92400e; }
.role-badge.professionnel   { background: #d1fae5; color: #065f46; }
.role-badge.directeur       { background: #fce7f3; color: #9d174d; }
.status-badge.active  { background: #d1fae5; color: #065f46; }
.status-badge.blocked { background: #fee2e2; color: #991b1b; }

.actions { display: flex; gap: 6px; }
.btn-warn, .btn-success, .btn-danger, .btn-cancel {
  padding: 4px 10px; border-radius: 6px; border: none;
  font-size: 0.78rem; font-weight: 500; cursor: pointer; transition: opacity 0.15s;
}
.btn-warn    { background: #fef3c7; color: #92400e; }
.btn-success { background: #d1fae5; color: #065f46; }
.btn-danger  { background: #fee2e2; color: #991b1b; }
.btn-cancel  { background: #f3f4f6; color: #374151; }
.btn-warn:hover    { background: #fde68a; }
.btn-success:hover { background: #a7f3d0; }
.btn-danger:hover  { background: #fecaca; }
.btn-cancel:hover  { background: #e5e7eb; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 200;
}
.modal {
  background: white; border-radius: 12px; padding: 1.5rem;
  min-width: 340px; max-width: 420px; width: 90%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}
.modal-title { font-size: 1rem; font-weight: 600; margin: 0 0 12px; color: #111827; }
.modal-body  { font-size: 0.875rem; margin: 0 0 6px; color: #374151; }
.modal-warn  { font-size: 0.8rem; color: #dc2626; margin: 0; }
.modal-actions {
  display: flex; gap: 8px; justify-content: flex-end; margin-top: 1.25rem;
}

.toast {
  position: fixed; bottom: 1.5rem; right: 1.5rem;
  padding: 10px 18px; border-radius: 8px;
  font-size: 0.875rem; font-weight: 500; z-index: 1000;
  background: #d1fae5; color: #065f46;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}
.toast.warn  { background: #fef3c7; color: #92400e; }
.toast.error { background: #fee2e2; color: #991b1b; }
</style>