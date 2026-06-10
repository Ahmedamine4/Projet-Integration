<script setup>
import { onBeforeUnmount, watch } from 'vue';
import CloseButton from '@/components/common/actions/CloseButton.vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
});

const emit = defineEmits(['close']);

function handleEscape(event) {
  if (event.key === 'Escape' && props.open) {
    emit('close');
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    } else {
      window.removeEventListener('keydown', handleEscape);
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="pop-up">
      <div
        v-if="open"
        class="modal-overlay"
        @click.self="emit('close')"
      >
        <article
          class="modal-card"
          :class="`modal-card--${size}`"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          @click.stop
        >
          <header class="modal-card__header">
            <div class="modal-card__heading">
              <h2 v-if="title">
                {{ title }}
              </h2>

              <p v-if="description">
                {{ description }}
              </p>
            </div>

            <div class="close-button">
              <CloseButton
                size="lg"
                @click="emit('close')"
              />
            </div>
          </header>

          <section class="modal-card__body">
            <slot />
          </section>

          <footer
            v-if="$slots.footer"
            class="modal-card__footer"
          >
            <slot name="footer" />
          </footer>
        </article>
      </div>
    </Transition>
  </Teleport>
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
  align-items: center;
}

.modal-card {
  --modal-edge-space: var(--space-lg);
  --modal-field-gap: var(--space-md);
  --scrollbar-width: 10px;

  position: relative;
  display: flex;
  flex-direction: column;
  width: clamp(34rem, 42vw, 46rem);
  max-width: 100vw;
  height: calc(100vh - 2 * var(--space-sm));
  margin-inline: var(--space-sm);
  overflow: hidden;
  border-radius: var(--radius-md);
  background-color: var(--color-background);
  box-shadow: 0 24px 60px rgba(var(--color-primary-rgb), 0.18);
}

.modal-card--sm {
  width: clamp(28rem, 34vw, 36rem);
}

.modal-card--md {
  width: clamp(34rem, 42vw, 46rem);
}

.modal-card--lg {
  width: clamp(42rem, 54vw, 58rem);
}

.modal-card__header {
  position: sticky;
  top: 0;
  z-index: 10;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--modal-edge-space);
  background-color: var(--color-background);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.12);
}

.modal-card__header::after {
  content: '';
  position: absolute;
  left: 0;
  right: var(--scrollbar-width);
  top: 100%;
  height: 24px;
  pointer-events: none;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  mask-image: linear-gradient(
    to bottom,
    black 0%,
    black 20%,
    rgba(0, 0, 0, 0.65) 55%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    black 0%,
    black 20%,
    rgba(0, 0, 0, 0.65) 55%,
    transparent 100%
  );
}

.modal-card__heading {
  min-width: 0;
}

.modal-card__heading h2 {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.2rem;
  line-height: 1.2;
  font-weight: var(--font-bold);
}

.modal-card__heading p {
  max-width: 34rem;
  margin: var(--space-xs) 0 0;
  color: rgba(var(--color-primary-rgb), 0.56);
  font-size: var(--font-size-xs);
  line-height: 1.45;
}

.close-button {
  display: inline-flex;
  flex-shrink: 0;
}

.modal-card__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: grid;
  gap: var(--modal-field-gap);
  padding: var(--modal-edge-space);
}

.modal-card__footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding: var(--space-md) var(--modal-edge-space);
  background-color: var(--color-background);
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.12);
}

.modal-card__footer::before {
  content: '';
  position: absolute;
  left: 0;
  right: var(--scrollbar-width);
  bottom: 100%;
  height: 24px;
  pointer-events: none;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  mask-image: linear-gradient(
    to top,
    black 0%,
    black 20%,
    rgba(0, 0, 0, 0.65) 55%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to top,
    black 0%,
    black 20%,
    rgba(0, 0, 0, 0.65) 55%,
    transparent 100%
  );
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
  .modal-overlay {
    justify-content: center;
  }

  .modal-card {
    margin-inline: auto;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    align-items: flex-end;
  }

  .modal-card,
  .modal-card--sm,
  .modal-card--md,
  .modal-card--lg {
    width: 100%;
    max-width: none;
    height: 70vh;
    margin-inline: 0;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }

  .modal-card__header,
  .modal-card__body,
  .modal-card__footer {
    padding-inline: var(--space-md);
  }

  .modal-card__footer {
    flex-direction: column-reverse;
  }
}
</style>