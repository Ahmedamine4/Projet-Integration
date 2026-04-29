
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GoogleCallbackView from '@/views/AuthCallbackView.vue';
import { mount, flushPromises } from '@vue/test-utils';
import AuthCallbackView from '@/views/AuthCallbackView.vue';

const mocks = vi.hoisted(() => ({
    replace: vi.fn(),
    completeGoogleAuth: vi.fn(() => new Promise(() => {}))
}));

vi.mock('vue-router', () => ({
    useRouter: () => ({
        replace: mocks.replace
    })
}));

vi.mock('@/stores/auth', () => ({
    useAuthStore: () => ({
        completeGoogleAuth: mocks.completeGoogleAuth
    })
}));

describe('GoogleCallbackView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows loading while Google auth is processing', () => {
        const wrapper = mount(GoogleCallbackView);

        expect(wrapper.text()).toContain('Signing you in...');
        expect(wrapper.find('.loading').exists()).toBe(true);
        expect(wrapper.find('.loading__spinner').exists()).toBe(true);
    });
    it('redirects to dashboard when Google auth succeeds', async () => {
    mocks.completeGoogleAuth.mockResolvedValueOnce();

    mount(AuthCallbackView);

    await flushPromises();

    expect(mocks.completeGoogleAuth).toHaveBeenCalled();
    expect(mocks.replace).toHaveBeenCalledWith('/dashboard');
});
it('displays the error message thrown by completeGoogleAuth', async () => {
    const errorMessage = 'Missing Supabase session';

    mocks.completeGoogleAuth.mockRejectedValueOnce(
        new Error(errorMessage)
    );

    const wrapper = mount(AuthCallbackView);

    await flushPromises();

    expect(mocks.completeGoogleAuth).toHaveBeenCalled();
    expect(wrapper.text()).toContain(errorMessage);
    expect(mocks.replace).not.toHaveBeenCalled();
});
});
