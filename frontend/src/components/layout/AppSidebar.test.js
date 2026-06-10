import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AppSidebar from './AppSidebar.vue';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  logout: vi.fn(),
  route: {
    path: '/dashboard',
  },
}));

vi.mock('@/assets/icons/FolioCraft.svg', () => ({
  default: 'folio-logo.svg',
}));

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    logout: mocks.logout,
  }),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mocks.push,
    replace: mocks.replace,
  }),
  useRoute: () => mocks.route,
}));

vi.mock('lucide-vue-next', () => ({
  LayoutDashboard: {
    name: 'LayoutDashboard',
    template: '<svg data-test="dashboard-icon" />',
  },
  PanelLeftOpen: {
    name: 'PanelLeftOpen',
    template: '<svg data-test="panel-open-icon" />',
  },
  PanelLeftClose: {
    name: 'PanelLeftClose',
    template: '<svg data-test="panel-close-icon" />',
  },
  Menu: {
    name: 'Menu',
    props: ['size'],
    template: '<svg data-test="menu-icon" />',
  },
  Compass: {
    name: 'Compass',
    template: '<svg data-test="compass-icon" />',
  },
  UserRound: {
    name: 'UserRound',
    template: '<svg data-test="user-icon" />',
  },
  FolderOpen: {
    name: 'FolderOpen',
    template: '<svg data-test="folder-icon" />',
  },
  Bell: {
    name: 'Bell',
    template: '<svg data-test="bell-icon" />',
  },
  Settings: {
    name: 'Settings',
    template: '<svg data-test="settings-icon" />',
  },
  LogOut: {
    name: 'LogOut',
    template: '<svg data-test="logout-icon" />',
  },
}));

function mountSidebar(props = {}) {
  return mount(AppSidebar, {
    props: {
      user: {
        firstName: 'Nour',
      },
      loading: false,
      ...props,
    },
  });
}

function findNavButton(wrapper, label) {
  return wrapper
    .findAll('.sidebar__item')
    .find((button) => button.text().includes(label));
}

describe('AppSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.route.path = '/dashboard';
    mocks.logout.mockResolvedValue(undefined);
  });

  it('renders the sidebar navigation items', () => {
    const wrapper = mountSidebar();

    expect(wrapper.find('.sidebar-space').exists()).toBe(true);
    expect(wrapper.text()).toContain('Dashboard');
    expect(wrapper.text()).toContain('Getting started');
    expect(wrapper.text()).toContain('Profile');
    expect(wrapper.text()).toContain('Portfolio');
    expect(wrapper.text()).toContain('Settings');
    expect(wrapper.text()).toContain('Log out');

    expect(wrapper.find('[data-test="dashboard-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="compass-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="folder-icon"]').exists()).toBe(true);
  });

  it('is collapsed by default', () => {
    const wrapper = mountSidebar();

    expect(wrapper.find('.sidebar-space').classes()).toContain('collapsed');
    expect(wrapper.find('[data-test="panel-open-icon"]').exists()).toBe(true);
  });

  it('toggles collapsed state when clicking the sidebar toggle', async () => {
    const wrapper = mountSidebar();

    const toggle = wrapper.find('.sidebar__toggle');

    await toggle.trigger('click');

    expect(wrapper.find('.sidebar-space').classes()).not.toContain('collapsed');
    expect(wrapper.find('[data-test="panel-close-icon"]').exists()).toBe(true);

    await toggle.trigger('click');

    expect(wrapper.find('.sidebar-space').classes()).toContain('collapsed');
    expect(wrapper.find('[data-test="panel-open-icon"]').exists()).toBe(true);
  });

  it('opens the sidebar when clicking the mobile toggle', async () => {
    const wrapper = mountSidebar();

    expect(wrapper.find('.sidebar-space').classes()).toContain('collapsed');

    await wrapper.find('.mobile-toggle').trigger('click');

    expect(wrapper.find('.sidebar-space').classes()).not.toContain('collapsed');
  });

  it('closes the sidebar when clicking the overlay', async () => {
    const wrapper = mountSidebar();

    await wrapper.find('.mobile-toggle').trigger('click');

    expect(wrapper.find('.sidebar-space').classes()).not.toContain('collapsed');

    await wrapper.find('.sidebar-overlay').trigger('click');

    expect(wrapper.find('.sidebar-space').classes()).toContain('collapsed');
  });

  it('marks Dashboard as selected when current route is /dashboard', () => {
    mocks.route.path = '/dashboard';

    const wrapper = mountSidebar();

    const dashboardButton = findNavButton(wrapper, 'Dashboard');
    const portfolioButton = findNavButton(wrapper, 'Portfolio');

    expect(dashboardButton.classes()).toContain('selected');
    expect(portfolioButton.classes()).not.toContain('selected');
  });

  it('marks Portfolio as selected for nested portfolio route', () => {
    mocks.route.path = '/portfolio/experience/123';

    const wrapper = mountSidebar();

    const portfolioButton = findNavButton(wrapper, 'Portfolio');

    expect(portfolioButton.classes()).toContain('selected');
  });

  it('updates the thumb active index according to the active route', () => {
    mocks.route.path = '/settings';

    const wrapper = mountSidebar();

    expect(wrapper.find('.sidebar__thumb').attributes('style')).toContain(
      '--active-index: 4'
    );
  });

  it('navigates when clicking an item with a path', async () => {
    const wrapper = mountSidebar();

    await findNavButton(wrapper, 'Settings').trigger('click');

    expect(mocks.push).toHaveBeenCalledWith('/settings');
  });

  it('does not navigate when clicking Profile because it has no path', async () => {
    const wrapper = mountSidebar();

    await findNavButton(wrapper, 'Profile').trigger('click');

    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('renders user information when not loading', () => {
    const wrapper = mountSidebar({
      user: {
        firstName: 'Nour',
      },
    });

    expect(wrapper.find('.sidebar__account--loading').exists()).toBe(false);
    expect(wrapper.find('.sidebar__avatar').text()).toBe('N');
    expect(wrapper.find('.sidebar__user').text()).toBe('Nour');
    expect(wrapper.find('[data-test="bell-icon"]').exists()).toBe(true);
  });

  it('renders fallback user information when user is null', () => {
    const wrapper = mountSidebar({
      user: null,
    });

    expect(wrapper.find('.sidebar__avatar').text()).toBe('U');
    expect(wrapper.find('.sidebar__user').text()).toBe('User');
  });

  it('renders loading skeleton when loading is true', () => {
    const wrapper = mountSidebar({
      loading: true,
    });

    expect(wrapper.find('.sidebar-space').classes()).toContain('is-loading');
    expect(wrapper.find('.sidebar__account--loading').exists()).toBe(true);
    expect(wrapper.findAll('.sidebar-skeleton').length).toBeGreaterThan(0);
    expect(wrapper.text()).not.toContain('Nour');
  });

  it('calls logout and redirects to login when clicking Log out', async () => {
    const wrapper = mountSidebar();

    await findNavButton(wrapper, 'Log out').trigger('click');

    expect(mocks.logout).toHaveBeenCalledTimes(1);
    expect(mocks.replace).toHaveBeenCalledWith('/login');
  });

  it('renders the logo image', () => {
    const wrapper = mountSidebar();

    const logo = wrapper.find('.brand img');

    expect(logo.exists()).toBe(true);
    expect(logo.attributes('src')).toBe('folio-logo.svg');
    expect(logo.attributes('draggable')).toBe('false');
  });
});