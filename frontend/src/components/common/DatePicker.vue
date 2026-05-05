<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-vue-next';

const model = defineModel({
  type: String,
  default: '',
});

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Select date',
  },
});

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const minYear = 1980;

const pickerElement = ref(null);
const isOpen = ref(false);
const today = new Date();
const currentYear = today.getFullYear();
const visibleMonth = ref(getInitialVisibleMonth());
const pickerMode = ref('days');

function getInitialVisibleMonth() {
  const selectedDate = parseDate(model.value);
  return selectedDate || new Date(today.getFullYear(), today.getMonth(), 1);
}

function parseDate(value) {
  if (!value) return null;

  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function isSameDay(firstDate, secondDate) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

const selectedDate = computed(() => parseDate(model.value));

const displayValue = computed(() => {
  if (!selectedDate.value) return props.placeholder;

  return selectedDate.value.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

const visibleMonthLabel = computed(() => {
  return `${monthNames[visibleMonth.value.getMonth()]} ${visibleMonth.value.getFullYear()}`;
});

const visibleYearLabel = computed(() => {
  return String(visibleMonth.value.getFullYear());
});

const headerLabel = computed(() => {
  return pickerMode.value === 'months'
    ? visibleYearLabel.value
    : visibleMonthLabel.value;
});

const years = computed(() => {
  return Array.from(
    { length: currentYear - minYear + 1 },
    (_, index) => currentYear - index
  );
});

const calendarDays = computed(() => {
  const year = visibleMonth.value.getFullYear();
  const month = visibleMonth.value.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const firstGridDate = new Date(year, month, 1 - firstDayOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstGridDate);
    date.setDate(firstGridDate.getDate() + index);

    return {
      date,
      value: formatDate(date),
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: isSameDay(date, today),
      isSelected: selectedDate.value ? isSameDay(date, selectedDate.value) : false,
    };
  });
});

function openPicker() {
  isOpen.value = true;
  pickerMode.value = 'days';

  if (selectedDate.value) {
    visibleMonth.value = new Date(
      selectedDate.value.getFullYear(),
      selectedDate.value.getMonth(),
      1
    );
  }
}

function selectDate(day) {
  model.value = day.value;
  isOpen.value = false;
  pickerMode.value = 'days';
}

function selectToday() {
  visibleMonth.value = new Date(today.getFullYear(), today.getMonth(), 1);
  model.value = formatDate(today);
  isOpen.value = false;
  pickerMode.value = 'days';
}

function clearDate() {
  model.value = '';
  isOpen.value = false;
  pickerMode.value = 'days';
}

function changeVisiblePeriod(offset) {
  if (pickerMode.value === 'years') return;

  const monthOffset = pickerMode.value === 'months' ? offset * 12 : offset;

  visibleMonth.value = new Date(
    visibleMonth.value.getFullYear(),
    visibleMonth.value.getMonth() + monthOffset,
    1
  );
}

function showYears() {
  pickerMode.value = 'years';
}

function selectYear(year) {
  visibleMonth.value = new Date(year, visibleMonth.value.getMonth(), 1);
  pickerMode.value = 'months';
}

function selectMonth(monthIndex) {
  visibleMonth.value = new Date(
    visibleMonth.value.getFullYear(),
    monthIndex,
    1
  );
  pickerMode.value = 'days';
}

function closeOnOutsideClick(event) {
  if (!pickerElement.value?.contains(event.target)) {
    isOpen.value = false;
    pickerMode.value = 'days';
  }
}

function closeOnEscape(event) {
  if (event.key === 'Escape') {
    isOpen.value = false;
    pickerMode.value = 'days';
  }
}

watch(model, () => {
  const nextSelectedDate = selectedDate.value;

  if (nextSelectedDate) {
    visibleMonth.value = new Date(
      nextSelectedDate.getFullYear(),
      nextSelectedDate.getMonth(),
      1
    );
  }
});

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick);
  document.addEventListener('keydown', closeOnEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutsideClick);
  document.removeEventListener('keydown', closeOnEscape);
});
</script>

