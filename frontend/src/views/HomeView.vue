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
const storySection = ref(null);
let revealObserver;

const highlights = [
  {
    icon: FileCheck2,
    value: '01',
    title: 'Build a portfolio that feels complete',
    text: 'Bring projects, internships, activities, skills, and contact details together in one polished profile.',
  },
  {
    icon: BadgeCheck,
    value: '02',
    title: 'Turn proof into confidence',
    text: 'Show certified work, GitHub activity, and professor recommendations with the context recruiters expect.',
  },
  {
    icon: BriefcaseBusiness,
    value: '03',
    title: 'Present your story clearly',
    text: 'FolioCraft helps students move from scattered experience to a focused, professional portfolio.',
  },
];

const processSteps = [
  'Create your academic profile',
  'Add projects and experiences',
  'Collect recommendations',
  'Share a verified portfolio',
];

const stats = [
  { value: '360', label: 'profile views' },
  { value: '24', label: 'projects tracked' },
  { value: '12', label: 'validated skills' },
];

function goToRegister() {
  router.push('/register');
}

function scrollToStory() {
  storySection.value?.scrollIntoView({
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
      threshold: 0.18,
      rootMargin: '0px 0px -8% 0px',
    },
  );

  revealItems.forEach((item) => {
    if (item) {
      revealObserver.observe(item);
    }
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
    <section class="home-hero">
      <header class="home-hero__nav">
        <button
          class="brand-lockup"
          type="button"
          aria-label="FolioCraft home"
          @click="scrollToStory"
        >
          <img
            :src="FolioCraftLogo"
            alt=""
            class="brand-lockup__mark"
          >
          <span>FolioCraft</span>
        </button>

        <nav
          class="home-hero__actions"
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

      <div class="home-hero__content">
        <p class="home-hero__eyebrow">
          Student portfolios with proof built in
        </p>

        <h1 class="hero-title hero-title--top">
          Your <span class="hero-title__strong">Portfolio,</span>
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
            @click="scrollToStory"
          >
            Explore FolioCraft
          </button>
        </div>
      </div>

      <aside
        class="portfolio-preview"
        aria-label="FolioCraft portfolio preview"
      >
        <div class="portfolio-preview__header">
          <div>
            <span class="portfolio-preview__kicker">Live profile</span>
            <strong>Amal Benali</strong>
          </div>
          <Sparkles
            :size="20"
            stroke-width="1.8"
          />
        </div>

        <div class="portfolio-preview__score">
          <span>Portfolio strength</span>
          <strong>92%</strong>
        </div>

        <div class="portfolio-preview__meter">
          <span />
        </div>

        <div class="portfolio-preview__grid">
          <div
            v-for="stat in stats"
            :key="stat.label"
          >
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.label }}</span>
          </div>
        </div>
      </aside>

      <button
        class="scroll-hint"
        type="button"
        aria-label="Scroll to learn more"
        @click="scrollToStory"
      >
        <span>Scroll</span>
        <ArrowDown
          :size="18"
          stroke-width="2"
        />
      </button>
    </section>

    <section
      ref="storySection"
      class="landing-section landing-section--intro"
    >
      <div
        class="section-copy reveal-on-scroll"
      >
        <span class="section-label">Why FolioCraft</span>
        <h2>From student work to professional evidence.</h2>
        <p>
          FolioCraft gives students a clear home for their academic journey:
          projects, certifications, recommendations, GitHub contributions, and
          real experience shaped into a portfolio people can trust.
        </p>
      </div>

      <div
        class="proof-panel reveal-on-scroll"
      >
        <div class="proof-panel__item">
          <GraduationCap
            :size="24"
            stroke-width="1.8"
          />
          <span>Academic identity</span>
        </div>
        <div class="proof-panel__item">
          <Github
            :size="24"
            stroke-width="1.8"
          />
          <span>GitHub contributions</span>
        </div>
        <div class="proof-panel__item">
          <BadgeCheck
            :size="24"
            stroke-width="1.8"
          />
          <span>Verified recommendations</span>
        </div>
      </div>
    </section>

    <section class="landing-section landing-section--features">
      <article
        v-for="highlight in highlights"
        :key="highlight.title"
        class="feature-card reveal-on-scroll"
      >
        <div class="feature-card__topline">
          <component
            :is="highlight.icon"
            :size="24"
            stroke-width="1.8"
          />
          <span>{{ highlight.value }}</span>
        </div>
        <h3>{{ highlight.title }}</h3>
        <p>{{ highlight.text }}</p>
      </article>
    </section>

    <section class="landing-section landing-section--workflow">
      <div
        class="section-copy reveal-on-scroll"
      >
        <span class="section-label">How it works</span>
        <h2>A smoother path from experience to opportunity.</h2>
      </div>

      <ol
        class="workflow-list reveal-on-scroll"
      >
        <li
          v-for="(step, index) in processSteps"
          :key="step"
        >
          <span>{{ String(index + 1).padStart(2, '0') }}</span>
          <p>{{ step }}</p>
        </li>
      </ol>
    </section>

    <section class="landing-section landing-section--final">
      <div
        class="final-panel reveal-on-scroll"
      >
        <span class="section-label">Ready when you are</span>
        <h2>Craft a portfolio that carries the weight of your work.</h2>
        <p>
          FolioCraft helps your best projects, skills, and endorsements look
          organized, credible, and ready for the next conversation.
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
  min-height: 100vh;
  overflow-x: hidden;
  background:
    linear-gradient(180deg, var(--color-background) 0%, #fffaf3 48%, #f4f7f2 100%);
  color: var(--color-primary);
}

.home-hero {
  position: relative;
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  isolation: isolate;
  overflow: hidden;
  background:
    radial-gradient(circle at 14% 22%, rgba(var(--color-secondary-rgb), 0.18), transparent 24rem),
    radial-gradient(circle at 92% 14%, rgba(35, 162, 121, 0.16), transparent 24rem),
    linear-gradient(145deg, rgba(255, 255, 255, 0.5), transparent 42%),
    linear-gradient(200deg, var(--color-background), var(--color-background) 48%, var(--color-surface) 100%);
}

.home-hero::before,
.home-hero::after {
  position: absolute;
  z-index: -1;
  content: '';
  pointer-events: none;
}

.home-hero::before {
  inset: 7rem auto auto 8%;
  width: 11rem;
  aspect-ratio: 1;
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  transform: rotate(18deg);
  animation: floatShape 12s ease-in-out infinite;
}

.home-hero::after {
  right: -8rem;
  bottom: 8rem;
  width: 26rem;
  aspect-ratio: 1;
  border: 1px solid rgba(var(--color-secondary-rgb), 0.24);
  border-radius: 50%;
  animation: pulseRing 8s ease-in-out infinite;
}

.home-hero__nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-lg);
  width: min(100% - 4rem, 74rem);
  margin: 0 auto;
  padding: 1.8rem 0 0;
}

