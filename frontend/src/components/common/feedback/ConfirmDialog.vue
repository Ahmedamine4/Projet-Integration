<script setup>
/**
 * ConfirmDialog — enhanced with a `variant` prop
 * ─────────────────────────────────────────────────────────────────
 * variant: 'danger'  → red  (delete / block)      [default]
 *          'warning' → orange (promote, reassign)
 *          'info'    → blue  (neutral confirmations)
 */
import { computed } from 'vue';
import { AlertTriangle, AlertCircle, ShieldAlert, UserPlus } from 'lucide-vue-next';
import BaseButton from '@/components/common/actions/BaseButton.vue';
import CloseButton from '@/components/common/actions/CloseButton.vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  /** 'danger' | 'warning' | 'info' */
  variant: {
    type: String,
    default: 'danger',
    validator: (v) => ['danger', 'warning', 'info'].includes(v),
  },
  title: {
    type: String,
    default: 'Confirm action',
  },
  message: {
    type: String,
    default: 'Are you sure you want to continue?',
  },
  confirmText: {
    type: String,
    default: 'Confirm',
  },
  cancelText: {
    type: String,
    default: 'Cancel',
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['cancel', 'confirm']);

// Pick icon per variant
const icon = computed(() => ({
  danger:  ShieldAlert,
  warning: UserPlus,
  info:    AlertCircle,
}[props.variant] ?? AlertTriangle));
</script>

<template>
  <Transition name="confirm-dialog">
    <div
      v-if="open"
      class="confirm-dialog"
      @click.self="emit('cancel')"
    >
      <section class="confirm-dialog__panel" :class="`panel--${variant}`">

        <!-- decorative top stripe -->
        <div class="panel__stripe" :class="`stripe--${variant}`" />

        <header class="confirm-dialog__header">
          <span class="confirm-dialog__icon" :class="`icon--${variant}`">
            <component :is="icon" :size="22" />
          </span>
          <div>
            <h2>{{ title }}</h2>
            <p>{{ message }}</p>
          </div>
          <CloseButton
            class="confirm-dialog__close"
            @click="emit('cancel')"
          />
        </header>

        <footer class="confirm-dialog__footer">
          <BaseButton
            type="button"
            variant="ghost"
            size="sm"
            :disabled="loading"
            @click="emit('cancel')"
          >
            {{ cancelText }}
          </BaseButton>
          <button
            type="button"
            class="btn-confirm"
            :class="`btn-confirm--${variant}`"
            :disabled="loading"
            @click="emit('confirm')"
          >
            <span v-if="loading" class="btn-confirm__spinner" />
            <component v-else :is="icon" :size="13" />
            {{ confirmText }}
          </button>
        </footer>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
/* ── Overlay ── */
.confirm-dialog {
  position: fixed;
  inset: 0;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(var(--color-primary-rgb), 0.32);
  backdrop-filter: blur(6px);
}

/* ── Panel ── */
.confirm-dialog__panel {
  position: relative;
  width: min(100%, 26rem);
  border-radius: 1rem;
  background: var(--color-background);
  box-shadow: 0 2rem 5rem rgba(var(--color-primary-rgb), 0.26);
  overflow: hidden;
}

/* coloured top stripe */
.panel__stripe {
  height: 4px;
  width: 100%;
}
.stripe--danger  { background: linear-gradient(90deg, #ef4444, #dc2626); }
.stripe--warning {
  background: linear-gradient(90deg, #f97316, #fb923c, #fbbf24);
  background-size: 200% 100%;
  animation: stripe-slide 2.5s linear infinite;
}
.stripe--info    { background: linear-gradient(90deg, #3b82f6, #2563eb); }

@keyframes stripe-slide {
  0%   { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
}

/* inner padding starts below stripe */
.confirm-dialog__header {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.85rem;
  align-items: flex-start;
  padding: 1.15rem 1.15rem 0;
}

/* ── Icon circle ── */
.confirm-dialog__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}
.icon--danger  { background: rgba(239, 68,  68,  0.12); color: #dc2626; }
.icon--warning { background: rgba(249, 115, 22,  0.12); color: #ea580c; }
.icon--info    { background: rgba(59,  130, 246, 0.12); color: #2563eb; }

.confirm-dialog__header h2 {
  margin: 0;
  color: var(--color-primary);
  font-size: var(--font-size-md);
  font-weight: 700;
  line-height: 1.25;
}

.confirm-dialog__header p {
  margin: 0.35rem 0 0;
  color: color-mix(in srgb, var(--color-primary) 65%, transparent);
  font-size: var(--font-size-sm);
  line-height: 1.55;
}

.confirm-dialog__close {
  margin-top: 0.1rem;
}

/* ── Footer ── */
.confirm-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 1.1rem 1.15rem 1.15rem;
  margin-top: 0.5rem;
}

/* custom confirm button */
.btn-confirm {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border: none;
  border-radius: 0.75rem;
  font-size: var(--font-size-sm);
  font-family: var(--font-ui);
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: filter var(--transition-fast), transform var(--transition-fast);
}
.btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-confirm:not(:disabled):hover { filter: brightness(0.92); transform: translateY(-1px); }
.btn-confirm:not(:disabled):active { transform: translateY(0); }

.btn-confirm--danger  { background: #dc2626; box-shadow: 0 6px 18px rgba(220,38,38,0.28); }
.btn-confirm--warning {
  background: linear-gradient(135deg, #f97316, #fb923c);
  box-shadow: 0 6px 18px rgba(249,115,22,0.32);
}
.btn-confirm--info    { background: #2563eb; box-shadow: 0 6px 18px rgba(37,99,235,0.28); }

/* spinner inside button */
.btn-confirm__spinner {
  width: 13px;
  height: 13px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Transition ── */
.confirm-dialog-enter-active,
.confirm-dialog-leave-active { transition: opacity 0.18s ease; }

.confirm-dialog-enter-active .confirm-dialog__panel,
.confirm-dialog-leave-active .confirm-dialog__panel {
  transition: transform 0.18s ease, opacity 0.18s ease;
}

.confirm-dialog-enter-from,
.confirm-dialog-leave-to { opacity: 0; }

.confirm-dialog-enter-from .confirm-dialog__panel,
.confirm-dialog-leave-to  .confirm-dialog__panel {
  opacity: 0;
  transform: translateY(-0.5rem) scale(0.97);
}

@media (max-width: 480px) {
  .confirm-dialog__panel { width: 100%; }
}
</style>
