import { nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ShareProjectModal from './ShareProjectModal.vue';

vi.mock('lucide-vue-next', () => ({
  CheckCheck: {
    name: 'CheckCheck',
    props: ['size'],
    template: '<svg data-test="check-icon" />',
  },
  Copy: {
    name: 'Copy',
    props: ['size'],
    template: '<svg data-test="copy-icon" />',
  },
  Link2: {
    name: 'Link2',
    props: ['size'],
    template: '<svg data-test="link-icon" />',
  },
  X: {
    name: 'X',
    props: ['size'],
    template: '<svg data-test="x-icon" />',
  },
}));

const project = {
  id: 123,
  title: 'Portfolio AI Platform',
  shareUrl: 'https://example.com/shared/project-123',
};

function mountModal(props = {}) {
  return mount(ShareProjectModal, {
    props: {
      project,
      ...props,
    },
    attachTo: document.body,
    global: {
      stubs: {
        Teleport: true,
      },
    },
  });
}

beforeEach(() => {
  vi.useFakeTimers();

  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
    configurable: true,
  });

  Object.defineProperty(document, 'execCommand', {
    value: vi.fn(() => true),
    configurable: true,
  });
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  document.body.innerHTML = '';
  vi.clearAllMocks();
});

describe('ShareProjectModal', () => {
  it('does not render when project is null', () => {
    const wrapper = mountModal({
      project: null,
    });

    expect(wrapper.find('.share-overlay').exists()).toBe(false);
    expect(wrapper.find('.share-modal').exists()).toBe(false);
  });

  it('renders the share modal when project exists', () => {
    const wrapper = mountModal();

    expect(wrapper.find('.share-overlay').exists()).toBe(true);
    expect(wrapper.find('.share-modal').exists()).toBe(true);

    expect(wrapper.text()).toContain('Share project');
    expect(wrapper.text()).toContain('Copy this link to share the project.');
    expect(wrapper.find('[data-test="link-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="copy-icon"]').exists()).toBe(true);
  });

  it('uses project.shareUrl when provided', () => {
    const wrapper = mountModal();

    const input = wrapper.find('.share-link-input');

    expect(input.element.value).toBe('https://example.com/shared/project-123');
  });

  it('builds a fallback link from project id when shareUrl is missing', () => {
    const wrapper = mountModal({
      project: {
        id: 456,
        title: 'Project without shareUrl',
      },
    });

    expect(wrapper.find('.share-link-input').element.value).toBe(
      `${window.location.origin}/projects/456`
    );
  });

  it('uses projet_id when id is missing', () => {
    const wrapper = mountModal({
      project: {
        projet_id: 789,
        title: 'Project with projet_id',
      },
    });

    expect(wrapper.find('.share-link-input').element.value).toBe(
      `${window.location.origin}/projects/789`
    );
  });

  it('uses project_id when id and projet_id are missing', () => {
    const wrapper = mountModal({
      project: {
        project_id: 999,
        title: 'Project with project_id',
      },
    });

    expect(wrapper.find('.share-link-input').element.value).toBe(
      `${window.location.origin}/projects/999`
    );
  });

  it('emits close when clicking the close button', async () => {
    const wrapper = mountModal();

    await wrapper.find('.share-close-button').trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('copies the link using navigator.clipboard', async () => {
    const wrapper = mountModal();

    await wrapper.find('.share-copy-button').trigger('click');
    await flushPromises();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://example.com/shared/project-123'
    );

    expect(wrapper.find('.share-copy-button').classes()).toContain('is-copied');
    expect(wrapper.text()).toContain('Copied');
    expect(wrapper.text()).toContain('Link copied successfully.');
    expect(wrapper.find('[data-test="check-icon"]').exists()).toBe(true);
  });

  it('resets copied state after 2200ms', async () => {
    const wrapper = mountModal();

    await wrapper.find('.share-copy-button').trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Copied');

    vi.advanceTimersByTime(2200);
    await nextTick();

    expect(wrapper.text()).toContain('Copy link');
    expect(wrapper.find('.copied-message').exists()).toBe(false);
    expect(wrapper.find('[data-test="copy-icon"]').exists()).toBe(true);
  });

  it('uses fallback copy when navigator.clipboard fails', async () => {
    navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Clipboard failed'));

    const wrapper = mountModal();

    await wrapper.find('.share-copy-button').trigger('click');
    await flushPromises();

    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(wrapper.text()).toContain('Copied');
  });

  it('removes the fallback textarea after copying', async () => {
    navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Clipboard failed'));

    const wrapper = mountModal();

    await wrapper.find('.share-copy-button').trigger('click');
    await flushPromises();

    const fallbackTextarea = document.body.querySelector('textarea');

    expect(fallbackTextarea).toBeNull();
  });

  it('selects the link when the input receives focus', async () => {
    const wrapper = mountModal();

    const input = wrapper.find('.share-link-input');

    input.element.select = vi.fn();

    await input.trigger('focus');

    expect(input.element.select).toHaveBeenCalled();
  });

  it('resets copied state when project changes', async () => {
    const wrapper = mountModal();

    await wrapper.find('.share-copy-button').trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Copied');

    await wrapper.setProps({
      project: {
        id: 456,
        title: 'Another project',
        shareUrl: 'https://example.com/shared/project-456',
      },
    });

    expect(wrapper.text()).toContain('Copy link');
    expect(wrapper.find('.copied-message').exists()).toBe(false);
  });
});