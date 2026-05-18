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
<<<<<<< HEAD
=======
  maxDate: {
    type: String,
    default: '',
  },
  minDate: {
    type: String,
    default: '',
  },
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
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

<<<<<<< HEAD
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

=======
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
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

<<<<<<< HEAD
function isSameDay(firstDate, secondDate) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

const selectedDate = computed(() => parseDate(model.value));
=======
const minDateValue = computed(() => parseDate(props.minDate));
const maxDateValue = computed(() => parseDate(props.maxDate));
const pickerElement = ref(null);
const isOpen = ref(false);
const selectedDate = computed(() => parseDate(model.value));
const today = new Date();
const currentYear = today.getFullYear();
const visibleMonth = ref(getInitialVisibleMonth());
const pickerMode = ref('days');

function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getInitialVisibleMonth() {
  return selectedDate.value ? getMonthStart(selectedDate.value) : getMonthStart(today);
}

function setVisibleMonth(date) {
  visibleMonth.value = getMonthStart(date);
}

function closePicker() {
  isOpen.value = false;
  pickerMode.value = 'days';
}

function isSelectedDate(date) {
  const selected = selectedDate.value;
  if (!date || !selected) return false;
  return (
    date.getFullYear() === selected.getFullYear() &&
    date.getMonth() === selected.getMonth() &&
    date.getDate() === selected.getDate()
  );
}

function isSelectedMonth(monthIndex) {
  return (
    selectedDate.value?.getFullYear() === visibleMonth.value.getFullYear() &&
    selectedDate.value?.getMonth() === monthIndex
  );
}

function isSelectedYear(year) {
  return selectedDate.value?.getFullYear() === year;
}

function isDisabledDate(date) {
  if (minDateValue.value && date < minDateValue.value) return true;
  if (maxDateValue.value && date > maxDateValue.value) return true;

  return false;
}

function isDisabledMonth(monthIndex) {
  const year = visibleMonth.value.getFullYear();

  if(isDisabledYear(year)) return true;

  if (
    minDateValue.value &&
    year === minDateValue.value.getFullYear() &&
    monthIndex < minDateValue.value.getMonth()
  ) {
    return true;
  }
  if (
    maxDateValue.value &&
    year === maxDateValue.value.getFullYear() &&
    monthIndex > maxDateValue.value.getMonth()
  ) {
    return true;
  }

  return false
}

function isDisabledYear(year) {
  if (minDateValue.value && year < minDateValue.value.getFullYear()) {
    return true;
  }
  if (maxDateValue.value && year > maxDateValue.value.getFullYear()) {
    return true;
  }
  return false;
}
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f

const displayValue = computed(() => {
  if (!selectedDate.value) return props.placeholder;

  return selectedDate.value.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

<<<<<<< HEAD
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
=======
const headerLabel = computed(() => {
  const year = visibleMonth.value.getFullYear();
  const month = visibleMonth.value.getMonth();

  return pickerMode.value === 'months'
    ? String(year)
    : `${monthNames[month]} ${year}`;
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
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
<<<<<<< HEAD
      isToday: isSameDay(date, today),
      isSelected: selectedDate.value ? isSameDay(date, selectedDate.value) : false,
=======
      isSelected: isSelectedDate(date),
      isDisabled: isDisabledDate(date),
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
    };
  });
});

function openPicker() {
  isOpen.value = true;
  pickerMode.value = 'days';

  if (selectedDate.value) {
<<<<<<< HEAD
    visibleMonth.value = new Date(
      selectedDate.value.getFullYear(),
      selectedDate.value.getMonth(),
      1
    );
=======
    setVisibleMonth(selectedDate.value);
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
  }
}

function selectDate(day) {
<<<<<<< HEAD
  model.value = day.value;
  isOpen.value = false;
  pickerMode.value = 'days';
}

function selectToday() {
  visibleMonth.value = new Date(today.getFullYear(), today.getMonth(), 1);
  model.value = formatDate(today);
  isOpen.value = false;
  pickerMode.value = 'days';
=======
  if (day.isDisabled) return;

  model.value = day.value;
  closePicker();
}

