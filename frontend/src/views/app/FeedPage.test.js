import { defineComponent, nextTick } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import FeedPage from './FeedPage.vue';

const mocks = vi.hoisted(() => ({
  routerPush: vi.fn(),
  authStore: {},
  feedExperienceStore: {},
  feedOfferStore: {},
  feedStudentStore: {},
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mocks.routerPush,
  }),
}));

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mocks.authStore,
}));

vi.mock('@/stores/feedExperience', () => ({
  useFeedExperienceStore: () => mocks.feedExperienceStore,
}));

vi.mock('@/stores/feedOffer', () => ({
  useFeedOfferStore: () => mocks.feedOfferStore,
}));

vi.mock('@/stores/feedStudent', () => ({
  useFeedStudentStore: () => mocks.feedStudentStore,
}));

vi.mock('lucide-vue-next', () => ({
  Check: {
    name: 'Check',
    template: '<span data-test="icon-check" />',
  },
  Plus: {
    name: 'Plus',
    template: '<span data-test="icon-plus" />',
  },
  SearchX: {
    name: 'SearchX',
    template: '<span data-test="icon-search-x" />',
  },
}));

const SidebarStub = defineComponent({
  name: 'Sidebar',
  props: {
    user: {
      type: Object,
      default: () => ({}),
    },
  },
  template: `
    <aside
      data-test="sidebar"
      :data-role="user.role"
      :data-prenom="user.prenom"
      :data-nom="user.nom"
    />
  `,
});

const FeedHeaderStub = defineComponent({
  name: 'FeedHeader',
  template: '<header data-test="feed-header">Feed header</header>',
});

const FeedOffersCarouselStub = defineComponent({
  name: 'FeedOffersCarousel',
  props: {
    offers: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
  },
  emits: ['select-offer'],
  template: `
    <section data-test="offers-carousel">
      <h2 data-test="carousel-title">{{ title }}</h2>
      <p data-test="carousel-subtitle">{{ subtitle }}</p>

      <button
        v-for="item in offers"
        :key="item.id"
        type="button"
        data-test="carousel-item"
        :data-id="item.id"
        :data-carousel-type="item.carouselType"
        @click="$emit('select-offer', item)"
      >
        {{ item.title }}
      </button>
    </section>
  `,
});

const FeedProjectCardStub = defineComponent({
  name: 'FeedProjectCard',
  props: {
    project: {
      type: Object,
      required: true,
    },
  },
  emits: ['click', 'share', 'open-student'],
  template: `
    <article
      data-test="project-card"
      :data-id="project.id"
      :data-title="project.title"
      @click="$emit('click')"
    >
      <h3>{{ project.title }}</h3>
      <p>{{ project.description }}</p>
      <span>{{ project.studentName }}</span>

      <button
        type="button"
        data-test="share-project"
        @click.stop="$emit('share', project)"
      >
        Share
      </button>

      <button
        type="button"
        data-test="open-project-owner"
        @click.stop="$emit('open-student', project)"
      >
        Open student
      </button>
    </article>
  `,
});

