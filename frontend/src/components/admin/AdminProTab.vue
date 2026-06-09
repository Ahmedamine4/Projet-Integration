<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { storeToRefs } from 'pinia';
import { BadgeCheck, X, UserPlus } from 'lucide-vue-next';

const adminStore = useAdminStore();
const { professionnels, utilisateurs, loading } = storeToRefs(adminStore);

const searchEmail = ref('');
const loadingId   = ref(null);
const toast       = ref(null);

onMounted(() => {
  adminStore.fetchProfessionnelsEnAttente();
  adminStore.fetchUtilisateurs();
});

// ── Pending requests ──────────────────────────────────────────────

async function accept(id) {
  loadingId.value = id;
  try {
    const res = await adminStore.validerProfessionnel(id);
    showToast(res.message ?? 'Request approved.');
  } catch (e) {
    showToast(e.response?.data?.error ?? 'Error.', 'error');
  } finally {
    loadingId.value = null;
  }
}

async function reject(id) {
  loadingId.value = id;
  try {
    const res = await adminStore.refuserProfessionnel(id);
    showToast(res.message ?? 'Request rejected.', 'warn');
  } catch (e) {
    showToast(e.response?.data?.error ?? 'Error.', 'error');
  } finally {
    loadingId.value = null;
  }
}

// ── Manual promote search ─────────────────────────────────────────

const searchResults = computed(() => {
  const q = searchEmail.value.toLowerCase().trim();
  if (!q) return [];
  return utilisateurs.value.filter(u =>
    u.role !== 'professionnel' &&
    u.role !== 'administrateur' &&
    u.email.toLowerCase().includes(q)
  ).slice(0, 6);
});

async function promote(id) {
  loadingId.value = id;
  try {
    await adminStore.promoteToPro(id);
    showToast('User successfully promoted to PRO.');
    searchEmail.value = '';
  } catch (e) {
    showToast(e.message || 'Error.', 'error');
  } finally {
    loadingId.value = null;
  }
}

// ── Toast ─────────────────────────────────────────────────────────

function showToast(message, type = 'success') {
  toast.value = { message, type };
  setTimeout(() => { toast.value = null; }, 3200);
}
</script>

<template>
  <div class="tab-section">

    <!-- ══ Section 1: Pending PRO requests ══ -->
    <section class="pro-section">
      <header class="tab-section__header">
        <BadgeCheck :size="18" class="tab-section__icon" />
        <div>
          <h2 class="tab-section__title">Pending PRO Requests</h2>
          <p class="tab-section__desc">Review and approve or reject users who applied for Professional status.</p>
        </div>
      </header>

      <div v-if="loading" class="state-msg">Loading…</div>

      <div v-else-if="!professionnels.length" class="state-msg empty-state">
        <BadgeCheck :size="32" class="empty-icon" />
        <p>No pending PRO requests at the moment.</p>
      </div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Position</th>
              <th class="th-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pro in professionnels" :key="pro.professionnel_utilisateur_id">
              <td>{{ pro.utilisateur.prenom }} {{ pro.utilisateur.nom }}</td>
              <td class="td-email">{{ pro.utilisateur.email }}</td>
              <td>{{ pro.entreprise ?? '—' }}</td>
              <td>{{ pro.post ?? '—' }}</td>
              <td class="td-center td-actions">
                <button
                  class="btn-accept"
                  :disabled="loadingId === pro.professionnel_utilisateur_id"
                  @click="accept(pro.professionnel_utilisateur_id)"
                >
                  Accept
                </button>
                <button
                  class="btn-reject"
                  :disabled="loadingId === pro.professionnel_utilisateur_id"
                  @click="reject(pro.professionnel_utilisateur_id)"
                >
                  <X :size="13" /> Reject
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <hr class="divider" />

    <!-- ══ Section 2: Manual promote ══ -->
    <section class="pro-section">
      <header class="tab-section__header">
        <UserPlus :size="18" class="tab-section__icon" />
        <div>
          <h2 class="tab-section__title">Promote User to PRO</h2>
          <p class="tab-section__desc">Search any regular user by email and directly assign them the PRO status.</p>
        </div>
      </header>

      <!-- Search — reusing the same Search-by-email pattern used in the app -->
      <div class="search-box">
        <svg class="search-box__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="searchEmail"
          class="search-box__input"
          type="text"
          placeholder="Search by email…"
        />
      </div>

      <!-- Results -->
      <div v-if="searchEmail.trim()" class="search-results">
        <div v-if="!searchResults.length" class="state-msg state-msg--sm">No matching non-PRO users found.</div>
        <div
          v-for="u in searchResults"
          :key="u.utilisateur_id"
          class="result-row"
        >
          <div class="result-row__info">
            <span class="result-row__avatar">{{ (u.prenom?.[0] ?? '') + (u.nom?.[0] ?? '') }}</span>
            <div>
              <p class="result-row__name">{{ u.prenom }} {{ u.nom }}</p>
              <p class="result-row__email">{{ u.email }}</p>
            </div>
          </div>
          <button
            class="btn-promote"
            :disabled="loadingId === u.utilisateur_id"
            @click="promote(u.utilisateur_id)"
          >
            {{ loadingId === u.utilisateur_id ? 'Promoting…' : 'Promote to PRO' }}
          </button>
        </div>
      </div>
    </section>

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
  display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-md);
}
.tab-section__icon { color: var(--color-secondary); flex-shrink: 0; margin-top: 2px; }
.tab-section__title { font-size: var(--font-size-md); font-weight: var(--font-bold); color: var(--color-primary); margin: 0 0 2px; }
.tab-section__desc  { font-size: var(--font-size-xs); color: var(--color-primary-hover); margin: 0; }

