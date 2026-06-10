<template>
  <header class="feed-header">
    <div class="feed-header__inner">
      <div class="feed-header__intro">
        

        <h1>Discover</h1>

        <p>
          Explore student projects, opportunities and inspiring profiles.
        </p>
      </div>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.feed-header {
  position: relative;
  width: 100%;
  padding-block: 1.35rem 1.15rem;
  padding-inline: 0;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.06);
  background:
    radial-gradient(
      circle at 10% 18%,
      rgba(255, 121, 145, 0.18),
      transparent 19rem
    ),
    radial-gradient(
      circle at 34% 4%,
      rgba(var(--color-secondary-rgb), 0.13),
      transparent 20rem
    ),
    linear-gradient(
      135deg,
      rgba(var(--color-background-rgb), 0.98),
      rgba(var(--color-surface-rgb), 0.72)
    );
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  flex-shrink: 0;
  overflow: hidden;
}
.feed-header::before {
  content: '';
  position: absolute;
  left: -5rem;
  top: -7rem;
  width: 22rem;
  height: 22rem;
  border-radius: 999px;
  background:
    radial-gradient(
      circle,
      rgba(255, 121, 145, 0.16),
      transparent 68%
    );
  pointer-events: none;
}

.feed-header::after {
  content: '';
  position: absolute;
  right: 14%;
  top: -5rem;
  width: 18rem;
  height: 18rem;
  border-radius: 999px;
  background:
    radial-gradient(
      circle,
      rgba(var(--color-secondary-rgb), 0.12),
      transparent 70%
    );
  pointer-events: none;
}

.feed-header__inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: calc(250px + 700px + 270px + (var(--space-md) * 2));
  margin-inline: auto;
}

.feed-header__intro {
  display: grid;
  gap: 0.35rem;
}

.feed-header__eyebrow {
  width: fit-content;
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: 999px;
  padding: 0.28rem 0.7rem;
  background: rgba(var(--color-background-rgb), 0.54);
  color: rgba(var(--color-primary-rgb), 0.54);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.feed-header__intro h1 {
  margin: 0;
  color: var(--color-primary);
  font-size: clamp(2rem, 3.2vw, 2.75rem);
  font-weight: 700;
  letter-spacing: -0.06em;
  line-height: 0.98;
}

.feed-header__intro p {
  max-width: 36rem;
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.58);
  font-size: var(--font-size-sm);
  line-height: 1.45;
}

@media (max-width: 760px) {
  .feed-header {
    padding: 1.15rem var(--space-md) 1rem;
  }

  .feed-header__intro h1 {
    font-size: clamp(1.85rem, 10vw, 2.35rem);
  }
}
</style>