const FeedFiltersPanelStub = defineComponent({
  name: 'FeedFiltersPanel',
  props: {
    filters: {
      type: Object,
      default: () => ({}),
    },
    search: {
      type: String,
      default: '',
    },
    technologies: {
      type: Array,
      default: () => [],
    },
    domains: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:filters', 'update:search', 'reset'],
  template: `
    <section data-test="filters-panel">
      <input
        data-test="filters-search"
        :value="search"
        @input="$emit('update:search', $event.target.value)"
      >

      <button
        type="button"
        data-test="sort-recent"
        @click="$emit('update:filters', { ...filters, sort: 'recent' })"
      >
        Sort recent
      </button>

      <button
        type="button"
        data-test="filter-vue"
        @click="$emit('update:filters', { ...filters, technology: 'Vue.js' })"
      >
        Filter Vue
      </button>

      <button
        type="button"
        data-test="reset-filters"
        @click="$emit('reset')"
      >
        Reset
      </button>
    </section>
  `,
});

const ShareProjectModalStub = defineComponent({
  name: 'ShareProjectModal',
  props: {
    project: {
      type: Object,
      default: null,
    },
  },
  emits: ['close'],
  template: `
    <div
      v-if="project"
      data-test="share-modal"
    >
      <span>{{ project.title }}</span>
      <button
        type="button"
        data-test="close-share-modal"
        @click="$emit('close')"
      >
        Close
      </button>
    </div>
  `,
});

const FeedOfferDetailModalStub = defineComponent({
  name: 'FeedOfferDetailModal',
  props: {
    offer: {
      type: Object,
      default: null,
    },
  },
  emits: ['close', 'apply'],
  template: `
    <div
      v-if="offer"
      data-test="offer-detail-modal"
    >
      <span>{{ offer.title }}</span>

      <button
        type="button"
        data-test="apply-offer"
        @click="$emit('apply', offer)"
      >
        Apply
      </button>

      <button
        type="button"
        data-test="close-offer-detail"
        @click="$emit('close')"
      >
        Close
      </button>
    </div>
  `,
});

const ApplyOfferModalStub = defineComponent({
  name: 'ApplyOfferModal',
  props: {
    offer: {
      type: Object,
      default: null,
    },
  },
  emits: ['close', 'submit'],
  template: `
    <div
      v-if="offer"
      data-test="apply-offer-modal"
    >
      <span>{{ offer.title }}</span>

      <button
        type="button"
        data-test="submit-application"
        @click="$emit('submit', { message: 'Interested in this offer.' })"
      >
        Submit application
      </button>

      <button
        type="button"
        data-test="close-apply-modal"
        @click="$emit('close')"
      >
        Close
      </button>
    </div>
  `,
});

function createProject(overrides = {}) {
  return {
    id: 1,
    title: 'Vue Portfolio',
    description: 'A Vue portfolio project',
    studentName: 'Nour Alami',
    schoolName: 'ENSA Tanger',
    type: 'projet',
    technologies: ['Vue.js'],
    domains: ['Web Frontend'],
    rankScore: 80,
    portfolioScore: 70,
    date: '2026-06-01',
    portfolioUserId: 101,
    ...overrides,
  };
}

function createProjects(count) {
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1;

    return createProject({
      id: number,
      title: `Project ${number}`,
      description: `Description ${number}`,
      rankScore: 100 - number,
      portfolioScore: number,
      date: `2026-05-${String(number).padStart(2, '0')}`,
      portfolioUserId: 1000 + number,
    });
  });
}

const suggestedStudents = [
  {
    id: 1,
    userId: 201,
    portfolioUserId: 301,
    initials: 'NA',
    name: 'Nour Alami',
    speciality: 'Frontend',
    stack: ['Vue.js', 'CSS'],
    technologies: ['Vue.js'],
    domains: ['Web Frontend'],
    schoolName: 'ENSA Tanger',
    portfolioScore: 82,
    rankScore: 70,
    isFollowing: false,
  },
  {
    id: 2,
    userId: 202,
    portfolioUserId: 302,
    initials: 'YA',
    name: 'Youssef Amrani',
    speciality: 'DevOps',
    stack: ['Docker'],
    technologies: ['Docker'],
    domains: ['DevOps & Cloud Infrastructure'],
    schoolName: 'ENSIAS',
    portfolioScore: 91,
    rankScore: 95,
    isFollowing: true,
  },
];

const studentsFromSchool = [
  {
    id: 3,
    userId: 203,
    portfolioUserId: 303,
    initials: 'SA',
    name: 'Sara Alaoui',
    speciality: 'Cybersecurity',
    stack: ['Security'],
    technologies: ['Security'],
    domains: ['Cybersecurity'],
    schoolName: 'ENSA Tanger',
    portfolioScore: 88,
    rankScore: 88,
    isFollowing: false,
  },
];

