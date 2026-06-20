import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import BaseSelect from './BaseSelect.vue';

vi.mock('lucide-vue-next', () => ({
  ChevronDown: {
    name: 'ChevronDown',
    props: ['size'],
    template: '<svg data-test="chevron-down-icon" />',
  },
}));

const options = ['Vue.js', 'Docker', 'PostgreSQL'];

function mountSelect(props = {}, attrs = {}) {
  let wrapper;

  wrapper = mount(BaseSelect, {
    props: {
      modelValue: '',
      label: 'Technology',
      options,
      placeholder: 'Select a technology',
      ...props,
      'onUpdate:modelValue': async (value) => {
        await wrapper.setProps({
          modelValue: value,
        });
      },
    },
    attrs,
    attachTo: document.body,
    global: {
      stubs: {
        Transition: true,
      },
    },
  });

  return wrapper;
}

async function openSelect(wrapper) {
  await wrapper.find('.select__control').trigger('click');
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('BaseSelect', () => {
  it('renders the label and placeholder', () => {
    const wrapper = mountSelect();

    expect(wrapper.text()).toContain('Technology');
    expect(wrapper.find('.select__value').text()).toBe('Select a technology');
    expect(wrapper.find('.select__control').classes()).toContain(
      'select__control--placeholder'
    );
    expect(wrapper.find('[data-test="chevron-down-icon"]').exists()).toBe(true);

    wrapper.unmount();
  });

  it('does not render the label when label is empty', () => {
    const wrapper = mountSelect({
      label: '',
    });

    expect(wrapper.find('.select__label').exists()).toBe(false);

    wrapper.unmount();
  });

  it('passes attrs to the control button', () => {
    const wrapper = mountSelect({}, {
      id: 'technology-select',
      disabled: true,
      'aria-label': 'Technology select',
    });

    const control = wrapper.find('.select__control');

    expect(control.attributes('id')).toBe('technology-select');
    expect(control.attributes('disabled')).toBeDefined();
    expect(control.attributes('aria-label')).toBe('Technology select');

    wrapper.unmount();
  });

  it('opens the option list when clicking the control', async () => {
    const wrapper = mountSelect();

    expect(wrapper.find('.select__list').exists()).toBe(false);

    await openSelect(wrapper);

    expect(wrapper.find('.select__list').exists()).toBe(true);

    const renderedOptions = wrapper
      .findAll('.select__option')
      .map((option) => option.text());

    expect(renderedOptions).toEqual(options);

    wrapper.unmount();
  });

  it('closes the option list when clicking the control again', async () => {
    const wrapper = mountSelect();

    await openSelect(wrapper);
    expect(wrapper.find('.select__list').exists()).toBe(true);

    await openSelect(wrapper);
    expect(wrapper.find('.select__list').exists()).toBe(false);

    wrapper.unmount();
  });

  it('displays the selected value when modelValue is provided', () => {
    const wrapper = mountSelect({
      modelValue: 'Docker',
    });

    expect(wrapper.find('.select__value').text()).toBe('Docker');
    expect(wrapper.find('.select__control').classes()).not.toContain(
      'select__control--placeholder'
    );

    wrapper.unmount();
  });

  it('marks the selected option when the list is open', async () => {
    const wrapper = mountSelect({
      modelValue: 'Docker',
    });

    await openSelect(wrapper);

    const selectedOption = wrapper.find('.select__option--selected');

    expect(selectedOption.exists()).toBe(true);
    expect(selectedOption.text()).toBe('Docker');

    wrapper.unmount();
  });

  it('emits update:modelValue and closes the list when selecting an option', async () => {
    const wrapper = mountSelect();

    await openSelect(wrapper);

    const dockerOption = wrapper
      .findAll('.select__option')
      .find((option) => option.text() === 'Docker');

    await dockerOption.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['Docker']);

    expect(wrapper.find('.select__list').exists()).toBe(false);
    expect(wrapper.find('.select__value').text()).toBe('Docker');

    wrapper.unmount();
  });

  it('closes the list when clicking outside', async () => {
    const wrapper = mountSelect();

    await openSelect(wrapper);

    expect(wrapper.find('.select__list').exists()).toBe(true);

    const outside = document.createElement('div');
    document.body.appendChild(outside);

    outside.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
      })
    );

    await wrapper.vm.$nextTick();

    expect(wrapper.find('.select__list').exists()).toBe(false);

    wrapper.unmount();
  });

  it('shows "No options available" when options list is empty', async () => {
    const wrapper = mountSelect({
      options: [],
    });

    expect(wrapper.find('.select__value').text()).toBe('No options available');

    await openSelect(wrapper);

    expect(wrapper.find('.select__list').exists()).toBe(false);
    expect(wrapper.findAll('.select__option')).toHaveLength(0);

    wrapper.unmount();
  });
});