.pro-section { margin-bottom: var(--space-lg); }
.divider { border: none; border-top: 1.5px solid var(--color-surface); margin: var(--space-lg) 0; }

/* ── State ── */
.state-msg { text-align: center; padding: var(--space-xl); color: var(--color-primary-hover); font-size: var(--font-size-sm); }
.state-msg--sm { padding: var(--space-md); }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: var(--space-sm); }
.empty-icon { color: var(--color-surface); }

/* ── Table ── */
.table-wrap { overflow-x: auto; border: 1px solid var(--color-surface); border-radius: var(--radius-md); }
table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
thead tr { background: var(--color-background); }
th {
  padding: 10px var(--space-md); text-align: left;
  font-size: var(--font-size-xxs); font-weight: var(--font-bold);
  text-transform: uppercase; letter-spacing: 0.07em;
  color: var(--color-primary-hover); border-bottom: 1.5px solid var(--color-surface);
}
.th-center { text-align: center; }
td {
  padding: 12px var(--space-md); border-bottom: 1px solid var(--color-surface);
  color: var(--color-primary); vertical-align: middle;
}
.td-center { text-align: center; }
.td-email   { color: var(--color-primary-hover); font-size: var(--font-size-xs); }
.td-actions { display: flex; gap: var(--space-xs); justify-content: center; }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: rgba(var(--color-secondary-rgb), 0.04); }

/* ── Action buttons ── */
.btn-accept, .btn-reject {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 5px 12px; border: none; border-radius: var(--radius-sm);
  font-size: var(--font-size-xs); font-weight: var(--font-medium);
  font-family: var(--font-ui); cursor: pointer;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}
.btn-accept { background: var(--color-secondary); color: white; }
.btn-accept:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
.btn-reject { background: #fee2e2; color: #991b1b; }
.btn-reject:hover:not(:disabled) { background: #fecaca; }
button:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Search ── */
.search-box {
  display: flex; align-items: center;
  background: var(--color-background);
  border: 1.5px solid var(--color-surface);
  border-radius: var(--radius-sm);
  padding: 0 var(--space-sm);
  gap: var(--space-xs);
  max-width: 320px;
  transition: border-color var(--transition-fast);
  margin-bottom: var(--space-sm);
}
.search-box:focus-within { border-color: var(--color-secondary); }
.search-box__icon { width: 15px; height: 15px; color: var(--color-primary-hover); flex-shrink: 0; }
.search-box__input {
  border: none; outline: none; background: transparent;
  font-size: var(--font-size-sm); font-family: var(--font-ui);
  color: var(--color-primary); width: 100%; padding: 9px 0;
}

/* ── Results ── */
.search-results {
  border: 1px solid var(--color-surface); border-radius: var(--radius-md); overflow: hidden;
  max-width: 600px;
}

.result-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--space-md); padding: 12px var(--space-md);
  border-bottom: 1px solid var(--color-surface);
  transition: background var(--transition-fast);
}
.result-row:last-child { border-bottom: none; }
.result-row:hover { background: rgba(var(--color-secondary-rgb), 0.04); }

.result-row__info { display: flex; align-items: center; gap: var(--space-sm); }

.result-row__avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--color-primary); color: var(--color-background);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: var(--font-size-xxs); font-weight: var(--font-bold); flex-shrink: 0;
}

.result-row__name  { font-size: var(--font-size-sm); font-weight: var(--font-medium); margin: 0 0 1px; }
.result-row__email { font-size: var(--font-size-xs); color: var(--color-primary-hover); margin: 0; }

.btn-promote {
  padding: 7px var(--space-md); background: var(--color-secondary); color: white;
  border: none; border-radius: var(--radius-sm); font-size: var(--font-size-xs);
  font-weight: var(--font-medium); font-family: var(--font-ui); cursor: pointer;
  white-space: nowrap; flex-shrink: 0;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}
.btn-promote:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
.btn-promote:disabled { opacity: 0.5; cursor: not-allowed; }

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
.toast-fade-enter-from { opacity: 0; transform: translateY(8px); }
.toast-fade-leave-to   { opacity: 0; transform: translateY(8px); }
</style>
