import { ref } from 'vue';

export function useDoubleTap(callback) {
  const lastTapAt = ref(0);

  function handleDoubleTap(event) {
    if (
      event.pointerType === 'mouse' ||
      event.target.closest('a, button, input, textarea, select')
    ) {
      return;
    }

    const now = Date.now();

    if (now - lastTapAt.value < 320) {
      event.preventDefault();
      event.stopPropagation();
      callback();
      lastTapAt.value = 0;
      return;
    }

    lastTapAt.value = now;
  }

  return { handleDoubleTap };
}