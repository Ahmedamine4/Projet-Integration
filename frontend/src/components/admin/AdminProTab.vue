<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { storeToRefs } from 'pinia';

// ── Existing components (mandatory) ──────────────────────────────
import BaseInput        from '@/components/common/forms/BaseInput.vue';
import BaseButton       from '@/components/common/actions/BaseButton.vue';
import BaseSpinner      from '@/components/common/feedback/BaseSpinner.vue';
import BaseNotification from '@/components/common/feedback/BaseNotification.vue';
import BaseError        from '@/components/common/feedback/BaseError.vue';
import ConfirmDialog    from '@/components/common/feedback/ConfirmDialog.vue';
import { BadgeCheck, X, UserPlus } from 'lucide-vue-next';

const adminStore = useAdminStore();
const { professionnels, userSearchResults, loading, errors } = storeToRefs(adminStore);

const searchEmail  = ref('');
const notification = ref({ message: '', type: 'success' });

// ── ConfirmDialog state ───────────────────────────────────────────
const dialog = ref({
  open: false,
  variant: 'warning',
  title: '',
  message: '',
  confirmText: '',
  loading: false,
  onConfirm: null,
});

function openDialog({ variant = 'warning', title, message, confirmText, onConfirm }) {
  dialog.value = { open: true, variant, title, message, confirmText, loading: false, onConfirm };
}
function closeDialog() {
  dialog.value = { ...dialog.value, open: false, loading: false, onConfirm: null };
}
async function handleDialogConfirm() {
  if (!dialog.value.onConfirm) return;
  dialog.value.loading = true;
  try {
    await dialog.value.onConfirm();
    closeDialog();
  } catch {
    dialog.value.loading = false;
  }
}

onMounted(() => adminStore.fetchProfessionnelsEnAttente());

let searchTimer = null;
watch(searchEmail, (value) => {
  clearTimeout(searchTimer);
  const q = value.trim();
  if (!q) {
    adminStore.userSearchResults = [];
    return;
  }
  searchTimer = setTimeout(async () => {
    try {
      await adminStore.searchUserByEmail(q);
    } catch (error) {
      showNotif(error.message || 'Unable to search for this user.', 'error');
    }
  }, 350);
});

function showNotif(message, type = 'success') {
  notification.value = { message, type };
  setTimeout(() => { notification.value.message = ''; }, 3500);
}

// ── Accept / Reject pending request ──────────────────────────────
const actionLoadingId = ref(null);

async function accept(pro) {
  openDialog({
    variant: 'warning',
    title: 'Approve PRO request?',
    message: `Grant professional status to ${pro.utilisateur?.prenom} ${pro.utilisateur?.nom}? They will gain access to PRO features.`,
    confirmText: 'Yes, approve',
    onConfirm: async () => {
      actionLoadingId.value = pro.professionnel_utilisateur_id;
      try {
        const res = await adminStore.validerProfessionnel(pro.professionnel_utilisateur_id);
        showNotif(res?.message ?? 'PRO request approved.', 'success');
      } catch (error) {
        showNotif(error.message || 'Unable to approve PRO request.', 'error');
        throw error;
      } finally {
        actionLoadingId.value = null;
      }
    },
  });
}

async function reject(pro) {
  openDialog({
    variant: 'danger',
    title: 'Reject PRO request?',
    message: `Reject the professional status request from ${pro.utilisateur?.prenom} ${pro.utilisateur?.nom}? This action will notify the user.`,
    confirmText: 'Reject request',
    onConfirm: async () => {
      actionLoadingId.value = pro.professionnel_utilisateur_id;
      try {
        const res = await adminStore.refuserProfessionnel(pro.professionnel_utilisateur_id);
        showNotif(res?.message ?? 'PRO request rejected.', 'error');
      } catch (error) {
        showNotif(error.message || 'Unable to reject PRO request.', 'error');
        throw error;
      } finally {
        actionLoadingId.value = null;
      }
    },
  });
}

