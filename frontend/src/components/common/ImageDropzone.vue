<script setup>
defineProps({
  modelValue: {
    type: Object,
    default: null
  },
  title: {
    type: String,
    default: 'Drag and drop your project screenshot here'
  },
  subtitle: {
    type: String,
    default: 'or click to upload'
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

const emit = defineEmits(['update:modelValue']);

const updateFile = (file) => {
  emit('update:modelValue', file || null);
};

const handleFileChange = (event) => {
  updateFile(event.target.files?.[0]);
};

const handleDrop = (event) => {
  updateFile(event.dataTransfer.files?.[0]);
};
</script>

<template>
  <label
    class="drop-zone"
    for="projectImage"
    @dragover.prevent
    @drop.prevent="handleDrop"
  >
    <p>{{ title }}</p>
    <span>{{ subtitle }}</span>

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
        'file-name--empty': !modelValue,
        'file-name--selected': modelValue
      }"
    >
      {{ modelValue?.name || emptyText }}
    </p>
  </label>
</template>

<style scoped>
.drop-zone {
  border: 1.5px dashed rgba(var(--color-primary-rgb), 0.35);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  text-align: center;
  background: var(--color-surface);
}

.drop-zone p {
  margin: 0;
  font-weight: var(--font-medium);
}

.drop-zone span {
  display: block;
  margin-top: var(--space-sm);
  color: var(--color-primary-hover);
  font-size: var(--font-size-sm);
}

.file-name {
  margin-top: var(--space-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
}

.file-name--empty {
  color: var(--color-error);
}

.file-name--selected {
  color: var(--color-success);
}

.hidden-input {
  display: none !important;
}

@media (max-width: 600px) {
  .drop-zone {
    padding: var(--space-md);
  }
}
</style>