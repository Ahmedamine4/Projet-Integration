import { defineComponent, nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Feed from './FeedPage.vue';

const routerPushMock = vi.hoisted(() => vi.fn());

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: routerPushMock,
  }),
}));

vi.mock('lucide-vue-next', () => ({
  Check: {
    name: 'Check',
    props: ['size', 'strokeWidth'],
    template: '<svg data-test="check-icon" />',
  },
  Plus: {
    name: 'Plus',
    props: ['size', 'strokeWidth'],
    template: '<svg data-test="plus-icon" />',
  },
  SearchX: {
    name: 'SearchX',
    props: ['size'],
    template: '<svg data-test="search-x-icon" />',
  },
}));

const SidebarStub = defineComponent({
  name: 'Sidebar',
  props: {
    user: {
      type: Object,
      default: null,
    },
  },
  template: `
    <aside
      data-test="sidebar"
      :data-user-role="user?.role || ''"
    >
      {{ user?.prenom }} {{ user?.nom }}
    </aside>
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
    <section
      data-test="offers-carousel"
      :data-title="title"
      :data-subtitle="subtitle"
    >
      <h2>{{ title }}</h2>
      <p>{{ subtitle }}</p>

      <article
        v-for="offer in offers"
        :key="offer.id"
        data-test="carousel-item"
        :data-title="offer.title"
        :data-type="offer.carouselType"
        @click="$emit('select-offer', offer)"
      >
        {{ offer.title }}
      </article>

      <button
        type="button"
        data-test="select-custom-offer"
        @click="$emit('select-offer', {
          id: 99,
          title: 'Frontend Developer Intern',
          company: 'Capgemini',
          location: 'Casablanca',
          duration: '6 months',
          level: 'Internship',
          technologies: ['Vue 3'],
          description: 'Offer description',
          carouselType: 'offer'
        })"
      >
        Select custom offer
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
      :data-id="String(project.id)"
      :data-title="project.title"
      :data-student="project.studentName"
      @click="$emit('click')"
    >
      <h3>{{ project.title }}</h3>
      <p>{{ project.studentName }}</p>

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
        Open owner
      </button>
    </article>
  `,
});

