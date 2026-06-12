<script setup>
import { FileCheck2, Sparkles } from 'lucide-vue-next';
import BaseButton from '@/components/common/actions/BaseButton.vue';

defineEmits(['register', 'explore']);
</script>

<template>
  <section class="landing-screen landing-screen--light showcase-screen">
    <div class="showcase-top">
      <div class="section-copy reveal-on-scroll">
        <p class="eyebrow">FolioCraft workspace</p>
        <h2>The portfolio system for verified student work.</h2>
      </div>

      <div class="showcase-side reveal-on-scroll">
        <BaseButton
          variant="submit"
          size="md"
          @click="$emit('register')"
        >
          Start crafting
        </BaseButton>
        <button
          class="round-link"
          type="button"
          aria-label="Continue exploring"
          @click="$emit('explore')"
        >
          <span>&nearr;</span>
        </button>
        <p>
          FolioCraft connects education, experiences, GitHub, validations,
          recommendations, and AI-assisted tagging into one profile.
        </p>
      </div>
    </div>

    <div class="product-visual reveal-on-scroll">
      <div class="product-visual__lines" />
      <div class="product-card product-card--score">
        <span>Credibility score</span>
        <strong>92 / 100</strong>
        <div><span /></div>
      </div>
      <div class="product-card product-card--ai">
        <Sparkles
          :size="22"
          stroke-width="1.8"
        />
        <div>
          <strong>AI tag detection</strong>
          <span>Technologies and domains found</span>
        </div>
      </div>
    </div>

    <div class="showcase-feature-row">
      <article class="mini-feature reveal-on-scroll">
        <FileCheck2
          :size="30"
          stroke-width="1.7"
        />
        <div>
          <h3>Build with proof</h3>
          <p>Collect education, experiences, and validation in one clear place.</p>
        </div>
      </article>

      <article class="mini-feature reveal-on-scroll">
        <Sparkles
          :size="30"
          stroke-width="1.7"
        />
        <div>
          <h3>Guided by AI</h3>
          <p>Our AI helps detect technologies and domains from experience text.</p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.showcase-screen {
  display: grid;
  grid-template-rows: auto minmax(16rem, 1fr) auto;
  gap: clamp(1.2rem, 2.5vh, 1.8rem);
}

.showcase-top {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(17rem, 0.55fr);
  align-items: start;
  gap: clamp(2rem, 6vw, 5rem);
  width: min(100%, 88rem);
  margin: 0 auto;
}

.showcase-top .section-copy {
  width: 100%;
  margin: 0;
}

.showcase-top .section-copy h2 {
  max-width: 15ch;
  font-size: clamp(2.7rem, 5.2vw, 5.2rem);
}

.showcase-side {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-md);
  align-items: start;
}

.showcase-side p {
  grid-column: 1 / -1;
  margin: 0.1rem 0 0;
  color: rgba(var(--color-primary-rgb), 0.64);
  line-height: 1.65;
}

.round-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.9rem;
  height: 2.9rem;
  border: 1px solid var(--landing-line);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.44);
  color: inherit;
  font: inherit;
  font-size: 1.9rem;
  line-height: 1;
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    background-color var(--transition-fast);
}

.round-link span {
  transform: translateY(-2px);
}

.round-link:hover {
  background: rgba(255, 255, 255, 0.72);
  transform: translate(2px, -2px);
}

