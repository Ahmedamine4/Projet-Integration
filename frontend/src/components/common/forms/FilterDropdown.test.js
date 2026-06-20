import { defineComponent, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import FilterDropdown from './FilterDropdown.vue';

vi.mock('lucide-vue-next', () => ({
  Filter: {
    name: 'Filter',
    props: ['size'],
    template: '<svg data-test="filter-icon" />',
  },
}));

const BaseInputStub = defineComponent({
  name: 'BaseInput',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue', 'click'],
  template: `
    <label data-test="base-input">
      <span v-if="label">{{ label }}</span>
      <input
        :value="modelValue"
        :placeholder="placeholder"
        @click="$emit('click')"
        @input="$emit('update:modelValue', $event.target.value)"
      >
    </label>
  `,
});

const options = [
  'Vue.js',
  'Express.js',
  'PostgreSQL',
  'Docker',
  'Python',
  'FastAPI',
];

function mountDropdown(props = {}) {
  return mount(FilterDropdown, {
    props: {
      modelValue: '',
      options,
      label: 'Technology',
      placeholder: 'Choose a technology',
      ...props,
    },
    attachTo: document.body,
    global: {
      stubs: {
        Input: BaseInputStub,
        Transition: true,
      },
    },
  });
}

async function openDropdown(wrapper) {
  await wrapper.find('input').trigger('click');
  await nextTick();
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('DropdownInput', () => {
  it('renders label, placeholder and filter icon', () => {
    const wrapper = mountDropdown();

    expect(wrapper.text()).toContain('Technology');
    expect(wrapper.find('input').attributes('placeholder')).toBe('Choose a technology');
    expect(wrapper.find('[data-test="filter-icon"]').exists()).toBe(true);

    wrapper.unmount();
  });

  it('opens the dropdown when clicking the input', async () => {
    const wrapper = mountDropdown();

    expect(wrapper.find('.dropdown__list').exists()).toBe(false);

    await openDropdown(wrapper);

    expect(wrapper.classes()).toContain('dropdown--open');
    expect(wrapper.find('.dropdown__list').exists()).toBe(true);

    const renderedOptions = wrapper
      .findAll('.dropdown__option')
      .map((option) => option.text());

    expect(renderedOptions).toEqual(options);

    wrapper.unmount();
  });

  it('filters options according to the model value', async () => {
    const wrapper = mountDropdown({
      modelValue: 'py',
    });

    await openDropdown(wrapper);

    const renderedOptions = wrapper
      .findAll('.dropdown__option')
      .map((option) => option.text());

    expect(renderedOptions).toEqual(['Python']);

    wrapper.unmount();
  });

  it('shows all options when the model value exactly matches an option', async () => {
    const wrapper = mountDropdown({
      modelValue: 'Vue.js',
    });

    await openDropdown(wrapper);

    const renderedOptions = wrapper
      .findAll('.dropdown__option')
      .map((option) => option.text());

    expect(renderedOptions).toEqual(options);

    wrapper.unmount();
  });

  it('marks the selected option as active', async () => {
    const wrapper = mountDropdown({
      modelValue: 'Docker',
    });

    await openDropdown(wrapper);

    const activeOption = wrapper.find('.dropdown__option--active');

    expect(activeOption.exists()).toBe(true);
    expect(activeOption.text()).toBe('Docker');

    wrapper.unmount();
  });

  it('emits update:modelValue and closes the dropdown when selecting an option', async () => {
    const wrapper = mountDropdown();

    await openDropdown(wrapper);

    const dockerOption = wrapper
      .findAll('.dropdown__option')
      .find((option) => option.text() === 'Docker');

    await dockerOption.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['Docker']);

    expect(wrapper.find('.dropdown__list').exists()).toBe(false);

    wrapper.unmount();
  });

  it('closes the dropdown when clicking outside', async () => {
    const wrapper = mountDropdown();

    await openDropdown(wrapper);

    expect(wrapper.find('.dropdown__list').exists()).toBe(true);

    const outside = document.createElement('div');
    document.body.appendChild(outside);

    outside.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
      })
    );

    await nextTick();

    expect(wrapper.find('.dropdown__list').exists()).toBe(false);

    wrapper.unmount();
  });

  it('applies the visibleOptions value as a CSS variable', async () => {
    const wrapper = mountDropdown({
      visibleOptions: 3,
    });

    await openDropdown(wrapper);

    expect(wrapper.find('.dropdown__list').attributes('style')).toContain(
      '--visible-options: 3'
    );

    wrapper.unmount();
  });
});