<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import BaseButton from '@/components/common/BaseButton.vue';
import { FileText, ChevronUp, ChevronDown } from 'lucide-vue-next';
import { useDoubleTap } from '@/composables/useDoubleTap';

const props = defineProps({
  userId: { type: String, required: true },
});

const MIN_ABOUT_LEN = 400;
const MAX_ABOUT_LEN = 1200;
const TRUNCATE_LEN = 800;

const isEdit = ref(false);
const loading = ref(false);
const saving = ref(false);
const aboutMe = ref('');
const editText = ref('');
const isOwner = ref(false);
const isExpanded = ref(false);
const auth = useAuthStore();

const isTruncated = computed(() => aboutMe.value.length > TRUNCATE_LEN);
const displayedAbtMe = computed(() => {
  if (!aboutMe.value) return '';

  if (isExpanded.value || aboutMe.value.length <= TRUNCATE_LEN) {
    return aboutMe.value;
  }

  return `${aboutMe.value.slice(0, TRUNCATE_LEN)}...`;
});

const aboutLength = computed(() => editText.value.length);

const textareaElem = ref(null);

function resizeTextarea() {
  const textarea = textareaElem.value;
  if (!textarea) return;

  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function edit() {
  if (!isOwner.value) return;

  editText.value = aboutMe.value;
  isEdit.value = true;
  nextTick(resizeTextarea);
}

function cancelEdit() {
  editText.value = aboutMe.value;
  isEdit.value = false;
}

async function fetchAbout() {
  loading.value = true;

  try {
    const res = await api.get(`/users/${props.userId}/about`);

    if (res.data?.success) {
      aboutMe.value = res.data.about || '';
      isOwner.value = typeof res.data.isOwner === 'boolean'
        ? res.data.isOwner
        : String(auth.user?.utilisateur_id) === String(props.userId);
    } else {
      aboutMe.value = '';
      isOwner.value = false;
    }
  } catch (err) {
    console.error('Failed to fetch about:', err);
    aboutMe.value = '';
    isOwner.value = false;
  } finally {
    loading.value = false;
  }
}

async function saveEdit() {
  if (editText.value.length > MAX_ABOUT_LEN) return;

  saving.value = true;

  try {
    const res = await api.put(`/users/${props.userId}/about`, {
      a_propos: editText.value,
    });

    if (res.data?.success) {
      aboutMe.value = res.data.updated?.a_propos ?? editText.value;
      isEdit.value = false;
      isExpanded.value = true;
    } else {
      alert('Failed to save changes');
    }
  } catch (err) {
    console.error('Save error:', err);
    alert('Failed to save changes');
  } finally {
    saving.value = false;
  }
}

const { handleDoubleTap } = useDoubleTap(() => {
  if (isEdit.value || !isOwner.value) return;

  edit();
});

onMounted(fetchAbout);
watch(() => props.userId, fetchAbout);
</script>

<template>
  <section class="about-me">
    <header>
      <h2>About me</h2>
    </header>

    <div
      class="about-me__body"
      :class="{ edit: isEdit }"
      @dblclick="edit"
      @click="handleDoubleTap"
    >
      <p v-if="loading && !isEdit">
        Loading professional summary...
      </p>
      <p v-else-if="!isEdit && aboutMe">
        {{ displayedAbtMe }}
      </p>
      <span v-else-if="!isEdit">
        <FileText :size="18" />
        <strong>
          No professional summary has been added yet.
        </strong>
      </span>
      <textarea
        v-else
        ref="textareaElem"
        v-model="editText"
        class="about-me__textarea"
        :maxlength="MAX_ABOUT_LEN"
        placeholder="Write a concise professional summary..."
        @input="resizeTextarea"
      />
    </div>

    <footer>
      <div
        v-if="!isEdit"
        class="view-footer"
      >
        <button
          v-if="isTruncated"
          class="see-more"
          @click="isExpanded = !isExpanded"
        >
          <span>
            {{ isExpanded ? 'See less' : 'See more' }}
          </span>
          <ChevronUp
            v-if="isExpanded"
            :size="16"
          />
          <ChevronDown
            v-else
            :size="16"
          />
        </button>
        <span v-if="isOwner">
          Double-click to edit
        </span>
      </div>
      <div
        v-else
        class="edit-footer"
      >
        <span
          class="edit-footer__count"
          :class="{ 'is-short': aboutLength < MIN_ABOUT_LEN }"
        >
          {{ aboutLength }} / {{ MAX_ABOUT_LEN }}
        </span>
        <div class="edit-footer__actions">
          <BaseButton
            size="xs"
            variant="ghost"
            @click="cancelEdit"
          >
            Cancel
          </BaseButton>
          <BaseButton
            size="xs"
            variant="submit"
            :loading="saving"
            :disabled="saving || aboutLength > MAX_ABOUT_LEN"
            @click="saveEdit"
          >
            Save changes
          </BaseButton>
        </div>
      </div>
    </footer>
  </section>
</template>

<style scoped>
.about-me {
  --border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  display: flex;
  flex-direction: column;
  border: var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 16px rgba(0, 0, 0, 0.04);
  background-color: rgba(var(--color-surface-rgb), 0.3);
}

.about-me header {
  border-bottom: var(--border);
  padding: 1.38rem var(--space-xl);
}

.about-me header h2 {
  margin: 0;
  font-weight: var(--font-bold);
  line-height: 1;
  font-size: var(--font-size-lg);
}

.about-me__body {
  flex: 1;
  padding-inline: var(--space-xl);
  padding-block: var(--space-lg) var(--space-xs);
  touch-action: manipulation;
}

.about-me__body p {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.5;
  font-size: var(--font-size-sm);
  font-weight: var(--font-regular);
  color: rgba(var(--color-primary-rgb), 0.76);
  overflow-wrap: anywhere;
}

.view-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-xl);
}

