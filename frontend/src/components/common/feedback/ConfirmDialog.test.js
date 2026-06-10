import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import ConfirmDialog from './ConfirmDialog.vue';

vi.mock('lucide-vue-next', () => ({
  AlertTriangle: {
    name: 'AlertTriangle',
    props: ['size'],
    template: '<svg data-test="alert-icon" />',
  },
}));

const BaseButtonStub = defineComponent({
  name: 'BaseButton',
  props: {
    variant: {
      type: String,
      default: 'pill',
    },
    size: {
      type: String,
      default: 'sm',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  template: `
    <button
      data-test="base-button"
      :data-variant="variant"
      :data-size="size"
      :data-loading="loading"
      :disabled="disabled || loading"
      @click="$emit('click')"
    >
      <slot />
    </button>
  `,
});

const CloseButtonStub = defineComponent({
  name: 'CloseButton',
  emits: ['click'],
  template: `
    <button
      type="button"
      data-test="close-button"
      @click="$emit('click')"
    >
      Close
    </button>
  `,
});

function mountDialog(props = {}) {
  return mount(ConfirmDialog, {
    props,
    global: {
      stubs: {
        BaseButton: BaseButtonStub,
        CloseButton: CloseButtonStub,
        Transition: false,
      },
    },
  });
}

describe('ConfirmDialog', () => {
  it('does not render when open is false', () => {
    const wrapper = mountDialog({
      open: false,
    });

    expect(wrapper.find('.confirm-dialog').exists()).toBe(false);
  });

  it('renders the dialog with default content when open is true', () => {
    const wrapper = mountDialog({
      open: true,
    });

    expect(wrapper.find('.confirm-dialog').exists()).toBe(true);
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    expect(wrapper.find('[role="dialog"]').attributes('aria-modal')).toBe('true');

    expect(wrapper.text()).toContain('Confirm action');
    expect(wrapper.text()).toContain('Are you sure you want to continue?');
    expect(wrapper.text()).toContain('Cancel');
    expect(wrapper.text()).toContain('Confirm');

    expect(wrapper.find('[data-test="alert-icon"]').exists()).toBe(true);
  });

  it('renders custom title, message and button texts', () => {
    const wrapper = mountDialog({
      open: true,
      title: 'Delete experience?',
      message: 'This experience will be permanently removed.',
      confirmText: 'Delete',
      cancelText: 'Keep it',
    });

    expect(wrapper.text()).toContain('Delete experience?');
    expect(wrapper.text()).toContain('This experience will be permanently removed.');
    expect(wrapper.text()).toContain('Delete');
    expect(wrapper.text()).toContain('Keep it');
  });

  it('emits cancel when clicking the backdrop', async () => {
    const wrapper = mountDialog({
      open: true,
    });

    await wrapper.find('.confirm-dialog').trigger('click');

    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });

  it('emits cancel when clicking the close button', async () => {
    const wrapper = mountDialog({
      open: true,
    });

    await wrapper.find('[data-test="close-button"]').trigger('click');

    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });

  it('emits cancel when clicking the cancel button', async () => {
    const wrapper = mountDialog({
      open: true,
      cancelText: 'No',
    });

    const cancelButton = wrapper
      .findAll('[data-test="base-button"]')
      .find((button) => button.text() === 'No');

    await cancelButton.trigger('click');

    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });

  it('emits confirm when clicking the confirm button', async () => {
    const wrapper = mountDialog({
      open: true,
      confirmText: 'Delete',
    });

    const confirmButton = wrapper
      .findAll('[data-test="base-button"]')
      .find((button) => button.text() === 'Delete');

    await confirmButton.trigger('click');

    expect(wrapper.emitted('confirm')).toHaveLength(1);
  });

  it('passes loading state to buttons and disables actions when loading is true', () => {
    const wrapper = mountDialog({
      open: true,
      loading: true,
      cancelText: 'Cancel',
      confirmText: 'Delete',
    });

    const buttons = wrapper.findAll('[data-test="base-button"]');

    const cancelButton = buttons.find((button) => button.text() === 'Cancel');
    const confirmButton = buttons.find((button) => button.text() === 'Delete');

    expect(cancelButton.attributes('disabled')).toBeDefined();
    expect(confirmButton.attributes('disabled')).toBeDefined();

    expect(confirmButton.attributes('data-loading')).toBe('true');
  });
});