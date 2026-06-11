<script setup>
import { nextTick, ref } from 'vue';
import { GraduationCap, Plus } from 'lucide-vue-next';
import PortfolioEmptyState from '@/components/portfolio/shared/PortfolioEmptyState.vue';
import BaseButton from '@/components/common/actions/BaseButton.vue';
import { usePortfolioStore } from '@/stores/portfolio';

const levelLabels = {
  bachelor: 'Bachelor / Licence',
  master: 'Master',
  doctorat: 'PhD / Doctorate',
};
const DESCRIPTION_MAX_LENGTH = 180;
const DESCRIPTION_MAX_LINES = 2;

const props = defineProps({
  userId: { type: String, required: true },
  canAdd: {
    type: Boolean,
    default: false,
  },
  items: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  'add-education',
  'description-updated',
  'description-error',
]);

const portfolioStore = usePortfolioStore();
const editingId = ref(null);
const editDescription = ref('');
const savingId = ref(null);
const textarea = ref(null);
const lastTap = ref({ id: null, at: 0 });

function formatLevel(level) {
  return levelLabels[level?.toLowerCase()] || level || 'Education';
}

function getTextareaElement() {
  return Array.isArray(textarea.value)
    ? textarea.value[0]
    : textarea.value;
}

function resizeTextarea() {
  const field = getTextareaElement();
  if (!field) return;

  const styles = window.getComputedStyle(field);
  const lineHeight = Number.parseFloat(styles.lineHeight) || 18;
  const paddingTop = Number.parseFloat(styles.paddingTop) || 0;
  const paddingBottom = Number.parseFloat(styles.paddingBottom) || 0;
  const borderTop = Number.parseFloat(styles.borderTopWidth) || 0;
  const borderBottom = Number.parseFloat(styles.borderBottomWidth) || 0;
  const maxHeight = (lineHeight * DESCRIPTION_MAX_LINES) +
    paddingTop +
    paddingBottom +
    borderTop +
    borderBottom;

  field.style.height = 'auto';
  field.style.height = `${Math.min(field.scrollHeight, maxHeight)}px`;
  field.style.overflowY = field.scrollHeight > maxHeight ? 'auto' : 'hidden';
}

function startDescriptionEdit(item) {
  if (!props.canAdd || savingId.value) return;

  editingId.value = item.id;
  editDescription.value = item.description ?? '';
  nextTick(() => {
    const field = getTextareaElement();
    field?.focus();
    resizeTextarea();
  });
}

function cancelDescriptionEdit() {
  if (savingId.value) return;

  editingId.value = null;
  editDescription.value = '';
}

async function saveDescription(item) {
  if (!item?.id || savingId.value) return;

  savingId.value = item.id;

  try {
    await portfolioStore.updateEducationDescription(
      item.id,
      editDescription.value.trim()
    );
    editingId.value = null;
    editDescription.value = '';
    emit('description-updated');
  }
  catch (error) {
    emit('description-error', error);
  }
  finally {
    savingId.value = null;
  }
}

function handleItemTap(item, event) {
  if (
    event.pointerType === 'mouse' ||
    event.target.closest('a, button, input, textarea, select')
  ) {
    return;
  }

  const now = Date.now();

  if (lastTap.value.id === item.id && now - lastTap.value.at < 320) {
    event.preventDefault();
    event.stopPropagation();
    startDescriptionEdit(item);
    lastTap.value = { id: null, at: 0 };
    return;
  }

  lastTap.value = { id: item.id, at: now };
}
</script>

<template>
  <div class="education">
    <header>
      <h2>Education</h2>
    </header>
    <div class="education__body">
      <article
        v-for="item in items"
        :key="item.id"
        class="education__item"
        :class="{ 'education__item--editable': canAdd }"
        @dblclick="startDescriptionEdit(item)"
        @pointerup="handleItemTap(item, $event)"
      >
        <div
          class="education__icon"
          aria-hidden="true"
        >
          <GraduationCap
            :size="18"
            :stroke-width="1.9"
          />
        </div>
        <div class="education__content">
          <div class="education__heading">
            <div class="education__title-group">
              <h3>{{ item.school }}</h3>
              <p class="education__degree">{{ formatLevel(item.level) }}</p>
            </div>
            <span class="education__period">{{ item.period }}</span>
          </div>
          <p
            v-if="editingId !== item.id && item.description"
            class="education__description"
          >
            {{ item.description }}
          </p>
          <div
            v-else-if="editingId === item.id"
            class="education__editor"
          >
            <textarea
              ref="textarea"
              v-model="editDescription"
              class="education__textarea"
              :maxlength="DESCRIPTION_MAX_LENGTH"
              placeholder="Add a short two-line description..."
              @dblclick.stop
              @click.stop
              @input="resizeTextarea"
            />
            <div class="education__editor-footer">
              <span>{{ editDescription.length }} / {{ DESCRIPTION_MAX_LENGTH }}</span>
              <div class="education__editor-actions">
                <BaseButton
                  size="xs"
                  variant="ghost"
                  :disabled="savingId === item.id"
                  @click="cancelDescriptionEdit"
                >
                  Cancel
                </BaseButton>
                <BaseButton
                  size="xs"
                  variant="submit"
                  :loading="savingId === item.id"
                  :disabled="savingId === item.id"
                  @click="saveDescription(item)"
                >
                  Save
                </BaseButton>
              </div>
            </div>
          </div>
          <span
            v-if="item.status === 'en_attente'"
            class="education__status"
          >
            Pending validation
          </span>
        </div>
      </article>
      <div
        v-if="!items.length && canAdd"
        class="education__empty education__empty--actionable"
      >
        <p>No education information has been added yet.</p>
        <button
          class="education__empty-action"
          type="button"
          @click="$emit('add-education')"
        >
          <Plus :size="15" />
          Add academic path
        </button>
      </div>
      <p
        v-else-if="items.length && canAdd"
        class="education__hint"
      >
        Double-click an education item to edit its description.
      </p>
      <PortfolioEmptyState
        v-else-if="!items.length"
        class="education__empty"
        message="No education information has been added yet."
      />
    </div>
  </div>
