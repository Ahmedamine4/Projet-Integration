<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowDown,
  BadgeCheck,
  BriefcaseBusiness,
  FileCheck2,
  Github,
  GraduationCap,
  Sparkles,
} from 'lucide-vue-next';
import BaseButton from '@/components/common/actions/BaseButton.vue';
import FolioCraftLogo from '@/assets/icons/FolioCraft.svg';

const router = useRouter();
const landingPage = ref(null);
const aiSection = ref(null);
let revealObserver;

const featureBlocks = [
  {
    icon: GraduationCap,
    title: 'Academic proof',
    text: 'Education, projects, internships, and certifications stay connected to the student profile.',
  },
  {
    icon: BadgeCheck,
    title: 'Trusted validation',
    text: 'Recommendations, validated work, and credibility scoring help the portfolio feel real.',
  },
  {
    icon: Github,
    title: 'Developer signals',
    text: 'GitHub contributions and project evidence give recruiters more than a static resume.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Career ready',
    text: 'FolioCraft turns scattered student work into a clean portfolio for opportunities.',
  },
];

const aiHints = [
  'Reads project and experience descriptions',
  'Detects mentioned technologies',
  'Identifies related technical domains',
  'Helps keep portfolio tags consistent',
];

function goToRegister() {
  router.push('/register');
}

function scrollToAi() {
  aiSection.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

onMounted(() => {
  const revealItems = landingPage.value?.querySelectorAll('.reveal-on-scroll') ?? [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (reduceMotion.matches) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px',
    },
  );

  revealItems.forEach((item) => {
    revealObserver.observe(item);
  });
});

onUnmounted(() => {
  revealObserver?.disconnect();
});
</script>

<template>
  <div
    ref="landingPage"
    class="landing-page"
  >
    <section class="landing-screen landing-screen--light home-hero">
      <header class="hero-nav">
        <button
          class="brand-lockup"
          type="button"
          aria-label="FolioCraft home"
          @click="scrollToAi"
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
            @click="router.push('/login')"
          >
            Sign in
          </BaseButton>
          <BaseButton
            variant="pill"
            size="xs"
            @click="goToRegister"
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
            @click="goToRegister"
          >
            Start crafting
          </BaseButton>
          <button
            class="text-link"
            type="button"
            @click="scrollToAi"
          >
            Explore FolioCraft
          </button>
        </div>
      </div>

      <button
        class="scroll-hint"
        type="button"
        aria-label="Scroll to AI section"
        @click="scrollToAi"
      >
        <span>Scroll</span>
        <ArrowDown
          :size="18"
          stroke-width="2"
        />
      </button>
    </section>

    <section
      ref="aiSection"
      class="landing-screen landing-screen--dark ai-screen"
    >
      <div class="section-copy reveal-on-scroll">
        <p class="eyebrow">Focused AI inside FolioCraft</p>
        <h2>Simple detection that makes portfolios easier to organize.</h2>
        <p>
          FolioCraft uses AI for one practical job: reading experience text and
          detecting the technologies and domains that belong with it.
        </p>
      </div>

      <div class="ai-console reveal-on-scroll">
        <div class="ai-console__header">
          <span />
          <span />
          <span />
          <strong>Technology detection</strong>
        </div>
        <div class="ai-console__message">
          <Sparkles
            :size="20"
            stroke-width="1.8"
          />
          <p>
            Detected technologies: React, Supabase, PostgreSQL. Suggested
            domains: Web Frontend, Web Backend.
          </p>
        </div>
        <ul>
          <li
            v-for="hint in aiHints"
            :key="hint"
          >
            {{ hint }}
          </li>
        </ul>
      </div>
    </section>

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
            @click="goToRegister"
          >
            Start crafting
          </BaseButton>
          <button
            class="round-link"
            type="button"
            aria-label="Continue exploring"
            @click="scrollToAi"
          >
            &nearr;
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

    <section class="landing-screen landing-screen--dark proof-screen">
      <div class="section-copy reveal-on-scroll">
        <p class="eyebrow">Built for trust</p>
        <h2>Everything a real portfolio needs, organized clearly.</h2>
      </div>

      <div class="feature-grid">
        <article
          v-for="feature in featureBlocks"
          :key="feature.title"
          class="feature-block reveal-on-scroll"
        >
          <component
            :is="feature.icon"
            :size="32"
            stroke-width="1.7"
          />
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.text }}</p>
        </article>
      </div>
    </section>

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
          @click="goToRegister"
        >
          Create your FolioCraft
        </BaseButton>
      </div>
    </section>
  </div>
