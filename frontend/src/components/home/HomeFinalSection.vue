<script setup>
import BaseButton from '@/components/common/actions/BaseButton.vue';

defineEmits(['register']);
</script>

<template>
  <section class="landing-screen landing-screen--light final-screen">
    <div class="final-copy reveal-on-scroll">
      <p class="eyebrow">Ready when your work is</p>
      <h2>Your portfolio, certified for the real world.</h2>
      <p>
        Build, verify, and present your best work with FolioCraft.
      </p>
      <BaseButton
        variant="submit"
        size="md"
        @click="$emit('register')"
      >
        Create your FolioCraft
      </BaseButton>
    </div>
  </section>
</template>

<style scoped>
.final-screen {
  display: grid;
  place-items: center;
  align-items: center;
  gap: clamp(2rem, 5vw, 4rem);
  width: 100%;
  background:
    radial-gradient(circle at 50% 0%, rgba(var(--color-secondary-rgb), 0.13), transparent 26rem),
    var(--landing-light);
  text-align: center;
}

.final-copy {
  display: grid;
  justify-items: center;
  width: min(100%, 42rem);
  margin: 0 auto;
}

.final-copy h2 {
  max-width: 14ch;
  margin: 0.8rem 0 0;
  font-family: var(--font-ui);
  font-size: clamp(2.5rem, 4.7vw, 4.8rem);
  font-weight: 760;
  line-height: 0.98;
  letter-spacing: 0;
  text-wrap: balance;
}

.final-copy p {
  max-width: 36rem;
  margin: 0.65rem 0 1.7rem;
  color: rgba(var(--color-primary-rgb), 0.62);
  line-height: 1.55;
}

@media (max-width: 760px) {
  .final-copy h2 {
    font-size: clamp(2.2rem, 10vw, 3.8rem);
  }
}
</style>
