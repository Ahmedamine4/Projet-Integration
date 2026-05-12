<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import Card from '@/components/common/Card.vue';
import Button from '@/components/common/Button.vue';

const props = defineProps({
  userId: { type: String, required: true },
});

const auth = useAuthStore();

const loading = ref(false);
const about = ref('');
const isOwner = ref(false);
const showFull = ref(false);

const isEditing = ref(false);
const editText = ref('');
const editorTextarea = ref(null);
const saving = ref(false);

const TRUNCATE_LEN = 200;
const MAX_EDIT_LEN = 500;

const isTruncated = computed(() => !!about.value && about.value.length > TRUNCATE_LEN);
const displayText = computed(() => {
  if (!about.value) return '';
  if (showFull.value || about.value.length <= TRUNCATE_LEN) return about.value;

  return `${about.value.slice(0, TRUNCATE_LEN)}...`;
});

const lastTap = ref(0);

function handleTextDblClick() {
  if (!isOwner.value) return;
  openEdit();
}

function handleTouchEnd() {
  if (!isOwner.value) return;
  const now = Date.now();
  const delta = now - lastTap.value;
  if (delta && delta < 300) {
    // double-tap detected
    openEdit();
    lastTap.value = 0;
  } else {
    lastTap.value = now;
    setTimeout(() => {
      lastTap.value = 0;
    }, 350);
  }
}

async function fetchAbout() {
  loading.value = true;
  try {
    const res = await api.get(`/users/${props.userId}/about`);
    const data = res.data;
    if (data?.success) {
      about.value = data.about || '';
      if (typeof data.isOwner === 'boolean') {
        isOwner.value = data.isOwner;
      } else {
        isOwner.value = !!auth.user && auth.user.utilisateur_id === props.userId;
      }
    } else {
      about.value = '';
      isOwner.value = false;
    }
  } catch (err) {
    console.error('Failed to fetch about:', err);
    about.value = '';
    isOwner.value = false;
  } finally {
    loading.value = false;
  }
}

function resizeEditorTextarea() {
  const textarea = editorTextarea.value;
  if (!textarea) return;

  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function openEdit() {
  editText.value = about.value || '';
  isEditing.value = true;
}

function closeEdit() {
  isEditing.value = false;
}

async function saveEdit() {

  if (editText.value.length > MAX_EDIT_LEN) {
    alert(`Maximum ${MAX_EDIT_LEN} characters allowed`);
    return;
  }

  saving.value = true;
  try {
    const res = await api.put(`/users/${props.userId}/about`, { a_propos: editText.value });
    if (res.data?.success) {
      about.value = res.data.updated?.a_propos ?? editText.value;
      isEditing.value = false;
      showFull.value = true;
    } else {
      alert('Failed to save changes');
    }
  }
  catch (err) {
    console.error('Save error:', err);
    alert('Failed to save changes');
  }
  finally {
    saving.value = false;
  }
}

onMounted(fetchAbout);
watch(() => props.userId, () => fetchAbout());
</script>

<template>
    <div class="about-frame">
      <div class="about-header-inline">
        <h2 class="about-title">About me</h2>
      </div>

      <div class="about-me">
        <Transition
          name="pop-up"
          mode="out-in"
          @after-enter="resizeEditorTextarea"
        >
          <div v-if="isEditing" class="inline-editor">
            <textarea
              ref="editorTextarea"
              class="editor-textarea"
              v-model="editText"
              :maxlength="MAX_EDIT_LEN"
              placeholder="Write something about yourself..."
              @input="resizeEditorTextarea"
            ></textarea>

            <div class="editor-footer">
              <div class="char-count">{{ editText.length }} / {{ MAX_EDIT_LEN }}</div>
              <div class="editor-actions">
                <Button variant="ghost" @click="closeEdit">Cancel</Button>
                <Button variant="submit" :loading="saving" :disabled="saving || editText.length > MAX_EDIT_LEN" @click="saveEdit">Save</Button>
              </div>
            </div>
          </div>

          <div
            v-else
            class="about-view"
            @dblclick="handleTextDblClick"
            @touchend.passive="handleTouchEnd"
          >
            <p class="about-me__text">
              <span v-if="about">{{ displayText }}</span>
              <span v-else class="muted">No about available.</span>
            </p>

            <div class="about-controls">
              <button v-if="isTruncated" class="link" @click="showFull = !showFull">
                {{ showFull ? 'See less' : 'See more' }}
              </button>
              <div v-if="isOwner" class="edit-hint">
                Double-click to edit
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
</template>

<style scoped>
.about-frame {
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  background: rgba(var(--color-surface-rgb), 0.78);
  padding: var(--space-lg) var(--space-xl);
  border-radius: var(--radius-lg);
}

.about-header-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.about-title {
  margin: 0;
  font-size: clamp(1.2rem, 1.6vw, 1.6rem);
}

.about-me {
  margin-top: 0.8rem;
}

.about-me__text {
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  color: var(--color-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.about-view {
  user-select: none;
  cursor: pointer;
}

.muted {
  color: rgba(var(--color-primary-rgb), 0.6);
}

.link {
  background: none;
  border: none;
  color: var(--color-secondary);
  cursor: pointer;
  font-weight: var(--font-medium);
  padding: 0;
  transition: color var(--transition-fast);
}

.char-count {
  color: rgba(var(--color-primary-rgb), 0.6);
  font-size: 0.9rem;
}

.inline-editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.editor-textarea {
  width: 100%;
  min-height: 160px;
  padding: 0.6rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.18);
  border-radius: var(--radius-md);
  background: transparent;
  font: inherit;
  color: inherit;
  line-height: 1.4;
  resize: none;
  overflow: hidden;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.editor-textarea:focus {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.14);
}

.editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-hint {
  color: rgba(var(--color-primary-rgb), 0.6);
  font-size: var(--font-size-xs);
}

.pop-up-enter-from,
.pop-up-leave-to {
  opacity: 0;
}

.pop-up-enter-active,
.pop-up-leave-active {
  transition: opacity var(--transition-fast);
}

.pop-up-enter-to,
.pop-up-leave-from {
  opacity: 1;
}

.pop-up-enter-from,
.pop-up-leave-to {
  transform: scale(0.97);
}

.pop-up-enter-active,
.pop-up-leave-active {
  transition:
    opacity var(--transition-fast),
    transform 0.22s var(--ease-overshoot);
}

.pop-up-enter-to,
.pop-up-leave-from {
  transform: scale(1);
}

@media (max-width: 480px) {
  .editor-textarea {
    min-height: 140px;
    font-size: 0.95rem;
    padding: 0.5rem;
  }

  .editor-footer {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .editor-actions {
    flex-direction: column;
    width: 100%;
  }

  .editor-actions > button {
    width: 100%;
  }
}
</style>