</template>

<style scoped>
:global(html) {
  scroll-behavior: smooth;
}

.landing-page {
  --landing-dark: #181614;
  --landing-darker: #0f0e0d;
  --landing-light: #f7f5ee;
  --landing-line: rgba(var(--color-primary-rgb), 0.13);
  overflow-x: hidden;
  background: var(--landing-light);
  color: var(--color-primary);
}

.landing-screen {
  position: relative;
  height: 100vh;
  padding: clamp(1.25rem, 2.6vw, 2rem);
  overflow-x: hidden;
  overflow-y: auto;
  isolation: isolate;
}

.landing-screen--light {
  background: var(--landing-light);
  color: var(--color-primary);
}

.landing-screen--dark {
  background:
    radial-gradient(circle at 80% 12%, rgba(var(--color-secondary-rgb), 0.2), transparent 24rem),
    linear-gradient(145deg, var(--landing-dark), var(--landing-darker));
  color: var(--color-background);
}

.hero-screen {
  display: grid;
  grid-template-rows: auto auto minmax(18rem, 1fr) auto;
  gap: clamp(1.2rem, 2.6vh, 1.8rem);
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
.round-link,
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

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(18rem, 0.55fr);
  align-items: start;
  gap: clamp(2rem, 6vw, 5rem);
  width: min(100%, 88rem);
  margin: 0 auto;
  padding-top: clamp(1.5rem, 4vh, 3rem);
}

.eyebrow {
  margin: 0;
  color: rgba(var(--color-secondary-rgb), 0.92);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
}

.hero-copy h1,
.section-copy h2,
.final-copy h2 {
  margin: 0;
  font-family: var(--font-ui);
  font-weight: 760;
  line-height: 0.98;
  letter-spacing: 0;
  text-wrap: balance;
}

.hero-copy h1 {
  max-width: 13ch;
  margin-top: 0.6rem;
  font-size: clamp(4.2rem, 8.6vw, 8.8rem);
}

.hero-side {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-md);
  align-items: start;
}

.hero-side p {
  grid-column: 1 / -1;
  margin: 0.2rem 0 0;
  color: rgba(var(--color-primary-rgb), 0.64);
  font-size: clamp(0.95rem, 1.3vw, 1.08rem);
  line-height: 1.65;
}

.round-link {
  display: inline-grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  border: 1px solid var(--landing-line);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.44);
  font-size: 1.9rem;
  line-height: 1;
  transition:
    transform var(--transition-fast),
    background-color var(--transition-fast);
}

.round-link:hover {
  background: rgba(255, 255, 255, 0.72);
  transform: translate(2px, -2px);
}