<template>
  <div ref="pickerElement" class="date-picker">
    <span v-if="label" class="date-picker__label">
      {{ label }}
    </span>

    <button
      type="button"
      class="date-picker__control"
      :class="{ 'date-picker__control--placeholder': !model }"
      @click="isOpen ? (isOpen = false) : openPicker()"
    >
      <span>{{ displayValue }}</span>
      <Calendar class="date-picker__icon" :size="16" />
    </button>

    <Transition name="date-picker-popover">
      <div v-if="isOpen" class="date-picker__popover" @click.stop>
        <div class="date-picker__header">
          <button
            type="button"
            class="date-picker__nav"
            aria-label="Previous month"
            :disabled="pickerMode === 'years'"
            @click="changeVisiblePeriod(-1)"
          >
            <ChevronLeft :size="16" />
          </button>

          <button
            type="button"
            class="date-picker__month"
            @click="showYears"
          >
            {{ headerLabel }}
          </button>

          <button
            type="button"
            class="date-picker__nav"
            aria-label="Next month"
            :disabled="pickerMode === 'years'"
            @click="changeVisiblePeriod(1)"
          >
            <ChevronRight :size="16" />
          </button>
        </div>

        <div v-if="pickerMode === 'days'" class="date-picker__weekdays">
          <span v-for="day in weekDays" :key="day">
            {{ day }}
          </span>
        </div>

        <div v-if="pickerMode === 'days'" class="date-picker__grid">
          <button
            v-for="day in calendarDays"
            :key="day.value"
            type="button"
            class="date-picker__day"
            :class="{
              'date-picker__day--muted': !day.isCurrentMonth,
              'date-picker__day--selected': day.isSelected
            }"
            @click="selectDate(day)"
          >
            {{ day.dayNumber }}
          </button>
        </div>

        <div v-else-if="pickerMode === 'years'" class="date-picker__year-grid">
          <button
            v-for="year in years"
            :key="year"
            type="button"
            class="date-picker__year"
            :class="{
              'date-picker__year--selected': year === visibleMonth.getFullYear(),
              'date-picker__year--current': year === currentYear
            }"
            @click="selectYear(year)"
          >
            {{ year }}
          </button>
        </div>

        <div v-else class="date-picker__month-grid">
          <button
            v-for="(month, index) in monthNames"
            :key="month"
            type="button"
            class="date-picker__month-option"
            :class="{
              'date-picker__month-option--selected': index === visibleMonth.getMonth()
            }"
            @click="selectMonth(index)"
          >
            {{ month }}
          </button>
        </div>

        <div class="date-picker__footer">
          <button
            type="button"
            class="date-picker__footer-button"
            @click="clearDate"
          >
            Clear
          </button>

          <button
            type="button"
            class="date-picker__footer-button"
            @click="selectToday"
          >
            Today
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.date-picker {
  position: relative;
  width: 100%;
}

.date-picker__label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary-hover);
}

.date-picker__control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  width: 100%;
  min-height: 2.25rem;
  padding: 0.45rem 0.75rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.18);
  border-radius: 0.8rem;
  background: rgba(var(--color-surface-rgb), 0.32);
  color: var(--color-primary);
  font-family: var(--font-ui);
  font-size: var(--font-size-sm);
  line-height: 1.2;
  text-align: left;
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.date-picker__control:focus {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.15);
}

.date-picker__control--placeholder {
  color: rgba(var(--color-primary-rgb), 0.42);
}

.date-picker__icon {
  flex: 0 0 auto;
  color: rgba(var(--color-primary-rgb), 0.5);
}

.date-picker__popover {
  position: absolute;
  z-index: 120;
  top: calc(100% + var(--space-sm));
  left: 0;
  width: min(20rem, calc(100vw - 2rem));
  padding: var(--space-md);
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  border-radius: var(--radius-md);
  background: var(--color-background);
  box-shadow: var(--shadow-md);
}

