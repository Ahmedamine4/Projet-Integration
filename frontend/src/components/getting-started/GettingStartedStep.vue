<script setup>
import { CircleCheck, CircleDashed, ClockFading ,GraduationCap, Phone, GithubIcon, } from 'lucide-vue-next';

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
  stepKey: {
  type: String,
  required: true,
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
          class="step-icon done-icon"
        />

        <GraduationCap
          v-else-if="stepKey === 'school'"
          class="step-icon"
        />

        <GithubIcon
          v-else-if="stepKey === 'github'"
          class="step-icon"
        />

        <Phone
          v-else-if="stepKey === 'phone'"
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
  color: rgba(var(--color-primary-rgb), 0.45);
}

.done .step-icon {
   color: var(--color-background);
  fill: var(--color-success);
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
