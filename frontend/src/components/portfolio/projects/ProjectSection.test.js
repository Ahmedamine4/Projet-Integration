import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import PortfolioProjectsSection from './ProjectsSection.vue';

const dragMocks = vi.hoisted(() => ({
  handlePointerDown: vi.fn(),
  handlePointerMove: vi.fn(),
  handlePointerUp: vi.fn(),
}));

vi.mock('@/composables/useHorizontalDragScroll', () => ({
  useHorizontalDragScroll: vi.fn(() => ({
    handlePointerDown: dragMocks.handlePointerDown,
    handlePointerMove: dragMocks.handlePointerMove,
    handlePointerUp: dragMocks.handlePointerUp,
  })),
}));

const PortfolioSectionShellStub = defineComponent({
  name: 'PortfolioSectionShell',
  props: {
    title: {
      type: String,
      default: '',
    },
    addLabel: {
      type: String,
      default: '',
    },
    canAdd: {
      type: Boolean,
      default: false,
    },
    isEmpty: {
      type: Boolean,
      default: false,
    },
    emptyLabel: {
      type: String,
      default: '',
    },
  },
  emits: ['add'],
  template: `
    <section
      data-test="section-shell"
      :data-title="title"
      :data-add-label="addLabel"
      :data-can-add="String(canAdd)"
      :data-is-empty="String(isEmpty)"
      :data-empty-label="emptyLabel"
    >
      <button
        v-if="canAdd"
        type="button"
        data-test="add-button"
        @click="$emit('add')"
      >
        {{ addLabel }}
      </button>

      <p
        v-if="isEmpty"
        data-test="empty-label"
      >
        {{ emptyLabel }}
      </p>

      <slot />
    </section>
  `,
});

