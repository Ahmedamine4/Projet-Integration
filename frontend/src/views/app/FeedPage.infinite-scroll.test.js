import { defineComponent, nextTick } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import FeedPage from './FeedPage.vue';

const mocks = vi.hoisted(() => ({
  authStore: {
    user: {
      prenom: 'Nour',
      nom: 'Bakkali',
      role: 'etudiant',
    },
  },
  feedOfferStore: {
    offers: [],
    fetchFeedOffers: vi.fn(),
    applyToOffer: vi.fn(),
  },
  feedStudentStore: {
    suggestedStudents: [],
    studentsFromSchool: [],
    fetchFeedStudents: vi.fn(),
    toggleFollow: vi.fn(),
  },
  routerPush: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mocks.routerPush,
    hasRoute: vi.fn(() => false),
  }),
}));

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mocks.authStore,
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
    template: '<span />',
  },
  Plus: {
    name: 'Plus',
    template: '<span />',
  },
  SearchX: {
    name: 'SearchX',
    template: '<span />',
  },
}));

const SidebarStub = defineComponent({
  name: 'Sidebar',
  template: '<aside />',
});

const FeedHeaderStub = defineComponent({
  name: 'FeedHeader',
  template: '<header />',
});

const FeedOffersCarouselStub = defineComponent({
  name: 'FeedOffersCarousel',
  template: '<section />',
});

const FeedProjectCardStub = defineComponent({
  name: 'FeedProjectCard',
  props: {
    project: {
      type: Object,
      required: true,
    },
  },
  template: '<article data-test="project-card">{{ project.title }}</article>',
});

const FeedFiltersPanelStub = defineComponent({
  name: 'FeedFiltersPanel',
  template: '<aside />',
});

const EmptyModalStub = defineComponent({
  name: 'EmptyModal',
  template: '<div />',
});

function mountFeedPage() {
  return mount(FeedPage, {
    global: {
      stubs: {
        Sidebar: SidebarStub,
        FeedHeader: FeedHeaderStub,
        FeedOffersCarousel: FeedOffersCarouselStub,
        FeedProjectCard: FeedProjectCardStub,
        FeedFiltersPanel: FeedFiltersPanelStub,
        ShareProjectModal: EmptyModalStub,
        FeedOfferDetailModal: EmptyModalStub,
        ApplyOfferModal: EmptyModalStub,
      },
    },
  });
}

describe('FeedPage infinite scroll', () => {
  let intersectionCallback;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    intersectionCallback = null;

    global.IntersectionObserver = vi.fn(function intersectionObserver(callback) {
      intersectionCallback = callback;

      return {
        observe: vi.fn(),
        disconnect: vi.fn(),
      };
    });
  });

  it('loads the next mock page when the sentinel intersects', async () => {
    const wrapper = mountFeedPage();

    await flushPromises();
    await nextTick();

    expect(wrapper.findAll('[data-test="project-card"]')).toHaveLength(4);
    expect(wrapper.text()).toContain('Projet 1');
    expect(wrapper.text()).toContain('Projet 4');
    expect(intersectionCallback).toBeTypeOf('function');

    intersectionCallback([{ isIntersecting: true }]);

    await flushPromises();
    await nextTick();

    expect(wrapper.findAll('[data-test="project-card"]')).toHaveLength(8);
    expect(wrapper.text()).toContain('Projet 8');
  });
});
