<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import HomeAiSection from '@/components/home/HomeAiSection.vue';
import HomeFinalSection from '@/components/home/HomeFinalSection.vue';
import HomeHeroSection from '@/components/home/HomeHeroSection.vue';
import HomeProofSection from '@/components/home/HomeProofSection.vue';
import HomeShowcaseSection from '@/components/home/HomeShowcaseSection.vue';

const router = useRouter();
const landingPage = ref(null);
const aiSection = ref(null);
let revealObserver;

function goToRegister() {
  router.push('/register');
}

function goToLogin() {
  router.push('/login');
}

function scrollToAi() {
  aiSection.value?.scrollIntoView();
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
    <HomeHeroSection
      @explore="scrollToAi"
      @login="goToLogin"
      @register="goToRegister"
    />
    <HomeAiSection
      ref="aiSection"
    />
    <HomeShowcaseSection
      @explore="scrollToAi"
      @register="goToRegister"
    />
    <HomeProofSection />
    <HomeFinalSection @register="goToRegister" />
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

.landing-page :deep(.landing-screen) {
  position: relative;
  height: 100vh;
  padding: clamp(1.25rem, 2.6vw, 2rem);
  overflow-x: hidden;
  overflow-y: auto;
  isolation: isolate;
}

.landing-page :deep(.landing-screen--light) {
  background: var(--landing-light);
  color: var(--color-primary);
}

.landing-page :deep(.landing-screen--dark) {
  background:
    radial-gradient(circle at 80% 12%, rgba(var(--color-secondary-rgb), 0.2), transparent 24rem),
    linear-gradient(145deg, var(--landing-dark), var(--landing-darker));
  color: var(--color-background);
}

.landing-page :deep(.eyebrow) {
  margin: 0;
  color: rgba(var(--color-secondary-rgb), 0.92);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
}

.landing-page :deep(.section-copy) {
  width: min(100%, 42rem);
  margin: 0 auto;
}

.landing-page :deep(.section-copy h2) {
  margin: 0.8rem 0 0;
  font-family: var(--font-ui);
  font-size: clamp(2.5rem, 4.7vw, 4.8rem);
  font-weight: 760;
  line-height: 0.98;
  letter-spacing: 0;
  text-wrap: balance;
}

.landing-page :deep(.section-copy p) {
  margin: 0.65rem 0 0;
  color: rgba(var(--color-primary-rgb), 0.62);
  line-height: 1.55;
}

.landing-page :deep(.landing-screen--dark .section-copy p) {
  color: rgba(var(--color-background-rgb), 0.7);
}

.landing-page :deep(.reveal-on-scroll) {
  opacity: 0;
  transform: translateY(26px);
  transition:
    opacity 0.7s ease,
    transform 0.7s ease;
}

.landing-page :deep(.reveal-on-scroll.is-visible) {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 760px) {
  .landing-page :deep(.landing-screen) {
    height: 100vh;
    padding: 1rem;
  }

  .landing-page :deep(.section-copy h2) {
    font-size: clamp(2.2rem, 10vw, 3.8rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing-page,
  .landing-page :deep(*) {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
