import { defineComponent, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import FeedModalShell from './FeedModalShell.vue';

const CloseButtonStub = defineComponent({
  name: 'CloseButton',
  props: {
    size: {
      type: String,
      default: 'md',
    },
  },
  emits: ['click'],
  template: `
    <button
      type="button"
      data-test="close-button"
      :data-size="size"
      @click="$emit('click')"
    >
      Close
    </button>
  `,
});

function mountShell(props = {}, slots = {}) {
  return mount(FeedModalShell, {
    props: {
      open: true,
      title: 'Project details',
      description: 'Full project information',
      size: 'md',
      ...props,
    },
    slots: {
      default: '<p data-test="body-content">Modal body content</p>',
      ...slots,
    },
    attachTo: document.body,
    global: {
      stubs: {
        CloseButton: CloseButtonStub,
        Teleport: true,
        Transition: true,
      },
    },
  });
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('FeedModalShell', () => {
  it('does not render when open is false', () => {
    const wrapper = mountShell({
      open: false,
    });

    expect(wrapper.find('.modal-overlay').exists()).toBe(false);

    wrapper.unmount();
  });

  it('renders the modal when open is true', () => {
    const wrapper = mountShell();

    expect(wrapper.find('.modal-overlay').exists()).toBe(true);
    expect(wrapper.find('.modal-card').exists()).toBe(true);
    expect(wrapper.find('.modal-card').attributes('role')).toBe('dialog');
    expect(wrapper.find('.modal-card').attributes('aria-modal')).toBe('true');

    wrapper.unmount();
  });

  it('renders title and description', () => {
    const wrapper = mountShell({
      title: 'Apply to offer',
      description: 'Send your application message',
    });

    expect(wrapper.find('h2').text()).toBe('Apply to offer');
    expect(wrapper.find('.modal-card__heading p').text()).toBe(
      'Send your application message'
    );
    expect(wrapper.find('.modal-card').attributes('aria-label')).toBe(
      'Apply to offer'
    );

    wrapper.unmount();
  });

  it('does not render title or description when they are empty', () => {
    const wrapper = mountShell({
      title: '',
      description: '',
    });

    expect(wrapper.find('h2').exists()).toBe(false);
    expect(wrapper.find('.modal-card__heading p').exists()).toBe(false);

    wrapper.unmount();
  });

  it('renders the default slot content', () => {
    const wrapper = mountShell();

    expect(wrapper.find('[data-test="body-content"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="body-content"]').text()).toBe(
      'Modal body content'
    );

    wrapper.unmount();
  });

  it('renders the footer slot when provided', () => {
    const wrapper = mountShell({}, {
      footer: '<button data-test="footer-button">Confirm</button>',
    });

    expect(wrapper.find('.modal-card__footer').exists()).toBe(true);
    expect(wrapper.find('[data-test="footer-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="footer-button"]').text()).toBe('Confirm');

    wrapper.unmount();
  });

  it('does not render footer when no footer slot is provided', () => {
    const wrapper = mountShell();

    expect(wrapper.find('.modal-card__footer').exists()).toBe(false);

    wrapper.unmount();
  });

  it('applies the size class', () => {
    const wrapper = mountShell({
      size: 'lg',
    });

    expect(wrapper.find('.modal-card').classes()).toContain('modal-card--lg');

    wrapper.unmount();
  });

  it('passes size lg to CloseButton', () => {
    const wrapper = mountShell();

    expect(wrapper.find('[data-test="close-button"]').attributes('data-size')).toBe(
      'lg'
    );

    wrapper.unmount();
  });

  it('emits close when clicking the close button', async () => {
    const wrapper = mountShell();

    await wrapper.find('[data-test="close-button"]').trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')).toHaveLength(1);

    wrapper.unmount();
  });

  it('emits close when clicking the overlay background', async () => {
    const wrapper = mountShell();

    await wrapper.find('.modal-overlay').trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')).toHaveLength(1);

    wrapper.unmount();
  });

  it('does not emit close when clicking inside the modal card', async () => {
    const wrapper = mountShell();

    await wrapper.find('.modal-card').trigger('click');

    expect(wrapper.emitted('close')).toBeFalsy();

    wrapper.unmount();
  });

  it('emits close when pressing Escape while open', async () => {
    const wrapper = mountShell();

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
      })
    );

    await nextTick();

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')).toHaveLength(1);

    wrapper.unmount();
  });

  it('does not emit close when pressing another key', async () => {
    const wrapper = mountShell();

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
      })
    );

    await nextTick();

    expect(wrapper.emitted('close')).toBeFalsy();

    wrapper.unmount();
  });

  it('removes Escape listener when open becomes false', async () => {
    const wrapper = mountShell();

    await wrapper.setProps({
      open: false,
    });

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
      })
    );

    await nextTick();

    expect(wrapper.emitted('close')).toBeFalsy();

    wrapper.unmount();
  });
});