.brand-lockup,
.text-link,
.scroll-hint {
  font: inherit;
  color: inherit;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.brand-lockup {
  display: inline-flex;
  align-items: center;
  gap: 0.72rem;
  padding: 0.3rem 0;
  font-weight: var(--font-bold);
}

.brand-lockup__mark {
  width: 2rem;
  height: 2rem;
  object-fit: contain;
}

.home-hero__actions {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.home-hero__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: min(100% - 3rem, 66rem);
  min-height: 64vh;
  margin: 0 auto;
  padding: clamp(3rem, 7vh, 5rem) 0 5.5rem;
  text-align: center;
}

.home-hero__eyebrow,
.section-label,
.portfolio-preview__kicker {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.68);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  letter-spacing: 0;
  text-transform: uppercase;
}

.home-hero__eyebrow {
  animation: riseIn 0.7s ease both;
}

.home-hero__tagline {
  max-width: 34rem;
  margin: var(--space-xl) 0 0;
  color: rgba(var(--color-primary-rgb), 0.72);
  font-size: 0.95rem;
  font-weight: var(--font-medium);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  animation: riseIn 0.75s 0.2s ease both;
}

.home-hero__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  margin-top: 2rem;
  animation: riseIn 0.75s 0.32s ease both;
}

.text-link {
  min-height: 2.85rem;
  padding: 0 0.3rem;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.28);
  font-size: var(--font-size-sm);
  font-weight: var(--font-bold);
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

.hero-title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: var(--font-medium);
  line-height: 0.9;
  letter-spacing: 0;
  text-wrap: balance;
}

