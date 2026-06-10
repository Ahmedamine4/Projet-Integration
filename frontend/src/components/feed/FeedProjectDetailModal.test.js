import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import FeedProjectDetailModal from './FeedProjectDetailModal.vue';

vi.mock('lucide-vue-next', () => ({
  Github: {
    name: 'Github',
    props: ['size'],
    template: '<svg data-test="github-icon" />',
  },
  MessageCircle: {
    name: 'MessageCircle',
    props: ['size'],
    template: '<svg data-test="message-icon" />',
  },
  Star: {
    name: 'Star',
    props: ['size'],
    template: '<svg data-test="star-icon" />',
  },
  X: {
    name: 'X',
    props: ['size'],
    template: '<svg data-test="x-icon" />',
  },
}));

const project = {
  id: 1,
  title: 'Portfolio AI Platform',
  studentName: 'Nour Bakkali',
  schoolName: 'EMSI',
  description: 'A portfolio platform using Vue, Express and AI recommendations.',
  imagePreview: 'https://example.com/project.png',
  feedReason: 'Recommended for you',
  technologies: ['Vue.js', 'Express.js', 'PostgreSQL'],
  domains: ['Web Development', 'Artificial Intelligence'],
  recommendationsCount: 12,
  commentsCount: 5,
  githubReposCount: 2,
  credibilityScore: 87,
};

function mountModal(props = {}) {
  return mount(FeedProjectDetailModal, {
    props: {
      project,
      ...props,
    },
    global: {
      stubs: {
        Teleport: true,
      },
    },
  });
}

describe('FeedProjectDetailModal', () => {
  it('does not render when project is null', () => {
    const wrapper = mountModal({
      project: null,
    });

    expect(wrapper.find('.project-backdrop').exists()).toBe(false);
    expect(wrapper.find('.project-modal').exists()).toBe(false);
  });

  it('renders the project details when project exists', () => {
    const wrapper = mountModal();

    expect(wrapper.find('.project-backdrop').exists()).toBe(true);
    expect(wrapper.find('.project-modal').exists()).toBe(true);

    expect(wrapper.text()).toContain('Portfolio AI Platform');
    expect(wrapper.text()).toContain('Nour Bakkali · EMSI');
    expect(wrapper.text()).toContain(
      'A portfolio platform using Vue, Express and AI recommendations.'
    );
    expect(wrapper.text()).toContain('Recommended for you');
  });

  it('renders the project image when imagePreview exists', () => {
    const wrapper = mountModal();

    const image = wrapper.find('.project-image');

    expect(image.exists()).toBe(true);
    expect(image.attributes('src')).toBe('https://example.com/project.png');
    expect(image.attributes('alt')).toBe('Portfolio AI Platform');
  });

  it('does not render the project image when imagePreview is missing', () => {
    const wrapper = mountModal({
      project: {
        ...project,
        imagePreview: '',
      },
    });

    expect(wrapper.find('.project-image').exists()).toBe(false);
  });

  it('renders technologies when provided', () => {
    const wrapper = mountModal();

    expect(wrapper.text()).toContain('Vue.js');
    expect(wrapper.text()).toContain('Express.js');
    expect(wrapper.text()).toContain('PostgreSQL');
  });

  it('does not render technologies list when technologies are empty', () => {
    const wrapper = mountModal({
      project: {
        ...project,
        technologies: [],
      },
    });

    expect(wrapper.text()).not.toContain('Vue.js');
    expect(wrapper.text()).not.toContain('Express.js');
    expect(wrapper.text()).not.toContain('PostgreSQL');
  });

  it('renders domains when provided', () => {
    const wrapper = mountModal();

    expect(wrapper.text()).toContain('Web Development');
    expect(wrapper.text()).toContain('Artificial Intelligence');
  });

  it('does not render domains list when domains are empty', () => {
    const wrapper = mountModal({
      project: {
        ...project,
        domains: [],
      },
    });

    expect(wrapper.text()).not.toContain('Web Development');
    expect(wrapper.text()).not.toContain('Artificial Intelligence');
  });

  it('renders project stats', () => {
    const wrapper = mountModal();

    expect(wrapper.text()).toContain('12 recommendations');
    expect(wrapper.text()).toContain('5 comments');
    expect(wrapper.text()).toContain('2 repositories');

    expect(wrapper.find('[data-test="star-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="message-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="github-icon"]').exists()).toBe(true);
  });

  it('uses 0 as fallback for missing stats', () => {
    const wrapper = mountModal({
      project: {
        ...project,
        recommendationsCount: undefined,
        commentsCount: undefined,
        githubReposCount: undefined,
      },
    });

    expect(wrapper.text()).toContain('0 recommendations');
    expect(wrapper.text()).toContain('0 comments');
    expect(wrapper.text()).toContain('0 repositories');
  });

  it('renders the credibility score', () => {
    const wrapper = mountModal();

    expect(wrapper.text()).toContain('Credibility score');
    expect(wrapper.text()).toContain('87');
  });

  it('uses dash as fallback when credibility score is missing', () => {
    const wrapper = mountModal({
      project: {
        ...project,
        credibilityScore: undefined,
      },
    });

    expect(wrapper.text()).toContain('Credibility score');
    expect(wrapper.find('.score-box strong').text()).toBe('-');
  });

  it('emits close when clicking the close button', async () => {
    const wrapper = mountModal();

    await wrapper.find('.close-button').trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('emits close when clicking the backdrop', async () => {
    const wrapper = mountModal();

    await wrapper.find('.project-backdrop').trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('does not emit close when clicking inside the modal', async () => {
    const wrapper = mountModal();

    await wrapper.find('.project-modal').trigger('click');

    expect(wrapper.emitted('close')).toBeFalsy();
  });

  it('renders the X icon in the close button', () => {
    const wrapper = mountModal();

    expect(wrapper.find('[data-test="x-icon"]').exists()).toBe(true);
  });
});