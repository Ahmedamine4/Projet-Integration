

import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginView from '@/views/auth/LoginView.vue';
import { useAuthStore } from '@/stores/auth';
import { authStubs, buttonByText } from '@/test/authStubs';

const mocked = vi.hoisted(() => ({
  authStore: {
    isAuthenticated: false,
    login: vi.fn(),
    startGoogleAuth: vi.fn(),
  },
}));

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mocked.authStore,
}));

const DummyView = {
  template: '<div>Protected page</div>',
};

const createTestRouter = () => {
  const routes = [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { layout: 'auth' },
    },
    {
      path: '/getting-started',
      name: 'getting-started',
      component: DummyView,
      meta: {
        requiresAuth: true,
        layout: 'app',
      },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DummyView,
      meta: {
        requiresAuth: true,
        layout: 'app',
      },
    },
    {
      path: '/portfolio',
      name: 'portfolio',
      component: DummyView,
      meta: {
        requiresAuth: true,
        layout: 'app',
      },
    },
  ];

  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  });

  router.beforeEach((to) => {
    const authStore = useAuthStore();

    const requiresAuth = to.matched.some((record) => {
      return record.meta.requiresAuth;
    });

    if (requiresAuth && !authStore.isAuthenticated) {
      return {
        name: 'login',
        query: { redirect: to.fullPath },
      };
    }

    return true;
  });

  return router;
};

const mountLoginViewWithRouter = async (initialPath = '/login') => {
  const router = createTestRouter();

  await router.push(initialPath);
  await router.isReady();

  const wrapper = mount(LoginView, {
    global: {
      plugins: [router],
      stubs: authStubs,
    },
  });

  return { wrapper, router };
};

const fillLoginForm = async (wrapper, email, password) => {
  await wrapper.find('input[placeholder="name@company.com"]').setValue(email);
  await wrapper.find('input[placeholder="Enter your password"]').setValue(password);
};

describe('LoginView - integration tests with router', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocked.authStore.isAuthenticated = false;
    mocked.authStore.login.mockReset();
    mocked.authStore.startGoogleAuth.mockReset();

    sessionStorage.clear();
  });

  it('redirects unauthenticated user from protected route to login with redirect query', async () => {
    const router = createTestRouter();

    await router.push('/portfolio?tab=projects');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('login');
    expect(router.currentRoute.value.query.redirect).toBe('/portfolio?tab=projects');
  });

  it('allows authenticated user to access protected route', async () => {
    mocked.authStore.isAuthenticated = true;

    const router = createTestRouter();

    await router.push('/portfolio');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('portfolio');
  });

  it('logs in and redirects to /getting-started by default', async () => {
    mocked.authStore.login.mockImplementation(async () => {
      mocked.authStore.isAuthenticated = true;
    });

    const { wrapper, router } = await mountLoginViewWithRouter('/login');

    await fillLoginForm(wrapper, 'student@test.com', 'password123');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mocked.authStore.login).toHaveBeenCalledWith('student@test.com', 'password123');
    expect(router.currentRoute.value.name).toBe('getting-started');
  });

  it('logs in and redirects to the protected route from redirect query', async () => {
    mocked.authStore.login.mockImplementation(async () => {
      mocked.authStore.isAuthenticated = true;
    });

    const { wrapper, router } = await mountLoginViewWithRouter('/login?redirect=/portfolio');

    await fillLoginForm(wrapper, 'student@test.com', 'password123');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mocked.authStore.login).toHaveBeenCalledWith('student@test.com', 'password123');
    expect(router.currentRoute.value.name).toBe('portfolio');
  });

  it('stays on login page and shows error when credentials are invalid', async () => {
    mocked.authStore.login.mockRejectedValue({
      response: {
        data: {
          error: 'Invalid credentials',
        },
      },
    });

    const { wrapper, router } = await mountLoginViewWithRouter('/login?redirect=/portfolio');

    await fillLoginForm(wrapper, 'student@test.com', 'wrong-password');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(router.currentRoute.value.name).toBe('login');
    expect(wrapper.text()).toContain('Invalid credentials');
  });

  it('stores the protected redirect before starting Google authentication', async () => {
    mocked.authStore.startGoogleAuth.mockResolvedValue();

    const { wrapper } = await mountLoginViewWithRouter('/login?redirect=/dashboard');

    await buttonByText(wrapper, 'Continue with Google').trigger('click');
    await flushPromises();

    expect(sessionStorage.getItem('auth_redirect')).toBe('/dashboard');
    expect(mocked.authStore.startGoogleAuth).toHaveBeenCalledTimes(1);
  });
});