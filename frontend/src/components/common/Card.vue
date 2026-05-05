<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: 'md',
  },
  variant: {
    type: String,
    default: 'default',
  },
});
</script>

<template>
  <div
    :class="[
      'card',
      `card--${size}`,
      `card--${variant}`,
      { 'card--full-width': fullWidth }
    ]"
  >
    <h2 v-if="title">
      {{ title }}
    </h2>
    <slot />
  </div>
</template>

<style scoped>
.card {
  margin: 0 auto;
  padding: 0;
  border: none;
  background: transparent;
}

.card--modal {
  position: relative;
  width: min(100%, 42.5rem);
  padding: var(--space-xl);
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  border-radius: var(--radius-lg);
  background: var(--color-background);
  box-shadow: var(--shadow-md);
  overflow: visible;
}

.card--xs {
  width: min(100%, 22rem);
}

.card--sm {
  width: min(100%, 24rem);
}

.card--md {
  width: min(100%, 26rem);
}

.card--lg {
  width: min(100%, 28rem);
}

.card--xxl {
  width: min(100%, 38rem);
}

.card--modal.card--xxl {
  width: min(100%, 42.5rem);
}

.card--full-width {
  width: 100%;
}

.card > h2 {
  margin: 0 0 0.45rem;
  font-size: clamp(1.7rem, 2.4vw, 2.5rem);
  line-height: 1;
  color: var(--color-primary);
}

.card--modal > h2 {
  margin: 0 3rem var(--space-lg) 0;
  font-size: 1.25rem;
  line-height: 1.25;
}

@media (max-width: 480px) {
  .card--xs,
  .card--sm,
  .card--md,
  .card--lg {
    width: 100%;
  }

}

@media (max-width: 600px) {
  .card--modal {
    width: 100%;
    max-width: 100%;
    height: 92dvh;
    max-height: 92dvh;
    padding: 18px;
    border-radius: 24px 24px 0 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .card--modal > h2 {
    margin-right: 3rem;
    margin-bottom: var(--space-md);
    font-size: 1.15rem;
    line-height: 1.35;
  }
}
</style>
