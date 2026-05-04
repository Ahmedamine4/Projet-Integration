<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  label: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="toggle-row">
    <span>{{ label }}</span>

    <label class="toggle-switch">
      <input
        type="checkbox"
        :checked="modelValue"
        @change="emit('update:modelValue', $event.target.checked)"
      />

      <span></span>
    </label>
  </div>
</template>

<style scoped>
.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: var(--font-medium);
  margin-top: 4px;
  margin-bottom: 4px;
}

.toggle-switch input {
  display: none;
}

.toggle-switch span {
  display: block;
  width: 46px;
  height: 24px;
  border-radius: 999px;
  background: var(--color-surface);
  position: relative;
  cursor: pointer;
  transition: var(--transition-fast);
}

.toggle-switch span::before {
  content: "";
  position: absolute;
  width: 18px;
  height: 18px;
  top: 3px;
  left: 3px;
  border-radius: 50%;
  background: var(--color-background);
  transition: var(--transition-fast);
}

.toggle-switch input:checked + span {
  background: var(--color-secondary);
}

.toggle-switch input:checked + span::before {
  transform: translateX(22px);
}
</style>