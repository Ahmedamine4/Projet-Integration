<script setup>
import { ref, watch } from 'vue';
import { X, Link } from 'lucide-vue-next';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  shareLink: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['close']);

const copied = ref(false);

watch(
  () => props.show,
  () => {
    copied.value = false;
  }
);

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.shareLink);
    copied.value = true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = props.shareLink;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    copied.value = true;
  }

  setTimeout(() => {
    copied.value = false;
  }, 1500);
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="share-backdrop"
      @click.self="emit('close')"
    >
      <div class="share-modal">
        <div class="share-header">
          <div>
            <h2>Share project</h2>
            <p>Copy this link to share the project.</p>
          </div>

          <button
            type="button"
            class="share-close"
            @click="emit('close')"
          >
            <X :size="16" />
          </button>
        </div>

        <div class="share-link-box">
          <Link :size="16" />

          <input
            :value="shareLink"
            readonly
            @focus="$event.target.select()"
          >

          <button
            type="button"
            @click="copyLink"
          >
            {{ copied ? 'Copied' : 'Copy link' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.share-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  padding: var(--space-lg);
  background-color: rgba(var(--color-primary-rgb), 0.28);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(10px);
  animation: fadeIn var(--transition-fast) ease-out;
}

.share-modal {
  width: min(100%, 30rem);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  background-color: rgba(var(--color-surface-rgb), 0.96);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
  animation: modalPop var(--transition-fast) ease-out;
}

.share-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.share-header h2 {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.95);
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
}

.share-header p {
  margin: var(--space-xs) 0 0;
  color: rgba(var(--color-primary-rgb), 0.55);
  font-size: var(--font-size-sm);
}

.share-close {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999px;
  background-color: rgba(var(--color-primary-rgb), 0.06);
  color: rgba(var(--color-primary-rgb), 0.65);
  cursor: pointer;
}

.share-link-box {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  background-color: rgba(var(--color-background-rgb), 0.55);
}

.share-link-box svg {
  flex-shrink: 0;
  color: rgba(var(--color-primary-rgb), 0.48);
}

.share-link-box input {
  min-width: 0;
  flex: 1;
  height: 2.25rem;
  border: none;
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.78);
  font-size: var(--font-size-xs);
  outline: none;
}

.share-link-box button {
  height: 2.25rem;
  padding: 0 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-secondary-rgb), 0.35);
  background-color: rgba(var(--color-secondary-rgb), 0.16);
  color: rgba(var(--color-primary-rgb), 0.9);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  white-space: nowrap;
  cursor: pointer;
}

.share-link-box button:hover {
  background-color: rgba(var(--color-secondary-rgb), 0.24);
}
</style>