.date-picker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
  margin-bottom: var(--space-sm);
}

.date-picker__nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.7);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.date-picker__month {
  padding: 0.35rem 0.7rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  margin: 0;
  color: var(--color-primary);
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.date-picker__month:hover,
.date-picker__month:focus-visible {
  outline: none;
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: var(--color-secondary);
}

.date-picker__nav:hover,
.date-picker__nav:focus-visible {
  outline: none;
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: var(--color-secondary);
}

.date-picker__nav:disabled {
  opacity: 0.35;
  cursor: default;
}

.date-picker__nav:disabled:hover {
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.7);
}

.date-picker__weekdays,
.date-picker__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.date-picker__weekdays {
  margin-bottom: 0.35rem;
  color: rgba(var(--color-primary-rgb), 0.48);
  font-size: 0.68rem;
  font-weight: var(--font-medium);
  text-align: center;
}

.date-picker__grid {
  gap: 0.2rem;
}

.date-picker__day {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  min-width: 0;
  border: 1px solid transparent;
  border-radius: 0.7rem;
  background: transparent;
  color: var(--color-primary);
  font: inherit;
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.date-picker__day:hover,
.date-picker__day:focus-visible {
  outline: none;
  border-color: rgba(var(--color-secondary-rgb), 0.34);
  background: rgba(var(--color-secondary-rgb), 0.1);
}

.date-picker__day--muted {
  color: rgba(var(--color-primary-rgb), 0.34);
}

.date-picker__day--selected {
  border-color: rgba(var(--color-secondary-rgb), 0.36);
  color: var(--color-secondary);
  font-weight: var(--font-medium);
}

.date-picker__year-grid,
.date-picker__month-grid {
  display: grid;
  gap: 0.35rem;
}

.date-picker__year-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  max-height: 13.5rem;
  overflow: auto;
  padding-right: 0.15rem;
}

.date-picker__month-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.date-picker__year,
.date-picker__month-option {
  min-width: 0;
  min-height: 2.25rem;
  border: 1px solid transparent;
  border-radius: 0.7rem;
  background: transparent;
  color: var(--color-primary);
  font: inherit;
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.date-picker__month-option {
  overflow-wrap: anywhere;
}

.date-picker__year:hover,
.date-picker__year:focus-visible,
.date-picker__month-option:hover,
.date-picker__month-option:focus-visible {
  outline: none;
  border-color: rgba(var(--color-secondary-rgb), 0.34);
  background: rgba(var(--color-secondary-rgb), 0.1);
}

.date-picker__year--current {
  border-color: rgba(var(--color-secondary-rgb), 0.36);
  color: var(--color-secondary);
  font-weight: var(--font-medium);
}

.date-picker__year--selected,
.date-picker__year--selected:hover,
.date-picker__year--selected:focus-visible,
.date-picker__month-option--selected,
.date-picker__month-option--selected:hover,
.date-picker__month-option--selected:focus-visible {
  border-color: rgba(var(--color-secondary-rgb), 0.36);
  background: transparent;
  color: var(--color-secondary);
  font-weight: var(--font-medium);
}

.date-picker__footer {
  display: flex;
  justify-content: space-between;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.date-picker__footer-button {
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--color-secondary);
  cursor: pointer;
  font: inherit;
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  padding: 0.45rem 0.75rem;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.date-picker__footer-button:hover,
.date-picker__footer-button:focus-visible {
  outline: none;
  background: rgba(var(--color-secondary-rgb), 0.1);
}

.date-picker-popover-enter-active,
.date-picker-popover-leave-active {
  transition:
    opacity var(--transition-fast),
    transform var(--transition-fast);
}

.date-picker-popover-enter-from,
.date-picker-popover-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem);
}

@media (max-width: 480px) {
  .date-picker__popover {
    right: 0;
    width: 100%;
  }
}
</style>
