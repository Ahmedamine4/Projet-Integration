<script setup>
import { reactive } from 'vue';
import Button from '@/components/common/actions/BaseButton.vue';
import Input from '@/components/common/forms/BaseInput.vue';
import Dropdown from '@/components/common/forms/BaseDropdown.vue';
import Select from '@/components/common/forms/BaseSelect.vue';
import Error from '@/components/common/feedback/BaseError.vue';
import CloseButton from '@/components/common/actions/CloseButton.vue';

const props = defineProps({
  open: Boolean,
  loading: Boolean,
  schoolOptions: {
    type: Array,
    default: () => [],
  },
  professorEmails: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['close', 'submit']);

const form = reactive({
  title: '',
  description: '',
  institution: '',
  teacherEmail: '',
});

const errors = reactive({
  title: '',
  description: '',
  institution: '',
  teacherEmail: '',
});

function resetErrors() {
  Object.keys(errors).forEach((key) => {
    errors[key] = '';
  });
}

function submitRequest() {
  resetErrors();

  const title = form.title.trim();
  const description = form.description.trim();
  const institution = form.institution.trim();
  const teacherEmail = form.teacherEmail.trim();

  if (!title) errors.title = 'Request title is required';
  if (description.length < 20) errors.description = 'Description must be at least 20 characters';
  if (!institution) errors.institution = 'Institution is required';
  if (!teacherEmail) errors.teacherEmail = 'Teacher email is required';
  else if (!props.professorEmails.includes(teacherEmail)) {
    errors.teacherEmail = 'Select a valid teacher email';
  }

  if (Object.values(errors).some(Boolean)) return;

  emit('submit', {
    title,
    description,
    institution,
    teacherEmail,
  });
}
</script>

<template>
  <Transition name="pop-up">
    <div v-if="open" class="modal-overlay">
      <div class="modal-card">
        <div class="modal-card__header">
          <h2>Request a recommendation letter</h2>
          <CloseButton size="lg" @click="emit('close')" />
        </div>

        <form class="recommendation-form" @submit.prevent="submitRequest">
          <div class="recommendation-form__body">
            <div class="field">
              <Input
                v-model="form.title"
                label="Request object"
                placeholder="Example: Recommendation letter for internship"
              />
              <Error v-if="errors.title" variant="field">
                {{ errors.title }}
              </Error>
            </div>

            <div class="field">
              <label for="description">Motif / Description</label>
              <textarea
                id="description"
                v-model="form.description"
                placeholder="Explain why you need this recommendation letter..."
                maxlength="1200"
              />
              <Error v-if="errors.description" variant="field">
                {{ errors.description }}
              </Error>
            </div>

            <div class="field">
              <Select
                v-model="form.institution"
                :options="schoolOptions"
                label="Institution"
                placeholder="Select your school"
              />
              <Error v-if="errors.institution" variant="field">
                {{ errors.institution }}
              </Error>
            </div>

            <div class="field">
              <Dropdown
                v-model="form.teacherEmail"
                :options="professorEmails"
                label="Professor email"
                placeholder="teacher@school.com"
              />
              <Error v-if="errors.teacherEmail" variant="field">
                {{ errors.teacherEmail }}
              </Error>
            </div>
          </div>

          <div class="recommendation-form__footer">
            <Button type="button" variant="ghost" @click="emit('close')">
              Cancel
            </Button>

            <Button type="submit" variant="submit" :loading="loading">
              Send request
            </Button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(var(--color-primary-rgb), 0.3);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.modal-card {
  display: flex;
  flex-direction: column;
  width: clamp(20rem, 40vw, 44rem);
  height: calc(100vh - 2 * var(--space-sm));
  margin-inline: var(--space-sm);
  background-color: var(--color-background);
  border-radius: var(--radius-md);
  overflow: hidden;
}


.modal-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26px 30px 24px;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.12);
}

.recommendation-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.recommendation-form__body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 28px 30px 30px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: var(--font-size-xs);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: var(--font-medium);
  color: var(--color-primary-hover);
}

textarea {
  width: 100%;
  min-height: 145px;
  resize: vertical;
  border: 1px solid rgba(var(--color-primary-rgb), 0.18);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  background: rgba(var(--color-surface-rgb), 0.32);
  color: var(--color-primary);
  font-family: var(--font-ui);
  font-size: var(--font-size-md);
  line-height: 1.5;
}

textarea:focus {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.15);
}

.recommendation-form__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding: 22px 30px 24px;
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.12);
}

.pop-up-enter-from,
.pop-up-leave-to {
  opacity: 0;
}

.pop-up-enter-active,
.pop-up-leave-active {
  transition: opacity var(--transition-normal);
}

@media (max-width: 480px) {
  .modal-card {
    width: 100%;
    height: 70vh;
    margin-inline: 0;
    align-self: flex-end;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }
}
<<<<<<< HEAD
</style>
=======
</style>
>>>>>>> testing
