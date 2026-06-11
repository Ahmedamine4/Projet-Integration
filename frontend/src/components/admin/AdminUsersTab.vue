<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { storeToRefs } from 'pinia';

import BaseInput from '@/components/common/forms/BaseInput.vue';
import ToggleSwitch from '@/components/common/forms/ToggleSwitch.vue';
import BaseNotification from '@/components/common/feedback/BaseNotification.vue';
import BaseSpinner from '@/components/common/feedback/BaseSpinner.vue';
import BaseError from '@/components/common/feedback/BaseError.vue';
import PaginationComponent from '@/components/dashboard/PaginationComponent.vue';
import { Users } from 'lucide-vue-next';

const adminStore = useAdminStore();
const { utilisateurs, loading, errors } = storeToRefs(adminStore);

const search = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const actionLoadingId = ref(null);
const notification = ref({ message: '', type: 'success' });

onMounted(() => adminStore.fetchUtilisateurs());

const visibleUsers = computed(() =>
  utilisateurs.value.filter((u) => u.role !== 'administrateur'),
);

const filteredUsers = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return visibleUsers.value;
  return visibleUsers.value.filter((u) =>
    `${u.nom ?? ''} ${u.prenom ?? ''} ${u.email ?? ''}`.toLowerCase().includes(q),
  );
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredUsers.value.length / itemsPerPage)),
);

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredUsers.value.slice(start, start + itemsPerPage);
});

function onSearch() {
  currentPage.value = 1;
}

function showNotif(message, type = 'success') {
  notification.value = { message, type };
  setTimeout(() => { notification.value.message = ''; }, 3500);
}

