import { defineComponent, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import BaseDropdown from './BaseDropdown.vue';

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
  emits: ['update:modelValue', 'focus'],
  template: `
    <label data-test="base-input">
      <span v-if="label">{{ label }}</span>
      <input
        :value="modelValue"
        :placeholder="placeholder"
        @focus="$emit('focus')"
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

function mountBaseDropdown(props = {}) {
  let wrapper;

  wrapper = mount(BaseDropdown, {
    props: {
      modelValue: '',
      options,
      label: 'Technology',
      placeholder: 'Choose a technology',
      ...props,
      'onUpdate:modelValue': async (value) => {
        await wrapper.setProps({
          modelValue: value,
        });
      },
    },
    attachTo: document.body,
    global: {
      stubs: {
        BaseInput: BaseInputStub,
        Transition: true,
      },
    },
  });

  return wrapper;
}

async function openDropdown(wrapper) {
  await wrapper.find('input').trigger('focus');
  await nextTick();
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('BaseDropdown', () => {
  it('renders the label and placeholder', () => {
    const wrapper = mountBaseDropdown();

    expect(wrapper.text()).toContain('Technology');
    expect(wrapper.find('input').attributes('placeholder')).toBe(
      'Choose a technology'
    );

    wrapper.unmount();
  });

  it('opens the option list on focus', async () => {
    const wrapper = mountBaseDropdown();

    expect(wrapper.find('.dropdown__list').exists()).toBe(false);

    await openDropdown(wrapper);

    expect(wrapper.find('.dropdown__list').exists()).toBe(true);

    const renderedOptions = wrapper
      .findAll('.dropdown__option')
      .map((option) => option.text());

    expect(renderedOptions).toEqual(options);

    wrapper.unmount();
  });

  it('filters options according to the typed value', async () => {
    const wrapper = mountBaseDropdown();

    await openDropdown(wrapper);

    await wrapper.find('input').setValue('py');
    await nextTick();

    const renderedOptions = wrapper
      .findAll('.dropdown__option')
      .map((option) => option.text());

    expect(renderedOptions).toEqual(['Python']);

    wrapper.unmount();
  });

  it('emits update:modelValue and closes the list when selecting an option', async () => {
    const wrapper = mountBaseDropdown();

    await openDropdown(wrapper);

    const dockerOption = wrapper
      .findAll('.dropdown__option')
      .find((option) => option.text() === 'Docker');

    await dockerOption.trigger('click');
    await nextTick();

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['Docker']);
    expect(wrapper.find('.dropdown__list').exists()).toBe(false);

    wrapper.unmount();
  });

  it('closes the dropdown when clicking outside', async () => {
    const wrapper = mountBaseDropdown();

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

  it('does not show the list when there are no options', async () => {
    const wrapper = mountBaseDropdown({
      options: [],
    });

    await openDropdown(wrapper);

    expect(wrapper.find('.dropdown__list').exists()).toBe(false);

    wrapper.unmount();
  });

  it('does not show the list when the search has no result', async () => {
    const wrapper = mountBaseDropdown();

    await openDropdown(wrapper);

    await wrapper.find('input').setValue('angular');
    await nextTick();

    expect(wrapper.find('.dropdown__list').exists()).toBe(false);

    wrapper.unmount();
  });

  it('applies visibleOptions as a CSS variable', async () => {
    const wrapper = mountBaseDropdown({
      visibleOptions: 3,
    });

    await openDropdown(wrapper);

    expect(wrapper.find('.dropdown__list').attributes('style')).toContain(
      '--visible-options: 3'
    );

    wrapper.unmount();
  });
});