</template>

<style scoped>
.education {
  --border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  display: flex;
  flex-direction: column;
  border: var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 16px rgba(0, 0, 0, 0.04);
  background-color: rgba(var(--color-surface-rgb), 0.3);
}

.education header {
  border-bottom: var(--border);
  padding: 1.38rem var(--space-xl);
}

.education header h2 {
  margin: 0;
  font-weight: var(--font-bold);
  line-height: 1;
  font-size: var(--font-size-lg);
}

.education__body {
  display: grid;
  gap: var(--space-md);
  padding: var(--space-lg) var(--space-xl);
}

.education__item {
  display: grid;
  grid-template-columns: 2.35rem 1fr;
  gap: var(--space-lg);
  align-items: start;
  border-radius: var(--radius-sm);
  transition:
    background-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.education__item--editable {
  cursor: text;
}

.education__item--editable:hover {
  background: rgba(var(--color-background-rgb), 0.34);
  box-shadow: 0 0 0 0.55rem rgba(var(--color-background-rgb), 0.34);
}

.education__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.35rem;
  height: 2.35rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.18);
  border-radius: 50%;
  color: rgba(var(--color-primary-rgb), 0.68);
}

.education__content {
  display: grid;
  gap: var(--space-xs);
  min-width: 0;
}

.education__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.education__title-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.education__heading h3,
.education__content p {
  margin: 0;
}

.education__heading h3 {
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-bold);
  line-height: 1.2;
  word-break: break-word;
}

.education__period {
  flex: 0 0 auto;
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  white-space: nowrap;
}

.education__degree {
  color: rgba(var(--color-primary-rgb), 0.76);
  font-size: var(--font-size-xs);
  font-weight: var(--font-regular);
  line-height: 1.2;
}

.education__status {
  width: fit-content;
  border: 1px solid rgba(var(--color-secondary-rgb), 0.26);
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: rgba(var(--color-primary-rgb), 0.72);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
}

.education__description {
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-xs);
  font-weight: var(--font-light);
  line-height: 1.3;
}

.education__editor {
  display: grid;
  gap: var(--space-sm);
  margin-top: var(--space-xs);
}

.education__textarea {
  width: 100%;
  min-height: 3.45rem;
  max-height: 3.45rem;
  resize: none;
  border: 1px solid rgba(var(--color-primary-rgb), 0.14);
  border-radius: var(--radius-md);
  padding: 0.55rem 0.7rem;
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.32),
      rgba(255, 255, 255, 0)
    ),
    color-mix(in srgb, var(--color-surface) 22%, var(--color-background));
  color: var(--color-primary);
  font-family: var(--font-ui);
  font-size: var(--font-size-xs);
  font-weight: var(--font-light);
  line-height: 1.15rem;
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 1px 2px rgba(0, 0, 0, 0.04);
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.education__textarea::placeholder {
  color: rgba(var(--color-primary-rgb), 0.42);
}

.education__textarea:hover {
  border-color: rgba(var(--color-primary-rgb), 0.24);
}

.education__textarea:focus {
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
    0 8px 18px rgba(0, 0, 0, 0.05);
}

.education__editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.education__editor-footer > span,
.education__hint {
  color: rgba(var(--color-primary-rgb), 0.46);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
}

.education__editor-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.education__hint {
  margin: 0;
  padding-top: var(--space-xs);
}

.education__empty {
  text-align: center;
}

.education__empty--actionable {
  display: grid;
  place-items: center;
  gap: var(--space-md);
  padding: var(--space-xl);
  border: 1.5px dashed rgba(var(--color-primary-rgb), 0.22);
  border-radius: var(--radius-md);
  background: rgba(var(--color-background-rgb), 0.35);
  color: rgba(var(--color-primary-rgb), 0.56);
}

.education__empty--actionable p {
  margin: 0;
  color: inherit;
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

.education__empty-action {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  border: none;
  border-radius: var(--radius-sm);
  padding-block: var(--space-sm);
  padding-inline: 0.75rem var(--space-md);
  background-color: var(--color-primary);
  color: var(--color-background);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.38);
  font: inherit;
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.education__empty-action:hover {
  background-color: rgba(var(--color-primary-rgb), 0.92);
  box-shadow: 0 7px 12px rgba(0, 0, 0, 0.34);
  transform: translateY(-1px);
}

.education__empty-action:focus-visible {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.15);
}

@media (max-width: 640px) {
  .education header {
    padding: 1.1rem var(--space-lg);
  }

  .education__body {
    padding: var(--space-lg);
  }

  .education__heading,
  .education__editor-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .education__period {
    white-space: normal;
  }
}

</style>
