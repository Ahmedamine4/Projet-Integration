import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GettingStartedView from '@/views/app/GettingStartedView.vue';

const mocked = vi.hoisted(() => ({
  institutionStore: {
    institutions: [
      {
        id: 1,
        name: 'ENSA Tanger',
      },
    ],
    fetchInstitutions: vi.fn(),
    setSchoolPath: vi.fn(),
  },

  githubStore: {
    loading: false,
    connectGithub: vi.fn(),
  },
}));

vi.mock('@/stores/institution', () => ({
  useInstitutionStore: () => mocked.institutionStore,
}));

vi.mock('@/stores/github', () => ({
  useGithubStore: () => mocked.githubStore,
}));

const mountView = () => {
  return mount(GettingStartedView, {
    global: {
      stubs: {
        GettingStartedStep: {
          name: 'GettingStartedStep',
          props: ['stepKey', 'title', 'description', 'status'],
          emits: ['action'],
          template: `
            <button
              type="button"
              :data-test="'step-' + stepKey"
              @click="$emit('action')"
            >
              <span :data-test="'title-' + stepKey">{{ title }}</span>
              <span :data-test="'status-' + stepKey">{{ status }}</span>
            </button>
          `,
        },

        ProgressMeter: {
          name: 'ProgressMeter',
          props: ['value', 'max'],
          template: `
            <div data-test="progress-meter">
              {{ value }} / {{ max }}
            </div>
          `,
        },

        SchoolPathModal: {
          name: 'SchoolPathModal',
          props: ['open', 'schools'],
          emits: ['close', 'complete'],
          template: `
            <div data-test="school-modal" :data-open="String(open)">
              <button
                type="button"
                data-test="complete-school"
                @click="$emit('complete', { schoolPath: ['ENSA Tanger'] })"
              >
                Complete school
              </button>
            </div>
          `,
        },

                    Button: {
            name: 'Button',
            props: ['type', 'variant', 'loading'],
            emits: ['click'],
            template: `
                <button
                :type="type || 'button'"
                :disabled="loading"
                @click="$emit('click', $event)"
                >
                <slot />
                </button>
            `,
            },
        GithubIcon: true,
      },
    },
  });
};

describe('GettingStartedView', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocked.githubStore.loading = false;
    mocked.githubStore.connectGithub.mockResolvedValue();
    mocked.institutionStore.fetchInstitutions.mockResolvedValue();
    mocked.institutionStore.setSchoolPath.mockReset();

    window.history.pushState({}, '', '/getting-started');
  });

  it('fetches institutions on mount', () => {
    mountView();

    expect(mocked.institutionStore.fetchInstitutions).toHaveBeenCalledTimes(1);
  });

  it('marks GitHub step as done when redirected from GitHub callback', async () => {
    window.history.pushState({}, '', '/getting-started?github=connected');

    const wrapper = mountView();

    await flushPromises();

    expect(wrapper.find('[data-test="status-github"]').text()).toBe('done');
    expect(wrapper.find('[data-test="progress-meter"]').text()).toContain('1 / 3');
  });

  it('opens GitHub panel and calls connectGithub when clicking the GitHub button', async () => {
    const wrapper = mountView();

    await wrapper.find('[data-test="step-github"]').trigger('click');

    expect(wrapper.text()).toContain('Authorize GitHub to connect your account');

    await wrapper.find('.github-button').trigger('click');
    await flushPromises();

    expect(mocked.githubStore.connectGithub).toHaveBeenCalledTimes(1);
  });

  it('marks school step as done after completing the school modal', async () => {
    const wrapper = mountView();

    await wrapper.find('[data-test="step-school"]').trigger('click');

    expect(wrapper.find('[data-test="school-modal"]').attributes('data-open')).toBe('true');

    await wrapper.find('[data-test="complete-school"]').trigger('click');

    expect(mocked.institutionStore.setSchoolPath).toHaveBeenCalledWith(['ENSA Tanger']);
    expect(wrapper.find('[data-test="status-school"]').text()).toBe('done');
    expect(wrapper.find('[data-test="progress-meter"]').text()).toContain('1 / 3');
  });

  it('does not mark phone step as done when phone number is empty', async () => {
    const wrapper = mountView();

    await wrapper.find('[data-test="step-phone"]').trigger('click');
    await wrapper.find('.phone-button').trigger('click');

    expect(wrapper.find('[data-test="status-phone"]').text()).toBe('todo');
    expect(wrapper.find('[data-test="progress-meter"]').text()).toContain('0 / 3');
  });

  it('marks phone step as done when phone number is valid', async () => {
    const wrapper = mountView();

    await wrapper.find('[data-test="step-phone"]').trigger('click');

    await wrapper
      .find('input[placeholder="Enter your phone number"]')
      .setValue('612345678');

    await wrapper.find('.phone-button').trigger('click');

    expect(wrapper.find('[data-test="status-phone"]').text()).toBe('done');
    expect(wrapper.find('[data-test="progress-meter"]').text()).toContain('1 / 3');
  });
});