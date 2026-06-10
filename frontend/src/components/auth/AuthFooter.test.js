import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AuthFooter from './AuthFooter.vue';

const RouterLinkStub = defineComponent({
  name: 'RouterLink',
  props: {
    to: {
      type: String,
      default: '',
    },
  },
  template: `
    <a
      data-test="router-link"
      :data-to="to"
    >
      <slot />
    </a>
  `,
});

function mountFooter(props = {}) {
  return mount(AuthFooter, {
    props: {
      message: 'Already have an account?',
      linkText: 'Login',
      to: '/login',
      ...props,
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
}

describe('AuthFooter', () => {
  it('renders the footer message', () => {
    const wrapper = mountFooter({
      message: 'Don’t have an account?',
    });

    expect(wrapper.text()).toContain('Don’t have an account?');
  });

  it('renders the link text', () => {
    const wrapper = mountFooter({
      linkText: 'Create account',
    });

    expect(wrapper.find('[data-test="router-link"]').text()).toBe('Create account');
  });

  it('passes the to prop to RouterLink', () => {
    const wrapper = mountFooter({
      to: '/register',
    });

    expect(wrapper.find('[data-test="router-link"]').attributes('data-to')).toBe('/register');
  });

  it('renders the auth-footer class', () => {
    const wrapper = mountFooter();

    expect(wrapper.find('p').classes()).toContain('auth-footer');
  });

  it('renders with empty default props', () => {
    const wrapper = mount(AuthFooter, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    });

    expect(wrapper.find('p').exists()).toBe(true);
    expect(wrapper.find('[data-test="router-link"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="router-link"]').text()).toBe('');
    expect(wrapper.find('[data-test="router-link"]').attributes('data-to')).toBe('');
  });
});