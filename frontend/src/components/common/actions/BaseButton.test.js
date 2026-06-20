import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import BaseButton from './BaseButton.vue';

vi.mock('@/assets/icons/google.svg', () => ({
  default: 'google-icon.svg',
}));

const BaseSpinnerStub = defineComponent({
  name: 'BaseSpinner',
  template: '<span data-test="spinner">Loading...</span>',
});

function mountButton(props = {}, slot = 'Click me') {
  return mount(BaseButton, {
    props,
    slots: {
      default: slot,
    },
    global: {
      stubs: {
        BaseSpinner: BaseSpinnerStub,
      },
    },
  });
}

describe('BaseButton', () => {
  it('renders the slot content with default classes', () => {
    const wrapper = mountButton();

    const button = wrapper.find('button');

    expect(button.text()).toContain('Click me');
    expect(button.classes()).toContain('button');
    expect(button.classes()).toContain('button--pill');
    expect(button.classes()).toContain('button--sm');
  });

  it('applies variant, size and block classes from props', () => {
    const wrapper = mountButton({
      variant: 'submit',
      size: 'md',
      block: true,
    }, 'Submit');

    const button = wrapper.find('button');

    expect(button.text()).toContain('Submit');
    expect(button.classes()).toContain('button--submit');
    expect(button.classes()).toContain('button--md');
    expect(button.classes()).toContain('button--block');
  });

  it('disables the button when disabled is true', () => {
    const wrapper = mountButton({
      disabled: true,
    });

    const button = wrapper.find('button');

    expect(button.attributes('disabled')).toBeDefined();
  });

  it('disables the button and shows the spinner when loading is true', () => {
    const wrapper = mountButton({
      loading: true,
    }, 'Save');

    const button = wrapper.find('button');

    expect(button.attributes('disabled')).toBeDefined();
    expect(wrapper.find('[data-test="spinner"]').exists()).toBe(true);
    expect(button.text()).toContain('Loading...');
    expect(button.text()).toContain('Save');
  });

  it('shows the Google icon when variant is google and loading is false', () => {
    const wrapper = mountButton({
      variant: 'google',
    }, 'Continue with Google');

    const image = wrapper.find('img.google-icon');

    expect(wrapper.find('[data-test="spinner"]').exists()).toBe(false);
    expect(image.exists()).toBe(true);
    expect(image.attributes('src')).toBe('google-icon.svg');
    expect(image.attributes('alt')).toBe('Google');
    expect(wrapper.text()).toContain('Continue with Google');
  });

  it('shows the spinner instead of the Google icon when loading is true', () => {
    const wrapper = mountButton({
      variant: 'google',
      loading: true,
    }, 'Continue with Google');

    expect(wrapper.find('[data-test="spinner"]').exists()).toBe(true);
    expect(wrapper.find('img.google-icon').exists()).toBe(false);
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });
});