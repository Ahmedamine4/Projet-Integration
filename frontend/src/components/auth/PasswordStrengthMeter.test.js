import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import PasswordStrengthMeter from './PasswordStrengthMeter.vue';

const ProgressMeterStub = defineComponent({
  name: 'ProgressMeter',
  props: {
    value: {
      type: Number,
      required: true,
    },
  },
  template: '<div data-test="progress-meter">{{ value }}</div>',
});

function mountPasswordStrengthMeter(password = '') {
  return mount(PasswordStrengthMeter, {
    props: {
      password,
    },
    global: {
      stubs: {
        ProgressMeter: ProgressMeterStub,
      },
    },
  });
}

function getRule(wrapper, label) {
  return wrapper
    .findAll('.password-meter__rule')
    .find((rule) => rule.text().includes(label));
}

describe('PasswordStrengthMeter', () => {
  it('is hidden when password is empty and shows a weak score of 0', () => {
    const wrapper = mountPasswordStrengthMeter('');

    expect(wrapper.classes()).not.toContain('password-meter--visible');
    expect(wrapper.text()).toContain('Password strength');
    expect(wrapper.text()).toContain('Weak');

    expect(wrapper.findComponent(ProgressMeterStub).props('value')).toBe(0);

    const checkboxes = wrapper.findAll('input[type="checkbox"]');

    expect(checkboxes).toHaveLength(4);
    expect(checkboxes.every((checkbox) => checkbox.element.checked === false)).toBe(true);
  });

  it('shows Weak when only one rule is passed', () => {
    const wrapper = mountPasswordStrengthMeter('abc');

    expect(wrapper.classes()).toContain('password-meter--visible');
    expect(wrapper.text()).toContain('Weak');
    expect(wrapper.findComponent(ProgressMeterStub).props('value')).toBe(1);

    expect(getRule(wrapper, 'Alphabetic letter').classes()).toContain(
      'password-meter__rule--passed'
    );

    expect(getRule(wrapper, '8+ characters').classes()).not.toContain(
      'password-meter__rule--passed'
    );

    expect(getRule(wrapper, 'Number').classes()).not.toContain(
      'password-meter__rule--passed'
    );

    expect(getRule(wrapper, 'Symbol').classes()).not.toContain(
      'password-meter__rule--passed'
    );
  });

  it('shows Fair when two rules are passed', () => {
    const wrapper = mountPasswordStrengthMeter('abc123');

    expect(wrapper.text()).toContain('Fair');
    expect(wrapper.findComponent(ProgressMeterStub).props('value')).toBe(2);

    expect(getRule(wrapper, 'Alphabetic letter').classes()).toContain(
      'password-meter__rule--passed'
    );

    expect(getRule(wrapper, 'Number').classes()).toContain(
      'password-meter__rule--passed'
    );

    expect(getRule(wrapper, '8+ characters').classes()).not.toContain(
      'password-meter__rule--passed'
    );

    expect(getRule(wrapper, 'Symbol').classes()).not.toContain(
      'password-meter__rule--passed'
    );
  });

  it('shows Good when three rules are passed', () => {
    const wrapper = mountPasswordStrengthMeter('abc12345');

    expect(wrapper.text()).toContain('Good');
    expect(wrapper.findComponent(ProgressMeterStub).props('value')).toBe(3);

    expect(getRule(wrapper, '8+ characters').classes()).toContain(
      'password-meter__rule--passed'
    );

    expect(getRule(wrapper, 'Alphabetic letter').classes()).toContain(
      'password-meter__rule--passed'
    );

    expect(getRule(wrapper, 'Number').classes()).toContain(
      'password-meter__rule--passed'
    );

    expect(getRule(wrapper, 'Symbol').classes()).not.toContain(
      'password-meter__rule--passed'
    );
  });

  it('shows Strong when all password rules are passed', () => {
    const wrapper = mountPasswordStrengthMeter('abc12345!');

    expect(wrapper.text()).toContain('Strong');
    expect(wrapper.findComponent(ProgressMeterStub).props('value')).toBe(4);

    expect(getRule(wrapper, '8+ characters').classes()).toContain(
      'password-meter__rule--passed'
    );

    expect(getRule(wrapper, 'Alphabetic letter').classes()).toContain(
      'password-meter__rule--passed'
    );

    expect(getRule(wrapper, 'Number').classes()).toContain(
      'password-meter__rule--passed'
    );

    expect(getRule(wrapper, 'Symbol').classes()).toContain(
      'password-meter__rule--passed'
    );

    const checkboxes = wrapper.findAll('input[type="checkbox"]');

    expect(checkboxes.every((checkbox) => checkbox.element.checked === true)).toBe(true);
  });

  it('updates the strength when the password prop changes', async () => {
    const wrapper = mountPasswordStrengthMeter('abc');

    expect(wrapper.text()).toContain('Weak');
    expect(wrapper.findComponent(ProgressMeterStub).props('value')).toBe(1);

    await wrapper.setProps({
      password: 'abc12345!',
    });

    expect(wrapper.text()).toContain('Strong');
    expect(wrapper.findComponent(ProgressMeterStub).props('value')).toBe(4);
  });
});