import { defineComponent, nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PortfolioView from './PortfolioView.vue';

const mocks = vi.hoisted(() => ({
  route: {
    params: {
      id: '1',
    },
  },
  router: {
    replace: vi.fn(),
  },
  authStore: {
    user: {
      utilisateur_id: 1,
      firstName: 'Nour',
      lastName: 'Bakkali',
      email: 'nour@test.com',
      role: 'etudiant',
    },
    profileLoading: false,
    profileChecked: true,
  },
  portfolioStore: {
    portfolio: null,
    loading: false,
    error: '',
    fetchPortfolio: vi.fn(),
  },
  institutionStore: {
    institutions: [],
    fetchInstitutions: vi.fn(),
    setSchoolPath: vi.fn(),
  },
  projectStore: {
    loading: false,
    createProject: vi.fn(),
    editProject: vi.fn(),
    deleteProject: vi.fn(),
  },
  activityStore: {
    loading: false,
    createActivity: vi.fn(),
    editActivity: vi.fn(),
    deleteActivity: vi.fn(),
  },
  certificationStore: {
    loading: false,
    createCertification: vi.fn(),
    editCertification: vi.fn(),
    deleteCertification: vi.fn(),
  },
  internshipStore: {
    loading: false,
    createInternship: vi.fn(),
    editInternship: vi.fn(),
    deleteInternship: vi.fn(),
  },
  api: {
    post: vi.fn(),
  },
}));

vi.mock('vue-router', () => ({
  useRoute: () => mocks.route,
  useRouter: () => mocks.router,
}));

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mocks.authStore,
}));

vi.mock('@/stores/portfolio', () => ({
  usePortfolioStore: () => mocks.portfolioStore,
}));

vi.mock('@/stores/institution', () => ({
  useInstitutionStore: () => mocks.institutionStore,
}));

vi.mock('@/stores/project', () => ({
  useProjectStore: () => mocks.projectStore,
}));

vi.mock('@/stores/activity', () => ({
  useActivityStore: () => mocks.activityStore,
}));

vi.mock('@/stores/certification', () => ({
  useCertificationStore: () => mocks.certificationStore,
}));

vi.mock('@/stores/internship', () => ({
  useInternshipStore: () => mocks.internshipStore,
}));

vi.mock('@/services/api', () => ({
  default: mocks.api,
}));

const AboutMeStub = defineComponent({
  name: 'AboutMe',
  props: ['userId'],
  template: '<section data-test="about-me">About me</section>',
});

const PortfolioEducationStub = defineComponent({
  name: 'PortfolioEducation',
  props: ['userId', 'items', 'canAdd'],
  emits: ['add-education'],
  template: '<section data-test="education">Education</section>',
});

const PortfolioSkillsStub = defineComponent({
  name: 'PortfolioSkills',
  props: ['userId', 'skills', 'domains'],
  template: '<section data-test="skills">Skills</section>',
});

