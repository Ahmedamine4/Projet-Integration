<script setup>
import { ArrowDown } from 'lucide-vue-next';
import BaseButton from '@/components/common/actions/BaseButton.vue';
import FolioCraftLogo from '@/assets/icons/FolioCraft.svg';

defineEmits(['register', 'explore', 'login']);
</script>

<template>
  <section class="landing-screen landing-screen--light home-hero">
    <header class="hero-nav">
      <button
        class="brand-lockup"
        type="button"
        aria-label="FolioCraft home"
        @click="$emit('explore')"
      >
        <img
          :src="FolioCraftLogo"
          alt=""
          class="brand-lockup__mark"
        >
        <span>FolioCraft</span>
      </button>

      <nav
        class="hero-nav__actions"
        aria-label="Account"
      >
        <BaseButton
          variant="ghost"
          size="xs"
          @click="$emit('login')"
        >
          Sign in
        </BaseButton>
        <BaseButton
          variant="pill"
          size="xs"
          @click="$emit('register')"
        >
          Sign up
        </BaseButton>
      </nav>
    </header>

    <div class="home-hero__content reveal-on-scroll">
      <p class="eyebrow">
        Student portfolios with proof built in
      </p>

      <h1 class="hero-title hero-title--top">
        Your <span>Portfolio,</span>
      </h1>

      <h2 class="hero-title hero-title--bottom">
        Certified for the Real World
      </h2>

      <p class="home-hero__tagline">
        Build, verify, and present your best work
      </p>

      <div class="home-hero__cta">
        <BaseButton
          variant="submit"
          size="md"
          @click="$emit('register')"
        >
          Start crafting
        </BaseButton>
        <button
          class="text-link"
          type="button"
          @click="$emit('explore')"
        >
          Explore FolioCraft
        </button>
      </div>
    </div>

    <button
      class="scroll-hint"
      type="button"
      aria-label="Scroll to AI section"
      @click="$emit('explore')"
    >
      <span>Scroll</span>
      <ArrowDown
        :size="18"
        stroke-width="2"
      />
    </button>
  </section>
</template>

<style scoped>
.home-hero {
  display: grid;
  grid-template-rows: auto 1fr auto;
  background:
    radial-gradient(circle at 14% 22%, rgba(var(--color-secondary-rgb), 0.18), transparent 24rem),
    radial-gradient(circle at 92% 14%, rgba(35, 162, 121, 0.14), transparent 24rem),
    linear-gradient(200deg, var(--landing-light), var(--landing-light) 52%, var(--color-surface) 100%);
}

.hero-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  width: min(100%, 88rem);
  margin: 0 auto;
}

.brand-lockup,
.scroll-hint {
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.brand-lockup {
  display: inline-flex;
  align-items: center;
  gap: 0.72rem;
  font-weight: var(--font-bold);
}

.brand-lockup__mark {
  width: 2rem;
  height: 2rem;
  object-fit: contain;
}

.hero-nav__actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.home-hero__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: min(100% - 3rem, 66rem);
  min-height: 64vh;
  margin: 0 auto;
  padding: clamp(2.5rem, 6vh, 4rem) 0 4.5rem;
  text-align: center;
}

.hero-title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: var(--font-medium);
  line-height: 0.94;
  letter-spacing: 0;
  text-wrap: balance;
}

.hero-title--top {
  margin-top: 1.1rem;
  font-size: clamp(3.6rem, 8vw, 7rem);
}

.hero-title--bottom {
  margin-top: 0.65rem;
  font-size: clamp(2.6rem, 6.2vw, 5.4rem);
}

.hero-title span {
  font-weight: var(--font-bold);
}

.home-hero__tagline {
  max-width: 34rem;
  margin: var(--space-xl) 0 0;
  color: rgba(var(--color-primary-rgb), 0.7);
  font-size: 0.9rem;
  font-weight: var(--font-medium);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.home-hero__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  margin-top: 2rem;
}

.text-link {
  min-height: 2.85rem;
  padding: 0 0.3rem;
  border: 0;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.28);
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: var(--font-size-sm);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
}

.text-link:hover {
  color: var(--color-secondary);
  border-color: var(--color-secondary);
  transform: translateY(-1px);
}

.scroll-hint {
  position: absolute;
  left: 50%;
  bottom: 1.15rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.85rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  border-radius: 999px;
  background: rgba(var(--color-background-rgb), 0.64);
  color: rgba(var(--color-primary-rgb), 0.68);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  transform: translateX(-50%);
  animation: hintBounce 1.8s ease-in-out infinite;
}

@keyframes hintBounce {
  0%,
  100% {
    transform: translate(-50%, 0);
  }
  50% {
    transform: translate(-50%, -0.55rem);
  }
}

@media (max-width: 760px) {
  .home-hero__content {
    width: min(100% - 1rem, 42rem);
    min-height: 68vh;
    padding-top: 3rem;
  }

  .home-hero__cta {
    flex-direction: column;
  }

  .hero-nav,
  .hero-nav__actions {
    gap: var(--space-sm);
  }

  .hero-title {
    line-height: 0.98;
  }

  .hero-title--top {
    font-size: clamp(3.2rem, 13vw, 5rem);
  }

  .hero-title--bottom {
    font-size: clamp(2.35rem, 10vw, 4rem);
  }

  .home-hero__tagline {
    font-size: 0.78rem;
    letter-spacing: 0.08em;
  }
}

@media (max-width: 520px) {
  .brand-lockup span {
    display: none;
  }
}
</style>
