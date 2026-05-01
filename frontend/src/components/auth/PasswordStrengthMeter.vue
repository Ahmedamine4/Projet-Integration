<script setup>
import { computed } from 'vue';
import ProgressMeter from '@/components/common/ProgressMeter.vue';

const props = defineProps({
  password: {
    type: String,
    default: '',
  },
});

const rules = computed(() => [
  {
    label: '8+ characters',
    passed: props.password.length >= 8,
  },
  {
    label: 'Alphabetic letter',
    passed: /[A-Za-z]/.test(props.password),
  },
  {
    label: 'Number',
    passed: /\d/.test(props.password),
  },
  {
    label: 'Symbol',
    passed: /[^A-Za-z0-9]/.test(props.password),
  },
]);

const strength = computed(() => {
  const score = rules.value.filter((rule) => rule.passed).length;
  if (score <= 1)
    return {
      label: 'Weak',
      score,
      color: 'var(--color-error)',
    };
  if (score === 2)
    return {
      label: 'Fair',
      score,
      color: '#e07012',
    };
  if (score === 3)
    return {
      label: 'Good',
      score,
      color: '#d9b20b',
    };

  return {
    label: 'Strong',
    score,
    color: 'var(--color-success)',
  };
});

const strengthTextStyle = computed(() => {
  return { color: strength.value.color };
});
</script>

<template>
  <section
    class="password-meter"
    :class="{ 'password-meter--visible': password }"
  >
    <div class="password-meter__header">
      <span class="password-meter__label"> Password strength </span>
      <strong :style="strengthTextStyle">
        {{ strength.label }}
      </strong>
    </div>

    <ProgressMeter :value="strength.score" />

    <ul class="password-meter__rules">
      <li
        v-for="rule in rules"
        :key="rule.label"
        class="password-meter__rule"
        :class="{ 'password-meter__rule--passed': rule.passed }"
      >
        <input
          class="password-meter__checkbox"
          type="checkbox"
          :checked="rule.passed"
          tabindex="-1"
        />
        <span>{{ rule.label }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.password-meter {
  display: grid;
  gap: var(--space-xs);
  padding-top: var(--space-xs);
  margin: 0;
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transform: translateY(-0.35rem);
  transition:
    max-height var(--transition-normal),
    opacity var(--transition-normal),
    transform var(--transition-normal);
}

.password-meter--visible {
  max-height: 8rem;
  opacity: 1;
  transform: translateY(0);
}

.password-meter__header {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xxs);
}

.password-meter__label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(var(--color-primary-rgb), 0.68);
}

.password-meter__rules {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem 0.75rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.password-meter__rule {
  display: grid;
  grid-template-columns: 0.6rem 1fr;
  align-items: center;
  column-gap: 0.3rem;
  font-size: var(--font-size-xs);
  color: rgba(var(--color-primary-rgb), 0.48);
}

.password-meter__rule--passed {
  color: var(--color-success);
}

.password-meter__checkbox {
  width: 0.6rem;
  height: 0.6rem;
  margin: 0;
  accent-color: var(--color-success);
  pointer-events: none;
}
</style>
