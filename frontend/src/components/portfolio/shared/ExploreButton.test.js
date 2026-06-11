import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ExploreButton from './ExploreButton.vue';

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
}));

const routeMock = vi.hoisted(() => ({
  params: {},
}));

vi.mock('vue-router', () => ({
  useRouter: () => routerMock,
  useRoute: () => routeMock,
}));

vi.mock('lucide-vue-next', () => ({
  ArrowUpRight: {
    name: 'ArrowUpRight',
    props: ['size'],
    template: '<svg data-test="arrow-up-right-icon" />',
  },
}));

function mountButton(props = {}) {
  return mount(ExploreButton, {
    props: {
      experienceType: 'project',
      experienceId: 12,
      ...props,
    },
  });
}

describe('ExploreButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routeMock.params = {};
  });

  it('renders the default label using the experience type', () => {
    const wrapper = mountButton({
      experienceType: 'project',
    });

    expect(wrapper.text()).toContain('Explore project');
  });

  it('renders a custom label when provided', () => {
    const wrapper = mountButton({
      label: 'View details',
    });

    expect(wrapper.text()).toContain('View details');
  });

  it('renders the arrow icon', () => {
    const wrapper = mountButton();

    expect(wrapper.find('[data-test="arrow-up-right-icon"]').exists()).toBe(true);
  });

  it('navigates to my portfolio experience route when there is no route id', async () => {
    routeMock.params = {};

    const wrapper = mountButton({
      experienceId: 12,
    });

    await wrapper.find('.explore-button').trigger('click');

    expect(routerMock.push).toHaveBeenCalledTimes(1);
    expect(routerMock.push).toHaveBeenCalledWith({
      name: 'my-portfolio-experience',
      params: {
        experienceId: 12,
      },
    });
  });

  it('navigates to public portfolio experience route when route id exists', async () => {
    routeMock.params = {
      id: 'student-123',
    };

    const wrapper = mountButton({
      experienceId: 45,
    });

    await wrapper.find('.explore-button').trigger('click');

    expect(routerMock.push).toHaveBeenCalledTimes(1);
    expect(routerMock.push).toHaveBeenCalledWith({
      name: 'portfolio-experience',
      params: {
        id: 'student-123',
        experienceId: 45,
      },
    });
  });

  it('keeps string experienceId when provided as string', async () => {
    routeMock.params = {};

    const wrapper = mountButton({
      experienceId: 'project-99',
    });

    await wrapper.find('.explore-button').trigger('click');

    expect(routerMock.push).toHaveBeenCalledWith({
      name: 'my-portfolio-experience',
      params: {
        experienceId: 'project-99',
      },
    });
  });

  it('uses the correct button type', () => {
    const wrapper = mountButton();

    expect(wrapper.find('.explore-button').attributes('type')).toBe('button');
  });
});