function askPromote(u) {
  openDialog({
    variant: 'warning',
    title: 'Promote to PRO?',
    message: `Manually promote ${u.prenom} ${u.nom} to professional status? This grants immediate PRO access.`,
    confirmText: 'Promote to PRO',
    onConfirm: async () => {
      actionLoadingId.value = u.utilisateur_id;
      try {
        const res = await adminStore.promoteToPro(u.utilisateur_id);
        showNotif(res?.message ?? 'User promoted to PRO.', 'success');
        searchEmail.value = '';
      } catch (error) {
        showNotif(error.message || 'Unable to promote user.', 'error');
        throw error;
      } finally {
        actionLoadingId.value = null;
      }
    },
  });
}
</script>

<template>
  <div class="pro-tab">

    <Teleport to="body">
      <ConfirmDialog
        :open="dialog.open"
        :variant="dialog.variant"
        :title="dialog.title"
        :message="dialog.message"
        :confirm-text="dialog.confirmText"
        :loading="dialog.loading"
        @confirm="handleDialogConfirm"
        @cancel="closeDialog"
      />
    </Teleport>

    <Teleport to="body">
      <BaseNotification
        :message="notification.message"
        :type="notification.type"
        @close="notification.message = ''"
      />
    </Teleport>

    <!-- ══════════ Section 1: Pending PRO Requests ══════════ -->
    <section class="pro-section">
      <header class="tab-header">
        <BadgeCheck :size="20" class="tab-header__icon" />
        <div>
          <h2 class="tab-header__title">Pending PRO Requests</h2>
          <p class="tab-header__desc">Approve or reject requests for professional status.</p>
        </div>
      </header>

      <div v-if="loading.pro" class="state-center">
        <BaseSpinner size="lg" />
        <p>Loading requests…</p>
      </div>

      <div v-else-if="!professionnels.length && !errors.pro" class="state-empty">
        <BadgeCheck :size="36" style="opacity:.2;" />
        <p>Aucune demande en attente pour le moment</p>
      </div>

      <BaseError v-else-if="errors.pro" variant="global" style="margin-bottom: 12px;">
        {{ errors.pro }}
      </BaseError>

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
            <tr
              v-for="pro in professionnels"
              :key="pro.professionnel_utilisateur_id"
            >
              <td>{{ pro.utilisateur?.prenom }} {{ pro.utilisateur?.nom }}</td>
              <td class="td-muted">{{ pro.utilisateur?.email }}</td>
              <td>{{ pro.entreprise ?? '—' }}</td>
              <td>{{ pro.poste ?? '—' }}</td>
              <td class="td-center">
                <div class="action-row">
                  <BaseButton
                    variant="submit"
                    size="xs"
                    :disabled="actionLoadingId !== null"
                    @click="accept(pro)"
                  >
                    Accept
                  </BaseButton>
                  <button
                    class="btn-reject"
                    :disabled="actionLoadingId !== null"
                    @click="reject(pro)"
                  >
                    <X :size="13" /> Reject
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <hr class="divider" />

    <!-- ══════════ Section 2: Manual PRO Promotion ══════════ -->
    <section class="pro-section">
      <header class="tab-header">
        <UserPlus :size="20" class="tab-header__icon" />
        <div>
          <h2 class="tab-header__title">Manual PRO Promotion</h2>
          <p class="tab-header__desc">Search for a user by email and promote them directly to professional status.</p>
        </div>
      </header>

      <div class="search-wrap">
        <BaseInput
          v-model="searchEmail"
          placeholder="Search by email…"
          size="sm"
        />
      </div>

      <div v-if="searchEmail.trim()" class="search-results">
        <div v-if="loading.userSearch" class="state-center state-center--sm">
          <BaseSpinner size="md" />
          <p>Searching...</p>
        </div>
        <BaseError v-else-if="errors.userSearch" variant="field" style="margin: 12px;">
          {{ errors.userSearch }}
        </BaseError>
        <div v-else-if="!userSearchResults.length" class="state-empty state-empty--sm">
          No eligible users found for "{{ searchEmail }}"
        </div>
        <div
          v-for="u in userSearchResults"
          :key="u.utilisateur_id"
          class="result-row"
        >
          <div class="result-row__info">
            <span class="avatar">{{ (u.prenom?.[0] ?? '') + (u.nom?.[0] ?? '') }}</span>
            <div>
              <p class="result-row__name">{{ u.prenom }} {{ u.nom }}</p>
              <p class="result-row__email">{{ u.email }}</p>
            </div>
          </div>
          <BaseButton
            variant="submit"
            size="xs"
            :disabled="actionLoadingId !== null"
            @click="askPromote(u)"
          >
            Promote to PRO
          </BaseButton>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pro-tab { font-family: var(--font-ui); }
