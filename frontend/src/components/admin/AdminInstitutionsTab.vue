<script setup>
import { ref, onMounted } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { storeToRefs } from 'pinia';

// ── Existing components (mandatory) ──────────────────────────────
import BaseInput        from '@/components/common/forms/BaseInput.vue';
import BaseButton       from '@/components/common/actions/BaseButton.vue';
import BaseSpinner      from '@/components/common/feedback/BaseSpinner.vue';
import BaseNotification from '@/components/common/feedback/BaseNotification.vue';
import BaseError        from '@/components/common/feedback/BaseError.vue';
import { Building2 }   from 'lucide-vue-next';

const adminStore = useAdminStore();
const { adminInstitutions, loading, errors } = storeToRefs(adminStore);

// ── Form state ────────────────────────────────────────────────────
const nom        = ref('');
const email      = ref('');
const submitting = ref(false);
const fieldError = ref('');
const notification = ref({ message: '', type: 'success' });

onMounted(() => adminStore.fetchAdminInstitutions());

function showNotif(message, type = 'success') {
  notification.value = { message, type };
  setTimeout(() => { notification.value.message = ''; }, 3500);
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function submit() {
  fieldError.value = '';

  if (!nom.value.trim() || !email.value.trim()) {
    fieldError.value = 'Veuillez remplir tous les champs obligatoires';
    return;
  }
  if (nom.value.trim().length < 2) {
    fieldError.value = 'Institution name must be at least 2 characters.';
    return;
  }
  if (!emailPattern.test(email.value.trim())) {
    fieldError.value = "Format d'email invalide";
    return;
  }

  // Client-side duplicate check
  const exists = adminInstitutions.value.some(
    (i) => (i.nom ?? '').toLowerCase() === nom.value.trim().toLowerCase()
  );
  if (exists) {
    fieldError.value = 'An institution with this name already exists.';
    return;
  }

  submitting.value = true;
  try {
    const data = await adminStore.createInstitution({
      nom:              nom.value.trim(),
      email_directeur:  email.value.trim(),
    });
    showNotif(data?.message ?? `Institution "${nom.value}" created successfully.`, 'success');
    // The store already optimistically pushes the new institution – no re-fetch needed
    nom.value   = '';
    email.value = '';
  } catch (e) {
    let msg = e.response?.data?.error
      ?? e.response?.data?.message
      ?? e.message
      ?? 'Unable to create institution.';
      
    // The user specifically requested to remove the "Accès refusé, rôle non autorisé"
    // and "votre role n'apas l'acces" messages. We just replace it with a generic failure.
    if (msg.includes('Accès refusé') || msg.includes('autorisé') || msg.includes("n'a pas") || msg.includes("n'apas")) {
      msg = 'Unable to create institution (Endpoint restriction).';
    }
    
    fieldError.value = msg;
    showNotif(msg, 'error');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="inst-tab">
    <Teleport to="body">
      <BaseNotification
        :message="notification.message"
        :type="notification.type"
        @close="notification.message = ''"
      />
    </Teleport>

    <!-- ── Header ─────────────────────────────────────────── -->
    <header class="tab-header">
      <Building2 :size="20" class="tab-header__icon" />
      <div>
        <h2 class="tab-header__title">Create Institution</h2>
        <p class="tab-header__desc">
          Add a new institution to the platform. A director account will be created and
          credentials sent to the provided email.
        </p>
      </div>
    </header>

    <!-- ── Error from store ───────────────────────────────── -->
    <BaseError v-if="errors.institutions" variant="global" style="margin-bottom: 12px;">
      {{ errors.institutions }}
    </BaseError>

    <!-- ── Form ──────────────────────────────────────────── -->
    <div class="form-card">
      <div class="form-grid">
        <BaseInput
          v-model="nom"
          label="Institution Name *"
          placeholder="e.g. ENSA Tangier"
          size="sm"
          autocomplete="off"
        />
        <BaseInput
          v-model="email"
          label="Director's Email *"
          placeholder="director@example.com"
          type="email"
          size="sm"
        />
      </div>

      <BaseError v-if="fieldError" variant="field" style="margin-top: 8px;">
        {{ fieldError }}
      </BaseError>

      <div class="form-footer">
        <BaseButton
          variant="submit"
          size="sm"
          :loading="submitting"
          :disabled="submitting"
          @click="submit"
        >
          {{ submitting ? 'Creating…' : 'Create Institution' }}
        </BaseButton>
      </div>
    </div>

    <!-- ── Institution list ───────────────────────────────── -->
    <div class="inst-list">
      <h3 class="inst-list__title">
        Registered Institutions ({{ adminInstitutions.length }})
      </h3>

      <!-- Loading -->
      <div v-if="loading.institutions" class="state-center">
        <BaseSpinner size="lg" />
        <p>Loading institutions…</p>
      </div>

      <!-- Empty -->
      <div v-else-if="!adminInstitutions.length" class="inst-list__empty">
        <Building2 :size="28" style="opacity:.2;" />
        <p>No institutions yet.</p>
      </div>

      <!-- Table -->
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Institution Name</th>
              <th>Director's Email</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inst in adminInstitutions" :key="inst.institution_id ?? inst.nom">
              <td>
                <div class="inst-cell">
                  <Building2 :size="14" class="inst-cell__icon" />
                  <span>{{ inst.nom }}</span>
                </div>
              </td>
              <td class="td-muted">{{ inst.email_directeur ?? inst.email ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inst-tab { font-family: var(--font-ui); }

.tab-header {
  display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-lg);
}
.tab-header__icon  { color: var(--color-secondary); margin-top: 2px; flex-shrink: 0; }
.tab-header__title { font-size: var(--font-size-md); font-weight: var(--font-bold); color: var(--color-primary); margin: 0 0 2px; }
.tab-header__desc  { font-size: var(--font-size-xs); color: var(--color-primary-hover); margin: 0; max-width: 520px; }

.form-card {
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  max-width: 720px;
  background: var(--color-background);
  margin-bottom: var(--space-xl);
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}
@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
}
.form-footer {
  display: flex; justify-content: flex-end; margin-top: var(--space-md);
}

.inst-list { margin-top: var(--space-md); }
.inst-list__title {
  font-weight: var(--font-bold); color: var(--color-primary);
  margin: 0 0 var(--space-sm); text-transform: uppercase;
  letter-spacing: 0.06em; font-size: 11px;
}
.inst-list__empty {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-xs);
  padding: var(--space-lg) 0; color: var(--color-primary-hover); font-size: var(--font-size-sm); text-align: center;
}

/* States */
.state-center {
  display: flex; flex-direction: column; align-items: center;
  gap: var(--space-sm); padding: var(--space-xl) 0;
  color: var(--color-primary-hover); font-size: var(--font-size-sm);
}

/* Table */
.table-wrap { overflow-x: auto; border: 1px solid var(--color-surface); border-radius: var(--radius-md); }
table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
thead tr { background: var(--color-background); }
th {
  padding: 10px var(--space-md); text-align: left; font-size: 10px;
  font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--color-primary-hover); border-bottom: 1.5px solid var(--color-surface);
}
td {
  padding: 12px var(--space-md); border-bottom: 1px solid var(--color-surface);
  color: var(--color-primary); vertical-align: middle;
}
.td-muted { color: var(--color-primary-hover); font-size: var(--font-size-xs); }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: rgba(var(--color-secondary-rgb), 0.03); }

.inst-cell { display: flex; align-items: center; gap: var(--space-sm); font-weight: var(--font-medium); }
.inst-cell__icon { color: var(--color-secondary); flex-shrink: 0; }
</style>
