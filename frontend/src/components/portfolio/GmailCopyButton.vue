<script setup>
import { ref } from 'vue';
import { Copy } from 'lucide-vue-next';

const props = defineProps({
  email: {
    type: String,
    required: true,
  },
});

const copied = ref(false);

function copyEmail() {
  navigator.clipboard.writeText(props.email);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>

<template>
  <button class="gmail-btn" :class="{ copied }" @click="copyEmail">
    <span>{{ copied ? 'Copied !' : email }}</span>
    <Copy size="16" />
  </button>
</template>

<style scoped>
.gmail-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-lg);
  background: rgba(var(--color-background-rgb), 0.04);
  border: 1px dashed rgba(var(--color-background-rgb), 0.2);
  border-radius: var(--radius-md);
  color: var(--color-background);
  font-family: "Intel One Mono";
  font-size: var(--font-size-sm);
  font-weight: var(--font-light);
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  margin-top: var(--space-lg);
  max-width: 100%;
}

.gmail-btn:hover {
  background: rgba(var(--color-background-rgb), 0.08);
  border-color: rgba(var(--color-background-rgb), 0.4);
}

.gmail-btn.copied {
  border-color: rgba(var(--color-background-rgb), 0.6);
}

.gmail-btn__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.gmail-btn span {
  max-width: 100%;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>