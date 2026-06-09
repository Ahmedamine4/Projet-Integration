<script setup>
import { computed, ref, watch } from 'vue';
import { CheckCheck, Copy } from 'lucide-vue-next';

import FeedModalShell from '@/components/feed/FeedModalShell.vue';

const props = defineProps({
  project: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close']);

const inputRef = ref(null);
const copied = ref(false);

const shareLink = computed(() => {
  if (!props.project) return '';

  if (props.project.shareUrl) {
    return props.project.shareUrl;
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return `${origin}/projects/${props.project.id}`;
});

watch(
  () => props.project,
  () => {
    copied.value = false;
  }
);

async function copyLink() {
  const text = shareLink.value;

  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  copied.value = true;

  window.setTimeout(() => {
    copied.value = false;
  }, 2200);
}
</script>

<template>
  <FeedModalShell
    :open="!!project"
    title="Share project"
    description="Copy this link to share the project."
    size="sm"
    @close="emit('close')"
  >
    <div class="share-modal-content">
      <input
        ref="inputRef"
        class="share-link-input"
        type="text"
        readonly
        :value="shareLink"
        @focus="$event.target.select()"
      >

      <p
        v-if="copied"
        class="copied-message"
      >
        Copied
      </p>
    </div>

    <template #footer>
      <button
        type="button"
        class="feed-modal-button feed-modal-button--secondary"
        @click="emit('close')"
      >
        Close
      </button>

      <button
        type="button"
        class="feed-modal-button feed-modal-button--primary"
        :class="{ 'is-copied': copied }"
        @click="copyLink"
      >
        <CheckCheck
          v-if="copied"
          :size="15"
        />
        <Copy
          v-else
          :size="15"
        />
        <span>{{ copied ? 'Copied' : 'Copy link' }}</span>
      </button>
    </template>
  </FeedModalShell>
</template>

<style scoped>
.share-modal-content {
  display: grid;
  gap: var(--space-sm);
}

.share-link-input {
  width: 100%;
  min-width: 0;
  padding: 0.65rem 0.8rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(var(--color-primary-rgb), 0.13);
  background: rgba(var(--color-background-rgb), 0.72);
  color: rgba(var(--color-primary-rgb), 0.72);
  font: inherit;
  font-size: var(--font-size-xs);
  outline: none;
}

.share-link-input:focus {
  border-color: rgba(var(--color-primary-rgb), 0.28);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.08);
}

.copied-message {
  margin: 0;
  color: #15803d;
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
}

.feed-modal-button {
  min-height: 2.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-radius: 999px;
  padding: 0 var(--space-md);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    opacity var(--transition-fast),
    transform var(--transition-fast);
}

.feed-modal-button:hover {
  transform: translateY(-1px);
}

.feed-modal-button--primary {
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: var(--color-background);
}

.feed-modal-button--primary.is-copied {
  border-color: #15803d;
  background: #15803d;
}

.feed-modal-button--secondary {
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.66);
}
</style>