.hero-title--top {
  margin-top: 1.3rem;
  font-size: clamp(3.8rem, 9vw, 8.4rem);
  animation: titleReveal 0.9s 0.04s ease both;
}

.hero-title--bottom {
  margin-top: 0.8rem;
  font-size: clamp(2.8rem, 7vw, 6.5rem);
  animation: titleReveal 0.9s 0.12s ease both;
}

.hero-title__strong {
  font-weight: var(--font-bold);
}

.portfolio-preview {
  position: absolute;
  right: max(2rem, calc((100vw - 74rem) / 2));
  bottom: 6.5rem;
  width: min(21rem, calc(100vw - 2rem));
  padding: 1rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.66);
  box-shadow: 0 26px 70px rgba(40, 36, 33, 0.12);
  backdrop-filter: blur(18px);
  animation: previewEnter 0.9s 0.45s ease both;
}

.portfolio-preview__header,
.portfolio-preview__score,
.feature-card__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.portfolio-preview__header strong,
.portfolio-preview__score strong,
.portfolio-preview__grid strong {
  display: block;
  font-family: var(--font-editorial);
  font-size: 1.45rem;
  font-weight: 700;
}

.portfolio-preview__score {
  margin-top: 1.2rem;
  color: rgba(var(--color-primary-rgb), 0.7);
  font-size: var(--font-size-sm);
}

.portfolio-preview__meter {
  height: 0.55rem;
  margin-top: 0.7rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(var(--color-primary-rgb), 0.1);
}

.portfolio-preview__meter span {
  display: block;
  width: 92%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--color-secondary), var(--color-success));
  transform-origin: left;
  animation: meterGrow 1.1s 0.95s ease both;
}

.portfolio-preview__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
  margin-top: 1rem;
}

.portfolio-preview__grid div {
  min-width: 0;
  padding: 0.65rem;
  border-radius: var(--radius-sm);
  background: rgba(var(--color-background-rgb), 0.72);
}

.portfolio-preview__grid span {
  display: block;
  color: rgba(var(--color-primary-rgb), 0.58);
  font-size: 0.67rem;
  line-height: 1.25;
}

.scroll-hint {
  position: absolute;
  left: 50%;
  bottom: 1.8rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  border-radius: 999px;
  background: rgba(var(--color-background-rgb), 0.68);
  color: rgba(var(--color-primary-rgb), 0.7);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  transform: translateX(-50%);
  animation: hintBounce 1.8s ease-in-out infinite;
}

.landing-section {
  width: min(100% - 4rem, 74rem);
  margin: 0 auto;
  padding: clamp(4rem, 9vw, 7rem) 0;
}

.landing-section--intro,
.landing-section--workflow {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(18rem, 0.95fr);
  gap: clamp(2rem, 6vw, 5rem);
  align-items: center;
}

.section-copy h2,
.final-panel h2 {
  max-width: 13ch;
  margin: 0.7rem 0 0;
  font-family: var(--font-editorial);
  font-size: clamp(2.4rem, 5vw, 4.8rem);
  font-weight: 650;
  line-height: 0.96;
  letter-spacing: 0;
}

.section-copy p,
.feature-card p,
.final-panel p {
  margin: 1.2rem 0 0;
  color: rgba(var(--color-primary-rgb), 0.68);
  font-size: clamp(1rem, 1.5vw, 1.1rem);
  line-height: 1.75;
}

.proof-panel {
  display: grid;
  gap: var(--space-md);
}

.proof-panel__item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  min-height: 5rem;
  padding: 1rem 1.15rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.58);
  box-shadow: 0 18px 40px rgba(40, 36, 33, 0.06);
  font-weight: var(--font-bold);
}

.proof-panel__item:nth-child(2) {
  transform: translateX(2rem);
}

.proof-panel__item:nth-child(3) {
  transform: translateX(4rem);
}

.landing-section--features {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-md);
}

.feature-card {
  min-height: 22rem;
  padding: clamp(1.2rem, 2vw, 1.6rem);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  border-radius: var(--radius-sm);
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.7), rgba(var(--color-surface-rgb), 0.62)),
    var(--color-surface);
  box-shadow: 0 20px 50px rgba(40, 36, 33, 0.07);
}