.see-more {
  display: inline-flex;
  align-items: center;
  border: none;
  gap: var(--space-sm);
  background-color: transparent;
  color: rgba(var(--color-primary-rgb), 0.68);
  padding: 0;
  cursor: pointer;
}

.see-more span {
  margin: 0;
  font-weight: var(--font-bold);
  font-size: var(--font-size-xs);
}

.view-footer > span {
  font-size: var(--font-size-xs);
  color: rgba(var(--color-primary-rgb), 0.48);
  margin-left: auto;
}

.edit-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-xl);
  border-top: var(--border);
  margin-top: var(--space-lg);
  background: rgba(var(--color-background-rgb), 0.28);
}

.about-me__body > span {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  background-color: rgba(var(--color-surface-rgb), 0.42);
  border: 1.5px dashed rgba(var(--color-primary-rgb), 0.22);
  border-radius: var(--radius-sm);
  padding: var(--space-md);
  color: rgba(var(--color-primary-rgb), 0.68);
}

.about-me__body strong {
  font-size: var(--font-size-sm);
  font-weight: var(--font-regular);
}

.about-me__body.edit {
  padding: var(--space-lg) var(--space-lg) 0;
}

.about-me__textarea {
  width: 100%;
  min-height: max(180px, 100%);
  resize: none;
  border: 1px solid rgba(var(--color-primary-rgb), 0.14);
  border-radius: var(--radius-md);
  padding: 1rem 1.05rem;
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.32),
      rgba(255, 255, 255, 0)
    ),
    color-mix(in srgb, var(--color-surface) 22%, var(--color-background));
  color: var(--color-primary);
  line-height: 1.5;
  font-family: var(--font-ui);
  font-size: var(--font-size-sm);
  font-weight: var(--font-light);
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 1px 2px rgba(0, 0, 0, 0.04);
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.about-me__textarea::placeholder {
  color: rgba(var(--color-primary-rgb), 0.42);
}

.about-me__textarea:hover {
  border-color: rgba(var(--color-primary-rgb), 0.24);
}

.about-me__textarea:focus {
  outline: none;
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

.edit-footer__count {
  font-family: var(--font-mono);
  color: rgba(var(--color-primary-rgb), 0.5);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
}

.edit-footer__count.is-short {
  color: rgba(var(--color-primary-rgb), 0.42);
}

.edit-footer__actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

@media (max-width: 480px) {
  .about-me__body.edit {
    padding-inline: var(--space-md);
  }

  .about-me__textarea {
    min-height: 150px;
    font-size: var(--font-size-sm);
  }

  .edit-footer {
    align-items: stretch;
    flex-direction: column;
    padding-inline: var(--space-md);
  }

  .edit-footer__actions {
    justify-content: flex-end;
  }
}
</style>
