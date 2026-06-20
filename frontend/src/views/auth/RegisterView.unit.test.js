import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterView from '@/views/auth/RegisterView.vue';
import { authStubs, buttonByText } from '@/test/authStubs';

const mocked = vi.hoisted(() => ({
  authStore: {
    register: vi.fn(),
    startGoogleAuth: vi.fn(),
  },
  routerPush: vi.fn(),
}));

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mocked.authStore,
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mocked.routerPush,
  }),
}));

const mountRegisterView = () => {
  return mount(RegisterView, {
    global: {
      stubs: authStubs,
    },
  });
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

describe('RegisterView - unit tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocked.authStore.register.mockReset();
    mocked.authStore.startGoogleAuth.mockReset();
    mocked.routerPush.mockReset();
  });

  it('renders the register form correctly', () => {
    const wrapper = mountRegisterView();

    expect(wrapper.text()).toContain('Register');
    expect(wrapper.text()).toContain('Create an account to get started');
    expect(wrapper.text()).toContain('First name');
    expect(wrapper.text()).toContain('Last name');
    expect(wrapper.text()).toContain('Email');
    expect(wrapper.text()).toContain('Password');
    expect(wrapper.text()).toContain('Confirm password');
    expect(wrapper.text()).toContain('Continue with Google');
    expect(wrapper.text()).toContain('Already have an account?');
    expect(wrapper.text()).toContain('Login now');
  });

  it('disables register button when required fields are empty', async () => {
    const wrapper = mountRegisterView();

    expect(buttonByText(wrapper, 'Register').attributes('disabled')).toBeDefined();

    await wrapper.find('input[placeholder="First name"]').setValue('Nour');

    expect(buttonByText(wrapper, 'Register').attributes('disabled')).toBeDefined();
  });

  it('shows error when first name is invalid', async () => {
    const wrapper = mountRegisterView();

    await fillRegisterForm(wrapper, {
      firstName: 'Nour123',
    });

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain('Invalid first name');
    expect(mocked.authStore.register).not.toHaveBeenCalled();
    expect(mocked.routerPush).not.toHaveBeenCalled();
  });

  it('shows error when last name is invalid', async () => {
    const wrapper = mountRegisterView();

    await fillRegisterForm(wrapper, {
      lastName: 'Bakkali@',
    });

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain('Invalid last name');
    expect(mocked.authStore.register).not.toHaveBeenCalled();
    expect(mocked.routerPush).not.toHaveBeenCalled();
  });

  it('shows error when email is invalid', async () => {
    const wrapper = mountRegisterView();

    await fillRegisterForm(wrapper, {
      email: 'bad-email',
    });

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain('Invalid email address');
    expect(mocked.authStore.register).not.toHaveBeenCalled();
    expect(mocked.routerPush).not.toHaveBeenCalled();
  });

  it('shows error when password is weak', async () => {
    const wrapper = mountRegisterView();

    await fillRegisterForm(wrapper, {
      password: 'password',
      confirm: 'password',
    });

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain('Password is not strong enouth');
    expect(mocked.authStore.register).not.toHaveBeenCalled();
    expect(mocked.routerPush).not.toHaveBeenCalled();
  });

  it('shows error when passwords do not match', async () => {
    const wrapper = mountRegisterView();

    await fillRegisterForm(wrapper, {
      password: 'Password@123',
      confirm: 'Password@456',
    });

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain('Passwords do not match');
    expect(mocked.authStore.register).not.toHaveBeenCalled();
    expect(mocked.routerPush).not.toHaveBeenCalled();
  });

  it('calls authStore.register with trimmed values and redirects on success', async () => {
    mocked.authStore.register.mockResolvedValue();

    const wrapper = mountRegisterView();

    await fillRegisterForm(wrapper, {
      firstName: '  Nour  ',
      lastName: '  Bakkali  ',
      email: '  student@test.com  ',
      password: 'Password@123',
      confirm: 'Password@123',
    });

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mocked.authStore.register).toHaveBeenCalledTimes(1);
    expect(mocked.authStore.register).toHaveBeenCalledWith({
      firstName: 'Nour',
      lastName: 'Bakkali',
      email: 'student@test.com',
      password: 'Password@123',
    });

    expect(mocked.routerPush).toHaveBeenCalledWith('/getting-started');
  });

  it('shows backend error message when register fails with response error', async () => {
    mocked.authStore.register.mockRejectedValue({
      response: {
        data: {
          error: 'Email already exists',
        },
      },
    });

    const wrapper = mountRegisterView();

    await fillRegisterForm(wrapper);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('Email already exists');
    expect(mocked.routerPush).not.toHaveBeenCalled();
  });

  it('shows fallback backend error when response has no error message', async () => {
    mocked.authStore.register.mockRejectedValue({
      response: {
        data: {},
      },
    });

    const wrapper = mountRegisterView();

    await fillRegisterForm(wrapper);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('Something went wrong');
    expect(mocked.routerPush).not.toHaveBeenCalled();
  });

  it('shows network error when register fails without response', async () => {
    mocked.authStore.register.mockRejectedValue(new Error('Network failed'));

    const wrapper = mountRegisterView();

    await fillRegisterForm(wrapper);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('Network error. Please try again.');
    expect(mocked.routerPush).not.toHaveBeenCalled();
  });

  it('disables register and Google buttons while registration is loading', async () => {
    let resolveRegister;

    mocked.authStore.register.mockImplementation(() => {
      return new Promise((resolve) => {
        resolveRegister = resolve;
      });
    });

    const wrapper = mountRegisterView();

    await fillRegisterForm(wrapper);
    await wrapper.find('form').trigger('submit.prevent');

    expect(buttonByText(wrapper, 'Register').attributes('disabled')).toBeDefined();
    expect(buttonByText(wrapper, 'Continue with Google').attributes('disabled')).toBeDefined();

    resolveRegister();
    await flushPromises();

    expect(buttonByText(wrapper, 'Register').attributes('disabled')).toBeUndefined();
  });

  it('starts Google authentication when clicking Continue with Google', async () => {
    mocked.authStore.startGoogleAuth.mockResolvedValue();

    const wrapper = mountRegisterView();

    await buttonByText(wrapper, 'Continue with Google').trigger('click');
    await flushPromises();

    expect(mocked.authStore.startGoogleAuth).toHaveBeenCalledTimes(1);
  });

  it('shows error message when Google authentication fails', async () => {
    mocked.authStore.startGoogleAuth.mockRejectedValue(new Error('Google register failed'));

    const wrapper = mountRegisterView();

    await buttonByText(wrapper, 'Continue with Google').trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Google register failed');
  });
});