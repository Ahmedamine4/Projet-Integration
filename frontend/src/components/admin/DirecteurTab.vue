<template>
  <div>

    <!-- ══ SECTION 1 : Créer une institution ══ -->
    <div class="section-block">
      <h2 class="section-title">Créer une institution</h2>
      <p class="section-desc">Ajoute une nouvelle institution dans la plateforme.</p>

      <div class="form-card">
        <div class="form-grid">
          <div class="field">
            <label>Nom de l'institution *</label>
            <input v-model="instForm.nom" placeholder="ex: Université d'Alger" />
          </div>
          <div class="field">
            <label>Email *</label>
            <input v-model="instForm.email" type="email" placeholder="contact@univ.dz" />
          </div>
          <div class="field">
            <label>Adresse</label>
            <input v-model="instForm.address" placeholder="ex: Alger, Algérie" />
          </div>
          <div class="field">
            <label>Description</label>
            <input v-model="instForm.description" placeholder="Brève description..." />
          </div>
        </div>
        <div class="form-footer">
          <span v-if="instError"   class="error-msg">{{ instError }}</span>
          <span v-if="instSuccess" class="success-msg">{{ instSuccess }}</span>
          <button class="btn-primary" :disabled="instSubmitting" @click="submitInstitution">
            {{ instSubmitting ? 'Création...' : "Créer l'institution" }}
          </button>
        </div>
      </div>
    </div>

    <hr class="divider" />

    <!-- ══ SECTION 2 : Assigner un directeur ══ -->
    <div class="section-block">
      <h2 class="section-title">Assigner un directeur</h2>
      <p class="section-desc">
        Assigne un utilisateur existant comme directeur d'une institution.
      </p>

      <div class="form-card">
        <div class="form-grid">
          <div class="field">
            <label>ID Utilisateur *</label>
            <input v-model="dirForm.utilisateur_id" placeholder="ex: clx1abc..." />
            <span class="hint">L'utilisateur doit déjà exister dans la base</span>
          </div>
          <div class="field">
            <label>Institution *</label>
            <select v-model="dirForm.institution_id">
              <option value="" disabled>Sélectionner une institution...</option>
              <option
                v-for="inst in institutionStore.institutions"
                :key="inst.institution_id"
                :value="inst.institution_id"
              >
                {{ inst.nom }}
              </option>
            </select>
          </div>
          <div class="field">
            <label>Poste</label>
            <input v-model="dirForm.poste" placeholder="ex: Directeur général" />
          </div>
          <div class="field">
            <label>Bureau</label>
            <input v-model="dirForm.bureau" placeholder="ex: Bâtiment A, bureau 12" />
          </div>
        </div>
        <div class="form-footer">
          <span v-if="dirError"   class="error-msg">{{ dirError }}</span>
          <span v-if="dirSuccess" class="success-msg">{{ dirSuccess }}</span>
          <button class="btn-primary" :disabled="dirSubmitting" @click="submitDirecteur">
            {{ dirSubmitting ? 'Enregistrement...' : 'Assigner le directeur' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAdminStore }       from '@/stores/admin'
import { useInstitutionStore } from '@/stores/institution'
import api from '@/services/api'

const adminStore       = useAdminStore()
const institutionStore = useInstitutionStore()

onMounted(() => institutionStore.fetchInstitutions())

// ── Institution ────────────────────────────────────
const instForm       = reactive({ nom: '', email: '', address: '', description: '' })
const instSubmitting = ref(false)
const instError      = ref('')
const instSuccess    = ref('')

async function submitInstitution() {
  instError.value   = ''
  instSuccess.value = ''
  if (!instForm.nom || !instForm.email) {
    instError.value = "Le nom et l'email sont obligatoires."
    return
  }
  instSubmitting.value = true
  try {

    const { data } = await api.post('/institutions', { ...instForm })

    instSuccess.value = `Institution "${data.institution.nom}" créée !`
    await institutionStore.fetchInstitutions()
    Object.assign(instForm, { nom: '', email: '', address: '', description: '' })
  } catch (e) {
    instError.value = e.response?.data?.error || 'Erreur lors de la création'
  } finally {
    instSubmitting.value = false
  }
}

// ── Directeur ──────────────────────────────────────
const dirForm       = reactive({ utilisateur_id: '', institution_id: '', poste: '', bureau: '' })
const dirSubmitting = ref(false)
const dirError      = ref('')
const dirSuccess    = ref('')

async function submitDirecteur() {
  dirError.value   = ''
  dirSuccess.value = ''
  if (!dirForm.utilisateur_id || !dirForm.institution_id) {
    dirError.value = "L'ID utilisateur et l'institution sont obligatoires."
    return
  }
  dirSubmitting.value = true
  try {
    const res = await adminStore.assignerDirecteur({ ...dirForm })
    dirSuccess.value = res.message || 'Directeur assigné avec succès !'
    Object.assign(dirForm, { utilisateur_id: '', institution_id: '', poste: '', bureau: '' })
  } catch (e) {
    dirError.value = e.response?.data?.error || "Erreur lors de l'assignation"
  } finally {
    dirSubmitting.value = false
  }
}
</script>

<style scoped>
.section-block { margin-bottom: 0; }
.section-title { font-size: 1rem; font-weight: 600; margin: 0 0 4px; color: #111827; }
.section-desc  { color: #6b7280; font-size: 0.875rem; margin: 0 0 1rem; }
.divider       { border: none; border-top: 1px solid #e5e7eb; margin: 1.75rem 0; }

.form-card {
  background: #fff; border: 1px solid #e5e7eb;
  border-radius: 12px; padding: 1.5rem; max-width: 700px;
}
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
}

.field { display: flex; flex-direction: column; gap: 4px; }
label  { font-size: 0.8rem; font-weight: 500; color: #374151; }

input, select {
  padding: 8px 12px; border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 0.875rem; background: #fff;
  outline: none; transition: border 0.15s;
}
input:focus, select:focus { border-color: #6366f1; }
.hint { font-size: 0.75rem; color: #9ca3af; }

.form-footer {
  margin-top: 1.25rem; display: flex;
  align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap;
}
.btn-primary {
  padding: 8px 20px; background: #4f46e5; color: white;
  border: none; border-radius: 8px; font-size: 0.875rem;
  font-weight: 500; cursor: pointer; transition: background 0.15s;
}
.btn-primary:hover    { background: #4338ca; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.error-msg   { font-size: 0.875rem; color: #dc2626; }
.success-msg { font-size: 0.875rem; color: #059669; }
</style>