const PortfolioProjectStub = defineComponent({
  name: 'PortfolioProject',
  props: {
    project: {
      type: Object,
      required: true,
    },
    canEdit: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['edit'],
  template: `
    <article
      data-test="portfolio-project"
      :data-id="project.id"
      :data-title="project.title"
      :data-can-edit="String(canEdit)"
      @click="$emit('edit', project)"
    >
      {{ project.title }}
    </article>
  `,
});

const projects = [
  {
    id: 1,
    title: 'Portfolio AI Platform',
  },
  {
    id: 2,
    title: 'GitHub Sync Tool',
  },
];

function mountSection(props = {}) {
  return mount(PortfolioProjectsSection, {
    props: {
      projects,
      canAdd: false,
      ...props,
    },
    global: {
      stubs: {
        PortfolioSectionShell: PortfolioSectionShellStub,
        PortfolioProject: PortfolioProjectStub,
      },
    },
  });
}

describe('PortfolioProjectsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the section shell with correct props', () => {
    const wrapper = mountSection({
      canAdd: true,
    });

    const shell = wrapper.find('[data-test="section-shell"]');

    expect(shell.exists()).toBe(true);
    expect(shell.attributes('data-title')).toBe('Projects');
    expect(shell.attributes('data-add-label')).toBe('Add Project');
    expect(shell.attributes('data-can-add')).toBe('true');
    expect(shell.attributes('data-is-empty')).toBe('false');
    expect(shell.attributes('data-empty-label')).toBe('No projects yet');
  });

  it('shows empty state when projects list is empty', () => {
    const wrapper = mountSection({
      projects: [],
    });

    expect(wrapper.find('[data-test="section-shell"]').attributes('data-is-empty')).toBe(
      'true'
    );
    expect(wrapper.find('[data-test="empty-label"]').text()).toBe('No projects yet');
    expect(wrapper.findAll('[data-test="portfolio-project"]')).toHaveLength(0);
  });

  it('renders all projects', () => {
    const wrapper = mountSection();

    const renderedProjects = wrapper.findAll('[data-test="portfolio-project"]');

    expect(renderedProjects).toHaveLength(2);
    expect(renderedProjects[0].text()).toContain('Portfolio AI Platform');
    expect(renderedProjects[1].text()).toContain('GitHub Sync Tool');
  });

  it('passes canEdit false to PortfolioProject when canAdd is false', () => {
    const wrapper = mountSection({
      canAdd: false,
    });

    const renderedProjects = wrapper.findAll('[data-test="portfolio-project"]');

    expect(renderedProjects[0].attributes('data-can-edit')).toBe('false');
    expect(renderedProjects[1].attributes('data-can-edit')).toBe('false');
  });

  it('passes canEdit true to PortfolioProject when canAdd is true', () => {
    const wrapper = mountSection({
      canAdd: true,
    });

    const renderedProjects = wrapper.findAll('[data-test="portfolio-project"]');

    expect(renderedProjects[0].attributes('data-can-edit')).toBe('true');
    expect(renderedProjects[1].attributes('data-can-edit')).toBe('true');
  });

  it('emits add-project when shell emits add', async () => {
    const wrapper = mountSection({
      canAdd: true,
    });

    await wrapper.find('[data-test="add-button"]').trigger('click');

    expect(wrapper.emitted('add-project')).toBeTruthy();
    expect(wrapper.emitted('add-project')).toHaveLength(1);
  });

  it('emits edit-project when a project emits edit', async () => {
    const wrapper = mountSection({
      canAdd: true,
    });

    await wrapper.findAll('[data-test="portfolio-project"]')[0].trigger('click');

    expect(wrapper.emitted('edit-project')).toBeTruthy();
    expect(wrapper.emitted('edit-project')).toHaveLength(1);
    expect(wrapper.emitted('edit-project')[0]).toEqual([projects[0]]);
  });

  it('calls drag handlers on pointer events', async () => {
    const wrapper = mountSection();

    const scroller = wrapper.find('.projects');

    await scroller.trigger('pointerdown');
    await scroller.trigger('pointermove');
    await scroller.trigger('pointerup');
    await scroller.trigger('pointercancel');
    await scroller.trigger('pointerleave');

    expect(dragMocks.handlePointerDown).toHaveBeenCalledTimes(1);
    expect(dragMocks.handlePointerMove).toHaveBeenCalledTimes(1);
    expect(dragMocks.handlePointerUp).toHaveBeenCalledTimes(3);
  });

  it('adds right fade when content can scroll to the right', async () => {
    const wrapper = mountSection();

    const scroller = wrapper.find('.projects').element;

    Object.defineProperty(scroller, 'scrollWidth', {
      value: 1000,
      configurable: true,
    });

    Object.defineProperty(scroller, 'clientWidth', {
      value: 400,
      configurable: true,
    });

    Object.defineProperty(scroller, 'scrollLeft', {
      value: 0,
      writable: true,
      configurable: true,
    });

    await wrapper.find('.projects').trigger('scroll');

    expect(wrapper.find('.projects-scroll-frame').classes()).not.toContain(
      'has-left-fade'
    );
    expect(wrapper.find('.projects-scroll-frame').classes()).toContain(
      'has-right-fade'
    );
  });

  it('adds left fade and right fade when scrolled in the middle', async () => {
    const wrapper = mountSection();

    const scroller = wrapper.find('.projects').element;

    Object.defineProperty(scroller, 'scrollWidth', {
      value: 1000,
      configurable: true,
    });

    Object.defineProperty(scroller, 'clientWidth', {
      value: 400,
      configurable: true,
    });

    Object.defineProperty(scroller, 'scrollLeft', {
      value: 250,
      writable: true,
      configurable: true,
    });

    await wrapper.find('.projects').trigger('scroll');

    expect(wrapper.find('.projects-scroll-frame').classes()).toContain(
      'has-left-fade'
    );
    expect(wrapper.find('.projects-scroll-frame').classes()).toContain(
      'has-right-fade'
    );
  });

  it('adds only left fade when scrolled to the end', async () => {
    const wrapper = mountSection();

    const scroller = wrapper.find('.projects').element;

    Object.defineProperty(scroller, 'scrollWidth', {
      value: 1000,
      configurable: true,
    });

    Object.defineProperty(scroller, 'clientWidth', {
      value: 400,
      configurable: true,
    });

    Object.defineProperty(scroller, 'scrollLeft', {
      value: 600,
      writable: true,
      configurable: true,
    });

    await wrapper.find('.projects').trigger('scroll');

    expect(wrapper.find('.projects-scroll-frame').classes()).toContain(
      'has-left-fade'
    );
    expect(wrapper.find('.projects-scroll-frame').classes()).not.toContain(
      'has-right-fade'
    );
  });
});