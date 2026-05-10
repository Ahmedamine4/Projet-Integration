<script setup>
import { computed, onUnmounted, ref, watch } from 'vue';
import { ImagePlus, Trash2, UploadCloud } from 'lucide-vue-next';

const model = defineModel({
  type: Object,
  default: null
});

defineProps({
  title: {
    type: String,
    default: 'Upload project screenshot'
  },
  subtitle: {
    type: String,
    default: 'PNG, JPG, or WebP. Click to browse.'
  },
  emptyText: {
    type: String,
    default: 'No file selected'
  },
  accept: {
    type: String,
    default: 'image/*'
  }
});

const isDragging = ref(false);

const updateFile = (file) => {
  model.value = file || null;
};

const handleFileChange = (event) => {
  updateFile(event.target.files?.[0]);
  event.target.value = '';
};

const handleDrop = (event) => {
  isDragging.value = false;
  updateFile(event.dataTransfer.files?.[0]);
};

const clearFile = () => {
  updateFile(null);
};

const previewURL = ref('');
const hasPreview = computed(() => !!previewURL.value);

function releasePreviewURL() {
  if (!previewURL.value) return;
  URL.revokeObjectURL(previewURL.value);
  previewURL.value = '';
}

watch(model, (newPreview) => {
  releasePreviewURL();
  if (newPreview instanceof Blob)
    previewURL.value = URL.createObjectURL(newPreview);
});

onUnmounted(releasePreviewURL);
</script>

<template>
  <label
    class="drop-zone"
    :class="{ 'drop-zone--active': isDragging }"
    for="projectImage"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <div class="drop-zone__preview">
      <img v-if="hasPreview" :src="previewURL" alt="">
      <ImagePlus v-else />
    </div>
    <div class="drop-zone__content">
      <span class="drop-zone__eyebrow">
        <UploadCloud :size="15" />
        Drop image here
      </span>
      <span class="drop-zone__title">
        {{ title }}
      </span>
      <span class="drop-zone__subtitle">
        {{ subtitle }}
      </span>

      <input
        id="projectImage"
        type="file"
        :accept="accept"
        class="hidden-input"
        @change="handleFileChange"
      />

      <p
        class="file-name"
        :class="{
          'file-name--empty': !model,
          'file-name--selected': model
        }"
      >
        {{ model?.name || emptyText }}
      </p>
    </div>
    <button
      v-if="model"
      type="button"
      class="drop-zone__clear"
      @click.prevent.stop="clearFile"
    >
      <Trash2 :size="15" />
    </button>
  </label>
</template>

<style scoped>
.drop-zone {
  position: relative;
  display: grid;
  grid-template-columns: 8rem minmax(0, 1fr);
  align-items: center;
  gap: var(--space-md);
  border: 1.5px dashed rgba(var(--color-primary-rgb), 0.18);
  border-radius: var(--radius-md);
  padding: var(--space-sm);
  text-align: left;
  background: linear-gradient(
    135deg,
    rgba(var(--color-surface-rgb), 0.44),
    var(--color-background)
  );
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.drop-zone:hover,
.drop-zone--active {
  border-color: rgba(var(--color-secondary-rgb), 0.56);
  box-shadow: 0 12px 26px rgba(var(--color-primary-rgb), 0.06);
  transform: translateY(-1px);
}

.drop-zone__clear {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  aspect-ratio: 1;
  border: none;
  border-radius: 999px;
  background-color: transparent;
  color: rgba(var(--color-primary-rgb), 0.78);
  cursor: pointer;
  transition:
    color var(--transition-fast),
    transform var(--transition-fast);
}

.drop-zone__clear:is(:hover, :focus-visible) {
  color: var(--color-error);
  outline: none;
  transform: translateY(-1px);
}

.drop-zone__preview {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-sm);
  background: linear-gradient(
    135deg,
    rgba(var(--color-secondary-rgb), 0.14),
    rgba(var(--color-primary-rgb), 0.05)
  );
  color: rgba(var(--color-primary-rgb), 0.68);
  overflow: hidden;
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.drop-zone__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.drop-zone__preview svg {
  width: 1.75rem;
  height: 1.75rem;
}

.drop-zone__content {
  display: grid;
  gap: 0.32rem;
  min-width: 0;
  overflow: hidden;
}

.drop-zone__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  width: fit-content;
  color: var(--color-secondary);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.drop-zone__title {
  color: var(--color-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-medium);
  line-height: 1.25;
}

.drop-zone__subtitle {
  color: rgba(var(--color-primary-rgb), 0.58);
  font-size: var(--font-size-xs);
  line-height: 1.35;
}

.drop-zone__title,
.drop-zone__subtitle {
  overflow-wrap: anywhere;
}

.file-name {
  margin: 0;
  margin-top: 0.1rem;
  background: rgba(var(--color-primary-rgb), 0.06);
  width: fit-content;
  max-width: 100%;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-name--empty {
  color: rgba(var(--color-primary-rgb), 0.52);
}

.file-name--selected {
  color: var(--color-success);
  background: rgba(var(--color-success-rgb), 0.08);
}

.hidden-input {
  display: none;
}

@media (max-width: 480px) {
  .drop-zone {
    grid-template-columns: 1fr;
  }

  .drop-zone__preview {
    aspect-ratio: 16 / 9;
  }
}
</style>