.feature-card__topline {
  color: rgba(var(--color-primary-rgb), 0.72);
}

.feature-card__topline span {
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
}

.feature-card h3 {
  margin: 5rem 0 0;
  font-size: clamp(1.35rem, 2.2vw, 1.8rem);
  line-height: 1.1;
  letter-spacing: 0;
}

.landing-section--workflow {
  align-items: start;
}

.workflow-list {
  display: grid;
  gap: var(--space-sm);
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: step;
}

.workflow-list li {
  display: grid;
  grid-template-columns: 4rem minmax(0, 1fr);
  align-items: center;
  min-height: 5.2rem;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.12);
}

.workflow-list span {
  font-family: var(--font-mono);
  color: var(--color-secondary);
}

.workflow-list p {
  margin: 0;
  font-size: clamp(1.15rem, 2vw, 1.55rem);
  font-weight: var(--font-bold);
}

.landing-section--final {
  padding-top: clamp(2rem, 6vw, 4rem);
}

.final-panel {
  display: grid;
  justify-items: center;
  min-height: 28rem;
  padding: clamp(2rem, 6vw, 5rem) clamp(1.25rem, 5vw, 4rem);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  border-radius: var(--radius-sm);
  background:
    linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.9), rgba(40, 36, 33, 0.8)),
    var(--color-primary);
  color: var(--color-background);
  text-align: center;
}

.final-panel .section-label,
.final-panel p {
  color: rgba(var(--color-background-rgb), 0.72);
}

.final-panel h2 {
  max-width: 17ch;
}

.final-panel p {
  max-width: 42rem;
  margin-bottom: 1.5rem;
}

.reveal-on-scroll {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity 0.7s ease,
    transform 0.7s ease;
}

.reveal-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@keyframes titleReveal {
  from {
    opacity: 0;
    transform: translateY(28px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes previewEnter {
  from {
    opacity: 0;
    transform: translate(28px, 20px) rotate(2deg);
  }
  to {
    opacity: 1;
    transform: translate(0, 0) rotate(0deg);
  }
}

@keyframes meterGrow {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
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

@keyframes floatShape {
  0%,
  100% {
    transform: translateY(0) rotate(18deg);
  }
  50% {
    transform: translateY(1rem) rotate(28deg);
  }
}

@keyframes pulseRing {
  0%,
  100% {
    opacity: 0.72;
    transform: scale(1);
  }
  50% {
    opacity: 0.38;
    transform: scale(1.08);
  }
}

@media (max-width: 980px) {
  .portfolio-preview {
    position: relative;
    right: auto;
    bottom: auto;
    width: min(100% - 2rem, 28rem);
    margin: -5rem auto 5.5rem;
  }

  .home-hero__content {
    min-height: 60vh;
    padding-bottom: 7rem;
  }

  .landing-section--intro,
  .landing-section--workflow,
  .landing-section--features {
    grid-template-columns: 1fr;
  }

  .feature-card {
    min-height: 16rem;
  }

  .feature-card h3 {
    margin-top: 3rem;
  }

  .proof-panel__item:nth-child(2),
  .proof-panel__item:nth-child(3) {
    transform: none;
  }
}

@media (max-width: 768px) {
  .home-hero__nav,
  .landing-section {
    width: min(100% - 2rem, 42rem);
  }

  .home-hero__nav {
    padding-top: 1.25rem;
  }

  .home-hero__actions {
    gap: var(--space-sm);
  }

  .home-hero__content {
    width: min(100% - 2rem, 42rem);
    min-height: 64vh;
    padding-top: 4rem;
  }

  .home-hero__cta {
    flex-direction: column;
  }

  .hero-title {
    line-height: 0.98;
  }

  .home-hero__tagline {
    font-size: 0.8rem;
    letter-spacing: 0.08em;
  }

  .section-copy h2,
  .final-panel h2 {
    max-width: 100%;
  }

  .workflow-list li {
    grid-template-columns: 3.4rem minmax(0, 1fr);
  }
}

@media (max-width: 520px) {
  .brand-lockup span {
    display: none;
  }

  .home-hero__nav {
    gap: var(--space-md);
  }

  .portfolio-preview__grid {
    grid-template-columns: 1fr;
  }

  .scroll-hint {
    bottom: 1rem;
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
