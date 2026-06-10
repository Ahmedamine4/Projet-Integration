import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PortfolioAiAssistant from './AiOrb.vue';
import { analyzeExperienceDescription } from '@/services/aiApi';

vi.mock('@/assets/icons/FolioCraft.svg', () => ({
  default: 'folio-logo.svg',
}));

vi.mock('lucide-vue-next', () => ({
  Sparkles: {
    name: 'Sparkles',
    props: ['size'],
    template: '<svg data-test="sparkles-icon" />',
  },
}));

vi.mock('@/services/aiApi', () => ({
  analyzeExperienceDescription: vi.fn(),
}));

function mountAssistant() {
  return mount(PortfolioAiAssistant);
}

describe('PortfolioAiAssistant', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    analyzeExperienceDescription.mockResolvedValue({
      technologies: ['Vue.js', { name: 'Express.js' }],
      domains: ['Web Development', { name: 'Artificial Intelligence' }],
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders the orb and the assistant UI', () => {
    const wrapper = mountAssistant();

    expect(wrapper.find('.container-vao').exists()).toBe(true);
    expect(wrapper.find('.orb').exists()).toBe(true);
    expect(wrapper.find('.container-chat-ia').exists()).toBe(true);
    expect(wrapper.find('.logo-icon').attributes('src')).toBe('folio-logo.svg');
    expect(wrapper.find('.logo-icon').attributes('alt')).toBe('FolioCraft');

    expect(wrapper.text()).toContain('What are');
    expect(wrapper.text()).toContain('you looking for ?');
    expect(wrapper.find('[data-test="sparkles-icon"]').exists()).toBe(true);
  });

  it('disables the send button when the description is empty', () => {
    const wrapper = mountAssistant();

    expect(wrapper.find('.chat-send-button').element.disabled).toBe(true);
  });

  it('enables the send button when the description has text', async () => {
    const wrapper = mountAssistant();

    await wrapper.find('.chat-input').setValue('I need a Vue developer.');

    expect(wrapper.find('.chat-send-button').element.disabled).toBe(false);
  });

  it('does not call AI service when submitting an empty description', async () => {
    const wrapper = mountAssistant();

    await wrapper.find('form').trigger('submit');

    expect(analyzeExperienceDescription).not.toHaveBeenCalled();
    expect(wrapper.emitted('filters-detected')).toBeFalsy();
  });

  it('calls analyzeExperienceDescription when submitting a description', async () => {
    const wrapper = mountAssistant();

    await wrapper
      .find('.chat-input')
      .setValue('Looking for a Vue and Express developer.');

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(analyzeExperienceDescription).toHaveBeenCalledTimes(1);
    expect(analyzeExperienceDescription).toHaveBeenCalledWith(
      'Looking for a Vue and Express developer.'
    );
  });

  it('renders the user message after submit', async () => {
    const wrapper = mountAssistant();

    await wrapper
      .find('.chat-input')
      .setValue('Looking for a Vue and Express developer.');

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.chat-user').exists()).toBe(true);
    expect(wrapper.find('.chat-user').text()).toContain(
      'Looking for a Vue and Express developer.'
    );
  });

  it('renders detected technologies and domains after successful analysis', async () => {
    const wrapper = mountAssistant();

    await wrapper
      .find('.chat-input')
      .setValue('Looking for a Vue and Express developer.');

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('Here is what I detected:');
    expect(wrapper.text()).toContain('Technologies');
    expect(wrapper.text()).toContain('Vue.js');
    expect(wrapper.text()).toContain('Express.js');

    expect(wrapper.text()).toContain('Domains');
    expect(wrapper.text()).toContain('Web Development');
    expect(wrapper.text()).toContain('Artificial Intelligence');
  });

  it('emits filters-detected with detected technologies and domains', async () => {
    const wrapper = mountAssistant();

    await wrapper
      .find('.chat-input')
      .setValue('Looking for a Vue and Express developer.');

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.emitted('filters-detected')).toBeTruthy();
    expect(wrapper.emitted('filters-detected')[0]).toEqual([
      {
        technologies: ['Vue.js', 'Express.js'],
        domaines: ['Web Development', 'Artificial Intelligence'],
      },
    ]);
  });

  it('clears the textarea after successful analysis', async () => {
    const wrapper = mountAssistant();

    await wrapper
      .find('.chat-input')
      .setValue('Looking for a Vue and Express developer.');

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.chat-input').element.value).toBe('');
  });

  it('shows loading state while analysis is pending', async () => {
    let resolvePromise;

    analyzeExperienceDescription.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    const wrapper = mountAssistant();

    await wrapper.find('.chat-input').setValue('Analyze this description.');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('Analyzing your description...');
    expect(wrapper.find('.chat-send-button').element.disabled).toBe(true);
    expect(wrapper.find('.chat-send-button').text()).toBe('...');

    resolvePromise({
      technologies: ['Vue.js'],
      domains: ['Web Development'],
    });

    await flushPromises();

    expect(wrapper.text()).not.toContain('Analyzing your description...');
    expect(wrapper.find('.chat-send-button').element.disabled).toBe(true);
  });

  it('shows an error message when analysis fails', async () => {
    analyzeExperienceDescription.mockRejectedValueOnce(
      new Error('AI service unavailable')
    );

    const wrapper = mountAssistant();

    await wrapper.find('.chat-input').setValue('Analyze this description.');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.error-message').text()).toBe('AI service unavailable');
    expect(wrapper.emitted('filters-detected')).toBeFalsy();
  });

  it('clears previous detected results before a new analysis', async () => {
    const wrapper = mountAssistant();

    await wrapper.find('.chat-input').setValue('First description.');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('Vue.js');

    analyzeExperienceDescription.mockResolvedValueOnce({
      technologies: ['Python'],
      domains: ['Data'],
    });

    await wrapper.find('.chat-input').setValue('Second description.');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('Python');
    expect(wrapper.text()).toContain('Data');
    expect(wrapper.text()).not.toContain('Vue.js');
  });

  it('submits when pressing Enter in the textarea', async () => {
    const wrapper = mountAssistant();

    await wrapper
      .find('.chat-input')
      .setValue('Looking for a Vue developer.');

    await wrapper.find('.chat-input').trigger('keydown.enter');
    await flushPromises();

    expect(analyzeExperienceDescription).toHaveBeenCalledTimes(1);
  });

  it('resizes textarea on input', async () => {
    const wrapper = mountAssistant();

    const textarea = wrapper.find('.chat-input').element;

    Object.defineProperty(textarea, 'scrollHeight', {
      value: 88,
      configurable: true,
    });

    await wrapper.find('.chat-input').setValue('Long description');

    expect(textarea.style.height).toBe('88px');
  });

  it('activates AI speaking animation when orb checkbox is checked', async () => {
    const wrapper = mountAssistant();

    await wrapper.find('.input-orb').setValue(true);

    expect(wrapper.find('.orb').classes()).toContain('is-ai-speaking');

    vi.advanceTimersByTime(6500);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.orb').classes()).not.toContain('is-ai-speaking');
  });

  it('activates AI speaking animation after successful analysis', async () => {
    const wrapper = mountAssistant();

    await wrapper.find('.chat-input').setValue('Analyze this description.');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.orb').classes()).toContain('is-ai-speaking');

    vi.advanceTimersByTime(3000);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.orb').classes()).not.toContain('is-ai-speaking');
  });
});