function selectToday() {
  setVisibleMonth(today);
  model.value = formatDate(today);
  closePicker();
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
}

function clearDate() {
  model.value = '';
<<<<<<< HEAD
  isOpen.value = false;
  pickerMode.value = 'days';
=======
  closePicker();
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
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
<<<<<<< HEAD
=======
  if (isDisabledYear(year)) return;

>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
  visibleMonth.value = new Date(year, visibleMonth.value.getMonth(), 1);
  pickerMode.value = 'months';
}

function selectMonth(monthIndex) {
<<<<<<< HEAD
=======
  if (isDisabledMonth(monthIndex)) return;

>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
  visibleMonth.value = new Date(
    visibleMonth.value.getFullYear(),
    monthIndex,
    1
  );
  pickerMode.value = 'days';
}

function closeOnOutsideClick(event) {
  if (!pickerElement.value?.contains(event.target)) {
<<<<<<< HEAD
    isOpen.value = false;
    pickerMode.value = 'days';
=======
    closePicker();
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
  }
}

function closeOnEscape(event) {
  if (event.key === 'Escape') {
<<<<<<< HEAD
    isOpen.value = false;
    pickerMode.value = 'days';
=======
    closePicker();
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
  }
}

watch(model, () => {
  const nextSelectedDate = selectedDate.value;

  if (nextSelectedDate) {
<<<<<<< HEAD
    visibleMonth.value = new Date(
      nextSelectedDate.getFullYear(),
      nextSelectedDate.getMonth(),
      1
    );
=======
    setVisibleMonth(nextSelectedDate);
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
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
<<<<<<< HEAD
      <div v-if="isOpen" class="date-picker__popover" @click.stop>
=======
      <div
        v-if="isOpen"
        class="date-picker__popover"
        @click.stop
      >
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
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

<<<<<<< HEAD
        <div v-if="pickerMode === 'days'" class="date-picker__weekdays">
=======
        <div
          v-if="pickerMode === 'days'"
          class="date-picker__weekdays"
        >
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
          <span v-for="day in weekDays" :key="day">
            {{ day }}
          </span>
        </div>

<<<<<<< HEAD
        <div v-if="pickerMode === 'days'" class="date-picker__grid">
=======
        <div
          v-if="pickerMode === 'days'"
          class="date-picker__grid"
        >
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
          <button
            v-for="day in calendarDays"
            :key="day.value"
            type="button"
            class="date-picker__day"
            :class="{
              'date-picker__day--muted': !day.isCurrentMonth,
<<<<<<< HEAD
              'date-picker__day--selected': day.isSelected
            }"
            @click="selectDate(day)"
=======
              'selected': day.isSelected,
              'disabled': day.isDisabled
            }"
            @click="selectDate(day)"
            :disabled="day.isDisabled"
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
          >
            {{ day.dayNumber }}
          </button>
        </div>

<<<<<<< HEAD
        <div v-else-if="pickerMode === 'years'" class="date-picker__year-grid">
=======
        <div
          v-else-if="pickerMode === 'years'"
          class="date-picker__year-grid"
        >
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
          <button
            v-for="year in years"
            :key="year"
            type="button"
            class="date-picker__year"
<<<<<<< HEAD
            @click="selectYear(year)"
=======
            :class="{
              selected: isSelectedYear(year),
              disabled: isDisabledYear(year)
            }"
            @click="selectYear(year)"
            :disabled="isDisabledYear(year)"
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
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
<<<<<<< HEAD
            @click="selectMonth(index)"
=======
            :class="{
              selected: isSelectedMonth(index),
              disabled: isDisabledMonth(index),
            }"
            @click="selectMonth(index)"
            :disabled="isDisabledMonth(index)"
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
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
<<<<<<< HEAD
  z-index: 120;
  top: calc(100% + var(--space-sm));
  left: 0;
  width: min(20rem, calc(100vw - 2rem));
  padding: var(--space-md);
=======
  width: min(17rem, calc(100vw - 2rem));
  padding: var(--space-sm);
  z-index: 120;
  top: calc(100% + var(--space-sm));
  left: 0;
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
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
<<<<<<< HEAD
  width: 2rem;
  height: 2rem;
  padding: 0;
