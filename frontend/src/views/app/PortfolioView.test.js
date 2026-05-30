import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PortfolioView from '@/views/app/PortfolioView.vue';

const mocked = vi.hoisted(() => ({
  route: {
    params: {},
  },

  authStore: {
    user: {
      utilisateur_id: 12,
      email: 'student@test.com',
      twitter: '',
      instagram: '',
    },
  },

  projectStore: {
    loading: false,
    createProject: vi.fn(),
  },

  activityStore: {
    loading: false,
    createActivity: vi.fn(),
  },
}));

vi.mock('vue-router', () => ({
  useRoute: () => mocked.route,
}));

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mocked.authStore,
}));

vi.mock('@/stores/project', () => ({
  useProjectStore: () => mocked.projectStore,
}));

vi.mock('@/stores/activity', () => ({
  useActivityStore: () => mocked.activityStore,
}));

vi.mock('lucide-vue-next', () => ({
  QrCode: {
    name: 'QrCode',
    template: '<svg data-test="qr-icon" />',
  },
}));

vi.mock('@/components/portfolio/contact/QRcodeModal.vue', () => ({
  default: {
    name: 'QRcodeModal',
    props: ['open', 'title', 'username'],
    emits: ['close'],
    template: '<div data-test="qr-modal"></div>',
  },
}));

const mountView = () => {
  return mount(PortfolioView, {
    global: {
      stubs: {
        AboutMe: {
          name: 'AboutMe',
          props: ['userId'],
          template: '<section data-test="about-me"></section>',
        },

        PortfolioEducation: {
          name: 'PortfolioEducation',
          props: ['userId'],
          template: '<section data-test="portfolio-education"></section>',
        },

        PortfolioSkills: {
          name: 'PortfolioSkills',
          props: ['userId'],
          template: '<section data-test="portfolio-skills"></section>',
        },

        ProjectsSection: {
          name: 'ProjectsSection',
          props: ['projects', 'canAdd'],
          emits: ['add-project', 'edit-project'],
          template: `
            <section data-test="projects-section">
              <button data-test="add-project" @click="$emit('add-project')">
                Add project
              </button>

              <button
                v-if="projects.length"
                data-test="edit-project"
                @click="$emit('edit-project', projects[0])"
              >
                Edit project
              </button>

              <div
                v-for="project in projects"
                :key="project.id"
                data-test="project-title"
              >
                {{ project.title }}
              </div>
            </section>
          `,
        },

        ActivitiesSection: {
          name: 'ActivitiesSection',
          props: ['activities', 'canAdd'],
          emits: ['add-activity', 'edit-activity', 'update-max-card-height'],
          template: `
            <section data-test="activities-section">
              <button data-test="add-activity" @click="$emit('add-activity')">
                Add activity
              </button>

              <div
                v-for="activity in activities"
                :key="activity.id"
                data-test="activity-title"
              >
                {{ activity.title }}
              </div>
            </section>
          `,
        },

        CertificationsSection: {
          name: 'CertificationsSection',
          props: ['certifications', 'canAdd', 'maxCardHeight'],
          emits: ['add-certification', 'edit-certification'],
          template: `
            <section data-test="certifications-section">
              <button data-test="add-certification" @click="$emit('add-certification')">
                Add certification
              </button>

              <div
                v-for="certification in certifications"
                :key="certification.id"
                data-test="certification-title"
              >
                {{ certification.title }}
              </div>
            </section>
          `,
        },

        PortfolioContact: {
          name: 'PortfolioContact',
          props: ['email', 'canedit', 'links'],
          template: '<footer data-test="portfolio-contact"></footer>',
        },

        ExperienceModal: {
          name: 'ExperienceModal',
          props: [
            'open',
            'mode',
            'type',
            'initialValue',
            'loading',
            'schoolOptions',
            'professorEmails',
          ],
          emits: ['close', 'submit'],
          template: `
            <div data-test="experience-modal">
              <button
                data-test="submit-experience"
                @click="$emit('submit', {
                  title: 'New Project From Test',
                  description: 'Created from test',
                  visibleToEveryone: true
                })"
              >
                Submit
              </button>
            </div>
          `,
        },

        BaseError: {
          name: 'BaseError',
          template: '<div data-test="base-error"><slot /></div>',
        },
      },
    },
  });
};

const getProjectsSection = (wrapper) => {
  return wrapper.findComponent({ name: 'ProjectsSection' });
};

const getActivitiesSection = (wrapper) => {
  return wrapper.findComponent({ name: 'ActivitiesSection' });
};

const getCertificationsSection = (wrapper) => {
  return wrapper.findComponent({ name: 'CertificationsSection' });
};

const getExperienceModal = (wrapper) => {
  return wrapper.findComponent({ name: 'ExperienceModal' });
};

