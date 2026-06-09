<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { storeToRefs } from 'pinia';
import ToggleSwitch from '@/components/common/forms/ToggleSwitch.vue';
import { Users, Trash2 } from 'lucide-vue-next';

const adminStore = useAdminStore();
const { utilisateurs, loading } = storeToRefs(adminStore);

const search          = ref('');
const toast           = ref(null);
const confirmDelete   = ref(null); // user object to confirm deletion

onMounted(() => adminStore.fetchUtilisateurs());

const filteredUsers = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return utilisateurs.value;
  return utilisateurs.value.filter(u =>
    `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(q)
  );
});

function showToast(message, type = 'success') {
  toast.value = { message, type };
  setTimeout(() => { toast.value = null; }, 3200);
}

/* Bloc/unbloc — the ToggleSwitch uses v-model on a local computed per row,
   but since objects are reactive refs, mutating them directly is fine.    */
async function handleBlockToggle(u) {
  try {
    if (u.bloque) {
      await adminStore.debloquerUtilisateur(u.utilisateur_id);
      showToast(`${u.prenom} ${u.nom} unblocked.`);
    } else {
      await adminStore.bloquerUtilisateur(u.utilisateur_id);
      showToast(`${u.prenom} ${u.nom} blocked.`, 'warn');
    }
  } catch (e) {
    showToast(e.message || 'Error updating user.', 'error');
  }
}

async function deleteUser() {
  const u = confirmDelete.value;
  if (!u) return;
  try {
    await adminStore.supprimerUtilisateur(u.utilisateur_id);
    showToast(`${u.prenom} ${u.nom}'s account deleted.`);
  } catch (e) {
    showToast(e.message || 'Error deleting user.', 'error');
  } finally {
    confirmDelete.value = null;
  }
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
</script>

<template>
  <div class="tab-section">
    <!-- Header -->
    <header class="tab-section__header">
      <Users :size="18" class="tab-section__icon" />
      <div>
        <h2 class="tab-section__title">User Management</h2>
        <p class="tab-section__desc">Block or remove accounts. Use the toggle to block/unblock login access.</p>
      </div>
    </header>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-box">
        <svg class="search-box__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="search"
          class="search-box__input"
          type="text"
          placeholder="Search by email…"
        />
      </div>
      <span class="toolbar__count">{{ filteredUsers.length }} user(s)</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-msg">Loading users…</div>

    <!-- Empty -->
    <div v-else-if="!utilisateurs.length" class="state-msg">No users found.</div>

    <!-- Table -->
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Registered</th>
            <th class="th-center">Blocked</th>
            <th class="th-center">Delete</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.utilisateur_id" :class="{ 'row--blocked': u.bloque }">
            <td class="td-name">
              <span class="avatar">{{ (u.prenom?.[0] ?? '') + (u.nom?.[0] ?? '') }}</span>
              <span>{{ u.prenom }} {{ u.nom }}</span>
            </td>
            <td class="td-email">{{ u.email }}</td>
            <td>
              <span class="role-badge" :class="`role-badge--${u.role}`">{{ u.role }}</span>
            </td>
            <td>{{ formatDate(u.date_de_creation) }}</td>
            <td class="td-center">
              <!-- Reuse ToggleSwitch for the block state; label is hidden for table use -->
              <label class="inline-toggle" :title="u.bloque ? 'Click to unblock' : 'Click to block'">
                <input
                  type="checkbox"
                  :checked="u.bloque"
                  @change="handleBlockToggle(u)"
                />
                <span class="inline-toggle__track" />
              </label>
            </td>
            <td class="td-center">
              <button class="btn-icon btn-icon--danger" title="Delete user" @click="confirmDelete = u">
                <Trash2 :size="15" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <div v-if="confirmDelete" class="modal-overlay" @click.self="confirmDelete = null">
        <div class="modal">
          <h3 class="modal__title">Confirm Deletion</h3>
          <p class="modal__body">
            Permanently delete the account of
            <strong>{{ confirmDelete.prenom }} {{ confirmDelete.nom }}</strong>?<br/>
            <span class="modal__warn">This action cannot be undone.</span>
          </p>
          <div class="modal__actions">
            <button class="btn-ghost" @click="confirmDelete = null">Cancel</button>
            <button class="btn-danger" @click="deleteUser">Delete Account</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <Transition name="toast-fade">
        <div v-if="toast" class="toast" :class="`toast--${toast.type}`">{{ toast.message }}</div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── Shared header ─── */
.tab-section__header {
  display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-lg);
}
.tab-section__icon { color: var(--color-secondary); flex-shrink: 0; margin-top: 2px; }
.tab-section__title { font-size: var(--font-size-md); font-weight: var(--font-bold); color: var(--color-primary); margin: 0 0 2px; }
.tab-section__desc  { font-size: var(--font-size-xs); color: var(--color-primary-hover); margin: 0; }

/* ── Toolbar ── */
.toolbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--space-md); margin-bottom: var(--space-md);
}

