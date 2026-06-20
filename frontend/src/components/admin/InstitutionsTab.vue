<template>
  <div>
    <div class="section-block">
      <h2 class="section-title">Create Institution</h2>
      <p class="section-desc">Add a new institution to the platform.</p>

      <div class="form-card">
        <div class="form-grid">
          <div class="field">
            <label>Institution Name *</label>
            <input v-model="instForm.nom" placeholder="Ensa Tanger" />
          </div>
          <div class="field">
            <label>Director's Email *</label>
            <input v-model="instForm.email" type="email" placeholder="EnsaT@uae.ac.etu.ma" />
          </div>
        </div>
        <div class="form-footer">
          <span v-if="instError"   class="error-msg">{{ instError }}</span>
          <span v-if="instSuccess" class="success-msg">{{ instSuccess }}</span>
          <button class="btn-primary" :disabled="instSubmitting" @click="submitInstitution">
            {{ instSubmitting ? 'Creating...' : "Create Institution" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useInstitutionStore } from '@/stores/institution'

const institutionStore = useInstitutionStore()

const instForm       = reactive({ nom: '', email: '' })
const instSubmitting = ref(false)
const instError      = ref('')
const instSuccess    = ref('')

async function submitInstitution() {
  instError.value   = ''
  instSuccess.value = ''
  if (!instForm.nom || !instForm.email) {
    instError.value = "Institution Name and Director's Email are required."
    return
  }
  instSubmitting.value = true
  try {
    const data = await institutionStore.createInstitution({ ...instForm })
    instSuccess.value = `Institution "${data?.institution?.nom || instForm.nom}" created successfully!`
    await institutionStore.fetchInstitutions()
    Object.assign(instForm, { nom: '', email: '' })
  } catch (e) {
    instError.value = e.response?.data?.error || 'Error creating institution'
  } finally {
    instSubmitting.value = false
  }
}
</script>

<style scoped>
.section-block { margin-bottom: 0; }
.section-title { font-size: 1rem; font-weight: 600; margin: 0 0 4px; color: #111827; }
.section-desc  { color: #6b7280; font-size: 0.875rem; margin: 0 0 1rem; }

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

input {
  padding: 8px 12px; border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 0.875rem; background: #fff;
  outline: none; transition: border 0.15s;
}
input:focus { border-color: #f97316; }

.form-footer {
  margin-top: 1.25rem; display: flex;
  align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap;
}
.btn-primary {
  padding: 8px 20px; background: #f97316; color: white;
  border: none; border-radius: 8px; font-size: 0.875rem;
  font-weight: 500; cursor: pointer; transition: background 0.15s;
}
.btn-primary:hover    { background: #ea580c; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.error-msg   { font-size: 0.875rem; color: #dc2626; }
.success-msg { font-size: 0.875rem; color: #059669; }
</style>
