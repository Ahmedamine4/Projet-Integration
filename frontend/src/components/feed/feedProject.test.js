import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import FeedProject from './feedProject.vue';

vi.mock('lucide-vue-next', () => ({
  GitBranch: {
    name: 'GitBranch',
    props: ['size'],
    template: '<svg data-test="git-branch-icon" />',
  },
  Github: {
    name: 'Github',
    props: ['size'],
    template: '<svg data-test="github-icon" />',
  },
  Share2: {
    name: 'Share2',
    props: ['size'],
    template: '<svg data-test="share-icon" />',
  },
}));

const project = {
  id: 3,
  studentName: 'Nour Bakkali',
  schoolName: 'EMSI',
  date: '2026-06-10T10:00:00.000Z',
  credibilityScore: 87,
  title: 'Portfolio AI Platform',
  description: 'A portfolio platform using Vue, Express and AI recommendations.',
  imagePreview: 'https://example.com/project.png',
  domains: ['Web Development', 'Artificial Intelligence'],
  technologies: ['Vue.js', 'Express.js', 'PostgreSQL'],
  commitsCount: 42,
  githubReposCount: 1,
};

function mountProject(props = {}) {
  return mount(FeedProject, {
    props: {
      project: {
        ...project,
        ...props.project,
      },
    },
  });
}

describe('FeedProject', () => {
  it('renders the main project information', () => {
    const wrapper = mountProject();

    expect(wrapper.find('.project-card').exists()).toBe(true);

    expect(wrapper.text()).toContain('Nour Bakkali');
    expect(wrapper.text()).toContain('EMSI');
    expect(wrapper.text()).toContain('Portfolio AI Platform');
    expect(wrapper.text()).toContain(
      'A portfolio platform using Vue, Express and AI recommendations.'
    );
    expect(wrapper.text()).toContain('87');
  });

  it('renders initials from the student name', () => {
    const wrapper = mountProject();

    expect(wrapper.find('.avatar').text()).toBe('NB');
  });

  it('renders only one initial when the student has one name', () => {
    const wrapper = mountProject({
      project: {
        studentName: 'Nour',
      },
    });

    expect(wrapper.find('.avatar').text()).toBe('N');
  });

  it('applies the avatar tone class based on the project id', () => {
    const wrapper = mountProject({
      project: {
        id: 3,
      },
    });

    expect(wrapper.find('.avatar').classes()).toContain('avatar--tone-4');
  });

  it('renders the formatted date', () => {
    const wrapper = mountProject();

    expect(wrapper.find('.author-meta').text()).toContain('EMSI');
    expect(wrapper.find('.author-meta').text()).toContain('Jun');
    expect(wrapper.find('.author-meta').text()).toContain('2026');
  });

  it('renders domains when provided', () => {
    const wrapper = mountProject();

    const domains = wrapper.findAll('.tag--domain').map((tag) => tag.text());

    expect(domains).toEqual(['Web Development', 'Artificial Intelligence']);
  });

  it('does not render domain tags when domains are empty', () => {
    const wrapper = mountProject({
      project: {
        domains: [],
      },
    });

    expect(wrapper.findAll('.tag--domain')).toHaveLength(0);
  });

  it('renders technologies when provided', () => {
    const wrapper = mountProject();

    const technologies = wrapper.findAll('.tag--tech').map((tag) => tag.text());

    expect(technologies).toEqual(['Vue.js', 'Express.js', 'PostgreSQL']);
  });

  it('does not render technology tags when technologies are empty', () => {
    const wrapper = mountProject({
      project: {
        technologies: [],
      },
    });

    expect(wrapper.findAll('.tag--tech')).toHaveLength(0);
  });

  it('renders project image when imagePreview exists', () => {
    const wrapper = mountProject();

    const image = wrapper.find('.post-media img');

    expect(image.exists()).toBe(true);
    expect(image.attributes('src')).toBe('https://example.com/project.png');
    expect(image.attributes('alt')).toBe('Portfolio AI Platform');
    expect(image.attributes('loading')).toBe('lazy');
  });

  it('does not render image when imagePreview is missing', () => {
    const wrapper = mountProject({
      project: {
        imagePreview: '',
      },
    });

    expect(wrapper.find('.post-media').exists()).toBe(false);
    expect(wrapper.find('img').exists()).toBe(false);
  });

  it('renders commitsCount when available', () => {
    const wrapper = mountProject({
      project: {
        commitsCount: 42,
        githubReposCount: 3,
      },
    });

    expect(wrapper.text()).toContain('42 commits');
  });

  it('falls back to githubReposCount when commitsCount is missing', () => {
    const wrapper = mountProject({
      project: {
        commitsCount: undefined,
        githubReposCount: 5,
      },
    });

    expect(wrapper.text()).toContain('5 commits');
  });

  it('shows 0 commits when commitsCount and githubReposCount are missing', () => {
    const wrapper = mountProject({
      project: {
        commitsCount: undefined,
        githubReposCount: undefined,
      },
    });

    expect(wrapper.text()).toContain('0 commits');
  });

  it('renders GitHub button only when githubReposCount is greater than 0', () => {
    const wrapper = mountProject({
      project: {
        githubReposCount: 1,
      },
    });

    const githubButton = wrapper
      .findAll('.action-btn')
      .find((button) => button.text().includes('GitHub'));

    expect(githubButton.exists()).toBe(true);
    expect(wrapper.find('[data-test="github-icon"]').exists()).toBe(true);
  });

  it('does not render GitHub button when githubReposCount is 0', () => {
    const wrapper = mountProject({
      project: {
        githubReposCount: 0,
      },
    });

    const githubButton = wrapper
      .findAll('.action-btn')
      .find((button) => button.text().includes('GitHub'));

    expect(githubButton).toBeUndefined();
  });

  it('emits open-student when clicking the student name', async () => {
    const wrapper = mountProject();

    await wrapper.find('.author-name-button').trigger('click');

    expect(wrapper.emitted('open-student')).toBeTruthy();
    expect(wrapper.emitted('open-student')).toHaveLength(1);
    expect(wrapper.emitted('open-student')[0]).toEqual([project]);
  });

  it('emits share when clicking the share button', async () => {
    const wrapper = mountProject();

    await wrapper.find('[aria-label="Share project"]').trigger('click');

    expect(wrapper.emitted('share')).toBeTruthy();
    expect(wrapper.emitted('share')).toHaveLength(1);
    expect(wrapper.emitted('share')[0]).toEqual([project]);
  });

  it('renders the icons used by the card', () => {
    const wrapper = mountProject();

    expect(wrapper.find('[data-test="git-branch-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="github-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="share-icon"]').exists()).toBe(true);
  });
});