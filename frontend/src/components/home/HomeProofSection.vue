<script setup>
import {
  BadgeCheck,
  BriefcaseBusiness,
  Github,
  GraduationCap,
} from 'lucide-vue-next';

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
</script>

<template>
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
</template>

<style scoped>
.proof-screen {
  display: grid;
  grid-template-rows: auto 1fr;
  align-items: center;
  gap: clamp(2rem, 5vw, 4rem);
  width: 100%;
}

.proof-screen .section-copy {
  width: min(100%, 88rem);
}

.proof-screen .section-copy h2 {
  max-width: 17ch;
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
  border: 1px solid rgba(var(--color-background-rgb), 0.12);
  border-radius: 0.95rem;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.16);
}

.feature-block svg {
  color: var(--color-secondary);
}

.feature-block h3 {
  margin: 4rem 0 0;
  font-size: clamp(1.45rem, 2.4vw, 2rem);
  line-height: 1.04;
}

.feature-block p {
  margin: 0.65rem 0 0;
  color: rgba(var(--color-background-rgb), 0.7);
  line-height: 1.55;
}

@media (max-width: 1080px) {
  .feature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }

  .feature-block {
    min-height: 13rem;
  }

  .feature-block h3 {
    margin-top: 2.2rem;
  }
}
</style>
