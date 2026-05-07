<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import Card from '@/components/Card.vue';
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
const saving = ref(false);

const TRUNCATE_LEN = 300;
const MAX_EDIT_LEN = 3000;

const isTruncated = computed(() => !!about.value && about.value.length > TRUNCATE_LEN);
const displayText = computed(() => {
  if (!about.value) return '';
  return showFull.value ? about.value : about.value.slice(0, TRUNCATE_LEN);
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
    console.debug('GET /users/:id/about response', props.userId, data);
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
  } catch (err) {
    console.error('Save error:', err);
    alert('Failed to save changes');
  } finally {
    saving.value = false;
  }
}

onMounted(fetchAbout);
watch(() => props.userId, () => fetchAbout());
</script>

<template>
  <Card>
    <div class="about-frame">
      <div class="about-header-inline">
        <h2 class="about-title">About me</h2>

        <div class="about-actions">
        </div>
      </div>

      <div class="about-me">
        <div v-if="isEditing" class="inline-editor">
          <textarea
            class="editor-textarea"
            v-model="editText"
            :maxlength="MAX_EDIT_LEN"
            placeholder="Write something about yourself..."
          ></textarea>

          <div class="editor-footer">
            <div class="char-count">{{ editText.length }} / {{ MAX_EDIT_LEN }}</div>
            <div class="editor-actions">
              <Button variant="ghost" @click="closeEdit">Cancel</Button>
              <Button variant="submit" :loading="saving" :disabled="saving || editText.length > MAX_EDIT_LEN" @click="saveEdit">Save</Button>
            </div>
          </div>
        </div>

        <p
          v-else
          class="about-me__text"
          @dblclick="handleTextDblClick"
          @touchend.passive="handleTouchEnd"
        >
          <span v-if="about">{{ displayText }}</span>
          <span v-else class="muted">No about available.</span>
        </p>

        <div class="about-controls">
          <button v-if="isTruncated && !isEditing" class="link" @click="showFull = !showFull">
            {{ showFull ? 'See less' : 'See more' }}
          </button>
          <div v-if="isOwner && !isEditing" class="edit-hint">double-click to edit</div>
        </div>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.about-frame {
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  background: var(--color-background);
  padding: var(--space-md);
  border-radius: var(--radius-sm);
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

.about-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.owner-badge {
  background: rgba(var(--color-success-rgb), 0.12);
  color: var(--color-success);
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.85rem;
}

.edit-button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-primary);
  padding: 0.25rem;
}

.about-me {
  margin-top: 0.8rem;
}

.about-me__text {
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  color: var(--color-primary);
  /* preserve newlines from backend and wrap long lines */
  white-space: pre-wrap;
  word-break: break-word;
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
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(var(--color-primary-rgb), 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-lg);
}

.modal-card {
  position: relative;
  width: min(800px, 95vw);
  background: var(--color-background);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--space-lg);
}

.close-button {
  position: absolute;
  right: 12px;
  top: 12px;
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
}

.about-textarea {
  width: 100%;
  min-height: 220px;
  resize: vertical;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  background: var(--color-background);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-md);
}

.char-count {
  color: rgba(var(--color-primary-rgb), 0.6);
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
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
  border-radius: var(--radius-sm);
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  background: var(--color-background);
  /* match page font and sizing */
  font: inherit;
  color: inherit;
  line-height: 1.4;
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
  font-size: 0.85rem;
  margin-left: 0.5rem;
}

/* Mobile tweaks for inline editor */
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
