<script setup>
import { computed, ref, watch } from 'vue';

import FeedModalShell from '@/components/feed/FeedModalShell.vue';
import BaseError from '@/components/common/feedback/BaseError.vue';

const props = defineProps({
  offer: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['close', 'submit', 'clear-error']);

const message = ref('');
const error = ref('');

const modalTitle = computed(() => {
  return props.offer ? `Apply to ${props.offer.title}` : 'Apply to offer';
});

const modalDescription = computed(() => {
  if (!props.offer) return '';

  return [props.offer.company, props.offer.location].filter(Boolean).join(' - ');
});

const isSubmitDisabled = computed(() => {
  return props.loading || !message.value.trim();
});

const visibleError = computed(() => props.errorMessage || error.value);

watch(
  () => props.offer,
  (offer) => {
    if (!offer) {
      message.value = '';
      error.value = '';
    }
  }
);

function handleSubmit() {
  const trimmedMessage = message.value.trim();

  if (!trimmedMessage) {
    error.value = 'Please write an application message.';
    return;
  }

  if (trimmedMessage.length < 20) {
    error.value = 'Application message must be at least 20 characters.';
    return;
  }

  if (!props.offer) return;

  emit('submit', {
    offerId: props.offer.id,
    offerTitle: props.offer.title,
    company: props.offer.company,
    message: trimmedMessage,
  });

  error.value = '';
}
</script>

<template>
  <FeedModalShell
    :open="!!offer"
    :title="modalTitle"
    :description="modalDescription"
    size="md"
    @close="emit('close')"
  >
    <div class="apply-modal-content">
      <p class="apply-helper">
        This message will be prepared for the recruiter reviewing this offer.
      </p>

      <label class="message-field">
        <span>Application message</span>

        <textarea
          v-model="message"
          rows="7"
          minlength="20"
          :disabled="loading"
          @input="error = ''; emit('clear-error')"
        />
      </label>

      <p class="message-hint">
        Introduce yourself and explain why you are interested. Minimum 20 characters.
      </p>

      <BaseError
        v-if="visibleError"
        variant="field"
      >
        {{ visibleError }}
      </BaseError>
    </div>

    <template #footer>
      <button
        type="button"
        class="feed-modal-button feed-modal-button--secondary"
        :disabled="loading"
        @click="emit('close')"
      >
        Cancel
      </button>

      <button
        type="button"
        class="feed-modal-button feed-modal-button--primary"
        :disabled="isSubmitDisabled"
        @click="handleSubmit"
      >
        Send application
      </button>
    </template>
  </FeedModalShell>
</template>

<style scoped>
.apply-modal-content {
  display: grid;
  gap: var(--space-md);
}

.apply-helper,
.message-hint {
  margin: 0;
  font-size: var(--font-size-xs);
  line-height: 1.55;
}

.apply-helper {
  color: rgba(var(--color-primary-rgb), 0.64);
}

.message-field {
  display: grid;
  gap: var(--space-xs);
}

.message-field span {
  color: rgba(var(--color-primary-rgb), 0.82);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
}

.message-field textarea {
  width: 100%;
  min-height: 9rem;
  resize: vertical;
  border: 1px solid rgba(var(--color-primary-rgb), 0.13);
  border-radius: var(--radius-md);
  background: rgba(var(--color-background-rgb), 0.72);
  color: rgba(var(--color-primary-rgb), 0.8);
  font: inherit;
  font-size: var(--font-size-xs);
  line-height: 1.55;
  outline: none;
  padding: var(--space-sm) var(--space-md);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.message-field textarea:focus {
  border-color: rgba(var(--color-secondary-rgb), 0.72);
  box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.14);
}

.message-field textarea::placeholder {
  color: rgba(var(--color-primary-rgb), 0.38);
}

.message-field textarea:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.message-hint {
  color: rgba(var(--color-primary-rgb), 0.46);
}

.feed-modal-button {
  min-height: 2.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0 var(--space-md);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    opacity var(--transition-fast),
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.feed-modal-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.feed-modal-button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
  transform: none;
  box-shadow: none;
}

.feed-modal-button--primary {
  border: 1px solid var(--color-secondary);
  background: var(--color-secondary);
  color: var(--color-background);
  box-shadow: 0 8px 16px rgba(var(--color-secondary-rgb), 0.22);
}

.feed-modal-button--primary:hover:not(:disabled) {
  border-color: rgba(var(--color-secondary-rgb), 0.92);
  background: rgba(var(--color-secondary-rgb), 0.92);
  box-shadow: 0 10px 20px rgba(var(--color-secondary-rgb), 0.28);
}

.feed-modal-button--secondary {
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.66);
}

.feed-modal-button--secondary:hover:not(:disabled) {
  border-color: rgba(var(--color-primary-rgb), 0.2);
  background: rgba(var(--color-primary-rgb), 0.04);
  color: rgba(var(--color-primary-rgb), 0.82);
}
</style>
