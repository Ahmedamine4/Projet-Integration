import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ToggleSwitch from './ToggleSwitch.vue';

function mountToggle(props = {}) {
  return mount(ToggleSwitch, {
    props: {
      modelValue: false,
      label: 'Visible to everyone',
      ...props,
    },
  });
}

describe('ToggleSwitch', () => {
  it('renders the label', () => {
    const wrapper = mountToggle({
      label: 'Enable notifications',
    });

    expect(wrapper.text()).toContain('Enable notifications');
  });

  it('is unchecked when modelValue is false', () => {
    const wrapper = mountToggle({
      modelValue: false,
    });

    const input = wrapper.find('input[type="checkbox"]');

    expect(input.element.checked).toBe(false);
  });

  it('is checked when modelValue is true', () => {
    const wrapper = mountToggle({
      modelValue: true,
    });

    const input = wrapper.find('input[type="checkbox"]');

    expect(input.element.checked).toBe(true);
  });

  it('emits update:modelValue with true when checked', async () => {
    const wrapper = mountToggle({
      modelValue: false,
    });

    const input = wrapper.find('input[type="checkbox"]');

    await input.setValue(true);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([true]);
  });

  it('emits update:modelValue with false when unchecked', async () => {
    const wrapper = mountToggle({
      modelValue: true,
    });

    const input = wrapper.find('input[type="checkbox"]');

    await input.setValue(false);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
  });
});