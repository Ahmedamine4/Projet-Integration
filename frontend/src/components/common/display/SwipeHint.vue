<template>
  <div
    class="swipe-hint"
    aria-hidden="true"
  >
    <span>Swipe</span>
    <svg
      class="swipe-hint-icon"
      viewBox="0 0 190 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 64 C55 68 98 68 146 56"
        fill="none"
        stroke="currentColor"
        stroke-width="12"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M108 20 Q116 58 176 46"
        fill="none"
        stroke="currentColor"
        stroke-width="12"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M132 98 Q124 60 176 46"
        fill="none"
        stroke="currentColor"
        stroke-width="12"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>

<style scoped>
.swipe-hint {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.2rem, 0.6vw, 0.4rem);
  color: color-mix(
    in srgb,
    var(--color-primary) 42%,
    var(--color-background)
  );
  font-family: var(--font-ui);
  font-size: clamp(1rem, 2vw, 1.4rem);
  font-weight: var(--font-medium);
  line-height: 1;
  white-space: nowrap;
  user-select: none;
  pointer-events: none;
}

.swipe-hint-icon {
  flex: 0 0 auto;
  width: clamp(1.8rem, 3.5vw, 2.5rem);
  height: clamp(0.9rem, 1.8vw, 1.25rem);
  color: currentColor;
  transform: translateY(0.08em);
}
</style>