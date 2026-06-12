<script setup>
import { ref } from 'vue';
import { Sparkles } from 'lucide-vue-next';

const section = ref(null);

const aiHints = [
  'Reads project and experience descriptions',
  'Detects mentioned technologies',
  'Identifies related technical domains',
  'Helps keep portfolio tags consistent',
];

function scrollIntoView() {
  section.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

defineExpose({
  scrollIntoView,
});
</script>

<template>
  <section
    ref="section"
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
</template>

<style scoped>
.ai-screen {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(21rem, 1.05fr);
  align-items: center;
  gap: clamp(2rem, 5vw, 4rem);
  width: 100%;
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

@media (max-width: 1080px) {
  .ai-screen {
    grid-template-columns: 1fr;
  }
}
</style>
