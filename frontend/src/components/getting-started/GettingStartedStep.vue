<script setup>
import { CircleCheck, CircleDashed, ClockFading } from 'lucide-vue-next';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'todo',
    validator: (value) => ['todo', 'pending', 'done'].includes(value),
  },
});

const emit = defineEmits(['action']);

function handleToggle() {
  if (props.status === 'todo') emit('action');
}
</script>

<template>
  <div
    class="step"
    :class="status"
    @click="handleToggle"
  >
    <div class="left">
      <CircleCheck
        v-if="status === 'done'"
        class="step-icon"
      />
      <ClockFading
        v-else-if="status === 'pending'"
        class="step-icon"
      />
      <CircleDashed
        v-else
        class="step-icon"
      />
      <div class="description">
        <h3>{{ title }}</h3>
        <p>{{ description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  position: relative;
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.08);
  cursor: pointer;
  transition: var(--transition-normal);
}

h3 {
  font-size: var(--font-size-md);
  font-weight: var(--font-medium);
  margin: 0;
}

p {
  font-size: var(--font-size-sm);
  font-weight: var(--font-regular);
  color: rgba(var(--color-primary-rgb), 0.6);
  margin: 0;
}

.left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.description {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.step-icon {
  align-self: flex-start;
  width: 1.8rem;
  height: 1.8rem;
  color: var(--color-background);
}

.done .step-icon {
  fill: var(--color-success);
}

.todo .step-icon {
  scale: 0.8;
  color: rgba(var(--color-primary-rgb), 0.3);
}

.pending .step-icon {
  scale: 0.8;
  color: #d9b20b;
}

.step-field {
  flex: 1;
}

.step:is(.done, .pending) {
  cursor: default;
}

.step:hover:not(.done, .pending) {
  background-color: rgba(var(--color-surface-rgb), 0.3);
}
</style>
