<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import PortfolioSectionShell from '@/components/portfolio/layout/PortfolioSectionShell.vue';
import PortfolioInternship from '@/components/portfolio/internships/PortfolioInternship.vue';

const props = defineProps({
  internships: {
    type: Array,
    default: () => [],
  },
  canAdd: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['add-internship', 'edit-internship']);

const visibleInternshipCount = 3;
const internshipsRef = ref(null);
const internshipItemRefs = ref([]);
const maxVisibleHeight = ref(null);
const canScrollUp = ref(false);
const canScrollDown = ref(false);
const hasScrollableInternships = computed(() => props.internships.length > visibleInternshipCount);
let resizeObserver = null;

function setInternshipItemRef(element, index) {
  if (element) internshipItemRefs.value[index] = element;
}

function updateScrollFades() {
  const el = internshipsRef.value;
  if (!el || !hasScrollableInternships.value) {
    canScrollUp.value = false;
    canScrollDown.value = false;
    return;
  }

  const maxScrollTop = el.scrollHeight - el.clientHeight;
  canScrollUp.value = el.scrollTop > 1;
  canScrollDown.value = el.scrollTop < maxScrollTop - 1;
}

function updateMaxVisibleHeight() {
  const el = internshipsRef.value;
  if (!el || !hasScrollableInternships.value) {
    maxVisibleHeight.value = null;
    updateScrollFades();
    return;
  }

  internshipItemRefs.value = internshipItemRefs.value.slice(0, props.internships.length);

  const visibleItems = internshipItemRefs.value.slice(0, visibleInternshipCount);
  if (visibleItems.length < visibleInternshipCount || visibleItems.some(item => !item)) return;

  const style = getComputedStyle(el);
  const gap = Number.parseFloat(style.rowGap || style.gap) || 0;
  const cardsHeight = visibleItems.reduce((height, item) => height + item.offsetHeight, 0);

  maxVisibleHeight.value = cardsHeight + (gap * (visibleInternshipCount - 1));
  updateScrollFades();
}

function scheduleLayoutUpdate() {
  nextTick(() => {
    updateMaxVisibleHeight();
    updateResizeObserver();
  });
}

function updateResizeObserver() {
  resizeObserver?.disconnect();
  const el = internshipsRef.value;
  if (!el) return;

  resizeObserver = new ResizeObserver(() => {
    nextTick(updateMaxVisibleHeight);
  });
  resizeObserver.observe(el);
  internshipItemRefs.value.forEach((item) => {
    if (item) resizeObserver.observe(item);
  });
}

onMounted(scheduleLayoutUpdate);

watch(
  () => props.internships,
  scheduleLayoutUpdate,
  { deep: true }
);

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});
</script>

<template>
  <PortfolioSectionShell
    title="Internships"
    add-label="Add Internship"
    :can-add="canAdd"
    :is-empty="!internships.length"
    empty-label="No internships yet"
    @add="emit('add-internship')"
  >
    <div
      class="internships-scroll-frame"
      :class="{
        'has-top-fade': canScrollUp,
        'has-bottom-fade': canScrollDown,
      }"
    >
      <div
        ref="internshipsRef"
        class="internships"
        :class="{ 'internships--scrollable': hasScrollableInternships }"
        :style="maxVisibleHeight ? { '--internships-max-height': `${maxVisibleHeight}px` } : null"
        @scroll="updateScrollFades"
      >
        <div
          v-for="(internship, index) in internships"
          :key="internship.id"
          :ref="element => setInternshipItemRef(element, index)"
          class="internships__item"
        >
          <PortfolioInternship
            :internship
            :can-edit="canAdd"
            @edit="internship => emit('edit-internship', internship)"
          />
        </div>
      </div>
    </div>
  </PortfolioSectionShell>
</template>

<style scoped>
.internships {
  --internship-gap: calc(var(--space-xl) * 1.2);
  position: relative;
  display: grid;
  gap: var(--internship-gap);
  padding-block: 0;
}

.internships--scrollable {
  max-height: var(--internships-max-height);
  padding-right: var(--internship-scrollbar-offset);
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.internships-scroll-frame {
  --internship-fade-height: clamp(2rem, 6vw, 4rem);
  --internship-scrollbar-offset: 1rem;
  position: relative;
  margin-block: var(--padding-block);
}

.internships-scroll-frame::before,
.internships-scroll-frame::after {
  content: "";
  position: absolute;
  inset-inline: 0 var(--internship-scrollbar-offset);
  z-index: 2;
  height: 0;
  pointer-events: none;
  transition: height var(--transition-normal);
}

.internships-scroll-frame::before {
  top: 0;
  background: linear-gradient(
    to bottom,
    var(--color-background),
    rgba(var(--color-background-rgb), 0)
  );
}

.internships-scroll-frame::after {
  bottom: 0;
  background: linear-gradient(
    to top,
    var(--color-background),
    rgba(var(--color-background-rgb), 0)
  );
}

.internships-scroll-frame.has-top-fade::before,
.internships-scroll-frame.has-bottom-fade::after {
  height: var(--internship-fade-height);
}

.internships::before {
  content: none;
}

@media (max-width: 640px) {
  .internships::before {
    left: calc(4.2rem + 1px);
  }
}
</style>
