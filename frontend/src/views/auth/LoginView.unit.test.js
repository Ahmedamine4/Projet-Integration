

import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginView from '@/views/auth/LoginView.vue';
import { authStubs, buttonByText } from '@/test/authStubs';

const mocked = vi.hoisted(() => ({
  authStore: {
    isAuthenticated: false,
    login: vi.fn(),
    startGoogleAuth: vi.fn(),
  },
  routerPush: vi.fn(),
  route: {
    query: {},
  },
}));

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mocked.authStore,
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mocked.routerPush,
  }),
  useRoute: () => mocked.route,
}));

const mountLoginView = () => {
  return mount(LoginView, {
    global: {
      stubs: authStubs,
    },
  });
};

const fillLoginForm = async (wrapper, email, password) => {
  await wrapper.find('input[placeholder="name@company.com"]').setValue(email);
  await wrapper.find('input[placeholder="Enter your password"]').setValue(password);
};

describe('LoginView - unit tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocked.authStore.isAuthenticated = false;
    mocked.authStore.login.mockReset();
    mocked.authStore.startGoogleAuth.mockReset();
    mocked.routerPush.mockReset();
    mocked.route.query = {};

    sessionStorage.clear();
  });

  it('renders the login form correctly', () => {
    const wrapper = mountLoginView();

    expect(wrapper.text()).toContain('Welcome back');
    //expect(wrapper.text()).toContain('SIGN IN TO YOUR ACCOUNT TO CONTINUE');
    expect(wrapper.text()).toContain('Email address');
    expect(wrapper.text()).toContain('Password');
    expect(wrapper.text()).toContain('Sign In');
    expect(wrapper.text()).toContain('Continue with Google');
    expect(wrapper.text()).toContain("Don't have an account?");
    expect(wrapper.text()).toContain('Register now');
  });

  it('disables the sign in button when email or password is empty', async () => {
    const wrapper = mountLoginView();

    const signInButton = buttonByText(wrapper, 'Sign In');

    expect(signInButton.attributes('disabled')).toBeDefined();

    await wrapper.find('input[placeholder="name@company.com"]').setValue('student@test.com');

    expect(buttonByText(wrapper, 'Sign In').attributes('disabled')).toBeDefined();
  });

  it('shows a field error when email format is invalid', async () => {
    const wrapper = mountLoginView();

    await fillLoginForm(wrapper, 'bad-email', 'password123');
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain('Invalid email address');
    expect(mocked.authStore.login).not.toHaveBeenCalled();
    expect(mocked.routerPush).not.toHaveBeenCalled();
  });

  it('calls authStore.login with trimmed email and password', async () => {
    mocked.authStore.login.mockResolvedValue();

    const wrapper = mountLoginView();

    await fillLoginForm(wrapper, '  student@test.com  ', 'password123');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mocked.authStore.login).toHaveBeenCalledTimes(1);
    expect(mocked.authStore.login).toHaveBeenCalledWith('student@test.com', 'password123');
  });

  it('redirects to /getting-started after successful login when there is no redirect query', async () => {
    mocked.authStore.login.mockResolvedValue();

    const wrapper = mountLoginView();

    await fillLoginForm(wrapper, 'student@test.com', 'password123');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mocked.routerPush).toHaveBeenCalledWith('/getting-started');
  });

  it('redirects to the route query redirect after successful login', async () => {
    mocked.route.query = {
      redirect: '/portfolio',
    };

    mocked.authStore.login.mockResolvedValue();

    const wrapper = mountLoginView();

    await fillLoginForm(wrapper, 'student@test.com', 'password123');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mocked.routerPush).toHaveBeenCalledWith('/portfolio');
  });

  it('does not redirect to an unsafe external URL', async () => {
    mocked.route.query = {
      redirect: 'https://evil-site.com',
    };

    mocked.authStore.login.mockResolvedValue();

    const wrapper = mountLoginView();

    await fillLoginForm(wrapper, 'student@test.com', 'password123');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mocked.routerPush).toHaveBeenCalledWith('/getting-started');
  });

  it('shows backend error message when login fails with response error', async () => {
    mocked.authStore.login.mockRejectedValue({
      response: {
        data: {
          error: 'Invalid credentials',
        },
      },
    });

    const wrapper = mountLoginView();

    await fillLoginForm(wrapper, 'student@test.com', 'wrong-password');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('Invalid credentials');
    expect(mocked.routerPush).not.toHaveBeenCalled();
  });

  it('shows fallback backend error when response has no error message', async () => {
    mocked.authStore.login.mockRejectedValue({
      response: {
        data: {},
      },
    });

    const wrapper = mountLoginView();

    await fillLoginForm(wrapper, 'student@test.com', 'wrong-password');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('Something went wrong');
    expect(mocked.routerPush).not.toHaveBeenCalled();
  });

  it('shows network error when login fails without response', async () => {
    mocked.authStore.login.mockRejectedValue(new Error('Network failed'));

    const wrapper = mountLoginView();

    await fillLoginForm(wrapper, 'student@test.com', 'password123');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('Network error. Please try again.');
    expect(mocked.routerPush).not.toHaveBeenCalled();
  });

  it('disables both login and Google buttons while login is loading', async () => {
    let resolveLogin;

    mocked.authStore.login.mockImplementation(() => {
      return new Promise((resolve) => {
        resolveLogin = resolve;
      });
    });

    const wrapper = mountLoginView();

    await fillLoginForm(wrapper, 'student@test.com', 'password123');
    await wrapper.find('form').trigger('submit.prevent');

    expect(buttonByText(wrapper, 'Sign In').attributes('disabled')).toBeDefined();
    expect(buttonByText(wrapper, 'Continue with Google').attributes('disabled')).toBeDefined();

    resolveLogin();
    await flushPromises();

    expect(buttonByText(wrapper, 'Sign In').attributes('disabled')).toBeUndefined();
  });

  it('stores redirect path and starts Google authentication', async () => {
    mocked.route.query = {
      redirect: '/dashboard',
    };

    mocked.authStore.startGoogleAuth.mockResolvedValue();

    const wrapper = mountLoginView();

    await buttonByText(wrapper, 'Continue with Google').trigger('click');
    await flushPromises();

    expect(sessionStorage.getItem('auth_redirect')).toBe('/dashboard');
    expect(mocked.authStore.startGoogleAuth).toHaveBeenCalledTimes(1);
  });

  it('uses /getting-started as Google redirect fallback when query redirect is unsafe', async () => {
    mocked.route.query = {
      redirect: 'https://evil-site.com',
    };

    mocked.authStore.startGoogleAuth.mockResolvedValue();

    const wrapper = mountLoginView();

    await buttonByText(wrapper, 'Continue with Google').trigger('click');
    await flushPromises();

    expect(sessionStorage.getItem('auth_redirect')).toBe('/getting-started');
    expect(mocked.authStore.startGoogleAuth).toHaveBeenCalledTimes(1);
  });

  it('shows error message when Google authentication fails', async () => {
    mocked.authStore.startGoogleAuth.mockRejectedValue(new Error('Google login failed'));

    const wrapper = mountLoginView();

    await buttonByText(wrapper, 'Continue with Google').trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Google login failed');
  });
});