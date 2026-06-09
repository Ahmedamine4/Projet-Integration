<script setup>
import { ref, reactive } from 'vue';
import { useInstitutionStore } from '@/stores/institution';
import { Building2 } from 'lucide-vue-next';

const institutionStore = useInstitutionStore();

const form = reactive({ nom: '', email: '' });
const submitting = ref(false);
const error      = ref('');
const success    = ref('');

async function submit() {
  error.value   = '';
  success.value = '';

  if (!form.nom.trim() || !form.email.trim()) {
    error.value = 'Both fields are required.';
    return;
  }

  // Frontend validation: Check if institution already exists (case-insensitive)
  const instExists = institutionStore.institutions?.some(
    (inst) => inst.nom.toLowerCase() === form.nom.trim().toLowerCase()
  );

  if (instExists) {
    error.value = 'An institution with this name already exists.';
    return;
  }

  submitting.value = true;
  try {
    // Envoie { nom, email_directeur } vers POST /api/admin/institutions
    const data = await institutionStore.createInstitution({
      nom: form.nom.trim(),
      email_directeur: form.email.trim(),
    });
    success.value = `Institution "${data?.institution?.nom ?? form.nom}" created successfully!`;
    await institutionStore.fetchInstitutions();
    Object.assign(form, { nom: '', email: '' });
  } catch (e) {
    if (e.response?.status === 404) {
      error.value = 'Cette fonctionnalité est en cours de développement (route backend manquante).';
    } else {
      error.value = e.response?.data?.error ?? e.response?.data?.message ?? 'Failed to create institution.';
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="tab-section">
    <header class="tab-section__header">
      <Building2 :size="18" class="tab-section__icon" />
      <div>
        <h2 class="tab-section__title">Create Institution</h2>
        <p class="tab-section__desc">Add a new institution to the platform. The team will create a director account and send credentials by email.</p>
      </div>
    </header>

    <div class="form-card">
      <div class="form-grid">
        <div class="field">
          <label class="field__label" for="inst-name">Institution Name <span class="required">*</span></label>
          <input
            id="inst-name"
            v-model="form.nom"
            class="field__input"
            placeholder="Ensa Tanger"
            autocomplete="off"
          />
        </div>
        <div class="field">
          <label class="field__label" for="inst-email">Director's Email <span class="required">*</span></label>
          <input
            id="inst-email"
            v-model="form.email"
            type="email"
            class="field__input"
            placeholder="EnsaT@uae.ac.etu.ma"
          />
        </div>
      </div>

      <footer class="form-card__footer">
        <p v-if="error"   class="msg msg--error">{{ error }}</p>
        <p v-if="success" class="msg msg--success">{{ success }}</p>
        <button class="btn-primary" :disabled="submitting" @click="submit">
          {{ submitting ? 'Creating…' : 'Create Institution' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* ── Shared section layout (imported via global scoped cascade) ── */
.tab-section__header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.tab-section__icon {
  color: var(--color-secondary);
  flex-shrink: 0;
  margin-top: 2px;
}

.tab-section__title {
  font-size: var(--font-size-md);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  margin: 0 0 2px;
}

.tab-section__desc {
  font-size: var(--font-size-xs);
  color: var(--color-primary-hover);
  margin: 0;
  max-width: 520px;
}

/* ── Form ─────────────────────────────────── */
.form-card {
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  max-width: 680px;
  background: var(--color-background);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.field__label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.required {
  color: var(--color-secondary);
}

.field__input {
  padding: 10px var(--space-md);
  border: 1.5px solid var(--color-surface);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-family: var(--font-ui);
  background: white;
  color: var(--color-primary);
  outline: none;
  transition: border-color var(--transition-fast);
}

.field__input:focus {
  border-color: var(--color-secondary);
}

.form-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

.msg {
  font-size: var(--font-size-xs);
  margin: 0;
}

.msg--error   { color: var(--color-error);   }
.msg--success { color: var(--color-success);  }

.btn-primary {
  padding: 10px var(--space-lg);
  background: var(--color-secondary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  font-family: var(--font-ui);
  cursor: pointer;
  transition: background var(--transition-fast), transform var(--transition-fast);
  margin-left: auto;
}

.btn-primary:hover:not(:disabled) {
  background: #d45c08;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
