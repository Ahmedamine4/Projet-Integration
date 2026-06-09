<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import BaseButton from '@/components/common/actions/BaseButton.vue';
import CloseButton from '@/components/common/actions/CloseButton.vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  portfolioOwnerName: {
    type: String,
    default: 'this portfolio',
  },
  recommenderName: {
    type: String,
    default: '',
  },
  recommenderRole: {
    type: String,
    default: 'Portfolio recommendation',
  },
});

const emit = defineEmits(['close', 'submit']);

const form = reactive({
  content: '',
});

const errors = reactive({
  content: '',
});

const textareaElem = ref(null);
const trimmedContent = computed(() => form.content.trim());
const canSubmit = computed(() => trimmedContent.value.length >= 40);
let previousBodyOverflow = '';

function resizeTextarea() {
  const textarea = textareaElem.value;
  if (!textarea) return;

  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function resetForm() {
  form.content = '';
  errors.content = '';
  nextTick(resizeTextarea);
}

function validate() {
  errors.content = trimmedContent.value.length >= 40 ? '' : 'Write at least 40 characters.';

  return !errors.content;
}

function closeModal() {
  emit('close');
}

function submitRecommendation() {
  if (!validate()) return;

  emit('submit', {
    content: trimmedContent.value,
  });

  resetForm();
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      nextTick(resizeTextarea);
      return;
    }

    resetForm();
    document.body.style.overflow = previousBodyOverflow;
  }
);

onMounted(() => {
  window.addEventListener('resize', resizeTextarea);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeTextarea);
  document.body.style.overflow = previousBodyOverflow;
});
</script>

<template>
  <Teleport to="body">
    <Transition name="pop-up">
      <div
        v-if="open"
        class="modal-overlay"
        @click.self="closeModal"
      >
        <section
          class="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="recommendation-modal-title"
        >
          <header class="modal__header">
            <div class="close-button">
              <CloseButton @click="closeModal" />
            </div>
            <h3 id="recommendation-modal-title">
              Recommend {{ portfolioOwnerName }}
            </h3>
          </header>

          <form
            class="recommendation-form"
            @submit.prevent="submitRecommendation"
          >
            <div class="modal__body">
              <label class="recommendation-field">
                <span>Recommendation</span>
                <textarea
                  ref="textareaElem"
                  v-model="form.content"
                  rows="7"
                  maxlength="300"
                  placeholder="Share what makes their work, skills, or collaboration stand out."
                  @input="resizeTextarea"
                />
                <small
                  class="recommendation-counter"
                  :class="{ 'recommendation-counter--error': errors.content }"
                >
                  {{ errors.content || `${trimmedContent.length}/300` }}
                </small>
              </label>
              <span>{{ recommenderName }} · {{ recommenderRole }}</span>
            </div>

            <footer class="modal__footer">
              <BaseButton
                variant="button"
                type="button"
                @click="closeModal"
              >
                Cancel
              </BaseButton>
              <BaseButton
                variant="submit"
                type="submit"
                :disabled="!canSubmit"
              >
                Submit
              </BaseButton>
            </footer>
          </form>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  background: rgba(var(--color-primary-rgb), 0.3);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal {
  display: flex;
  flex-direction: column;
  width: min(36rem, 100%);
  max-height: min(38rem, 90vh);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-md);
  background: var(--color-background);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.modal__header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.close-button {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
}

.modal__header > h3 {
  margin: 0;
  color: var(--color-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-medium);
  line-height: 1.2;
}

.recommendation-form {
  display: contents;
}

.modal__body {
  display: grid;
  gap: var(--space-md);
  min-height: 16rem;
  padding: 0.75rem 1.8rem;
  overflow: auto;
}

.recommendation-field {
  display: grid;
  gap: var(--space-sm);
}

.recommendation-field span {
  color: rgba(var(--color-primary-rgb), 0.72);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
}

.recommendation-field textarea {
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  border: 1px solid rgba(var(--color-primary-rgb), 0.14);
  border-radius: var(--radius-md);
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.32),
      rgba(255, 255, 255, 0)
    ),
    color-mix(in srgb, var(--color-surface) 18%, var(--color-background));
  color: var(--color-primary);
  font: inherit;
  font-size: var(--font-size-sm);
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: normal;
  word-break: normal;
  outline: none;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 1px 2px rgba(0, 0, 0, 0.04);
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.recommendation-field textarea {
  min-height: 11rem;
  overflow: hidden;
  overflow-x: hidden;
  resize: none;
  padding: 1rem 1.05rem;
}

.recommendation-field textarea::placeholder {
  color: rgba(var(--color-primary-rgb), 0.42);
}

.recommendation-field textarea:hover {
  border-color: rgba(var(--color-primary-rgb), 0.24);
}

.recommendation-field textarea:focus {
  border-color: var(--color-secondary);
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.42),
      rgba(255, 255, 255, 0)
    ),
    color-mix(in srgb, var(--color-surface) 12%, var(--color-background));
  box-shadow:
    0 0 0 3px rgba(var(--color-secondary-rgb), 0.14),
    0 10px 22px rgba(0, 0, 0, 0.06);
}

.recommendation-field small,
.modal__body > span {
  color: rgba(var(--color-primary-rgb), 0.55);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
}

.recommendation-counter {
  justify-self: end;
}

.recommendation-counter--error {
  color: var(--color-error);
}

.modal__footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.08);
  background-color: var(--color-background);
}

.pop-up-enter-from,
.pop-up-leave-to {
  opacity: 0;
}

.pop-up-enter-active,
.pop-up-leave-active {
  transition: opacity var(--transition-normal);
}

.pop-up-enter-to,
.pop-up-leave-from {
  opacity: 1;
}

.pop-up-enter-from .modal,
.pop-up-leave-to .modal {
  transform: scale(0.97);
}

.pop-up-enter-active .modal,
.pop-up-leave-active .modal {
  transition: transform 0.4s var(--ease-overshoot);
}

.pop-up-enter-to .modal,
.pop-up-leave-from .modal {
  transform: scale(1);
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
  }

  .modal {
    width: 100%;
    align-self: end;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }
}

@media (max-width: 480px) {
  .modal__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
