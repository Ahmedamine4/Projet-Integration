import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterView from '@/views/auth/RegisterView.vue';
import { authStubs, buttonByText } from '@/test/authStubs';

const mocked = vi.hoisted(() => ({
  authStore: {
    isAuthenticated: false,
    register: vi.fn(),
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
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { layout: 'auth' },
    },
    {
      path: '/login',
      name: 'login',
      component: DummyView,
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
  ];

  return createRouter({
    history: createMemoryHistory(),
    routes,
  });
};

const mountRegisterViewWithRouter = async () => {
  const router = createTestRouter();

  await router.push('/register');
  await router.isReady();

  const wrapper = mount(RegisterView, {
    global: {
      plugins: [router],
      stubs: authStubs,
    },
  });

  return { wrapper, router };
};

const fillRegisterForm = async (
  wrapper,
  {
    firstName = 'Nour',
    lastName = 'Bakkali',
    email = 'student@test.com',
    password = 'Password@123',
    confirm = 'Password@123',
  } = {}
) => {
  await wrapper.find('input[placeholder="First name"]').setValue(firstName);
  await wrapper.find('input[placeholder="Last name"]').setValue(lastName);
  await wrapper.find('input[placeholder="email"]').setValue(email);
  await wrapper.find('input[placeholder="password"]').setValue(password);
  await wrapper.find('input[placeholder="confirm password"]').setValue(confirm);
};

describe('RegisterView - integration tests with router', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocked.authStore.isAuthenticated = false;
    mocked.authStore.register.mockReset();
    mocked.authStore.startGoogleAuth.mockReset();
  });

  it('registers a new user and redirects to /getting-started', async () => {
    mocked.authStore.register.mockImplementation(async () => {
      mocked.authStore.isAuthenticated = true;
    });

    const { wrapper, router } = await mountRegisterViewWithRouter();

    await fillRegisterForm(wrapper);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mocked.authStore.register).toHaveBeenCalledWith({
      firstName: 'Nour',
      lastName: 'Bakkali',
      email: 'student@test.com',
      password: 'Password@123',
    });

    expect(router.currentRoute.value.path).toBe('/getting-started');
  });

  it('stays on register page when frontend validation fails', async () => {
    const { wrapper, router } = await mountRegisterViewWithRouter();

    await fillRegisterForm(wrapper, {
      email: 'bad-email',
    });

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('Invalid email address');
    expect(mocked.authStore.register).not.toHaveBeenCalled();
    expect(router.currentRoute.value.path).toBe('/register');
  });

  it('stays on register page and shows backend error when registration fails', async () => {
    mocked.authStore.register.mockRejectedValue({
      response: {
        data: {
          error: 'Email already exists',
        },
      },
    });

    const { wrapper, router } = await mountRegisterViewWithRouter();

    await fillRegisterForm(wrapper);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('Email already exists');
    expect(router.currentRoute.value.path).toBe('/register');
  });

  it('starts Google authentication from register page', async () => {
    mocked.authStore.startGoogleAuth.mockResolvedValue();

    const { wrapper } = await mountRegisterViewWithRouter();

    await buttonByText(wrapper, 'Continue with Google').trigger('click');
    await flushPromises();

    expect(mocked.authStore.startGoogleAuth).toHaveBeenCalledTimes(1);
  });
});