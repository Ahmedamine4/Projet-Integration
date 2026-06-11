import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import PortfolioProject from './PortfolioProject.vue';

vi.mock('lucide-vue-next', () => ({
  BadgeCheck: {
    name: 'BadgeCheck',
    props: ['size', 'strokeWidth'],
    template: '<svg data-test="badge-check-icon" />',
  },
  Clock3: {
    name: 'Clock3',
    props: ['size', 'strokeWidth'],
    template: '<svg data-test="clock-icon" />',
  },
  Eye: {
    name: 'Eye',
    props: ['size'],
    template: '<svg data-test="eye-icon" />',
  },
  EyeOff: {
    name: 'EyeOff',
    props: ['size'],
    template: '<svg data-test="eye-off-icon" />',
  },
  Sparkles: {
    name: 'Sparkles',
    props: ['size', 'strokeWidth'],
    template: '<svg data-test="sparkles-icon" />',
  },
  XCircle: {
    name: 'XCircle',
    props: ['size', 'strokeWidth'],
    template: '<svg data-test="x-circle-icon" />',
  },
}));

vi.mock('@/composables/useDoubleTap', () => ({
  useDoubleTap: (callback) => ({
    handleDoubleTap: () => callback(),
  }),
}));

const ExploreButtonStub = defineComponent({
  name: 'ExploreButton',
  props: {
    experienceType: {
      type: String,
      default: '',
    },
    experienceId: {
      type: [String, Number],
      default: '',
    },
  },
  template: `
    <button
      type="button"
      data-test="explore-button"
      :data-type="experienceType"
      :data-id="String(experienceId)"
    >
      Explore
    </button>
  `,
});

const project = {
  id: 7,
  title: 'Portfolio AI Platform',
  description: 'A smart portfolio platform using Vue and AI recommendations.',
  imagePreview: 'https://example.com/project.png',
  date: '2026-06-10T10:00:00.000Z',
  technologies: ['Vue.js', 'Express.js', 'PostgreSQL', 'Docker'],
  domains: ['Web Development', 'Artificial Intelligence', 'Cloud'],
  isAcademic: true,
  validationStatus: 'valide',
  highlighted: true,
  effectiveVisibleToEveryone: true,
  score: 92,
};

function mountProject(props = {}) {
  const { project: projectOverrides = {}, ...restProps } = props;

  return mount(PortfolioProject, {
    props: {
      canEdit: false,
      ...restProps,
      project: {
        ...project,
        ...projectOverrides,
      },
    },
    global: {
      stubs: {
        ExploreButton: ExploreButtonStub,
      },
    },
  });
}

