import { onUnmounted, ref, unref } from 'vue';

export function useHorizontalDragScroll(scrollerRef, options = {}) {
  const {
    enabled = true,
    dragSpeed = 1.2,
    minReleaseVelocity = 0.05,
    frictionPerFrame = 0.95,
    targetFrameDuration = 16,
    dragActivationDistance = 5,
    getLoopWidth = () => 0,
    onScroll = () => {},
  } = options;

  const isDragging = ref(false);
  const hasActivatedDrag = ref(false);
  const startX = ref(0);
  const lastX = ref(0);
  const lastTime = ref(0);
  const velocity = ref(0);
  const animationFrame = ref(null);

  function isEnabled() {
    return Boolean(unref(enabled));
  }

  function cancelMomentum() {
    if (!animationFrame.value) return;

    cancelAnimationFrame(animationFrame.value);
    animationFrame.value = null;
  }

  function normalizeScrollPosition() {
    const scroller = scrollerRef.value;
    const loopWidth = getLoopWidth();

    if (!scroller || !loopWidth) return;

    if (scroller.scrollLeft < 1) {
      scroller.scrollLeft += loopWidth;
    }
    else if (scroller.scrollLeft >= loopWidth) {
      scroller.scrollLeft -= loopWidth;
    }
  }

  function scrollBy(left) {
    const scroller = scrollerRef.value;
    if (!scroller) return;

    scroller.scrollBy({ left });
    normalizeScrollPosition();
    onScroll();
  }

  function handlePointerDown(event) {
    if (!isEnabled()) return;

    const scroller = scrollerRef.value;
    if (!scroller) return;

    isDragging.value = true;
    hasActivatedDrag.value = false;
    velocity.value = 0;
    startX.value = event.clientX;
    lastX.value = event.clientX;
    lastTime.value = performance.now();

    cancelMomentum();
    normalizeScrollPosition();
  }

  function handlePointerMove(event) {
    if (!isDragging.value || !isEnabled()) return;

    const totalDeltaX = event.clientX - startX.value;

    if (!hasActivatedDrag.value && Math.abs(totalDeltaX) < dragActivationDistance) {
      return;
    }

    if (!hasActivatedDrag.value) {
      hasActivatedDrag.value = true;
      scrollerRef.value?.setPointerCapture?.(event.pointerId);
    }

    const deltaX = event.clientX - lastX.value;
    event.preventDefault();
    scrollBy(-deltaX * dragSpeed);

    const now = performance.now();
    const deltaTime = now - lastTime.value;

    if (deltaTime > 0) {
      velocity.value = deltaX / deltaTime;
    }

    lastX.value = event.clientX;
    lastTime.value = now;
  }

  function handlePointerUp() {
    if (!isDragging.value) return;

    const shouldApplyMomentum = hasActivatedDrag.value;
    isDragging.value = false;
    hasActivatedDrag.value = false;

    if (!shouldApplyMomentum || Math.abs(velocity.value) < minReleaseVelocity) return;

    lastTime.value = performance.now();
    animationFrame.value = requestAnimationFrame(applyMomentum);
  }

  function applyMomentum(currentTime) {
    if (!isEnabled() || Math.abs(velocity.value) < minReleaseVelocity) {
      animationFrame.value = null;
      return;
    }

    const deltaTime = currentTime - lastTime.value;

    scrollBy(-velocity.value * deltaTime);

    velocity.value *= frictionPerFrame ** (deltaTime / targetFrameDuration);
    lastTime.value = currentTime;
    animationFrame.value = requestAnimationFrame(applyMomentum);
  }

  onUnmounted(cancelMomentum);

  return {
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    normalizeScrollPosition,
  };
}