.pro-section { margin-bottom: var(--space-lg); }
.divider { border: none; border-top: 1.5px solid var(--color-surface); margin: var(--space-lg) 0; }

.tab-header { display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-md); }
.tab-header__icon  { color: var(--color-secondary); margin-top: 2px; flex-shrink: 0; }
.tab-header__title { font-size: var(--font-size-md); font-weight: var(--font-bold); color: var(--color-primary); margin: 0 0 2px; }
.tab-header__desc  { font-size: var(--font-size-xs); color: var(--color-primary-hover); margin: 0; }

.state-center { display: flex; flex-direction: column; align-items: center; gap: var(--space-sm); padding: var(--space-xl) 0; color: var(--color-primary-hover); font-size: var(--font-size-sm); }
.state-center--sm { padding: var(--space-md) 0; }
.state-empty  { display: flex; flex-direction: column; align-items: center; gap: var(--space-xs); padding: var(--space-lg) 0; color: var(--color-primary-hover); font-size: var(--font-size-sm); }
.state-empty--sm { padding: var(--space-md) 0; }

.table-wrap { overflow-x: auto; border: 1px solid var(--color-surface); border-radius: var(--radius-md); }
table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
thead tr { background: var(--color-background); }
th { padding: 10px var(--space-md); text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-primary-hover); border-bottom: 1.5px solid var(--color-surface); }
.th-center { text-align: center; }
td { padding: 12px var(--space-md); border-bottom: 1px solid var(--color-surface); color: var(--color-primary); vertical-align: middle; }
.td-center { text-align: center; }
.td-muted  { color: var(--color-primary-hover); font-size: var(--font-size-xs); }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: rgba(var(--color-secondary-rgb), 0.03); }

.action-row { display: flex; gap: var(--space-xs); justify-content: center; align-items: center; }

.btn-reject {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 5px 10px; border: none;
  background: #fee2e2; color: #991b1b;
  border-radius: 0.8rem; font-size: var(--font-size-xs);
  font-weight: var(--font-medium); font-family: var(--font-ui);
  cursor: pointer; transition: background var(--transition-fast);
}
.btn-reject:hover:not(:disabled) { background: #fecaca; }
.btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }

.search-wrap    { max-width: 340px; margin-bottom: var(--space-sm); }
.search-results { border: 1px solid var(--color-surface); border-radius: var(--radius-md); overflow: hidden; max-width: 680px; }

.result-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--space-md); padding: 12px var(--space-md);
  border-bottom: 1px solid var(--color-surface);
  transition: background var(--transition-fast);
}
.result-row:last-child { border-bottom: none; }
.result-row:hover { background: rgba(var(--color-secondary-rgb), 0.04); }
.result-row__info { display: flex; align-items: center; gap: var(--space-sm); }

.avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--color-primary); color: var(--color-background);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0; text-transform: uppercase;
}
.result-row__name  { font-size: var(--font-size-sm); font-weight: var(--font-medium); margin: 0 0 1px; }
.result-row__email { font-size: var(--font-size-xs); color: var(--color-primary-hover); margin: 0; }
</style>