describe('PortfolioProject', () => {
  it('renders the project title, description and date', () => {
    const wrapper = mountProject();

    expect(wrapper.find('.project-card').exists()).toBe(true);
    expect(wrapper.text()).toContain('Portfolio AI Platform');
    expect(wrapper.text()).toContain(
      'A smart portfolio platform using Vue and AI recommendations.'
    );
    expect(wrapper.text()).toContain('June');
    expect(wrapper.text()).toContain('2026');
  });

  it('renders the project image when imagePreview exists', () => {
    const wrapper = mountProject();

    const image = wrapper.find('.project-preview img');

    expect(image.exists()).toBe(true);
    expect(image.attributes('src')).toBe('https://example.com/project.png');
    expect(image.attributes('alt')).toBe('Portfolio AI Platform image');
    expect(image.attributes('draggable')).toBe('false');
  });

  it('does not render an image when imagePreview is missing', () => {
    const wrapper = mountProject({
      project: {
        imagePreview: '',
      },
    });

    expect(wrapper.find('.project-preview img').exists()).toBe(false);
  });

  it('uses fallback alt text when project title is missing', () => {
    const wrapper = mountProject({
      project: {
        title: '',
      },
    });

    expect(wrapper.find('.project-preview img').attributes('alt')).toBe(
      'Project image'
    );
  });

  it('renders only the first three technologies and the remaining count', () => {
    const wrapper = mountProject();

    expect(wrapper.text()).toContain('Vue.js');
    expect(wrapper.text()).toContain('Express.js');
    expect(wrapper.text()).toContain('PostgreSQL');
    expect(wrapper.text()).toContain('+1');
    expect(wrapper.text()).not.toContain('Docker');
  });

  it('does not render technologies section when technologies are empty', () => {
    const wrapper = mountProject({
      project: {
        technologies: [],
      },
    });

    expect(wrapper.text()).not.toContain('Vue.js');
    expect(wrapper.text()).not.toContain('Express.js');
    expect(wrapper.text()).not.toContain('PostgreSQL');
  });

  it('renders only the first two domains and the remaining count', () => {
    const wrapper = mountProject();

    expect(wrapper.text()).toContain('Web Development');
    expect(wrapper.text()).toContain('Artificial Intelligence');
    expect(wrapper.text()).toContain('+1');
    expect(wrapper.text()).not.toContain('Cloud');
  });

  it('does not render domains section when domains are empty', () => {
    const wrapper = mountProject({
      project: {
        domains: [],
      },
    });

    expect(wrapper.text()).not.toContain('Web Development');
    expect(wrapper.text()).not.toContain('Artificial Intelligence');
  });

  it('renders ExploreButton with project type and id', () => {
    const wrapper = mountProject();

    const exploreButton = wrapper.find('[data-test="explore-button"]');

    expect(exploreButton.exists()).toBe(true);
    expect(exploreButton.attributes('data-type')).toBe('project');
    expect(exploreButton.attributes('data-id')).toBe('7');
  });

  it('renders validation badge for validated academic project', () => {
    const wrapper = mountProject();

    const badge = wrapper.find('.project-validation-badge');

    expect(badge.exists()).toBe(true);
    expect(badge.classes()).toContain('project-validation-badge--valide');
    expect(badge.attributes('title')).toBe('Academic experience validated');
    expect(wrapper.find('[data-test="badge-check-icon"]').exists()).toBe(true);
  });

  it('renders pending validation badge', () => {
    const wrapper = mountProject({
      project: {
        validationStatus: 'en_attente',
      },
    });

    const badge = wrapper.find('.project-validation-badge');

    expect(badge.classes()).toContain('project-validation-badge--en_attente');
    expect(badge.attributes('title')).toBe(
      'Academic experience pending validation'
    );
    expect(wrapper.find('[data-test="clock-icon"]').exists()).toBe(true);
  });

  it('renders rejected validation badge', () => {
    const wrapper = mountProject({
      project: {
        validationStatus: 'refuse',
      },
    });

    const badge = wrapper.find('.project-validation-badge');

    expect(badge.classes()).toContain('project-validation-badge--refuse');
    expect(badge.attributes('title')).toBe('Academic experience rejected');
    expect(wrapper.find('[data-test="x-circle-icon"]').exists()).toBe(true);
  });

  it('does not render validation badge when project is not academic', () => {
    const wrapper = mountProject({
      project: {
        isAcademic: false,
        validationStatus: 'valide',
      },
    });

    expect(wrapper.find('.project-validation-badge').exists()).toBe(false);
  });

  it('adds highlighted class and match badge when project is highlighted and visible', () => {
    const wrapper = mountProject();

    expect(wrapper.find('.project-card').classes()).toContain(
      'project-card--highlighted'
    );
    expect(wrapper.find('.project-match-badge').exists()).toBe(true);
    expect(wrapper.text()).toContain('92% match');
    expect(wrapper.find('[data-test="sparkles-icon"]').exists()).toBe(true);
  });

  it('shows fallback Match text when highlighted project has no score', () => {
    const wrapper = mountProject({
      project: {
        score: null,
      },
    });

    expect(wrapper.find('.project-match-badge').exists()).toBe(true);
    expect(wrapper.text()).toContain('Match');
  });

  it('does not highlight when project is highlighted but not visible', () => {
    const wrapper = mountProject({
      project: {
        highlighted: true,
        effectiveVisibleToEveryone: false,
      },
    });

    expect(wrapper.find('.project-card').classes()).not.toContain(
      'project-card--highlighted'
    );
    expect(wrapper.find('.project-match-badge').exists()).toBe(false);
  });

  it('adds hidden class when project is not visible to everyone', () => {
    const wrapper = mountProject({
      project: {
        effectiveVisibleToEveryone: false,
      },
    });

    expect(wrapper.find('.project-card').classes()).toContain(
      'project-card--hidden'
    );
  });

  it('shows visibility icon only when canEdit is true', () => {
    const wrapper = mountProject({
      canEdit: true,
      project: {
        effectiveVisibleToEveryone: true,
      },
    });

    expect(wrapper.find('.project-visibility').exists()).toBe(true);
    expect(wrapper.find('[data-test="eye-icon"]').exists()).toBe(true);
  });

  it('shows EyeOff icon when editable project is hidden', () => {
    const wrapper = mountProject({
      canEdit: true,
      project: {
        effectiveVisibleToEveryone: false,
      },
    });

    expect(wrapper.find('.project-visibility').exists()).toBe(true);
    expect(wrapper.find('[data-test="eye-off-icon"]').exists()).toBe(true);
  });

  it('does not show visibility icon when canEdit is false', () => {
    const wrapper = mountProject({
      canEdit: false,
    });

    expect(wrapper.find('.project-visibility').exists()).toBe(false);
  });

  it('shows edit hint when project can be edited', () => {
    const wrapper = mountProject({
      canEdit: true,
      project: {
        validationStatus: 'valide',
      },
    });

    expect(wrapper.find('.project-card').classes()).toContain(
      'project-card--editable'
    );
    expect(wrapper.text()).toContain('Double-click to edit');
  });

  it('does not show edit hint when canEdit is false', () => {
    const wrapper = mountProject({
      canEdit: false,
    });

    expect(wrapper.find('.project-card').classes()).not.toContain(
      'project-card--editable'
    );
    expect(wrapper.text()).not.toContain('Double-click to edit');
  });

  it('does not allow edit when validationStatus is refuse', () => {
    const wrapper = mountProject({
      canEdit: true,
      project: {
        validationStatus: 'refuse',
      },
    });

    expect(wrapper.find('.project-card').classes()).not.toContain(
      'project-card--editable'
    );
    expect(wrapper.text()).not.toContain('Double-click to edit');
  });

  it('emits edit when double clicking an editable project', async () => {
    const wrapper = mountProject({
      canEdit: true,
      project: {
        validationStatus: 'valide',
      },
    });

    await wrapper.find('.project-card').trigger('dblclick');

    expect(wrapper.emitted('edit')).toBeTruthy();
    expect(wrapper.emitted('edit')).toHaveLength(1);
    expect(wrapper.emitted('edit')[0]).toEqual([
      {
        ...project,
        validationStatus: 'valide',
      },
    ]);
  });

  it('does not emit edit when double clicking a non editable project', async () => {
    const wrapper = mountProject({
      canEdit: false,
    });

    await wrapper.find('.project-card').trigger('dblclick');

    expect(wrapper.emitted('edit')).toBeFalsy();
  });

  it('does not emit edit when double clicking a rejected project', async () => {
    const wrapper = mountProject({
      canEdit: true,
      project: {
        validationStatus: 'refuse',
      },
    });

    await wrapper.find('.project-card').trigger('dblclick');

    expect(wrapper.emitted('edit')).toBeFalsy();
  });

  it('emits edit through the double tap handler when editable', async () => {
    const wrapper = mountProject({
      canEdit: true,
      project: {
        validationStatus: 'valide',
      },
    });

    await wrapper.find('.project-card').trigger('click');

    expect(wrapper.emitted('edit')).toBeTruthy();
    expect(wrapper.emitted('edit')[0]).toEqual([
      {
        ...project,
        validationStatus: 'valide',
      },
    ]);
  });

  it('does not emit edit through the double tap handler when rejected', async () => {
    const wrapper = mountProject({
      canEdit: true,
      project: {
        validationStatus: 'refuse',
      },
    });

    await wrapper.find('.project-card').trigger('click');

    expect(wrapper.emitted('edit')).toBeFalsy();
  });
});