const FeedFiltersPanelStub = defineComponent({
  name: 'FeedFiltersPanel',
  props: {
    filters: {
      type: Object,
      required: true,
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
    <section
      data-test="filters-panel"
      :data-search="search"
      :data-source="filters.source"
      :data-sort="filters.sort"
      :data-technology="filters.technology || ''"
      :data-domain="filters.domain || ''"
    >
      <button
        type="button"
        data-test="search-campus"
        @click="$emit('update:search', 'Campus Event')"
      >
        Search Campus Event
      </button>

      <button
        type="button"
        data-test="search-empty"
        @click="$emit('update:search', 'zzzzzz')"
      >
        Search empty
      </button>

      <button
        type="button"
        data-test="filter-same-school"
        @click="$emit('update:filters', { ...filters, source: 'same-school' })"
      >
        Same school
      </button>

      <button
        type="button"
        data-test="filter-following"
        @click="$emit('update:filters', { ...filters, source: 'following' })"
      >
        Following
      </button>

      <button
        type="button"
        data-test="filter-vue"
        @click="$emit('update:filters', { ...filters, technology: 'Vue3' })"
      >
        Vue
      </button>

      <button
        type="button"
        data-test="filter-mobile"
        @click="$emit('update:filters', { ...filters, domain: 'Mobile' })"
      >
        Mobile
      </button>

      <button
        type="button"
        data-test="sort-recent"
        @click="$emit('update:filters', { ...filters, sort: 'recent' })"
      >
        Recent
      </button>

      <button
        type="button"
        data-test="sort-portfolio"
        @click="$emit('update:filters', { ...filters, sort: 'portfolio-score' })"
      >
        Portfolio score
      </button>

      <button
        type="button"
        data-test="reset-filters"
        @click="$emit('reset')"
      >
        Reset
      </button>

      <div data-test="technologies-list">
        <span
          v-for="technology in technologies"
          :key="technology"
        >
          {{ technology }}
        </span>
      </div>

      <div data-test="domains-list">
        <span
          v-for="domain in domains"
          :key="domain"
        >
          {{ domain }}
        </span>
      </div>
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
      data-test="share-project-modal"
      :data-title="project.title"
    >
      <button
        type="button"
        data-test="close-share-modal"
        @click="$emit('close')"
      >
        Close share
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
      :data-title="offer.title"
    >
      <button
        type="button"
        data-test="close-offer-detail"
        @click="$emit('close')"
      >
        Close offer
      </button>

      <button
        type="button"
        data-test="apply-offer"
        @click="$emit('apply', offer)"
      >
        Apply
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
      :data-title="offer.title"
    >
      <button
        type="button"
        data-test="close-apply-offer"
        @click="$emit('close')"
      >
        Close apply
      </button>

      <button
        type="button"
        data-test="submit-apply-offer"
        @click="$emit('submit', { message: 'I am interested' })"
      >
        Submit apply
      </button>
    </div>
  `,
});

function mountFeed() {
  return mount(Feed, {
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

function getProjectTitles(wrapper) {
  return wrapper
    .findAll('[data-test="project-card"]')
    .map((card) => card.attributes('data-title'));
}

describe('Feed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('renders the main feed layout', () => {
    const wrapper = mountFeed();

    expect(wrapper.find('[data-test="sidebar"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="sidebar"]').text()).toContain('Wissam Bakkali');
    expect(wrapper.find('[data-test="sidebar"]').attributes('data-user-role')).toBe('professeur');

    expect(wrapper.find('[data-test="feed-header"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="offers-carousel"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="filters-panel"]').exists()).toBe(true);
  });

  it('renders professor feed configuration', () => {
    const wrapper = mountFeed();

    expect(wrapper.text()).toContain('Top students');
    expect(wrapper.text()).toContain('Discover high-performing students from your school.');
    expect(wrapper.text()).toContain('Students from your school');
    expect(wrapper.text()).toContain('Profiles you may want to follow.');

    expect(wrapper.find('.feed-add-offer-button').exists()).toBe(false);
  });

  it('renders top students in the carousel for professor role', () => {
    const wrapper = mountFeed();

    const carouselItems = wrapper.findAll('[data-test="carousel-item"]');

    expect(carouselItems).toHaveLength(3);
    expect(carouselItems[0].attributes('data-title')).toBe('Yassine Karim');
    expect(carouselItems[0].attributes('data-type')).toBe('student-profile');
    expect(carouselItems[1].attributes('data-title')).toBe('Sara Idrissi');
    expect(carouselItems[2].attributes('data-title')).toBe('Amal Benali');
  });

  it('renders students from school in the left sidebar', () => {
    const wrapper = mountFeed();

    expect(wrapper.text()).toContain('Amine Kettani');
    expect(wrapper.text()).toContain('Youssef Benmoussa');
    expect(wrapper.text()).toContain('Nour Berrada');

    expect(wrapper.text()).not.toContain('Sara IdrissiFrontend Developer');
  });

  it('toggles follow state for a sidebar student', async () => {
    const wrapper = mountFeed();

    const firstFollowButton = wrapper.findAll('.follow-mini-button')[0];

    expect(firstFollowButton.attributes('aria-label')).toBe('Follow Amine Kettani');
    expect(firstFollowButton.classes()).not.toContain('is-following');

    await firstFollowButton.trigger('click');

    expect(firstFollowButton.attributes('aria-label')).toBe('Following Amine Kettani');
    expect(firstFollowButton.classes()).toContain('is-following');
    expect(firstFollowButton.text()).toContain('Following');
  });

  it('opens a sidebar student portfolio', async () => {
    const wrapper = mountFeed();

    const firstStudentButton = wrapper.findAll('.suggested-name-button')[0];

    await firstStudentButton.trigger('click');

    expect(routerPushMock).toHaveBeenCalledWith('/portfolio/4');
  });

  it('renders projects sorted by trending by default', () => {
    const wrapper = mountFeed();

    expect(getProjectTitles(wrapper)).toEqual([
      'SmartStudyRoom Platform',
      'AI Portfolio Recommendation System',
      'Campus Event Aggregator',
    ]);
  });

  it('opens project detail when clicking a project card', async () => {
    const wrapper = mountFeed();

    await wrapper.findAll('[data-test="project-card"]')[0].trigger('click');

    expect(routerPushMock).toHaveBeenCalledWith({
      name: 'portfolio-experience',
      params: {
        id: 4,
        experienceId: 'cmq2w34ze000dug4a8r9byuqb',
      },
    });
  });

  it('opens project owner portfolio when project card emits open-student', async () => {
    const wrapper = mountFeed();

    await wrapper.findAll('[data-test="open-project-owner"]')[1].trigger('click');

    expect(routerPushMock).toHaveBeenCalledWith('/portfolio/2');
  });

  it('opens and closes share project modal', async () => {
    const wrapper = mountFeed();

    await wrapper.findAll('[data-test="share-project"]')[0].trigger('click');

    expect(wrapper.find('[data-test="share-project-modal"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="share-project-modal"]').attributes('data-title')).toBe(
      'SmartStudyRoom Platform'
    );

    await wrapper.find('[data-test="close-share-modal"]').trigger('click');

    expect(wrapper.find('[data-test="share-project-modal"]').exists()).toBe(false);
  });

  it('filters projects with search', async () => {
    const wrapper = mountFeed();

    await wrapper.find('[data-test="search-campus"]').trigger('click');
    await nextTick();

    expect(getProjectTitles(wrapper)).toEqual(['Campus Event Aggregator']);
  });

  it('shows empty state when no project matches search', async () => {
    const wrapper = mountFeed();

    await wrapper.find('[data-test="search-empty"]').trigger('click');
    await nextTick();

    expect(wrapper.findAll('[data-test="project-card"]')).toHaveLength(0);
    expect(wrapper.find('.feed-empty').exists()).toBe(true);
    expect(wrapper.find('[data-test="search-x-icon"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Aucun élément ne correspond à vos filtres.');
  });

  it('filters projects by same school source', async () => {
    const wrapper = mountFeed();

    await wrapper.find('[data-test="filter-same-school"]').trigger('click');
    await nextTick();

    expect(getProjectTitles(wrapper)).toEqual([
      'SmartStudyRoom Platform',
      'Campus Event Aggregator',
    ]);
  });

  it('filters projects by following source', async () => {
    const wrapper = mountFeed();

    await wrapper.find('[data-test="filter-following"]').trigger('click');
    await nextTick();

    expect(getProjectTitles(wrapper)).toEqual([
      'AI Portfolio Recommendation System',
    ]);
  });

  it('filters projects by technology with normalized value', async () => {
    const wrapper = mountFeed();

    await wrapper.find('[data-test="filter-vue"]').trigger('click');
    await nextTick();

    expect(getProjectTitles(wrapper)).toEqual([
      'SmartStudyRoom Platform',
    ]);
  });

  it('filters projects by domain with partial normalized value', async () => {
    const wrapper = mountFeed();

    await wrapper.find('[data-test="filter-mobile"]').trigger('click');
    await nextTick();

    expect(getProjectTitles(wrapper)).toEqual([
      'Campus Event Aggregator',
    ]);
  });

  it('sorts projects by recent date', async () => {
    const wrapper = mountFeed();

    await wrapper.find('[data-test="sort-recent"]').trigger('click');
    await nextTick();

    expect(getProjectTitles(wrapper)).toEqual([
      'AI Portfolio Recommendation System',
      'SmartStudyRoom Platform',
      'Campus Event Aggregator',
    ]);
  });

  it('sorts projects by portfolio score', async () => {
    const wrapper = mountFeed();

    await wrapper.find('[data-test="sort-portfolio"]').trigger('click');
    await nextTick();

    expect(getProjectTitles(wrapper)).toEqual([
      'AI Portfolio Recommendation System',
      'SmartStudyRoom Platform',
      'Campus Event Aggregator',
    ]);
  });

  it('resets filters and search', async () => {
    const wrapper = mountFeed();

    await wrapper.find('[data-test="search-campus"]').trigger('click');
    await nextTick();

    expect(getProjectTitles(wrapper)).toEqual(['Campus Event Aggregator']);

    await wrapper.find('[data-test="reset-filters"]').trigger('click');
    await nextTick();

    expect(getProjectTitles(wrapper)).toEqual([
      'SmartStudyRoom Platform',
      'AI Portfolio Recommendation System',
      'Campus Event Aggregator',
    ]);

    expect(wrapper.find('[data-test="filters-panel"]').attributes('data-search')).toBe('');
    expect(wrapper.find('[data-test="filters-panel"]').attributes('data-source')).toBe('all');
    expect(wrapper.find('[data-test="filters-panel"]').attributes('data-sort')).toBe('trending');
  });

  it('does not open offer detail when clicking a professor carousel student profile', async () => {
    const wrapper = mountFeed();

    await wrapper.findAll('[data-test="carousel-item"]')[0].trigger('click');
    await nextTick();

    expect(wrapper.find('[data-test="offer-detail-modal"]').exists()).toBe(false);
    expect(routerPushMock).not.toHaveBeenCalled();
  });

  it('opens offer detail, applies, then closes application modal on submit', async () => {
    const wrapper = mountFeed();

    await wrapper.find('[data-test="select-custom-offer"]').trigger('click');
    await nextTick();

    expect(wrapper.find('[data-test="offer-detail-modal"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="offer-detail-modal"]').attributes('data-title')).toBe(
      'Frontend Developer Intern'
    );

    await wrapper.find('[data-test="apply-offer"]').trigger('click');
    await nextTick();

    expect(wrapper.find('[data-test="offer-detail-modal"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="apply-offer-modal"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="apply-offer-modal"]').attributes('data-title')).toBe(
      'Frontend Developer Intern'
    );

    await wrapper.find('[data-test="submit-apply-offer"]').trigger('click');
    await flushPromises();

    expect(console.log).toHaveBeenCalledWith('Offer application payload:', {
      message: 'I am interested',
    });

    expect(wrapper.find('[data-test="apply-offer-modal"]').exists()).toBe(false);
  });

  it('closes offer detail modal', async () => {
    const wrapper = mountFeed();

    await wrapper.find('[data-test="select-custom-offer"]').trigger('click');
    await nextTick();

    expect(wrapper.find('[data-test="offer-detail-modal"]').exists()).toBe(true);

    await wrapper.find('[data-test="close-offer-detail"]').trigger('click');
    await nextTick();

    expect(wrapper.find('[data-test="offer-detail-modal"]').exists()).toBe(false);
  });

  it('closes apply offer modal', async () => {
    const wrapper = mountFeed();

    await wrapper.find('[data-test="select-custom-offer"]').trigger('click');
    await nextTick();

    await wrapper.find('[data-test="apply-offer"]').trigger('click');
    await nextTick();

    expect(wrapper.find('[data-test="apply-offer-modal"]').exists()).toBe(true);

    await wrapper.find('[data-test="close-apply-offer"]').trigger('click');
    await nextTick();

    expect(wrapper.find('[data-test="apply-offer-modal"]').exists()).toBe(false);
  });

  it('passes technologies and domains to filters panel', () => {
    const wrapper = mountFeed();

    expect(wrapper.find('[data-test="technologies-list"]').text()).toContain('Vue 3');
    expect(wrapper.find('[data-test="technologies-list"]').text()).toContain('FastAPI');
    expect(wrapper.find('[data-test="technologies-list"]').text()).toContain('Flutter');

    expect(wrapper.find('[data-test="domains-list"]').text()).toContain('Mobile Development');
    expect(wrapper.find('[data-test="domains-list"]').text()).toContain('Web Frontend');
    expect(wrapper.find('[data-test="domains-list"]').text()).toContain('Cybersecurity');
  });
});