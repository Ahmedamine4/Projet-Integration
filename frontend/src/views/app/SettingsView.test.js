import { defineComponent, nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SettingsView from './SettingsView.vue';

const mocks = vi.hoisted(() => ({
  authStore: {
    user: {
      utilisateur_id: 1,
      prenom: 'Nour',
      nom: 'Bakkali',
      email: 'nour@test.com',
      github: null,
    },
  },
  userStore: {
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    fetchSessions: vi.fn(),
  },
  githubStore: {
    loading: false,
    connectGithub: vi.fn(),
  },
}));

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mocks.authStore,
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => mocks.userStore,
}));

vi.mock('@/stores/github', () => ({
  useGithubStore: () => mocks.githubStore,
}));

const BaseInputStub = defineComponent({
  name: 'BaseInput',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    name: {
      type: String,
      default: '',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'focus'],
  template: `
    <label class="base-input-stub">
      <span>{{ label }}</span>
      <input
        :aria-label="label"
        :name="name"
        :type="type"
        :value="modelValue"
        :readonly="readonly"
        :disabled="disabled"
        @focus="$emit('focus', $event)"
        @input="$emit('update:modelValue', $event.target.value)"
      >
    </label>
  `,
});

const BaseErrorStub = defineComponent({
  name: 'BaseError',
  template: '<p class="base-error-stub"><slot /></p>',
});

const PasswordStrengthMeterStub = defineComponent({
  name: 'PasswordStrengthMeter',
  props: ['password'],
  template: '<div data-test="password-strength">Password strength</div>',
});

function createSessions() {
  return [
    {
      connexion_id: 1,
      device_type: 'desktop',
      browser: 'Chrome',
      browser_version: '125',
      os: 'Windows',
      ville: 'Tangier',
      pays: 'Morocco',
      date_action: '2026-06-09T10:00:00.000Z',
    },
    {
      connexion_id: 2,
      device_type: 'mobile',
      browser: 'Safari',
      browser_version: '17',
      os: 'iOS',
      ville: 'Rabat',
      pays: 'Morocco',
      date_action: '2026-06-08T10:00:00.000Z',
    },
  ];
}

function mountSettings() {
  return mount(SettingsView, {
    global: {
      stubs: {
        Input: BaseInputStub,
        Error: BaseErrorStub,
        PasswordStrengthMeter: PasswordStrengthMeterStub,
        Settings: true,
      },
    },
  });
}

describe('AccountSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.authStore.user = {
      utilisateur_id: 1,
      prenom: 'Nour',
      nom: 'Bakkali',
      email: 'nour@test.com',
      github: null,
    };

    mocks.githubStore.loading = false;
    mocks.githubStore.connectGithub.mockResolvedValue();

    mocks.userStore.updateProfile.mockResolvedValue();
    mocks.userStore.changePassword.mockResolvedValue();
    mocks.userStore.fetchSessions.mockResolvedValue(createSessions());

    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('displays user information and loads active sessions', async () => {
    const wrapper = mountSettings();

    await flushPromises();

    expect(wrapper.text()).toContain('Account Settings');
    expect(wrapper.text()).toContain('Nour Bakkali');
    expect(wrapper.text()).toContain('nour@test.com');

    expect(mocks.userStore.fetchSessions).toHaveBeenCalledTimes(1);

    expect(wrapper.text()).toContain('PC / Ordinateur');
    expect(wrapper.text()).toContain('Chrome 125');
    expect(wrapper.text()).toContain('Windows');
    expect(wrapper.text()).toContain('Tangier, Morocco');
    expect(wrapper.text()).toContain('Active now');

    expect(wrapper.text()).toContain('Mobile');
    expect(wrapper.text()).toContain('Safari 17');
    expect(wrapper.text()).toContain('iOS');
    expect(wrapper.text()).toContain('Rabat, Morocco');
  });

  it('saves the updated first name and hides the field actions after saving', async () => {
    const wrapper = mountSettings();

    await flushPromises();

    const firstNameInput = wrapper.findAll('input.field-input')[0];

    await firstNameInput.setValue('Noura');
    await nextTick();

    expect(wrapper.text()).toContain('Save');
    expect(wrapper.text()).toContain('Cancel');

    const saveButtons = wrapper
      .findAll('button')
      .filter((button) => button.text() === 'Save');

    await saveButtons[0].trigger('click');

    await flushPromises();

    expect(mocks.userStore.updateProfile).toHaveBeenCalledWith({
      firstName: 'Noura',
      lastName: 'Bakkali',
    });

    expect(wrapper.text()).toContain('Noura Bakkali');
  });

  it('shows password validation errors and does not call the API when the form is invalid', async () => {
    const wrapper = mountSettings();

    await flushPromises();

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Change password')
      .trigger('click');

    await nextTick();

    const passwordInputs = wrapper.findAll('.base-input-stub input');

    await passwordInputs[1].setValue('weak');
    await passwordInputs[2].setValue('different');

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Save Password')
      .trigger('click');

    await nextTick();

    expect(wrapper.text()).toContain('Please enter your current password');
    expect(wrapper.text()).toContain(
      'Password must be 8+ chars with a letter, number, and special character'
    );
    expect(wrapper.text()).toContain('Passwords do not match');

    expect(mocks.userStore.changePassword).not.toHaveBeenCalled();
  });

  it('changes the password when the form is valid and closes the password form', async () => {
    const wrapper = mountSettings();

    await flushPromises();

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Change password')
      .trigger('click');

    await nextTick();

    const passwordInputs = wrapper.findAll('.base-input-stub input');

    await passwordInputs[0].setValue('OldPassword1!');
    await passwordInputs[1].setValue('NewPassword1!');
    await passwordInputs[2].setValue('NewPassword1!');

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Save Password')
      .trigger('click');

    await flushPromises();

    expect(mocks.userStore.changePassword).toHaveBeenCalledWith(
      'OldPassword1!',
      'NewPassword1!'
    );

    expect(window.alert).toHaveBeenCalledWith('Password updated successfully');
    expect(wrapper.text()).not.toContain('Save Password');
    expect(wrapper.text()).toContain('Change password');
  });

  it('connects GitHub and manages sessions locally', async () => {
    const wrapper = mountSettings();

    await flushPromises();

    const githubButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Link GitHub');

    await githubButton.trigger('click');

    await flushPromises();

    expect(mocks.githubStore.connectGithub).toHaveBeenCalledTimes(1);

    expect(wrapper.text()).toContain('Mobile');
    expect(wrapper.text()).toContain('Log out all other sessions');

    const logoutSessionButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Log out'));

    await logoutSessionButton.trigger('click');

    await nextTick();

    expect(wrapper.text()).not.toContain('Mobile');
    expect(wrapper.text()).toContain('No other active sessions.');
  });
});