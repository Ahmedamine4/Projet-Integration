import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import DatePicker from './DatePicker.vue';

vi.mock('lucide-vue-next', () => ({
  Calendar: {
    name: 'Calendar',
    props: ['size'],
    template: '<svg data-test="calendar-icon" />',
  },
  ChevronLeft: {
    name: 'ChevronLeft',
    props: ['size'],
    template: '<svg data-test="chevron-left" />',
  },
  ChevronRight: {
    name: 'ChevronRight',
    props: ['size'],
    template: '<svg data-test="chevron-right" />',
  },
}));

function mountDatePicker(props = {}) {
  return mount(DatePicker, {
    props: {
      modelValue: '',
      ...props,
    },
    attachTo: document.body,
    global: {
      stubs: {
        Transition: true,
      },
    },
  });
}

async function openPicker(wrapper) {
  await wrapper.find('.date-picker__control').trigger('click');
  await nextTick();
}

function findDayButton(wrapper, dayNumber) {
  return wrapper
    .findAll('.date-picker__day')
    .find((button) => button.text() === String(dayNumber));
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('DatePicker', () => {
  it('renders the label and placeholder when no date is selected', () => {
    const wrapper = mountDatePicker({
      label: 'Start date',
      placeholder: 'Choose a date',
    });

    expect(wrapper.text()).toContain('Start date');
    expect(wrapper.text()).toContain('Choose a date');
    expect(wrapper.find('.date-picker__control--placeholder').exists()).toBe(true);
    expect(wrapper.find('[data-test="calendar-icon"]').exists()).toBe(true);

    wrapper.unmount();
  });

  it('opens the calendar and shows the selected date month', async () => {
    const wrapper = mountDatePicker({
      modelValue: '2026-05-20',
    });

    await openPicker(wrapper);

    expect(wrapper.find('.date-picker__popover').exists()).toBe(true);
    expect(wrapper.text()).toContain('May 2026');

    wrapper.unmount();
  });

  it('emits update:modelValue when selecting an available day', async () => {
    const wrapper = mountDatePicker({
      modelValue: '2026-05-20',
    });

    await openPicker(wrapper);

    const day15 = findDayButton(wrapper, 15);

    expect(day15.exists()).toBe(true);

    await day15.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['2026-05-15']);
    expect(wrapper.find('.date-picker__popover').exists()).toBe(false);

    wrapper.unmount();
  });

  it('disables days outside minDate and maxDate', async () => {
    const wrapper = mountDatePicker({
      modelValue: '2026-05-15',
      minDate: '2026-05-10',
      maxDate: '2026-05-20',
    });

    await openPicker(wrapper);

    const day9 = findDayButton(wrapper, 9);
    const day10 = findDayButton(wrapper, 10);
    const day21 = findDayButton(wrapper, 21);

    expect(day9.attributes('disabled')).toBeDefined();
    expect(day9.classes()).toContain('disabled');

    expect(day10.attributes('disabled')).toBeUndefined();

    expect(day21.attributes('disabled')).toBeDefined();
    expect(day21.classes()).toContain('disabled');

    wrapper.unmount();
  });

  it('clears the selected date when clicking Clear', async () => {
    const wrapper = mountDatePicker({
      modelValue: '2026-05-20',
    });

    await openPicker(wrapper);

    const clearButton = wrapper
      .findAll('.date-picker__footer-button')
      .find((button) => button.text() === 'Clear');

    await clearButton.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['']);
    expect(wrapper.find('.date-picker__popover').exists()).toBe(false);

    wrapper.unmount();
  });

  it('allows selecting a year then a month', async () => {
    const wrapper = mountDatePicker({
      modelValue: '2026-05-20',
    });

    await openPicker(wrapper);

    await wrapper.find('.date-picker__month').trigger('click');
    await nextTick();

    expect(wrapper.find('.date-picker__year-grid').exists()).toBe(true);

    const year2025 = wrapper
      .findAll('.date-picker__year')
      .find((button) => button.text() === '2025');

    await year2025.trigger('click');
    await nextTick();

    expect(wrapper.find('.date-picker__month-grid').exists()).toBe(true);

    const marchButton = wrapper
      .findAll('.date-picker__month-option')
      .find((button) => button.text() === 'March');

    await marchButton.trigger('click');
    await nextTick();

    expect(wrapper.find('.date-picker__grid').exists()).toBe(true);
    expect(wrapper.text()).toContain('March 2025');

    wrapper.unmount();
  });

  it('closes the picker when pressing Escape', async () => {
    const wrapper = mountDatePicker({
      modelValue: '2026-05-20',
    });

    await openPicker(wrapper);

    expect(wrapper.find('.date-picker__popover').exists()).toBe(true);

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
      })
    );

    await nextTick();

    expect(wrapper.find('.date-picker__popover').exists()).toBe(false);

    wrapper.unmount();
  });

  it('closes the picker when clicking outside', async () => {
    const wrapper = mountDatePicker({
      modelValue: '2026-05-20',
    });

    await openPicker(wrapper);

    expect(wrapper.find('.date-picker__popover').exists()).toBe(true);

    document.body.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
      })
    );

    await nextTick();

    expect(wrapper.find('.date-picker__popover').exists()).toBe(false);

    wrapper.unmount();
  });
});