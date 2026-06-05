<template>
  <div v-if="project" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-header">
        <div class="modal-icon">
          <Share2 :size="18" />
        </div>
        <div>
          <h2 id="modal-title" class="modal-title">Partager le projet</h2>
          <p class="modal-subtitle">Copiez ce lien pour partager le projet.</p>
        </div>
        <button class="modal-close" @click="emit('close')" aria-label="Fermer">
          <X :size="18" />
        </button>
      </div>

      <div class="modal-body">
        <div class="link-row">
          <input
            ref="inputRef"
            class="link-input"
            type="text"
            readonly
            :value="shareLink"
            @focus="$event.target.select()"
          />
          <button class="copy-btn" :class="{ copied }" @click="copyLink">
            <CheckCheck v-if="copied" :size="15" />
            <Copy v-else :size="15" />
            <span>{{ copied ? 'Copié !' : 'Copier le lien' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Share2, X, Copy, CheckCheck } from 'lucide-vue-next';

const props = defineProps({
  project: { type: Object, default: null },
});

const emit = defineEmits(['close']);

const inputRef = ref(null);
const copied = ref(false);

const shareLink = computed(() => {
  if (!props.project) return '';
  return props.project.shareUrl || `${window.location.origin}/projects/${props.project.id}`;
});

async function copyLink() {
  const text = shareLink.value;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2200);
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
}

.modal-box {
  background: rgba(var(--color-surface-rgb), 1);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  border-radius: var(--radius-lg);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
  width: 100%;
  max-width: 440px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-md) var(--space-sm);
}

.modal-icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  background: rgba(var(--color-secondary-rgb), 0.12);
  color: rgba(var(--color-secondary-rgb), 1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-title {
  margin: 0 0 3px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-bold);
  color: rgba(var(--color-primary-rgb), 0.9);
}

.modal-subtitle {
  margin: 0;
  font-size: var(--font-size-xs);
  color: rgba(var(--color-primary-rgb), 0.5);
}

.modal-close {
  margin-left: auto;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.4);
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.modal-close:hover {
  background: rgba(var(--color-primary-rgb), 0.07);
  color: rgba(var(--color-primary-rgb), 0.75);
}

.modal-body {
  padding: 0 var(--space-md) var(--space-md);
}

.link-row {
  display: flex;
  gap: 8px;
}

.link-input {
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  background: rgba(var(--color-background-rgb), 0.7);
  font-size: var(--font-size-xs);
  color: rgba(var(--color-primary-rgb), 0.7);
  outline: none;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  border: none;
  background: rgba(var(--color-secondary-rgb), 1);
  color: #fff;
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);
  cursor: pointer;
  white-space: nowrap;
  transition: opacity var(--transition-fast), background var(--transition-normal);
  flex-shrink: 0;
}

.copy-btn:hover {
  opacity: 0.88;
}

.copy-btn.copied {
  background: #16a34a;
}

@media (max-width: 480px) {
  .link-row {
    flex-direction: column;
  }
  .copy-btn {
    justify-content: center;
  }
}
</style>