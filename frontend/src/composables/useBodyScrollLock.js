import { watch, onUnmounted } from 'vue';

export function useBodyScrollLock(isLocked) {
  watch(isLocked, (locked) => {
    document.body.style.overflow = locked ? 'hidden' : '';
  }, { immediate: true });

  onUnmounted(() => {
    document.body.style.overflow = '';
  });
}
