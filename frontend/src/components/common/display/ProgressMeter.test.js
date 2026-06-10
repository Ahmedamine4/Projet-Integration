import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ProgressMeter from './ProgressMeter.vue';

function mountProgressMeter(props = {}) {
  return mount(ProgressMeter, {
    props,
  });
}

function getFillStyle(wrapper) {
  return wrapper.find('.progress-meter__fill').attributes('style');
}

describe('ProgressMeter', () => {
  it('renders an empty progress bar by default', () => {
    const wrapper = mountProgressMeter();

    const fill = wrapper.find('.progress-meter__fill');

    expect(fill.exists()).toBe(true);
    expect(getFillStyle(wrapper)).toContain('width: 0%');
    expect(getFillStyle(wrapper)).toContain('var(--color-error)');
  });

  it('uses error color when completion is 25% or less', () => {
    const wrapper = mountProgressMeter({
      value: 1,
      max: 4,
    });

    expect(getFillStyle(wrapper)).toContain('width: 25%');
    expect(getFillStyle(wrapper)).toContain('var(--color-error)');
  });

  it('uses orange color when completion is 50% or less', () => {
    const wrapper = mountProgressMeter({
      value: 2,
      max: 4,
    });

    expect(getFillStyle(wrapper)).toContain('width: 50%');
    expect(getFillStyle(wrapper)).toContain('rgb(224, 112, 18)');
  });

  it('uses yellow color when completion is 75% or less', () => {
    const wrapper = mountProgressMeter({
      value: 3,
      max: 4,
    });

    expect(getFillStyle(wrapper)).toContain('width: 75%');
    expect(getFillStyle(wrapper)).toContain('rgb(217, 178, 11)');
  });

  it('uses success color when completion is above 75%', () => {
    const wrapper = mountProgressMeter({
      value: 4,
      max: 4,
    });

    expect(getFillStyle(wrapper)).toContain('width: 100%');
    expect(getFillStyle(wrapper)).toContain('var(--color-success)');
  });

  it('calculates progress using a custom max value', () => {
    const wrapper = mountProgressMeter({
      value: 5,
      max: 10,
    });

    expect(getFillStyle(wrapper)).toContain('width: 50%');
  });
});