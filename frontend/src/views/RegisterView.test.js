import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterView from '@/views/RegisterView.vue';

const mocks = vi.hoisted(() => ({
    push: vi.fn(),
    register: vi.fn(),
    startGoogleAuth: vi.fn()
}));

vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: mocks.push
    })
}));

vi.mock('../stores/auth', () => ({
    useAuthStore: () => ({
        register: mocks.register,
        startGoogleAuth: mocks.startGoogleAuth
    })
}));

const mountRegisterView = () => {
    return mount(RegisterView, {
        global: {
            stubs: {
                Card: {
                    props: ['title'],
                    template: '<div><h1>{{ title }}</h1><slot /></div>'
                },
                Input: {
                    props: ['modelValue', 'label', 'type', 'placeholder'],
                    template: `
                        <label>
                            <span>{{ label }}</span>
                            <input
                                :type="type || 'text'"
                                :placeholder="placeholder"
                                :value="modelValue"
                                @input="$emit('update:modelValue', $event.target.value)"
                            />
                        </label>
                    `
                },
                Button: {
                    props: ['disabled', 'type'],
                    template: `
                        <button
                            :type="type || 'submit'"
                            :disabled="disabled"
                            @click="$emit('click')"
                        >
                            <slot />
                        </button>
                    `
                },
                PasswordStrengthMeter: {
                    template: '<div></div>'
                },
                AuthFooter: {
                    template: '<div></div>'
                },
                Divider: {
                    template: '<div><slot /></div>'
                }
            }
        }
    });
};

describe('RegisterView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders register form', () => {
        const wrapper = mountRegisterView();

        expect(wrapper.text()).toContain('Register');
        expect(wrapper.text()).toContain('Create an account to get started');
        expect(wrapper.text()).toContain('First name');
        expect(wrapper.text()).toContain('Last name');
        expect(wrapper.text()).toContain('Email');
        expect(wrapper.text()).toContain('Password');
        expect(wrapper.text()).toContain('Continue with Google');
    });

    it('shows validation errors and does not register when fields are invalid', async () => {
        const wrapper = mountRegisterView();

        await wrapper.find('input[placeholder="First name"]').setValue('Nour1');
        await wrapper.find('input[placeholder="Last name"]').setValue('');
        await wrapper.find('input[placeholder="email"]').setValue('wrong-email');
        await wrapper.find('input[placeholder="password"]').setValue('weak');
        await wrapper.find('input[placeholder="confirm password"]').setValue('different');

        await wrapper.find('form').trigger('submit.prevent');

        expect(wrapper.text()).toContain('Invalid first name');
        expect(wrapper.text()).toContain('Invalid last name');
        expect(wrapper.text()).toContain('Invalid email address');
        expect(wrapper.text()).toContain('Password is not strong');
        expect(wrapper.text()).toContain('Passwords do not match');

        expect(mocks.register).not.toHaveBeenCalled();
        expect(mocks.push).not.toHaveBeenCalled();
    });

    it('calls register and redirects to dashboard on success', async () => {
        mocks.register.mockResolvedValueOnce();

        const wrapper = mountRegisterView();

        await wrapper.find('input[placeholder="First name"]').setValue(' Nour ');
        await wrapper.find('input[placeholder="Last name"]').setValue(' Bakkali ');
        await wrapper.find('input[placeholder="email"]').setValue(' nour@test.com ');
        await wrapper.find('input[placeholder="password"]').setValue('Password@123');
        await wrapper.find('input[placeholder="confirm password"]').setValue('Password@123');

        await wrapper.find('form').trigger('submit.prevent');
        await flushPromises();

        expect(mocks.register).toHaveBeenCalledWith({
            firstName: 'Nour',
            lastName: 'Bakkali',
            email: 'nour@test.com',
            password: 'Password@123'
        });

        expect(mocks.push).toHaveBeenCalledWith('/dashboard');
    });

    it('shows network error when register fails without response', async () => {
        mocks.register.mockRejectedValueOnce(new Error('Network failed'));

        const wrapper = mountRegisterView();

        await wrapper.find('input[placeholder="First name"]').setValue('Nour');
        await wrapper.find('input[placeholder="Last name"]').setValue('Bakkali');
        await wrapper.find('input[placeholder="email"]').setValue('nour@test.com');
        await wrapper.find('input[placeholder="password"]').setValue('Password@123');
        await wrapper.find('input[placeholder="confirm password"]').setValue('Password@123');

        await wrapper.find('form').trigger('submit.prevent');
        await flushPromises();

        expect(wrapper.text()).toContain('Network error. Please try again.');
        expect(mocks.push).not.toHaveBeenCalled();
    });

    it('calls startGoogleAuth when Google button is clicked', async () => {
        mocks.startGoogleAuth.mockResolvedValueOnce();

        const wrapper = mountRegisterView();

        const buttons = wrapper.findAll('button');
        const googleButton = buttons[1];

        await googleButton.trigger('click');
        await flushPromises();

        expect(mocks.startGoogleAuth).toHaveBeenCalled();
    });
});