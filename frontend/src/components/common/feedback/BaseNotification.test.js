import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import BaseNotification from './BaseNotification.vue';

vi.mock('lucide-vue-next', () => ({
  CircleX: {
    name: 'CircleX',
    props: ['size'],
    template: '<svg data-test="error-icon" />',
  },
  CheckCircle: {
    name: 'CheckCircle',
    props: ['size'],
    template: '<svg data-test="success-icon" />',
  },
  X: {
    name: 'X',
    props: ['size'],
    template: '<svg data-test="close-icon" />',
  },
}));

function mountNotification(props = {}) {
  return mount(BaseNotification, {
    props,
    global: {
      stubs: {
        Transition: false,
      },
    },
  });
}

describe('BaseNotification', () => {
  it('does not render anything when message is empty', () => {
    const wrapper = mountNotification();

    expect(wrapper.find('.base-notification').exists()).toBe(false);
  });

  it('renders an error notification by default', () => {
    const wrapper = mountNotification({
      message: 'Something went wrong',
    });

    const notification = wrapper.find('.base-notification');

    expect(notification.exists()).toBe(true);
    expect(notification.attributes('role')).toBe('alert');
    expect(notification.classes()).toContain('base-notification--error');
    expect(wrapper.text()).toContain('Something went wrong');

    expect(wrapper.find('[data-test="error-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="success-icon"]').exists()).toBe(false);
  });

  it('renders a success notification when type is success', () => {
    const wrapper = mountNotification({
      message: 'Saved successfully',
      type: 'success',
    });

    const notification = wrapper.find('.base-notification');

    expect(notification.exists()).toBe(true);
    expect(notification.classes()).toContain('base-notification--success');
    expect(wrapper.text()).toContain('Saved successfully');

    expect(wrapper.find('[data-test="success-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="error-icon"]').exists()).toBe(false);
  });

  it('emits close when clicking the dismiss button', async () => {
    const wrapper = mountNotification({
      message: 'Saved successfully',
      type: 'success',
    });

    const closeButton = wrapper.find('button[aria-label="Dismiss notification"]');

    expect(closeButton.exists()).toBe(true);

    await closeButton.trigger('click');

    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});