.product-visual {
  position: relative;
  width: min(100%, 88rem);
  min-height: clamp(16rem, 34vh, 23rem);
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: 1.35rem;
  background:
    radial-gradient(circle at 34% 78%, rgba(247, 255, 121, 0.54), transparent 20rem),
    radial-gradient(circle at 23% 44%, rgba(var(--color-secondary-rgb), 0.42), transparent 24rem),
    linear-gradient(105deg, #fbf8e7, #f4f1e9 48%, #fff5c5);
  box-shadow: 0 24px 70px rgba(40, 36, 33, 0.1);
}

.product-visual::before {
  position: absolute;
  inset: auto -10% -55% 8%;
  height: 120%;
  border-radius: 50%;
  background: rgba(255, 246, 128, 0.38);
  content: '';
}

.product-visual__lines {
  position: absolute;
  inset: -20% auto auto -8%;
  width: 62%;
  height: 140%;
  background:
    repeating-linear-gradient(
      125deg,
      transparent 0 4.8rem,
      rgba(var(--color-secondary-rgb), 0.85) 4.9rem 5.02rem,
      transparent 5.12rem 8.2rem
    );
  transform: rotate(-4deg);
}

.product-card {
  position: absolute;
  z-index: 1;
  display: grid;
  gap: 0.42rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 18px 40px rgba(40, 36, 33, 0.12);
  color: var(--color-primary);
  backdrop-filter: blur(14px);
}

.product-card--score {
  top: 32%;
  right: 8%;
  width: min(20rem, 42vw);
  padding: 0.95rem 1rem;
  transform: rotate(7deg);
}

.product-card--score span,
.product-card--ai span {
  color: rgba(var(--color-primary-rgb), 0.56);
  font-size: var(--font-size-xs);
}

.product-card--score strong {
  font-size: 1.28rem;
}

.product-card--score div {
  height: 0.5rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(var(--color-primary-rgb), 0.1);
}

.product-card--score div span {
  display: block;
  width: 92%;
  height: 100%;
  background: linear-gradient(90deg, var(--color-secondary), var(--color-success));
  animation: meterGrow 1.1s ease both;
}

.product-card--ai {
  right: 4%;
  bottom: 10%;
  grid-template-columns: auto 1fr;
  align-items: center;
  width: min(25rem, 50vw);
  padding: 1rem;
  transform: rotate(8deg);
}

.product-card--ai strong {
  display: block;
}

.showcase-feature-row {
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  align-items: stretch;
  gap: clamp(1rem, 3vw, 3rem);
  width: min(100%, 78rem);
  margin: 0 auto;
}

.showcase-feature-row::before {
  order: 2;
  width: 1px;
  background: var(--landing-line);
  content: '';
}

.mini-feature {
  display: grid;
  grid-template-columns: 4rem minmax(0, 1fr);
  gap: var(--space-lg);
  align-items: center;
}

.mini-feature:nth-child(1) {
  order: 1;
}

.mini-feature:nth-child(2) {
  order: 3;
}

.mini-feature svg {
  color: var(--color-secondary);
}

.mini-feature h3 {
  margin: 0;
  font-size: clamp(1.35rem, 2vw, 1.8rem);
  line-height: 1.08;
}

.mini-feature p {
  margin: 0.65rem 0 0;
  color: rgba(var(--color-primary-rgb), 0.62);
  line-height: 1.55;
}

@keyframes meterGrow {
  from {
    transform: scaleX(0);
    transform-origin: left;
  }
  to {
    transform: scaleX(1);
    transform-origin: left;
  }
}

@media (max-width: 1080px) {
  .showcase-top {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .showcase-screen {
    grid-template-rows: auto auto auto;
  }

  .showcase-side {
    grid-template-columns: 1fr;
  }

  .showcase-top .section-copy h2 {
    font-size: clamp(2.2rem, 10vw, 3.8rem);
  }

  .product-visual {
    min-height: 18rem;
  }

  .product-card--score,
  .product-card--ai {
    right: 1rem;
    width: min(18rem, calc(100% - 2rem));
    transform: rotate(3deg);
  }

  .product-card--ai {
    bottom: 1rem;
  }

  .showcase-feature-row {
    grid-template-columns: 1fr;
  }

  .showcase-feature-row::before {
    display: none;
  }

  .showcase-feature-row .mini-feature:nth-child(1),
  .showcase-feature-row .mini-feature:nth-child(2) {
    order: initial;
  }
}

@media (max-width: 520px) {
  .mini-feature {
    grid-template-columns: 1fr;
    gap: var(--space-sm);
  }
}
</style>
