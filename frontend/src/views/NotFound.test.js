import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotFoundView from '@/views/NotFoundView.vue';

const mocks = vi.hoisted(() => ({
    push: vi.fn()
}));

vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: mocks.push
    })
}));

describe('NotFoundView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the not found page content', () => {
        const wrapper = mount(NotFoundView, {
            global: {
                stubs: {
                    Button: {
                        template: '<button><slot /></button>'
                    }
                }
            }
        });

        expect(wrapper.text()).toContain('404');
        expect(wrapper.text()).toContain('Unverified page');
        expect(wrapper.text()).toContain('This page does not have a certified place in your portfolio.');
        expect(wrapper.text()).toContain('Back home');
        expect(wrapper.text()).toContain('Sign in');
    });

    it('redirects to home when Back home is clicked', async () => {
        const wrapper = mount(NotFoundView, {
            global: {
                stubs: {
                    Button: {
                        template: '<button @click="$emit(\'click\')"><slot /></button>'
                    }
                }
            }
        });

        const buttons = wrapper.findAll('button');

        await buttons[0].trigger('click');

        expect(mocks.push).toHaveBeenCalledWith('/');
    });

    it('redirects to login when Sign in is clicked', async () => {
        const wrapper = mount(NotFoundView, {
            global: {
                stubs: {
                    Button: {
                        template: '<button @click="$emit(\'click\')"><slot /></button>'
                    }
                }
            }
        });

        const buttons = wrapper.findAll('button');

        await buttons[1].trigger('click');

        expect(mocks.push).toHaveBeenCalledWith('/login');
    });
});