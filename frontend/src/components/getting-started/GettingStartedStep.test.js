import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import GettingStartedStep from './GettingStartedStep.vue';

vi.mock('lucide-vue-next', () => ({
  CircleCheck: {
    name: 'CircleCheck',
    template: '<svg data-test="circle-check-icon" />',
  },
  GraduationCap: {
    name: 'GraduationCap',
    template: '<svg data-test="graduation-icon" />',
  },
  GithubIcon: {
    name: 'GithubIcon',
    template: '<svg data-test="github-icon" />',
  },
  Phone: {
    name: 'Phone',
    template: '<svg data-test="phone-icon" />',
  },
}));

function mountStep(props = {}) {
  return mount(GettingStartedStep, {
    props: {
      title: 'Connect your school',
      description: 'Link your school account to continue.',
      status: 'todo',
      stepKey: 'school',
      ...props,
    },
  });
}

describe('GettingStartedStep', () => {
  it('renders the title and description', () => {
    const wrapper = mountStep({
      title: 'Connect GitHub',
      description: 'Import your repositories.',
    });

    expect(wrapper.text()).toContain('Connect GitHub');
    expect(wrapper.text()).toContain('Import your repositories.');
  });

  it('applies the status class', () => {
    const wrapper = mountStep({
      status: 'pending',
    });

    expect(wrapper.classes()).toContain('step');
    expect(wrapper.classes()).toContain('pending');
  });

  it('renders the school icon when stepKey is school and status is not done', () => {
    const wrapper = mountStep({
      stepKey: 'school',
      status: 'todo',
    });

    expect(wrapper.find('[data-test="graduation-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="github-icon"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="phone-icon"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="circle-check-icon"]').exists()).toBe(false);
  });

  it('renders the GitHub icon when stepKey is github and status is not done', () => {
    const wrapper = mountStep({
      stepKey: 'github',
      status: 'todo',
    });

    expect(wrapper.find('[data-test="github-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="graduation-icon"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="phone-icon"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="circle-check-icon"]').exists()).toBe(false);
  });

  it('renders the phone icon when stepKey is phone and status is not done', () => {
    const wrapper = mountStep({
      stepKey: 'phone',
      status: 'todo',
    });

    expect(wrapper.find('[data-test="phone-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="graduation-icon"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="github-icon"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="circle-check-icon"]').exists()).toBe(false);
  });

  it('renders the done icon when status is done, regardless of stepKey', () => {
    const wrapper = mountStep({
      stepKey: 'github',
      status: 'done',
    });

    expect(wrapper.find('[data-test="circle-check-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="github-icon"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="graduation-icon"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="phone-icon"]').exists()).toBe(false);
  });

  it('emits action when clicking a todo step', async () => {
    const wrapper = mountStep({
      status: 'todo',
    });

    await wrapper.trigger('click');

    expect(wrapper.emitted('action')).toBeTruthy();
    expect(wrapper.emitted('action')).toHaveLength(1);
  });

  it('does not emit action when clicking a pending step', async () => {
    const wrapper = mountStep({
      status: 'pending',
    });

    await wrapper.trigger('click');

    expect(wrapper.emitted('action')).toBeFalsy();
  });

  it('does not emit action when clicking a done step', async () => {
    const wrapper = mountStep({
      status: 'done',
    });

    await wrapper.trigger('click');

    expect(wrapper.emitted('action')).toBeFalsy();
  });
});