<script setup>
import { computed, ref, watch } from 'vue';
import { CheckCheck, Copy, Link2, X } from 'lucide-vue-next';

const props = defineProps({
  project: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close']);

const copied = ref(false);

const shareLink = computed(() => {
  if (!props.project) return '';

  if (props.project.shareUrl) {
    return props.project.shareUrl;
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const projectId = props.project.id || props.project.projet_id || props.project.project_id;

  return `${origin}/projects/${projectId}`;
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
  <Teleport to="body">
    <div
      v-if="project"
      class="share-overlay"
    >
      <div class="share-modal">
        <button
          type="button"
          class="share-close-button"
          @click="emit('close')"
        >
          <X :size="18" />
        </button>

        <h2 class="share-title">
          Share project
        </h2>

        <p class="share-description">
          Copy this link to share the project.
        </p>

        <div class="share-link-box">
          <Link2
            class="share-link-icon"
            :size="20"
          />

          <input
            class="share-link-input"
            type="text"
            readonly
            :value="shareLink"
            @focus="$event.target.select()"
          >

          <button
            type="button"
            class="share-copy-button"
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
        </div>

        <p
          v-if="copied"
          class="copied-message"
        >
          Link copied successfully.
        </p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.share-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 24px;

  background: rgba(20, 20, 20, 0.28);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.share-modal {
  position: relative;

  width: 100%;
  max-width: 600px;

  padding: 2rem 1.9rem 1.9rem;

  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: 24px;

  background: #f4f1e9;

  box-shadow:
    0 24px 60px rgba(var(--color-primary-rgb), 0.16),
    0 1px 0 rgba(255, 255, 255, 0.8) inset;

  animation: shareModalPop 0.18s ease-out;
}

.share-close-button {
  position: absolute;
  top: 1.9rem;
  right: 1.9rem;

  width: 2.7rem;
  height: 2.7rem;

  border: none;
  border-radius: 999px;

  background: rgba(var(--color-primary-rgb), 0.06);
  color: rgba(var(--color-primary-rgb), 0.55);

  display: inline-flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  transition:
    background var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
}

.share-close-button:hover {
  background: rgba(249, 115, 22, 0.12);
  color: #f97316;
  transform: rotate(90deg);
}

.share-title {
  margin: 0;
  padding-right: 3.5rem;

  color: var(--color-primary);
  font-size: 1.55rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.share-description {
  margin: 0.35rem 0 1.8rem;

  color: rgba(var(--color-primary-rgb), 0.58);
  font-size: 1rem;
  line-height: 1.45;
}

.share-link-box {
  width: 100%;
  min-height: 4.25rem;

  display: flex;
  align-items: center;
  gap: 0.75rem;

  padding: 0.65rem 0.7rem 0.65rem 1rem;

  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  border-radius: 16px;

  background: rgba(255, 255, 255, 0.55);
}

.share-link-icon {
  flex: 0 0 auto;
  color: rgba(var(--color-primary-rgb), 0.5);
}

.share-link-input {
  flex: 1;
  min-width: 0;

  border: none;
  outline: none;
  background: transparent;

  color: rgba(var(--color-primary-rgb), 0.72);
  font: inherit;
  font-size: 0.95rem;
}

.share-copy-button {
  flex: 0 0 auto;

  min-height: 2.7rem;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;

  padding: 0 1rem;

  border: 1px solid #fb923c;
  border-radius: 999px;

  background: #ffedd5;
  color: var(--color-primary);

  font-size: 0.82rem;
  font-weight: 800;

  cursor: pointer;

  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.share-copy-button:hover {
  background: #fed7aa;
  border-color: #f97316;
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(249, 115, 22, 0.16);
}

.share-copy-button.is-copied {
  border-color: #22c55e;
  background: #dcfce7;
  color: #15803d;
}

.copied-message {
  margin: 0.85rem 0 0;

  color: #15803d;
  font-size: 0.85rem;
  font-weight: 700;
}

@keyframes shareModalPop {
  from {
    opacity: 0;
    transform: scale(0.97) translateY(8px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@media (max-width: 640px) {
  .share-modal {
    max-width: 100%;
    padding: 1.7rem 1.25rem 1.25rem;
  }

  .share-close-button {
    top: 1.25rem;
    right: 1.25rem;
  }

  .share-link-box {
    flex-wrap: wrap;
  }

  .share-copy-button {
    width: 100%;
  }
}
</style>