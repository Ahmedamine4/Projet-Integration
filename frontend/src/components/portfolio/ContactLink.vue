<script setup>
import { ref, computed } from 'vue';
import { ArrowUpRight, Pencil, Check, X } from 'lucide-vue-next';
import api from '@/services/api';

const props = defineProps({
  title:    { type: String, required: true },
  href:     { type: String, default: '' },
  isOwner:  { type: Boolean, default: false },
  isEditing: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  platform: { type: String, required: true },
});

const PLATFORMS = {
  github:    { label: 'GitHub',       pattern: /^https?:\/\/(www\.)?github\.com\/.+/ },
  twitter:   { label: 'Twitter / X',  pattern: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/ },
  instagram: { label: 'Instagram',    pattern: /^https?:\/\/(www\.)?instagram\.com\/.+/ },
  facebook:  { label: 'Facebook',     pattern: /^https?:\/\/(www\.)?facebook\.com\/.+/ },
};


const emit = defineEmits(['edit', 'cancel', 'updated']);

const isEdit = computed(() => props.isEditing);
const saving  = ref(false);
const draft   = ref('');
const error   = ref('');

const placeholder = computed(() =>
  `https://${props.platform}.com/username`,
);

function openEdit() {
  draft.value = props.href || '';
  error.value = '';
  emit('edit');
}

function cancelEdit() {
  error.value = '';
  emit('cancel');
}

function validate() {
  const val = draft.value.trim();
  if (!val) return true; 
  const rule = PLATFORMS[props.platform];
  if (rule && !rule.pattern.test(val)) {
    error.value = `Enter a valid ${props.title} URL`;
    return false;
  }
  return true;
}

async function save() {
  if (!validate()) return;

  saving.value = true;
  try {
    const res = await api.put(`/socials/${props.platform}`, {
      links: { [props.platform]: draft.value.trim() },
    });

    if (res.data?.success) {
        emit('updated', {
        platform: props.platform,
        href: draft.value.trim(),
    });
    } else {
      error.value = 'Failed to save. Try again.';
    }
  } catch {
    error.value = 'Failed to save. Try again.';
  } finally {
    saving.value = false;
  }
}

function handleClick(e) {
  if (props.disabled) {
    e.preventDefault();
    return;
  }

  if (!props.isOwner) return;

  e.preventDefault();
  openEdit();
}
</script>

<template>
  <!-- VIEW MODE -->
  <template v-if="!isEdit">
    <a
      class="contact-link"
      :class="{ 'is-owner': isOwner, 'is-disabled': disabled }"
      :href="href || '#'"
      target="_blank"
      rel="noopener noreferrer"
      @click="handleClick"
    >
      <span>{{ title }}</span>
      <Pencil v-if="isOwner" class="contact-link__icon owner-icon" />
      <ArrowUpRight v-else class="contact-link__icon contact-link__arrow" />
    </a>
  </template>

  <!-- EDIT MODE -->
  <div v-else class="contact-link-edit">
    <span class="contact-link-edit__label">{{ title }}</span>

    <div class="contact-link-edit__row" :class="{ 'has-error': error }">
      <input
        v-model="draft"
        type="url"
        :placeholder="placeholder"
        @keydown.enter="save"
        @keydown.esc="cancelEdit"
        @input="error = ''"
        autofocus
      />
      <button class="action-btn action-btn--cancel" @click="cancelEdit" title="Cancel">
        <X :size="13" />
      </button>
      <button
        class="action-btn action-btn--save"
        :disabled="saving"
        @click="save"
        title="Save"
      >
        <Check :size="13" />
      </button>
    </div>

    <p v-if="error" class="contact-link-edit__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.contact-link,
.contact-link-edit {
  display: flex;
  align-items: center;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid rgba(var(--color-background-rgb), 0.15);
  min-height: 2.4rem;
}

.contact-link {
  justify-content: space-between;
  gap: 1rem;
  color: var(--color-background);
  font-size: var(--font-size-ms);
  font-weight: var(--font-light);
  letter-spacing: 0.02em;
  text-decoration: none;
  transition:
    opacity 0.25s ease,
    transform 0.25s ease,
    border-color 0.25s ease;
}

.contact-link span {
  transition:
    transform 0.25s ease,
    letter-spacing 0.25s ease;
}

.contact-link__icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

/* Visitor hover */
.contact-link:not(.is-owner):hover {
  transform: translateX(6px);
  border-color: rgba(var(--color-background-rgb), 0.35);
}
.contact-link:not(.is-owner):hover span {
  letter-spacing: 0.05em;
}
.contact-link:not(.is-owner):hover .contact-link__arrow {
  transform: translate(4px, -4px) scale(1.08);
}

.contact-link.is-owner {
  cursor: pointer;
}
.contact-link.is-owner .owner-icon {
  opacity: 0.45;
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.contact-link.is-owner:hover .owner-icon {
  opacity: 1;
  transform: scale(1.15);
}
.contact-link.is-disabled {
  opacity: 0.35;
  pointer-events: none;
}

.contact-link-edit {
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-xs);
  padding-block: var(--space-sm);
}

.contact-link-edit__label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  color: rgba(var(--color-background-rgb), 0.62);
  letter-spacing: 0.04em;
}

.contact-link-edit__row {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.contact-link-edit__row input {
  flex: 1;
  padding: 0.38rem 0.7rem;
  border: 1px solid rgba(var(--color-background-rgb), 0.25);
  border-radius: var(--radius-sm);
  background: rgba(var(--color-background-rgb), 0.08);
  color: var(--color-background);
  font-family: var(--font-ui);
  font-size: var(--font-size-sm);
  font-weight: var(--font-light);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.contact-link-edit__row input::placeholder {
  color: rgba(var(--color-background-rgb), 0.3);
}

.contact-link-edit__row input:focus {
  border-color: rgba(var(--color-background-rgb), 0.55);
  box-shadow: 0 0 0 3px rgba(var(--color-background-rgb), 0.1);
}

.has-error input {
  border-color: rgba(255, 100, 100, 0.6);
  box-shadow: 0 0 0 3px rgba(255, 100, 100, 0.12);
}

.contact-link-edit__error {
  margin: 0;
  font-size: var(--font-size-xs);
  color: rgba(255, 120, 120, 0.9);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(var(--color-background-rgb), 0.2);
  background: rgba(var(--color-background-rgb), 0.06);
  color: var(--color-background);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.18s ease, border-color 0.18s ease;
}

.action-btn:hover {
  background: rgba(var(--color-background-rgb), 0.14);
  border-color: rgba(var(--color-background-rgb), 0.36);
}

.action-btn--save:hover {
  background: rgba(80, 200, 130, 0.18);
  border-color: rgba(80, 200, 130, 0.45);
  color: rgb(80, 200, 130);
}

.action-btn--cancel:hover {
  background: rgba(255, 100, 100, 0.14);
  border-color: rgba(255, 100, 100, 0.35);
  color: rgba(255, 120, 120, 0.9);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>