const offers = [
  {
    id: 11,
    title: 'Frontend Internship',
    company: 'Tech Corp',
    location: 'Tanger',
    duration: '3 months',
    level: 'Internship',
    technologies: ['Vue.js'],
    domains: ['Web Frontend'],
    description: 'Frontend internship description',
  },
];

function mountFeed() {
  return mount(FeedPage, {
    global: {
      stubs: {
        Sidebar: SidebarStub,
        FeedHeader: FeedHeaderStub,
        FeedOffersCarousel: FeedOffersCarouselStub,
        FeedProjectCard: FeedProjectCardStub,
        FeedFiltersPanel: FeedFiltersPanelStub,
        ShareProjectModal: ShareProjectModalStub,
        FeedOfferDetailModal: FeedOfferDetailModalStub,
        ApplyOfferModal: ApplyOfferModalStub,
      },
    },
  });
}

describe('FeedPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    mocks.routerPush.mockReset();

    mocks.authStore = {
      user: {
        prenom: 'Nour',
        nom: 'Bakkali',
        role: 'etudiant',
      },
    };

    mocks.feedExperienceStore = {
      items: [
        createProject({
          id: 1,
          title: 'Vue Portfolio',
          description: 'A Vue portfolio project',
          technologies: ['Vue.js'],
          rankScore: 70,
          date: '2026-06-01',
          portfolioUserId: 101,
        }),
        createProject({
          id: 2,
          title: 'Cyber Security Dashboard',
          description: 'A cybersecurity monitoring dashboard',
          technologies: ['Node.js'],
          domains: ['Cybersecurity'],
          rankScore: 90,
          date: '2026-06-05',
          portfolioUserId: 102,
        }),
        createProject({
          id: 3,
          title: 'DevOps Pipeline',
          description: 'Docker and CI/CD pipeline',
          technologies: ['Docker'],
          domains: ['DevOps & Cloud Infrastructure'],
          rankScore: 50,
          date: '2026-05-15',
          portfolioUserId: 103,
        }),
      ],
      loading: false,
      error: null,
      filterTechnologies: ['Vue.js', 'Node.js', 'Docker'],
      fetchFeedTechnologies: vi.fn(),
      fetchFeedExperiences: vi.fn(),
    };

    mocks.feedOfferStore = {
      offers,
      fetchFeedOffers: vi.fn(),
      applyToOffer: vi.fn().mockResolvedValue({ success: true }),
    };

    mocks.feedStudentStore = {
      suggestedStudents,
      studentsFromSchool,
      fetchFeedStudents: vi.fn(),
      toggleFollow: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('fetches feed data on mount', () => {
    mountFeed();

    expect(mocks.feedExperienceStore.fetchFeedTechnologies).toHaveBeenCalledTimes(1);

    expect(mocks.feedExperienceStore.fetchFeedExperiences).toHaveBeenCalledWith({
      search: undefined,
      source: undefined,
      sort: 'trending',
      technology: undefined,
      domain: undefined,
    });

    expect(mocks.feedOfferStore.fetchFeedOffers).toHaveBeenCalledTimes(1);
    expect(mocks.feedStudentStore.fetchFeedStudents).toHaveBeenCalledWith('suggested');
    expect(mocks.feedStudentStore.fetchFeedStudents).toHaveBeenCalledWith('school');
  });

  it('renders the student feed with opportunities and suggested students', () => {
    const wrapper = mountFeed();

    expect(wrapper.find('[data-test="sidebar"]').attributes('data-role')).toBe('etudiant');
    expect(wrapper.find('[data-test="carousel-title"]').text()).toBe('Recommended opportunities');
    expect(wrapper.text()).toContain('Suggested students');
    expect(wrapper.text()).toContain('Frontend Internship');
    expect(wrapper.text()).toContain('Nour Alami');
  });

  it('shows loading state', () => {
    mocks.feedExperienceStore.loading = true;

    const wrapper = mountFeed();

    expect(wrapper.text()).toContain('Chargement du feed...');
    expect(wrapper.findAll('[data-test="project-card"]')).toHaveLength(0);
  });

  it('shows error state', () => {
    mocks.feedExperienceStore.error = 'Erreur de chargement du feed';

    const wrapper = mountFeed();

    expect(wrapper.text()).toContain('Erreur de chargement du feed');
    expect(wrapper.findAll('[data-test="project-card"]')).toHaveLength(0);
  });

  it('shows empty state when there are no matching projects', () => {
    mocks.feedExperienceStore.items = [];

    const wrapper = mountFeed();

    expect(wrapper.text()).toContain('Aucun élément ne correspond à vos filtres.');
    expect(wrapper.findAll('[data-test="project-card"]')).toHaveLength(0);
  });

  it('renders projects sorted by trending score by default', () => {
    const wrapper = mountFeed();

    const cards = wrapper.findAll('[data-test="project-card"]');

    expect(cards).toHaveLength(3);
    expect(cards[0].attributes('data-title')).toBe('Cyber Security Dashboard');
    expect(cards[1].attributes('data-title')).toBe('Vue Portfolio');
    expect(cards[2].attributes('data-title')).toBe('DevOps Pipeline');
  });

  it('filters projects by search and fetches again after debounce', async () => {
    const wrapper = mountFeed();

    mocks.feedExperienceStore.fetchFeedExperiences.mockClear();

    await wrapper.find('[data-test="filters-search"]').setValue('cyber');
    await nextTick();

    const cards = wrapper.findAll('[data-test="project-card"]');

    expect(cards).toHaveLength(1);
    expect(cards[0].attributes('data-title')).toBe('Cyber Security Dashboard');

    vi.advanceTimersByTime(350);
    await nextTick();

    expect(mocks.feedExperienceStore.fetchFeedExperiences).toHaveBeenCalledWith({
      search: 'cyber',
      source: undefined,
      sort: 'trending',
      technology: undefined,
      domain: undefined,
    });
  });

  it('updates filters and sends filter params after debounce', async () => {
    const wrapper = mountFeed();

    mocks.feedExperienceStore.fetchFeedExperiences.mockClear();

    await wrapper.find('[data-test="filter-vue"]').trigger('click');
    await nextTick();

    vi.advanceTimersByTime(350);
    await nextTick();

    expect(mocks.feedExperienceStore.fetchFeedExperiences).toHaveBeenCalledWith({
      search: undefined,
      source: undefined,
      sort: 'trending',
      technology: 'Vue.js',
      domain: undefined,
    });
  });

  it('sorts projects by recent when filter changes', async () => {
    const wrapper = mountFeed();

    await wrapper.find('[data-test="sort-recent"]').trigger('click');
    await nextTick();

    const cards = wrapper.findAll('[data-test="project-card"]');

    expect(cards[0].attributes('data-title')).toBe('Cyber Security Dashboard');
    expect(cards[1].attributes('data-title')).toBe('Vue Portfolio');
    expect(cards[2].attributes('data-title')).toBe('DevOps Pipeline');
  });

  it('limits visible projects to 20 then loads 10 more', async () => {
    mocks.feedExperienceStore.items = createProjects(25);

    const wrapper = mountFeed();

    expect(wrapper.findAll('[data-test="project-card"]')).toHaveLength(20);
    expect(wrapper.find('.load-more-button').exists()).toBe(true);

    await wrapper.find('.load-more-button').trigger('click');

    expect(wrapper.findAll('[data-test="project-card"]')).toHaveLength(25);
    expect(wrapper.find('.load-more-button').exists()).toBe(false);
  });

  it('opens project detail route when clicking a project owned by another student', async () => {
    const wrapper = mountFeed();

    await wrapper.find('[data-test="project-card"]').trigger('click');

    expect(mocks.routerPush).toHaveBeenCalledWith({
      name: 'portfolio-experience',
      params: {
        id: 102,
        experienceId: 2,
      },
    });
  });

  it('opens my portfolio experience route when project has no owner id', async () => {
    mocks.feedExperienceStore.items = [
      createProject({
        id: 55,
        title: 'My Local Project',
        portfolioUserId: undefined,
        userId: undefined,
        utilisateur_id: undefined,
        etudiant_id: undefined,
      }),
    ];

    const wrapper = mountFeed();

    await wrapper.find('[data-test="project-card"]').trigger('click');

    expect(mocks.routerPush).toHaveBeenCalledWith({
      name: 'my-portfolio-experience',
      params: {
        experienceId: 55,
      },
    });
  });

  it('opens and closes share modal from project card', async () => {
    const wrapper = mountFeed();

    await wrapper.find('[data-test="share-project"]').trigger('click');

    expect(wrapper.find('[data-test="share-modal"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="share-modal"]').text()).toContain('Cyber Security Dashboard');

    await wrapper.find('[data-test="close-share-modal"]').trigger('click');

    expect(wrapper.find('[data-test="share-modal"]').exists()).toBe(false);
  });

  it('opens project owner portfolio from project card', async () => {
    const wrapper = mountFeed();

    await wrapper.find('[data-test="open-project-owner"]').trigger('click');

    expect(mocks.routerPush).toHaveBeenCalledWith('/portfolio/102');
  });

  it('toggles follow from suggested students sidebar', async () => {
    const wrapper = mountFeed();

    const followButtons = wrapper.findAll('.follow-mini-button');

    await followButtons[0].trigger('click');

    expect(mocks.feedStudentStore.toggleFollow).toHaveBeenCalledWith(suggestedStudents[0]);
  });

  it('opens suggested student portfolio from sidebar name', async () => {
    const wrapper = mountFeed();

    await wrapper.find('.suggested-name-button').trigger('click');

    expect(mocks.routerPush).toHaveBeenCalledWith('/portfolio/301');
  });

  it('opens offer detail, applies, then closes apply modal after successful submit', async () => {
    const wrapper = mountFeed();

    await wrapper.find('[data-test="carousel-item"]').trigger('click');

    expect(wrapper.find('[data-test="offer-detail-modal"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Frontend Internship');

    await wrapper.find('[data-test="apply-offer"]').trigger('click');

    expect(wrapper.find('[data-test="offer-detail-modal"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="apply-offer-modal"]').exists()).toBe(true);

    await wrapper.find('[data-test="submit-application"]').trigger('click');
    await flushPromises();

    expect(mocks.feedOfferStore.applyToOffer).toHaveBeenCalledWith(11, {
      message: 'Interested in this offer.',
    });

    expect(wrapper.find('[data-test="apply-offer-modal"]').exists()).toBe(false);
  });

  it('renders recruiter version with top students and add offer button', () => {
    mocks.authStore.user.role = 'professionnel';

    const wrapper = mountFeed();

    expect(wrapper.find('[data-test="carousel-title"]').text()).toBe('Top students');
    expect(wrapper.text()).toContain('Featured candidates');
    expect(wrapper.text()).toContain('Add offer');

    const carouselItems = wrapper.findAll('[data-test="carousel-item"]');

    expect(carouselItems[0].text()).toBe('Youssef Amrani');
    expect(carouselItems[0].attributes('data-carousel-type')).toBe('student-profile');
  });

  it('renders professor version with students from school', () => {
    mocks.authStore.user.role = 'professeur';

    const wrapper = mountFeed();

    expect(wrapper.find('[data-test="carousel-title"]').text()).toBe('Top students');
    expect(wrapper.text()).toContain('Students from your school');
    expect(wrapper.text()).toContain('Sara Alaoui');
    expect(wrapper.text()).not.toContain('Add offer');
  });

  it('resets filters and search when reset is emitted', async () => {
    const wrapper = mountFeed();

    await wrapper.find('[data-test="filters-search"]').setValue('cyber');
    await nextTick();

    expect(wrapper.findAll('[data-test="project-card"]')).toHaveLength(1);

    await wrapper.find('[data-test="reset-filters"]').trigger('click');
    await nextTick();

    expect(wrapper.findAll('[data-test="project-card"]')).toHaveLength(3);
  });
});