.search-box {
  display: flex; align-items: center;
  background: var(--color-background);
  border: 1.5px solid var(--color-surface);
  border-radius: var(--radius-sm);
  padding: 0 var(--space-sm);
  gap: var(--space-xs);
  width: 260px;
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

/* ── State ── */
.state-msg { text-align: center; padding: var(--space-xl); color: var(--color-primary-hover); font-size: var(--font-size-sm); }

/* ── Table ── */
.table-wrap { overflow-x: auto; border: 1px solid var(--color-surface); border-radius: var(--radius-md); }

table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }

thead tr { background: var(--color-background); }

th {
  padding: 10px var(--space-md); text-align: left; font-size: var(--font-size-xxs);
  font-weight: var(--font-bold); text-transform: uppercase; letter-spacing: 0.07em;
  color: var(--color-primary-hover); border-bottom: 1.5px solid var(--color-surface);
  white-space: nowrap;
}
.th-center { text-align: center; }

td {
  padding: 12px var(--space-md); border-bottom: 1px solid var(--color-surface);
  color: var(--color-primary); vertical-align: middle;
}
.td-center { text-align: center; }
.td-email  { color: var(--color-primary-hover); font-size: var(--font-size-xs); }

tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: rgba(var(--color-secondary-rgb), 0.04); }

.row--blocked td { opacity: 0.55; }
.row--blocked .td-name { text-decoration: line-through; }

/* ── Avatar ── */
.td-name { display: flex; align-items: center; gap: var(--space-sm); }
.avatar {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--color-primary); color: var(--color-background);
  font-size: var(--font-size-xxs); font-weight: var(--font-bold); flex-shrink: 0;
}

/* ── Role badge ── */
.role-badge {
  display: inline-block; padding: 2px 8px;
  border-radius: 999px; font-size: var(--font-size-xxs);
  font-weight: var(--font-medium); text-transform: capitalize;
  background: var(--color-surface); color: var(--color-primary);
}
.role-badge--administrateur { background: #ede9fe; color: #5b21b6; }
.role-badge--etudiant       { background: #e0f2fe; color: #075985; }
.role-badge--professeur     { background: #fef3c7; color: #92400e; }
.role-badge--professionnel  { background: #d1fae5; color: #065f46; }
.role-badge--directeur      { background: #fce7f3; color: #9d174d; }

/* ── Inline toggle (reuses ToggleSwitch design, slimmer for table) ── */
.inline-toggle { cursor: pointer; }
.inline-toggle input { display: none; }
.inline-toggle__track {
  display: block; width: 40px; height: 22px; border-radius: 999px;
  background: var(--color-surface); position: relative;
  transition: background var(--transition-fast);
}
.inline-toggle__track::before {
  content: ''; position: absolute;
  width: 16px; height: 16px; top: 3px; left: 3px;
  border-radius: 50%; background: white;
  transition: transform var(--transition-fast);
}
.inline-toggle input:checked + .inline-toggle__track { background: var(--color-secondary); }
.inline-toggle input:checked + .inline-toggle__track::before { transform: translateX(18px); }

/* ── Icon button ── */
.btn-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: var(--radius-sm);
  border: none; background: transparent; cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
  color: var(--color-primary-hover);
}
.btn-icon--danger:hover { background: #fee2e2; color: #991b1b; }

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 900;
}
.modal {
  background: white; border-radius: var(--radius-md); padding: var(--space-lg);
  width: 90%; max-width: 400px; box-shadow: var(--shadow-md);
}
.modal__title { font-size: var(--font-size-md); font-weight: var(--font-bold); margin: 0 0 var(--space-sm); }
.modal__body  { font-size: var(--font-size-sm); color: var(--color-primary-hover); margin: 0 0 var(--space-lg); line-height: 1.6; }
.modal__warn  { color: var(--color-error); font-size: var(--font-size-xs); }
.modal__actions { display: flex; gap: var(--space-sm); justify-content: flex-end; }

.btn-ghost {
  padding: 8px var(--space-md); border: 1.5px solid var(--color-surface);
  background: transparent; border-radius: var(--radius-sm);
  font-size: var(--font-size-sm); font-family: var(--font-ui); cursor: pointer;
  color: var(--color-primary-hover); transition: background var(--transition-fast);
}
.btn-ghost:hover { background: var(--color-surface); }

.btn-danger {
  padding: 8px var(--space-md); background: var(--color-error); color: white;
  border: none; border-radius: var(--radius-sm); font-size: var(--font-size-sm);
  font-family: var(--font-ui); cursor: pointer;
  transition: opacity var(--transition-fast);
}
.btn-danger:hover { opacity: 0.85; }

/* ── Toast ── */
.toast {
  position: fixed; bottom: var(--space-lg); right: var(--space-lg);
  padding: 10px var(--space-md); border-radius: var(--radius-sm);
  font-size: var(--font-size-sm); font-weight: var(--font-medium);
  font-family: var(--font-ui); box-shadow: var(--shadow-md); z-index: 1000;
  background: #d1fae5; color: #065f46;
}
.toast--warn  { background: #fef3c7; color: #92400e; }
.toast--error { background: #fee2e2; color: #991b1b; }

.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity 0.25s, transform 0.25s; }
.toast-fade-enter-from  { opacity: 0; transform: translateY(8px); }
.toast-fade-leave-to    { opacity: 0; transform: translateY(8px); }
</style>
