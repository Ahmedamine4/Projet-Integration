import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import BaseInput from './BaseInput.vue';

vi.mock('lucide-vue-next', () => ({
  Eye: {
    name: 'Eye',
    template: '<svg data-test="eye-icon" />',
  },
  EyeOff: {
    name: 'EyeOff',
    template: '<svg data-test="eye-off-icon" />',
  },
}));

function mountInput(props = {}, attrs = {}) {
  return mount(BaseInput, {
    props: {
      modelValue: '',
      ...props,
    },
    attrs,
  });
}

describe('BaseInput', () => {
  it('renders the label when label prop is provided', () => {
    const wrapper = mountInput({
      label: 'Email Address',
    }, {
      type: 'email',
    });

    expect(wrapper.text()).toContain('Email Address');
    expect(wrapper.find('.input__label').exists()).toBe(true);
  });

  it('does not render a label when label prop is empty', () => {
    const wrapper = mountInput({}, {
      type: 'text',
    });

    expect(wrapper.find('.input__label').exists()).toBe(false);
  });

  it('uses sm size by default', () => {
    const wrapper = mountInput();

    expect(wrapper.classes()).toContain('input');
    expect(wrapper.classes()).toContain('input--sm');
  });

  it('applies the size class from props', () => {
    const wrapper = mountInput({
      size: 'md',
    });

    expect(wrapper.classes()).toContain('input--md');
    expect(wrapper.classes()).not.toContain('input--sm');
  });

  it('passes attrs to the input element', () => {
    const wrapper = mountInput({}, {
      type: 'email',
      placeholder: 'Enter your email',
      name: 'email',
      id: 'email-input',
      autocomplete: 'email',
    });

    const input = wrapper.find('input');

    expect(input.attributes('type')).toBe('email');
    expect(input.attributes('placeholder')).toBe('Enter your email');
    expect(input.attributes('name')).toBe('email');
    expect(input.attributes('id')).toBe('email-input');
    expect(input.attributes('autocomplete')).toBe('email');
  });

  it('binds the model value to the input', () => {
    const wrapper = mountInput({
      modelValue: 'nour@test.com',
    }, {
      type: 'email',
    });

    const input = wrapper.find('input');

    expect(input.element.value).toBe('nour@test.com');
  });

  it('emits update:modelValue when the user types', async () => {
    const wrapper = mountInput({}, {
      type: 'text',
    });

    const input = wrapper.find('input');

    await input.setValue('Nour');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['Nour']);
  });

  it('does not show the password toggle for non-password inputs', () => {
    const wrapper = mountInput({}, {
      type: 'text',
    });

    expect(wrapper.find('.input__toggle').exists()).toBe(false);
    expect(wrapper.find('[data-test="eye-icon"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="eye-off-icon"]').exists()).toBe(false);
  });

  it('shows the password toggle when type is password', () => {
    const wrapper = mountInput({}, {
      type: 'password',
    });

    const input = wrapper.find('input');

    expect(input.attributes('type')).toBe('password');
    expect(wrapper.find('.input__toggle').exists()).toBe(true);
    expect(wrapper.find('[data-test="eye-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="eye-off-icon"]').exists()).toBe(false);
  });

  it('toggles password visibility when clicking the toggle button', async () => {
    const wrapper = mountInput({}, {
      type: 'password',
    });

    const input = wrapper.find('input');
    const toggleButton = wrapper.find('.input__toggle');

    expect(input.attributes('type')).toBe('password');
    expect(wrapper.find('[data-test="eye-icon"]').exists()).toBe(true);

    await toggleButton.trigger('click');

    expect(input.attributes('type')).toBe('text');
    expect(wrapper.find('[data-test="eye-off-icon"]').exists()).toBe(true);

    await toggleButton.trigger('click');

    expect(input.attributes('type')).toBe('password');
    expect(wrapper.find('[data-test="eye-icon"]').exists()).toBe(true);
  });
});