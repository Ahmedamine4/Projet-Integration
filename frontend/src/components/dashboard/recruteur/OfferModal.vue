<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue';
import BaseButton from '@/components/common/actions/BaseButton.vue';
import BaseInput from '@/components/common/forms/BaseInput.vue';
import BaseDropdown from '@/components/common/forms/BaseDropdown.vue';
import CloseButton from '@/components/common/actions/CloseButton.vue';
import BaseError from '@/components/common/feedback/BaseError.vue';
import { useBodyScrollLock } from '@/composables/useBodyScrollLock';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  typeOptions: {
  type: Array,
  default: () => [],
},
});

const emit = defineEmits(['close', 'submit']);

const MAX_TEXT_LEN = 1200;

const form = reactive({
  entreprise: '',
  localisation: '',
  technologiesText: '',
  description: '',
  type: '',
});

const errors = reactive({
  entreprise: '',
  localisation: '',
  technologiesText: '',
  description: '',
  type: '',
});

const typeOptions = computed(() =>
  props.typeOptions?.length
    ? props.typeOptions
    : ['stage', 'emploi', 'freelance', 'alternance']
);

const textareaElem = ref(null);
const formBodyRef = ref(null);

const technologies = computed(() =>
  form.technologiesText
    .split(',')
    .map(tech => tech.trim())
    .filter(Boolean)
);

function resetErrors() {
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });
}

function resetForm() {
  form.entreprise = '';
  form.localisation = '';
  form.technologiesText = '';
  form.description = '';
  form.type = '';
  resetErrors();
}

function resizeTextarea() {
  if (!textareaElem.value) return;

  textareaElem.value.style.height = 'auto';
  textareaElem.value.style.height = `${textareaElem.value.scrollHeight}px`;
}

async function scrollToFirstError() {
  await nextTick();

  const firstErrorKey = Object.keys(errors).find(key => errors[key]);
  const formBody = formBodyRef.value;
  if (!firstErrorKey || !formBody) return;

  const field = formBody.querySelector(`[data-error-field="${firstErrorKey}"]`);
  const focusTarget = field?.querySelector('input, textarea, button, [tabindex]:not([tabindex="-1"])');

  focusTarget?.focus?.({ preventScroll: false });
}

function submitOffer() {
  resetErrors();

  const trimmedEntreprise = form.entreprise.trim();
  const trimmedLocalisation = form.localisation.trim();
  const trimmedDescription = form.description.trim();

  if (!trimmedEntreprise) errors.entreprise = 'Company name is required';
  if (!trimmedLocalisation) errors.localisation = 'Location is required';
  if (!form.type) errors.type = 'Offer type is required';

  if (!technologies.value.length) {
    errors.technologiesText = 'At least one technology is required';
  }

  if (trimmedDescription.length < 20) {
    errors.description = 'Description must be at least 20 characters';
  } else if (trimmedDescription.length > MAX_TEXT_LEN) {
    errors.description = `Description must be ${MAX_TEXT_LEN} characters or fewer`;
  }

  if (Object.values(errors).some(Boolean)) {
    scrollToFirstError();
    return;
  }

  emit('submit', {
    entreprise: trimmedEntreprise,
    localisation: trimmedLocalisation,
    technologies: technologies.value,
    description: trimmedDescription,
    type: form.type,
  });
}

watch(
  () => props.open,
  async (open) => {
    if (!open) return;

    resetForm();

    await nextTick();
    resizeTextarea();
  }
);

useBodyScrollLock(() => props.open);
</script>

<template>
  <Transition name="pop-up">
    <div
      v-if="open"
      class="modal-overlay"
      @click.self="emit('close')"
    >
      <div class="modal-card">
        <div class="modal-card__header">
          <h2>Publish a new offer</h2>

          <div class="close-button">
            <CloseButton
              size="lg"
              @click="emit('close')"
            />
          </div>
        </div>

        <form
          class="experience-form"
          @submit.prevent="submitOffer"
        >
          <div
            ref="formBodyRef"
            class="experience-form__body"
          >
            <div class="field" data-error-field="entreprise">
              <BaseInput
                v-model="form.entreprise"
                label="Company"
                placeholder="Enter company name"
              />

              <BaseError v-if="errors.entreprise" variant="field">
                {{ errors.entreprise }}
              </BaseError>
            </div>

            <div class="field" data-error-field="localisation">
              <BaseInput
                v-model="form.localisation"
                label="Location"
                placeholder="Tangier, Casablanca, Remote..."
              />

              <BaseError v-if="errors.localisation" variant="field">
                {{ errors.localisation }}
              </BaseError>
            </div>

            <div class="field" data-error-field="type">
              <BaseDropdown
                v-model="form.type"
                :options="typeOptions"
                label="Offer type"
                placeholder="Select offer type"
                autocomplete="nope"
              />

              <BaseError v-if="errors.type" variant="field">
                {{ errors.type }}
              </BaseError>
            </div>

            <div class="field" data-error-field="technologiesText">
              <BaseInput
                v-model="form.technologiesText"
                label="Technologies"
                placeholder="Vue.js, Node.js, PostgreSQL..."
              />

              <p class="helper-text">
                Separate technologies with commas.
              </p>

              <BaseError v-if="errors.technologiesText" variant="field">
                {{ errors.technologiesText }}
              </BaseError>

              <div v-if="technologies.length" class="tags">
                <span
                  v-for="tech in technologies"
                  :key="tech"
                  class="tag"
                >
                  {{ tech }}
                </span>
              </div>
            </div>

            <div class="field" data-error-field="description">
              <div class="form-group-textarea">
                <label for="description">Description</label>

                <textarea
                  id="description"
                  ref="textareaElem"
                  v-model="form.description"
                  placeholder="Describe the offer, missions, required skills, and profile..."
                  :maxlength="MAX_TEXT_LEN"
                  @input="resizeTextarea"
                />

                <div class="textarea-meta">
                  <BaseError v-if="errors.description" variant="field">
                    {{ errors.description }}
                  </BaseError>

                  <span class="textarea-counter">
                    {{ form.description.length }}/{{ MAX_TEXT_LEN }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="experience-form__footer">
            <div></div>

            <div class="experience-form__footer-actions">
              <BaseButton
                type="button"
                variant="ghost"
                :disabled="loading"
                @click="emit('close')"
              >
                Cancel
              </BaseButton>

              <BaseButton
                type="submit"
                variant="submit"
                :loading="loading"
              >
                Publish offer
              </BaseButton>
            </div>
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
  -webkit-backdrop-filter: blur(3px);
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  padding: var(--space-sm);
  box-sizing: border-box;
}

