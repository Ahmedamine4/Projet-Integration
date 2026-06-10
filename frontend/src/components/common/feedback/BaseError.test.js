import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import BaseError from './BaseError.vue';

describe('BaseError', () => {
  it('renders the slot content', () => {
    const wrapper = mount(BaseError, {
      slots: {
        default: 'Something went wrong',
      },
    });

    expect(wrapper.text()).toBe('Something went wrong');
  });

  it('uses global variant by default', () => {
    const wrapper = mount(BaseError, {
      slots: {
        default: 'Global error',
      },
    });

    const error = wrapper.find('p');

    expect(error.classes()).toContain('error--global');
    expect(error.classes()).not.toContain('error--field');
  });

  it('applies the field variant class when variant is field', () => {
    const wrapper = mount(BaseError, {
      props: {
        variant: 'field',
      },
      slots: {
        default: 'This field is required',
      },
    });

    const error = wrapper.find('p');

    expect(error.classes()).toContain('error--field');
    expect(error.classes()).not.toContain('error--global');
  });
});