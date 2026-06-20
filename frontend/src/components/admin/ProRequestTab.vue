<template>
  <div>
    <!-- Pending Requests Section -->
    <div class="section-block">
      <h2 class="section-title">Pending PRO Requests</h2>
      <p class="section-desc">
        Users who requested the Professional status.
      </p>

      <div v-if="adminStore.loading" class="state-msg">Loading...</div>

      <div v-else-if="!adminStore.professionnels.length" class="state-msg">
        No pending requests.
      </div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Position</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="pro in adminStore.professionnels"
              :key="pro.professionnel_utilisateur_id"
            >
              <td>{{ pro.utilisateur.prenom }} {{ pro.utilisateur.nom }}</td>
              <td>{{ pro.utilisateur.email }}</td>
              <td>{{ pro.entreprise || '—' }}</td>
              <td>{{ pro.post || '—' }}</td>
              <td class="actions">
                <button
                  class="btn-success"
                  :disabled="loadingId === pro.professionnel_utilisateur_id"
                  @click="valider(pro.professionnel_utilisateur_id)"
                >Accept</button>
                <button
                  class="btn-danger"
                  :disabled="loadingId === pro.professionnel_utilisateur_id"
                  @click="refuser(pro.professionnel_utilisateur_id)"
                >Reject</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <hr class="divider" />

    <!-- Promote to PRO Section -->
    <div class="section-block">
      <h2 class="section-title">Promote User to PRO</h2>
      <p class="section-desc">
        Manually search for a regular user to assign them the PRO status.
      </p>

      <div class="search-container">
        <input
          v-model="search"
          class="search-input"
          placeholder="Search by name or email..."
        />
      </div>

      <div class="table-wrap" v-if="search.trim()">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.utilisateur_id">
              <td>{{ user.prenom }} {{ user.nom }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td class="actions">
                <button
                  class="btn-primary"
                  :disabled="loadingId === user.utilisateur_id"
                  @click="promote(user.utilisateur_id)"
                >Promote to PRO</button>
              </td>
            </tr>
            <tr v-if="!filteredUsers.length">
              <td colspan="4" class="state-msg" style="padding: 1rem;">No regular users match your search.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="toast" class="toast" :class="toast.type">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()
const loadingId  = ref(null)
const toast      = ref(null)
const search     = ref('')

onMounted(() => {
  adminStore.fetchUtilisateurs()
})

const filteredUsers = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return []
  return adminStore.utilisateurs.filter(u =>
    u.role !== 'professionnel' &&
    `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(q)
  ).slice(0, 5) // Display up to 5 results for clarity
})

function showToast(message, type = 'success') {
  toast.value = { message, type }
  setTimeout(() => { toast.value = null }, 3000)
}

async function valider(id) {
  loadingId.value = id
  try {
    const res = await adminStore.validerProfessionnel(id)
    showToast(res.message || 'Professional approved')
  } catch (e) {
    showToast(e.response?.data?.error || 'Error', 'error')
  } finally {
    loadingId.value = null
  }
}

async function refuser(id) {
  loadingId.value = id
  try {
    const res = await adminStore.refuserProfessionnel(id)
    showToast(res.message || 'Request rejected', 'warn')
  } catch (e) {
    showToast(e.response?.data?.error || 'Error', 'error')
  } finally {
    loadingId.value = null
  }
}

async function promote(id) {
  loadingId.value = id
  try {
    const res = await adminStore.promoteToPro(id)
    showToast('User successfully promoted to PRO')
  } catch (e) {
    showToast(e.response?.data?.error || 'Error', 'error')
  } finally {
    loadingId.value = null
  }
}
</script>

<style scoped>
.section-block { margin-bottom: 2rem; }
.section-title { font-size: 1.1rem; font-weight: 600; margin: 0 0 4px; color: #111827; }
.section-desc { color: #6b7280; font-size: 0.875rem; margin-bottom: 1rem; }
.divider { border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }

.state-msg { text-align: center; padding: 2rem; color: #9ca3af; }

.table-wrap { overflow-x: auto; margin-top: 1rem; }
table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
thead tr { background: #f9fafb; }
th {
  padding: 10px 12px; text-align: left; font-weight: 500;
  color: #374151; border-bottom: 1px solid #e5e7eb;
}
td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #111827; }
tr:hover td { background: #fafafa; }

.actions { display: flex; gap: 8px; }
.btn-success, .btn-danger, .btn-primary {
  padding: 6px 12px; border-radius: 6px; border: none;
  font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: opacity 0.15s;
}
.btn-success { background: #d1fae5; color: #065f46; }
.btn-danger  { background: #fee2e2; color: #991b1b; }
.btn-primary { background: #4f46e5; color: white; }
.btn-success:hover { background: #a7f3d0; }
.btn-danger:hover  { background: #fecaca; }
.btn-primary:hover { background: #4338ca; }
button:disabled   { opacity: 0.5; cursor: not-allowed; }

.search-container {
  margin-bottom: 1rem;
}
.search-input {
  padding: 8px 14px; border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 0.875rem; width: 100%; max-width: 400px;
  outline: none; transition: border 0.15s;
}
.search-input:focus { border-color: #6366f1; }

.toast {
  position: fixed; bottom: 1.5rem; right: 1.5rem;
  padding: 10px 18px; border-radius: 8px;
  font-size: 0.875rem; font-weight: 500;
  background: #d1fae5; color: #065f46;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 1000;
}
.toast.warn  { background: #fef3c7; color: #92400e; }
.toast.error { background: #fee2e2; color: #991b1b; }
</style>