=======
  padding: 0;
  width: 1.75rem;
  height: 1.75rem;
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
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
<<<<<<< HEAD
  padding: 0.35rem 0.7rem;
  border: none;
  border-radius: 999px;
=======
  border: none;
  border-radius: 999px;
  font-size: var(--font-size-xs);
  padding: 0.25rem 0.55rem;
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
  background: transparent;
  margin: 0;
  color: var(--color-primary);
  cursor: pointer;
  font-family: var(--font-ui);
<<<<<<< HEAD
  font-size: var(--font-size-sm);
=======
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
  font-weight: var(--font-medium);
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

<<<<<<< HEAD
.date-picker__month:hover,
.date-picker__month:focus-visible {
  outline: none;
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: var(--color-secondary);
}

.date-picker__nav:hover,
.date-picker__nav:focus-visible {
=======
:is(.date-picker__month, .date-picker__nav):is(:hover, :focus-visible) {
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
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
<<<<<<< HEAD
  gap: 0.2rem;
=======
  gap: 0.15rem;
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
}

.date-picker__day {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  min-width: 0;
  border: 1px solid transparent;
<<<<<<< HEAD
  border-radius: 0.7rem;
  background: transparent;
  color: var(--color-primary);
  font: inherit;
  font-size: var(--font-size-xs);
=======
  border-radius: 0.55rem;
  background: transparent;
  color: var(--color-primary);
  font: inherit;
  font-size: 0.68rem;
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

<<<<<<< HEAD
.date-picker__day:hover,
.date-picker__day:focus-visible {
=======
.date-picker__day:is(:hover, :focus-visible) {
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
  outline: none;
  border-color: rgba(var(--color-secondary-rgb), 0.34);
  background: rgba(var(--color-secondary-rgb), 0.1);
}

.date-picker__day--muted {
  color: rgba(var(--color-primary-rgb), 0.34);
}

<<<<<<< HEAD
.date-picker__day--selected {
=======
:is(.date-picker__day, .date-picker__month-option, .date-picker__year).selected {
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
  border-color: rgba(var(--color-secondary-rgb), 0.36);
  color: var(--color-secondary);
  font-weight: var(--font-medium);
}

<<<<<<< HEAD
=======
:is(
  .date-picker__day,
  .date-picker__month-option,
  .date-picker__year
).disabled {
  color: var(--color-error);
  border-color: transparent;
  background: transparent;
  cursor: not-allowed;
}

:is(
  .date-picker__day,
  .date-picker__month-option,
  .date-picker__year
).disabled:is(:hover, :focus-visible) {
  color: var(--color-error);
  border-color: transparent;
  background: transparent;
}

.date-picker__day--muted.disabled,
.date-picker__day--muted.disabled:is(:hover, :focus-visible) {
  color: rgba(var(--color-error-rgb), 0.34);
  border-color: transparent;
  background: transparent;
}

.date-picker__day--muted.disabled:is(:hover, :focus-visible) {
  color: rgba(var(--color-error-rgb), 0.34);
  border-color: transparent;
  background: transparent;
}

>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
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

<<<<<<< HEAD
=======
.date-picker__year-grid::-webkit-scrollbar {
  width: var(--scrollbar-width);
}

.date-picker__year-grid::-webkit-scrollbar-track {
  background: transparent;
}

.date-picker__year-grid::-webkit-scrollbar-thumb {
  background-color: rgba(var(--color-primary-rgb), 0.22);
  border-radius: 999px;
  border: var(--scrollbar-padding) solid transparent;
  background-clip: content-box;
}

>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
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

<<<<<<< HEAD
.date-picker__year:hover,
.date-picker__year:focus-visible,
.date-picker__month-option:hover,
.date-picker__month-option:focus-visible {
=======
:is(.date-picker__year, .date-picker__month-option):is(:hover, :focus-visible) {
>>>>>>> 7d8d9ad21b525cb7b456eecd3cff6a35f9a28f0f
  outline: none;
  border-color: rgba(var(--color-secondary-rgb), 0.34);
  background: rgba(var(--color-secondary-rgb), 0.1);
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
