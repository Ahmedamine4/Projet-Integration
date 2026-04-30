import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginView from '@/views/LoginView.vue';

const mocks = vi.hoisted(() => ({
    push: vi.fn(),
    login: vi.fn(),
    startGoogleAuth: vi.fn()
}));

vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: mocks.push
    })
}));

vi.mock('@/stores/auth', () => ({
    useAuthStore: () => ({
        login: mocks.login,
        startGoogleAuth: mocks.startGoogleAuth
    })
}));

const mountLoginView = () => {
    return mount(LoginView, {
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
                Error: {
                    template: '<p class="error"><slot /></p>'
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

describe('LoginView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form', () => {
        const wrapper = mountLoginView();

        expect(wrapper.text()).toContain('Welcome back');
        expect(wrapper.text()).toContain('Email address');
        expect(wrapper.text()).toContain('Password');
        expect(wrapper.text()).toContain('Sign In');
        expect(wrapper.text()).toContain('Continue with Google');
    });

    it('shows invalid email error and does not call login', async () => {
        const wrapper = mountLoginView();

        await wrapper.find('input[placeholder="name@company.com"]').setValue('wrong-email');
        await wrapper.find('input[placeholder="Enter your password"]').setValue('password123');

        await wrapper.find('form').trigger('submit.prevent');

        expect(wrapper.text()).toContain('Invalid email address');
        expect(mocks.login).not.toHaveBeenCalled();
        expect(mocks.push).not.toHaveBeenCalled();
    });

    it('calls login and redirects to dashboard on success', async () => {
        mocks.login.mockResolvedValueOnce();

        const wrapper = mountLoginView();

        await wrapper.find('input[placeholder="name@company.com"]').setValue('test@gmail.com');
        await wrapper.find('input[placeholder="Enter your password"]').setValue('password123');

        await wrapper.find('form').trigger('submit.prevent');
        await flushPromises();

        expect(mocks.login).toHaveBeenCalledWith('test@gmail.com', 'password123');
        expect(mocks.push).toHaveBeenCalledWith('/dashboard');
    });

    it('shows network error when login fails without response', async () => {
        mocks.login.mockRejectedValueOnce(new Error());

        const wrapper = mountLoginView();

        await wrapper.find('input[placeholder="name@company.com"]').setValue('test@gmail.com');
        await wrapper.find('input[placeholder="Enter your password"]').setValue('password123');

        await wrapper.find('form').trigger('submit.prevent');
        await flushPromises();

        expect(wrapper.text()).toContain('Network error. Please try again.');
        expect(mocks.push).not.toHaveBeenCalled();
    });

    it('calls startGoogleAuth when Google button is clicked', async () => {
        mocks.startGoogleAuth.mockResolvedValueOnce();

        const wrapper = mountLoginView();

        const buttons = wrapper.findAll('button');
        const googleButton = buttons[1];

        await googleButton.trigger('click');
        await flushPromises();

        expect(mocks.startGoogleAuth).toHaveBeenCalled();
    });
});