describe('PortfolioView', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocked.route.params = {};

    mocked.authStore.user = {
      utilisateur_id: 12,
      email: 'student@test.com',
      twitter: '',
      instagram: '',
    };

    mocked.projectStore.loading = false;
    mocked.projectStore.createProject.mockReset();

    mocked.activityStore.loading = false;
    mocked.activityStore.createActivity.mockReset();
  });

  it('shows private projects and activities when the connected user owns the portfolio', () => {
    mocked.route.params = { id: '12' };

    const wrapper = mountView();

    const projectTitles = getProjectsSection(wrapper)
      .props('projects')
      .map((project) => project.title);

    const activityTitles = getActivitiesSection(wrapper)
      .props('activities')
      .map((activity) => activity.title);

    expect(projectTitles).toContain('BitrixFlow Workspace');
    expect(activityTitles).toContain('Morocco Social Tech Hackathon 2018: Smart Region');
  });

  it('hides private projects and activities when the connected user is only a visitor', () => {
    mocked.route.params = { id: '99' };

    const wrapper = mountView();

    const projectTitles = getProjectsSection(wrapper)
      .props('projects')
      .map((project) => project.title);

    const activityTitles = getActivitiesSection(wrapper)
      .props('activities')
      .map((activity) => activity.title);

    expect(projectTitles).not.toContain('BitrixFlow Workspace');
    expect(activityTitles).not.toContain('Morocco Social Tech Hackathon 2018: Smart Region');
  });

  it('allows the owner to add and edit portfolio sections', () => {
    mocked.route.params = { id: '12' };

    const wrapper = mountView();

    expect(getProjectsSection(wrapper).props('canAdd')).toBe(true);
    expect(getActivitiesSection(wrapper).props('canAdd')).toBe(true);
    expect(getCertificationsSection(wrapper).props('canAdd')).toBe(true);
    expect(getExperienceModal(wrapper).exists()).toBe(true);
  });

  it('prevents a visitor from adding or editing portfolio sections', async () => {
    mocked.route.params = { id: '99' };

    const wrapper = mountView();

    expect(getProjectsSection(wrapper).props('canAdd')).toBe(false);
    expect(getActivitiesSection(wrapper).props('canAdd')).toBe(false);
    expect(getCertificationsSection(wrapper).props('canAdd')).toBe(false);
    expect(getExperienceModal(wrapper).exists()).toBe(false);

    await getProjectsSection(wrapper).vm.$emit('add-project');

    expect(getExperienceModal(wrapper).exists()).toBe(false);
  });

  it('opens the experience modal in create project mode when the owner adds a project', async () => {
    mocked.route.params = { id: '12' };

    const wrapper = mountView();

    await getProjectsSection(wrapper).vm.$emit('add-project');

    const modal = getExperienceModal(wrapper);

    expect(modal.props('open')).toBe(true);
    expect(modal.props('type')).toBe('project');
    expect(modal.props('mode')).toBe('create');
    expect(modal.props('initialValue')).toBeNull();
  });

  it('opens the experience modal in edit project mode with the selected project', async () => {
    mocked.route.params = { id: '12' };

    const wrapper = mountView();

    const selectedProject = getProjectsSection(wrapper).props('projects')[0];

    await getProjectsSection(wrapper).vm.$emit('edit-project', selectedProject);

    const modal = getExperienceModal(wrapper);

    expect(modal.props('open')).toBe(true);
    expect(modal.props('type')).toBe('project');
    expect(modal.props('mode')).toBe('edit');
    expect(modal.props('initialValue')).toEqual(selectedProject);
  });

  it('calls createProject when submitting a new project', async () => {
    mocked.route.params = { id: '12' };

    const createdProject = {
      id: 'project-created-by-test',
      type: 'project',
      title: 'Created Project',
      description: 'Created successfully',
      visibleToEveryone: true,
      technologies: [],
      domains: [],
    };

    mocked.projectStore.createProject.mockResolvedValue(createdProject);

    const wrapper = mountView();

    await getProjectsSection(wrapper).vm.$emit('add-project');

    const submittedProject = {
      title: 'New Project From Test',
      description: 'Created from test',
      visibleToEveryone: true,
    };

    await getExperienceModal(wrapper).vm.$emit('submit', submittedProject);
    await flushPromises();

    expect(mocked.projectStore.createProject).toHaveBeenCalledTimes(1);
    expect(mocked.projectStore.createProject).toHaveBeenCalledWith(submittedProject);
  });

  it('shows an error message when project creation fails', async () => {
    mocked.route.params = { id: '12' };

    mocked.projectStore.createProject.mockRejectedValue({
      response: {
        data: {
          message: 'Project creation failed',
        },
      },
    });

    const wrapper = mountView();

    await getProjectsSection(wrapper).vm.$emit('add-project');

    await getExperienceModal(wrapper).vm.$emit('submit', {
      title: 'Invalid Project',
      description: 'This should fail',
      visibleToEveryone: true,
    });

    await flushPromises();

    expect(wrapper.find('[data-test="base-error"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="base-error"]').text()).toContain(
      'Project creation failed',
    );
  });
});