.hero-visual {
  position: relative;
  width: min(100%, 88rem);
  min-height: clamp(17rem, 38vh, 25rem);
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: 1.35rem;
  background:
    radial-gradient(circle at 34% 78%, rgba(247, 255, 121, 0.55), transparent 20rem),
    radial-gradient(circle at 23% 44%, rgba(var(--color-secondary-rgb), 0.42), transparent 24rem),
    linear-gradient(105deg, #fbf8e7, #f4f1e9 48%, #fff5c5);
  box-shadow: 0 24px 70px rgba(40, 36, 33, 0.1);
}

.hero-visual::before {
  position: absolute;
  inset: auto -10% -55% 8%;
  height: 120%;
  border-radius: 50%;
  background: rgba(255, 246, 128, 0.38);
  content: '';
}

.hero-visual__lines {
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

.ai-card {
  position: absolute;
  z-index: 1;
  display: grid;
  gap: 0.42rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 40px rgba(40, 36, 33, 0.12);
  color: var(--color-primary);
  backdrop-filter: blur(14px);
}

.ai-card--score {
  top: 16%;
  right: 8%;
  width: min(20rem, 42vw);
  padding: 0.95rem 1rem;
  transform: rotate(8deg);
}

.ai-card--score span,
.ai-card--recommend span {
  color: rgba(var(--color-primary-rgb), 0.56);
  font-size: var(--font-size-xs);
}

.ai-card--score strong {
  font-size: 1.35rem;
}

.ai-card--score div {
  height: 0.5rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(var(--color-primary-rgb), 0.1);
}

.ai-card--score div span {
  display: block;
  width: 92%;
  height: 100%;
  background: linear-gradient(90deg, var(--color-secondary), var(--color-success));
  animation: meterGrow 1.1s ease both;
}

.ai-card--recommend {
  right: 4%;
  bottom: 10%;
  grid-template-columns: auto 1fr;
  align-items: center;
  width: min(25rem, 50vw);
  padding: 1rem;
  transform: rotate(10deg);
}

.ai-card--recommend strong {
  display: block;
}

.hero-feature-row {
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  align-items: stretch;
  gap: clamp(1rem, 3vw, 3rem);
  width: min(100%, 78rem);
  margin: 0 auto;
}

.hero-feature-row::before {
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

.mini-feature svg,
.feature-block svg {
  color: var(--color-secondary);
}

.mini-feature h2,
.feature-block h3 {
  margin: 0;
  font-size: clamp(1.45rem, 2.4vw, 2rem);
  line-height: 1.04;
}

.mini-feature p,
.feature-block p,
.section-copy p,
.final-copy p {
  margin: 0.65rem 0 0;
  color: rgba(var(--color-primary-rgb), 0.62);
  line-height: 1.55;
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

.ai-screen,
.proof-screen,
.final-screen {
  display: grid;
  align-items: center;
  gap: clamp(2rem, 5vw, 4rem);
  width: 100%;
}

.ai-screen {
  grid-template-columns: minmax(0, 0.95fr) minmax(21rem, 1.05fr);
}

.section-copy,
.final-copy {
  width: min(100%, 42rem);
  margin: 0 auto;
}

.section-copy h2,
.final-copy h2 {
  margin-top: 0.8rem;
  font-size: clamp(3rem, 6vw, 6.6rem);
}

.landing-screen--dark .section-copy p,
.landing-screen--dark .final-copy p {
  color: rgba(var(--color-background-rgb), 0.7);
}

.ai-console {
  width: min(100%, 42rem);
  margin: 0 auto;
  border: 1px solid rgba(var(--color-background-rgb), 0.12);
  border-radius: 1.2rem;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.28);
  overflow: hidden;
}

.ai-console__header {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 1rem;
  border-bottom: 1px solid rgba(var(--color-background-rgb), 0.12);
}

.ai-console__header span {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  background: rgba(var(--color-background-rgb), 0.32);
}

.ai-console__header strong {
  margin-left: auto;
  color: rgba(var(--color-background-rgb), 0.76);
  font-size: var(--font-size-xs);
}

.ai-console__message {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-md);
  margin: 1rem;
  padding: 1rem;
  border-radius: 0.85rem;
  background: rgba(var(--color-secondary-rgb), 0.14);
}

.ai-console__message p {
  margin: 0;
  line-height: 1.6;
}

.ai-console ul {
  display: grid;
  gap: var(--space-sm);
  margin: 0;
  padding: 0 1rem 1.2rem;
  list-style: none;
}

.ai-console li {
  padding: 0.9rem 1rem;
  border: 1px solid rgba(var(--color-background-rgb), 0.1);
  border-radius: 0.75rem;
  color: rgba(var(--color-background-rgb), 0.78);
}

.proof-screen {
  grid-template-rows: auto 1fr;
  align-items: center;
}

.proof-screen .section-copy {
  width: min(100%, 88rem);
}

.proof-screen .section-copy h2 {
  max-width: 15ch;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-md);
  width: min(100%, 88rem);
  margin: 0 auto;
}

.feature-block {
  min-height: 20rem;
  padding: clamp(1.1rem, 2vw, 1.5rem);
  border: 1px solid rgba(var(--color-primary-rgb), 0.09);
  border-radius: 0.95rem;
  background: rgba(255, 255, 255, 0.52);
  box-shadow: 0 20px 55px rgba(40, 36, 33, 0.06);
}

.feature-block h3 {
  margin-top: 4rem;
}

.final-screen {
  place-items: center;
  text-align: center;
}

.final-copy {
  display: grid;
  justify-items: center;
}

.final-copy h2 {
  max-width: 14ch;
}

.final-copy p {
  max-width: 36rem;
  margin-bottom: 1.7rem;
}

.reveal-on-scroll {
  opacity: 0;
  transform: translateY(26px);
  transition:
    opacity 0.7s ease,
    transform 0.7s ease;
}

.reveal-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
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

@keyframes hintBounce {
  0%,
  100% {
    transform: translate(-50%, 0);
  }
  50% {
    transform: translate(-50%, -0.55rem);
  }
}

@media (max-width: 1080px) {
  .hero-grid,
  .ai-screen,
  .feature-grid {
    grid-template-columns: 1fr;
  }

  .hero-copy h1 {
    max-width: 15ch;
  }

  .feature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .landing-screen {
    height: 100vh;
    padding: 1rem;
  }

  .hero-screen {
    grid-template-rows: auto auto auto auto;
  }

  .hero-nav {
    gap: var(--space-sm);
  }

  .hero-nav__actions {
    gap: var(--space-sm);
  }

  .hero-grid {
    gap: var(--space-lg);
    padding-top: var(--space-lg);
  }

  .hero-copy h1 {
    font-size: clamp(3.4rem, 14vw, 5.2rem);
  }

  .hero-side {
    grid-template-columns: 1fr;
  }

  .round-link {
    display: none;
  }

  .hero-visual {
    min-height: 18rem;
  }

  .ai-card--score,
  .ai-card--recommend {
    right: 1rem;
    width: min(18rem, calc(100% - 2rem));
    transform: rotate(3deg);
  }

  .ai-card--recommend {
    bottom: 1rem;
  }

  .hero-feature-row,
  .feature-grid {
    grid-template-columns: 1fr;
  }

  .hero-feature-row::before {
    display: none;
  }

  .mini-feature:nth-child(1),
  .mini-feature:nth-child(2) {
    order: initial;
  }

  .section-copy h2,
  .final-copy h2 {
    font-size: clamp(2.6rem, 12vw, 4.6rem);
  }

  .feature-block {
    min-height: 13rem;
  }

  .feature-block h3 {
    margin-top: 2.2rem;
  }
}

@media (max-width: 520px) {
  .brand-lockup span {
    display: none;
  }

  .mini-feature {
    grid-template-columns: 1fr;
    gap: var(--space-sm);
  }
}

.home-hero {
  display: grid;
  grid-template-rows: auto 1fr auto;
  background:
    radial-gradient(circle at 14% 22%, rgba(var(--color-secondary-rgb), 0.18), transparent 24rem),
    radial-gradient(circle at 92% 14%, rgba(35, 162, 121, 0.14), transparent 24rem),
    linear-gradient(200deg, var(--landing-light), var(--landing-light) 52%, var(--color-surface) 100%);
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
  top: 16%;
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

.showcase-feature-row .mini-feature:nth-child(1) {
  order: 1;
}

.showcase-feature-row .mini-feature:nth-child(2) {
  order: 3;
}

.mini-feature h3 {
  margin: 0;
  font-size: clamp(1.35rem, 2vw, 1.8rem);
  line-height: 1.08;
}

.section-copy h2,
.final-copy h2 {
  font-size: clamp(2.5rem, 4.7vw, 4.8rem);
}

.proof-screen .section-copy h2 {
  max-width: 17ch;
}

.landing-screen--dark .feature-block {
  border-color: rgba(var(--color-background-rgb), 0.12);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.16);
}

.landing-screen--dark .feature-block p {
  color: rgba(var(--color-background-rgb), 0.7);
}

.final-screen {
  background:
    radial-gradient(circle at 50% 0%, rgba(var(--color-secondary-rgb), 0.13), transparent 26rem),
    var(--landing-light);
}

@media (max-width: 1080px) {
  .showcase-top {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .home-hero__content {
    width: min(100% - 1rem, 42rem);
    min-height: 68vh;
    padding-top: 3rem;
  }

  .home-hero__cta,
  .showcase-side {
    grid-template-columns: 1fr;
  }

  .home-hero__cta {
    flex-direction: column;
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

  .showcase-screen {
    grid-template-rows: auto auto auto;
  }

  .showcase-top .section-copy h2,
  .section-copy h2,
  .final-copy h2 {
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

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
