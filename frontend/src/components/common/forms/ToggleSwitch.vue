<script setup>
const model = defineModel({
  type: Boolean,
  required: true
});

defineProps({
  label: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div
    class="toggle-row"
    :class="{ 'toggle-row--disabled': disabled }"
  >
    <span>{{ label }}</span>

    <label class="toggle-switch">
      <input
        v-model="model"
        type="checkbox"
        :disabled="disabled"
      >

      <span />
    </label>
  </div>
</template>

<style scoped>
.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: var(--font-medium);
}

.toggle-row > span {
  display: block;
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary-hover);
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

.toggle-row--disabled {
  opacity: 0.58;
}

.toggle-row--disabled .toggle-switch span {
  cursor: not-allowed;
}
</style>