async function toggleBlocked(user) {
  const willUnblock = Boolean(user.bloque);
  const label = `${user.prenom ?? ''} ${user.nom ?? ''}`.trim() || user.email;
  const confirmed = window.confirm(
    willUnblock
      ? `Débloquer le compte de ${label} ?`
      : `Bloquer le compte de ${label} ? L'utilisateur ne pourra plus se connecter.`,
  );

  if (!confirmed) return;

  actionLoadingId.value = user.utilisateur_id;
  try {
    const res = willUnblock
      ? await adminStore.debloquerUtilisateur(user.utilisateur_id)
      : await adminStore.bloquerUtilisateur(user.utilisateur_id);
    showNotif(res?.message ?? (willUnblock ? 'Utilisateur débloqué.' : 'Utilisateur bloqué.'), 'success');
  } catch (error) {
    showNotif(error.message || "Impossible d'appliquer l'action.", 'error');
  } finally {
    actionLoadingId.value = null;
  }
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
</script>

<template>
  <div class="users-tab">
    <Teleport to="body">
      <BaseNotification
        :message="notification.message"
        :type="notification.type"
        @close="notification.message = ''"
      />
    </Teleport>

    <header class="tab-header">
      <div class="tab-header__title-row">
        <Users :size="20" class="tab-header__icon" />
        <div>
          <h2 class="tab-header__title">User Management</h2>
          <p class="tab-header__desc">Block or unblock user accounts. Administrators are hidden.</p>
        </div>
      </div>
    </header>

    <BaseError v-if="errors.users" variant="global" style="margin-bottom: 12px;">
      {{ errors.users }}
    </BaseError>

    <div class="toolbar">
      <div class="toolbar__search">
        <BaseInput
          v-model="search"
          placeholder="Search by name or email..."
          size="sm"
          @input="onSearch"
        />
      </div>
      <span class="toolbar__count">{{ filteredUsers.length }} user(s)</span>
    </div>

    <div v-if="loading.users" class="state-center">
      <BaseSpinner size="lg" />
      <p>Loading users...</p>
    </div>

    <div v-else-if="!visibleUsers.length" class="state-empty">
      <Users :size="36" class="state-empty__icon" />
      <p>No users found.</p>
    </div>

    <template v-else>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th class="th-center">Status</th>
              <th class="th-center">Blocked</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="u in paginatedUsers"
              :key="u.utilisateur_id"
              :class="{ 'row--blocked': u.bloque }"
            >
              <td>
                <div class="user-cell">
                  <span class="avatar">{{ (u.prenom?.[0] ?? '') + (u.nom?.[0] ?? '') }}</span>
                  <span>{{ u.prenom }} {{ u.nom }}</span>
                </div>
              </td>

              <td class="td-muted">{{ u.email }}</td>

              <td>
                <span class="role-badge" :class="`role-badge--${u.role}`">{{ u.role }}</span>
              </td>

              <td class="td-muted">{{ formatDate(u.date_de_creation) }}</td>

              <td class="td-center">
                <span class="status-badge" :class="u.bloque ? 'status--blocked' : 'status--active'">
                  {{ u.bloque ? 'Blocked' : 'Active' }}
                </span>
              </td>

              <td class="td-center">
                <div class="switch-cell" :class="{ 'switch-cell--loading': actionLoadingId === u.utilisateur_id }">
                  <ToggleSwitch
                    :model-value="Boolean(u.bloque)"
                    label=""
                    :title="u.bloque ? 'Unblock user' : 'Block user'"
                    @update:model-value="toggleBlocked(u)"
                  />
                </div>
              </td>
            </tr>

            <tr v-if="!paginatedUsers.length">
              <td colspan="6" class="state-center">No results for "{{ search }}"</td>
            </tr>
          </tbody>
        </table>
      </div>

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
.users-tab { font-family: var(--font-ui); }

.tab-header { margin-bottom: var(--space-lg); }
.tab-header__title-row { display: flex; align-items: flex-start; gap: var(--space-sm); }
.tab-header__icon { color: var(--color-secondary); margin-top: 2px; flex-shrink: 0; }
.tab-header__title { font-size: var(--font-size-md); font-weight: var(--font-bold); color: var(--color-primary); margin: 0 0 2px; }
.tab-header__desc { font-size: var(--font-size-xs); color: var(--color-primary-hover); margin: 0; }

.toolbar { display: flex; align-items: center; justify-content: space-between; gap: var(--space-md); margin-bottom: var(--space-md); }
.toolbar__search { width: 280px; }
.toolbar__count { font-size: var(--font-size-xs); color: var(--color-primary-hover); white-space: nowrap; }

.state-center { display: flex; flex-direction: column; align-items: center; gap: var(--space-sm); padding: var(--space-xl) 0; color: var(--color-primary-hover); font-size: var(--font-size-sm); text-align: center; }
.state-empty { display: flex; flex-direction: column; align-items: center; gap: var(--space-sm); padding: var(--space-xl) 0; color: var(--color-primary-hover); font-size: var(--font-size-sm); text-align: center; }
.state-empty__icon { opacity: 0.25; }

.table-wrap { overflow-x: auto; border: 1px solid var(--color-surface); border-radius: var(--radius-md); }
table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
thead tr { background: var(--color-background); }
th {
  padding: 10px var(--space-md); text-align: left; font-size: 10px;
  font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--color-primary-hover); border-bottom: 1.5px solid var(--color-surface); white-space: nowrap;
}
.th-center { text-align: center; }
td { padding: 12px var(--space-md); border-bottom: 1px solid var(--color-surface); color: var(--color-primary); vertical-align: middle; }
.td-center { text-align: center; }
.td-muted { color: var(--color-primary-hover); font-size: var(--font-size-xs); }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: rgba(var(--color-secondary-rgb), 0.03); }
.row--blocked td { opacity: 0.62; }
.row--blocked .user-cell span:last-child { text-decoration: line-through; }

.user-cell { display: flex; align-items: center; gap: var(--space-sm); }
.avatar {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--color-primary); color: var(--color-background);
  font-size: 10px; font-weight: 700; flex-shrink: 0; text-transform: uppercase;
}

.role-badge {
  display: inline-block; padding: 2px 8px; border-radius: 999px;
  font-size: 10px; font-weight: 600; text-transform: capitalize;
  background: var(--color-surface); color: var(--color-primary);
}
.role-badge--etudiant { background: #e0f2fe; color: #075985; }
.role-badge--professeur { background: #fef3c7; color: #92400e; }
.role-badge--professionnel { background: #d1fae5; color: #065f46; }
.role-badge--directeur { background: #fce7f3; color: #9d174d; }

.status-badge {
  display: inline-block; padding: 2px 8px; border-radius: 999px;
  font-size: 10px; font-weight: 700;
}
.status--active { background: #d1fae5; color: #065f46; }
.status--blocked { background: #fee2e2; color: #991b1b; }

.switch-cell { display: inline-flex; min-width: 76px; justify-content: center; }
.switch-cell--loading { opacity: 0.5; pointer-events: none; }
.switch-cell :deep(.toggle-row) { justify-content: center; }
.switch-cell :deep(.toggle-row > span) { display: none; }

.pagination-wrap { display: flex; justify-content: center; padding-top: var(--space-md); }
</style>