const ProjectsSectionStub = defineComponent({
  name: 'ProjectsSection',
  props: {
    projects: {
      type: Array,
      default: () => [],
    },
    canAdd: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['add-project', 'edit-project'],
  template: `
    <section data-test="projects-section">
      <button data-test="add-project" @click="$emit('add-project')">
        Add project
      </button>
    </section>
  `,
});

const InternshipsSectionStub = defineComponent({
  name: 'InternshipsSection',
  props: ['internships', 'canAdd'],
  emits: ['add-internship', 'edit-internship'],
  template: '<section data-test="internships-section">Internships</section>',
});

const ActivitiesSectionStub = defineComponent({
  name: 'ActivitiesSection',
  props: ['activities', 'canAdd'],
  emits: ['add-activity', 'edit-activity', 'update-max-card-height'],
  template: '<section data-test="activities-section">Activities</section>',
});

const CertificationsSectionStub = defineComponent({
  name: 'CertificationsSection',
  props: ['certifications', 'canAdd', 'maxCardHeight'],
  emits: ['add-certification', 'edit-certification'],
  template: '<section data-test="certifications-section">Certifications</section>',
});

const RecommendationsSectionStub = defineComponent({
  name: 'RecommendationsSection',
  props: {
    recommendations: {
      type: Array,
      default: () => [],
    },
    isOwner: {
      type: Boolean,
      default: false,
    },
  },
  template: `
    <section data-test="recommendations-section">
      <p
        v-for="recommendation in recommendations"
        :key="recommendation.id"
      >
        {{ recommendation.content || recommendation.message || recommendation.authorName }}
      </p>
    </section>
  `,
});

const PortfolioContactStub = defineComponent({
  name: 'PortfolioContact',
  props: ['email', 'canedit', 'userId', 'links'],
  emits: ['link-updated'],
  template: '<footer data-test="portfolio-contact">Contact</footer>',
});

const QRcodeModalStub = defineComponent({
  name: 'QRcodeModal',
  props: ['open', 'title', 'username'],
  emits: ['close'],
  template: '<div data-test="qr-modal" v-if="open">QR modal</div>',
});

const PortfolioRecommendationModalStub = defineComponent({
  name: 'PortfolioRecommendationModal',
  props: ['open', 'portfolioOwnerName', 'recommenderName', 'recommenderRole'],
  emits: ['close', 'submit'],
  template: `
    <div data-test="recommendation-modal" v-if="open">
      <button
        data-test="submit-recommendation"
        @click="$emit('submit', { content: 'Excellent portfolio.' })"
      >
        Submit recommendation
      </button>
    </div>
  `,
});

const ExperienceModalStub = defineComponent({
  name: 'ExperienceModal',
  props: ['open', 'mode', 'type', 'initialValue', 'loading', 'schoolOptions', 'professorEmails'],
  emits: ['close', 'submit', 'delete'],
  template: '<div data-test="experience-modal" v-if="open">Experience modal</div>',
});

const ConfirmDialogStub = defineComponent({
  name: 'ConfirmDialog',
  props: ['open', 'title', 'message', 'confirmText', 'loading'],
  emits: ['cancel', 'confirm'],
  template: '<div data-test="confirm-dialog" v-if="open">Confirm dialog</div>',
});

const SchoolPathModalStub = defineComponent({
  name: 'SchoolPathModal',
  props: ['open', 'schools'],
  emits: ['close', 'complete'],
  template: '<div data-test="school-modal" v-if="open">School modal</div>',
});

const ImageCropperModalStub = defineComponent({
  name: 'ImageCropperModal',
  props: ['open', 'file', 'title', 'outputWidth', 'outputHeight'],
  emits: ['close', 'crop'],
  template: '<div data-test="image-cropper" v-if="open">Cropper</div>',
});

const BaseNotificationStub = defineComponent({
  name: 'BaseNotification',
  props: ['message', 'type'],
  emits: ['close'],
  template: '<div data-test="notification" v-if="message">{{ message }}</div>',
});

const BaseErrorStub = defineComponent({
  name: 'BaseError',
  template: '<div data-test="base-error"><slot /></div>',
});

const AiOrbStub = defineComponent({
  name: 'AiOrb',
  emits: ['filters-detected'],
  template: '<div data-test="ai-orb">AI</div>',
});

function createPortfolio(overrides = {}) {
  return {
    id: 1,
    headline: 'Full Stack Developer',
    school: 'ENSA Tanger',
    user: {
      firstName: 'Nour',
      lastName: 'Bakkali',
      email: 'nour@test.com',
      photo: '',
      github: 'https://github.com/nour',
      linkedin: 'https://linkedin.com/in/nour',
    },
    portfolio: {
      score_credibilite: 82,
      interactions: [{ id: 1 }, { id: 2 }],
    },
    recommendations: [
      {
        id: 'rec-1',
        authorName: 'Professor A',
        content: 'Strong technical profile.',
        status: 'valide',
      },
      {
        id: 'rec-2',
        authorName: 'Hidden Recommendation',
        content: 'Should not be visible.',
        status: 'refuse',
      },
    ],
    education: [{ id: 1, school: 'ENSA Tanger' }],
    skills: [{ id: 1, name: 'Vue.js' }],
    domains: [{ id: 1, name: 'Web Development' }],
    projects: [
      {
        id: 'hidden-project',
        title: 'Hidden Project',
        effectiveVisibleToEveryone: false,
        highlighted: true,
        score: 100,
        date: '2026-05-01',
      },
      {
        id: 'highlighted-project',
        title: 'Highlighted Project',
        effectiveVisibleToEveryone: true,
        highlighted: true,
        score: 80,
        date: '2026-02-01',
      },
      {
        id: 'recent-project',
        title: 'Recent Project',
        effectiveVisibleToEveryone: true,
        highlighted: false,
        score: 20,
        date: '2026-06-01',
      },
    ],
    activities: [],
    certifications: [],
    internships: [],
    ...overrides,
  };
}

function mountPortfolioView() {
  return mount(PortfolioView, {
    global: {
      stubs: {
        AboutMe: AboutMeStub,
        PortfolioEducation: PortfolioEducationStub,
        PortfolioSkills: PortfolioSkillsStub,
        ProjectsSection: ProjectsSectionStub,
        InternshipsSection: InternshipsSectionStub,
        ActivitiesSection: ActivitiesSectionStub,
        CertificationsSection: CertificationsSectionStub,
        RecommendationsSection: RecommendationsSectionStub,
        PortfolioContact: PortfolioContactStub,
        QRcodeModal: QRcodeModalStub,
        PortfolioRecommendationModal: PortfolioRecommendationModalStub,
        ExperienceModal: ExperienceModalStub,
        ConfirmDialog: ConfirmDialogStub,
        SchoolPathModal: SchoolPathModalStub,
        ImageCropperModal: ImageCropperModalStub,
        BaseNotification: BaseNotificationStub,
        BaseError: BaseErrorStub,
        AiOrb: AiOrbStub,
      },
    },
  });
}

describe('PortfolioView', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.route.params = {
      id: '1',
    };

    mocks.authStore.user = {
      utilisateur_id: 1,
      firstName: 'Nour',
      lastName: 'Bakkali',
      email: 'nour@test.com',
      role: 'etudiant',
    };
    mocks.authStore.profileLoading = false;
    mocks.authStore.profileChecked = true;

    mocks.portfolioStore.portfolio = createPortfolio();
    mocks.portfolioStore.loading = false;
    mocks.portfolioStore.error = '';
    mocks.portfolioStore.fetchPortfolio.mockResolvedValue();

    mocks.institutionStore.institutions = [];
    mocks.institutionStore.fetchInstitutions.mockResolvedValue();

    mocks.router.replace.mockClear();
  });

  it('fetches the portfolio and displays the main profile information', async () => {
    const wrapper = mountPortfolioView();

    await flushPromises();

    expect(mocks.institutionStore.fetchInstitutions).toHaveBeenCalledTimes(1);
    expect(mocks.portfolioStore.fetchPortfolio).toHaveBeenCalledWith('1');

    expect(wrapper.text()).toContain('Nour Bakkali');
    expect(wrapper.text()).toContain('Full Stack Developer at ENSA Tanger');
    expect(wrapper.text()).toContain('Followers');
    expect(wrapper.text()).toContain('2');
    expect(wrapper.text()).toContain('Recommendations');
    expect(wrapper.text()).toContain('1');
    expect(wrapper.text()).toContain('Score');
    expect(wrapper.text()).toContain('82');
  });

  it('filters private experiences on a public portfolio and disables owner actions', async () => {
    mocks.route.params = {
      id: '99',
    };

    mocks.authStore.user = {
      utilisateur_id: 1,
      firstName: 'Visitor',
      lastName: 'User',
      email: 'visitor@test.com',
      role: 'etudiant',
    };

    mocks.portfolioStore.portfolio = createPortfolio({
      id: 99,
      user: {
        firstName: 'Public',
        lastName: 'Student',
        email: 'public@test.com',
      },
    });

    const wrapper = mountPortfolioView();

    await flushPromises();

    const projectsSection = wrapper.findComponent(ProjectsSectionStub);

    expect(projectsSection.exists()).toBe(true);
    expect(projectsSection.props('canAdd')).toBe(false);
    expect(projectsSection.props('projects').map((project) => project.id)).toEqual([
      'highlighted-project',
      'recent-project',
    ]);

    expect(wrapper.text()).toContain('Follow');
    expect(wrapper.text()).toContain('Recommend');
    expect(wrapper.findComponent(ExperienceModalStub).exists()).toBe(false);
  });

  it('keeps private experiences for the owner and opens the create project modal', async () => {
    const wrapper = mountPortfolioView();

    await flushPromises();

    const projectsSection = wrapper.findComponent(ProjectsSectionStub);

    expect(projectsSection.props('canAdd')).toBe(true);
    expect(projectsSection.props('projects').map((project) => project.id)).toEqual([
  'highlighted-project',
  'recent-project',
  'hidden-project',
]);

   expect(wrapper.find('.follow-button').exists()).toBe(false);
expect(wrapper.find('.recommend-button').exists()).toBe(false);

    await wrapper.find('[data-test="add-project"]').trigger('click');
    await nextTick();

    const experienceModal = wrapper.findComponent(ExperienceModalStub);

    expect(experienceModal.exists()).toBe(true);
    expect(experienceModal.props('open')).toBe(true);
    expect(experienceModal.props('type')).toBe('project');
    expect(experienceModal.props('mode')).toBe('create');
  });

  it('allows a visitor to submit a local recommendation', async () => {
    mocks.route.params = {
      id: '99',
    };

    mocks.authStore.user = {
      utilisateur_id: 1,
      firstName: 'Visitor',
      lastName: 'User',
      email: 'visitor@test.com',
      role: 'etudiant',
    };

    mocks.portfolioStore.portfolio = createPortfolio({
      id: 99,
      user: {
        firstName: 'Public',
        lastName: 'Student',
        email: 'public@test.com',
      },
      recommendations: [],
    });

    const wrapper = mountPortfolioView();

    await flushPromises();

    await wrapper.find('.recommend-button').trigger('click');
    await nextTick();

    expect(wrapper.find('[data-test="recommendation-modal"]').exists()).toBe(true);

    await wrapper.find('[data-test="submit-recommendation"]').trigger('click');
    await nextTick();

    const recommendationsSection = wrapper.findComponent(RecommendationsSectionStub);
    const recommendations = recommendationsSection.props('recommendations');

    expect(recommendations[0]).toMatchObject({
      authorName: 'Visitor User',
      authorRole: 'Student',
      content: 'Excellent portfolio.',
      status: 'valide',
      portfolioOwnerId: '99',
    });

    expect(wrapper.find('[data-test="recommendation-modal"]').exists()).toBe(false);
  });

  it('redirects to not-found when the portfolio does not exist', async () => {
    mocks.route.params = {
      id: '404',
    };

    mocks.portfolioStore.portfolio = null;
    mocks.portfolioStore.fetchPortfolio.mockRejectedValueOnce({
      response: {
        status: 404,
      },
    });

    mountPortfolioView();

    await flushPromises();

    expect(mocks.router.replace).toHaveBeenCalledWith({
      name: 'not-found',
    });
  });
});