.modal-card {
  --modal-edge-space: var(--space-lg);
  --modal-field-gap: var(--space-lg);

  --modal-inner-gap: 4px;  --modal-inner-gap: 4px;
  --scrollbar-width: 10px;

  position: relative;
  display: flex;
  flex-direction: column;
  width: clamp(34rem, 42vw, 46rem);
  max-width: 100vw;
  background-color: var(--color-background);
  height: 100%;
  border-radius: var(--radius-md);
  margin: 0;
  overflow: hidden;
}

.experience-form__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: visible;
  scroll-behavior: smooth;
  display: grid;
  align-content: start;
  gap: var(--modal-field-gap);
  padding: var(--modal-edge-space);
  padding-bottom: calc(var(--modal-edge-space) + 2rem);
}

.field {
  display: grid;
  gap: var(--modal-inner-gap);
  position: relative;
}

.field[data-error-field="type"] {
  z-index: 50;
}

.field[data-error-field="type"] :deep(.dropdown-menu),
.field[data-error-field="type"] :deep(.base-dropdown__menu),
.field[data-error-field="type"] :deep(.dropdown__menu),
.field[data-error-field="type"] :deep([role="listbox"]) {
  margin-top: 4px !important;
  transform: none !important;
}

.modal-card__header {
  position: sticky;
  top: 0;
  z-index: 10;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--modal-edge-space);
  background-color: var(--color-background);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.12);
}

.modal-card__header h2 {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.2rem;
  line-height: 1.2;
}

.close-button {
  display: inline-flex;
  flex-shrink: 0;
}

.experience-form {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.experience-form__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scroll-behavior: smooth;
  display: grid;
  gap: var(--modal-field-gap);
  padding: var(--modal-edge-space);
}

.field {
  display: grid;
  gap: var(--modal-inner-gap);
}

.form-group-textarea {
  display: grid;
  gap: var(--modal-inner-gap);
}

.form-group-textarea label {
  font-size: var(--font-size-xs);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: var(--font-medium);
  color: var(--color-primary-hover);
}

textarea {
  width: 100%;
  min-height: 140px;
  resize: none;
  border: 1px solid rgba(var(--color-primary-rgb), 0.18);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  background: rgba(var(--color-surface-rgb), 0.32);
  color: var(--color-primary);
  font-family: var(--font-ui);
  font-size: var(--font-size-md);
  overflow: hidden;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

textarea:focus {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.15);
}

.textarea-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  min-height: 1rem;
}

.textarea-counter {
  color: var(--color-primary-hover);
  font-size: var(--font-size-xxs);
  margin-left: auto;
  white-space: nowrap;
}

.helper-text {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-xxs);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(var(--color-primary-rgb), 0.05);
  color: var(--color-primary-hover);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
}

.experience-form__footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  gap: var(--space-sm);
  padding: var(--space-md) var(--modal-edge-space);
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.12);
}

.experience-form__footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
}

.pop-up-enter-from,
.pop-up-leave-to {
  opacity: 0;
}

.pop-up-enter-active,
.pop-up-leave-active {
  transition: opacity var(--transition-normal);
}

.pop-up-enter-from .modal-card,
.pop-up-leave-to .modal-card {
  transform: scale(0.97);
}

.pop-up-enter-active .modal-card,
.pop-up-leave-active .modal-card {
  transition: transform 0.4s var(--ease-overshoot);
}

.pop-up-enter-to .modal-card,
.pop-up-leave-from .modal-card {
  transform: scale(1);
}

@media (max-width: 980px) {
  .modal-card {
    margin-inline: auto;
  }
}

@media (max-width: 480px) {
  .modal-card {
    width: 100%;
    max-width: none;
    margin-inline: 0;
    align-self: flex-end;
    height: 70vh;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }
}
</style>