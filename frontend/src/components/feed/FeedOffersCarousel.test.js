import { defineComponent, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import FeedOffersCarousel from './FeedOffersCarousel.vue';

vi.mock('lucide-vue-next', () => ({
  MoveHorizontal: {
    name: 'MoveHorizontal',
    props: ['size'],
    template: '<svg data-test="move-horizontal-icon" />',
  },
  Repeat2: {
    name: 'Repeat2',
    props: ['size'],
    template: '<svg data-test="repeat-icon" />',
  },
}));

vi.mock('@/composables/useHorizontalDragScroll', () => ({
  useHorizontalDragScroll: vi.fn(() => ({
    isDragging: ref(false),
    handlePointerDown: vi.fn(),
    handlePointerMove: vi.fn(),
    handlePointerUp: vi.fn(),
  })),
}));

const RecommendationCardStub = defineComponent({
  name: 'RecommendationCard',
  props: {
    recommendation: {
      type: Object,
      required: true,
    },
    canManageVisibility: {
      type: Boolean,
      default: false,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  template: `
    <article
      data-test="recommendation-card"
      :data-id="recommendation.id"
      :data-author-name="recommendation.authorName"
      :data-author-role="recommendation.authorRole"
      :data-content="recommendation.content"
    >
      <h3>{{ recommendation.authorName }}</h3>
      <p>{{ recommendation.authorRole }}</p>
      <span>{{ recommendation.content }}</span>
    </article>
  `,
});

const offers = [
  {
    id: 'offer-1',
    title: 'Frontend Developer Internship',
    company: 'Owltsy',
    location: 'Casablanca',
    description: 'Build Vue.js interfaces.',
    duration: '6 months',
    level: 'Internship',
  },
  {
    id: 'offer-2',
    title: 'Backend Developer Internship',
    company: 'TechLab',
    location: 'Rabat',
    description: 'Build APIs with Node.js.',
    duration: '4 months',
    level: 'Internship',
  },
];

function mountCarousel(props = {}) {
  return mount(FeedOffersCarousel, {
    props: {
      offers,
      ...props,
    },
    global: {
      stubs: {
        RecommendationCard: RecommendationCardStub,
      },
    },
  });
}

describe('FeedOffersCarousel', () => {
  it('does not render when offers list is empty', () => {
    const wrapper = mountCarousel({
      offers: [],
    });

    expect(wrapper.find('.offers-section').exists()).toBe(false);
  });

  it('renders title and subtitle', () => {
    const wrapper = mountCarousel({
      title: 'Recommended offers',
      subtitle: 'Offers matching your profile.',
    });

    expect(wrapper.find('.offers-section').exists()).toBe(true);
    expect(wrapper.text()).toContain('Recommended offers');
    expect(wrapper.text()).toContain('Offers matching your profile.');
  });

  it('does not render subtitle when subtitle is empty', () => {
    const wrapper = mountCarousel({
      subtitle: '',
    });

    expect(wrapper.text()).toContain('Recommended opportunities');
    expect(wrapper.find('.offers-section-header p').exists()).toBe(false);
  });

  it('renders offers as recommendation cards', () => {
    const wrapper = mountCarousel();

    const cards = wrapper.findAll('[data-test="recommendation-card"]');

    // Mode loop avec 2 offres => 4 copies * 2 offres = 8 cards.
    expect(cards).toHaveLength(8);

    expect(cards[0].attributes('data-author-name')).toBe('Owltsy');
    expect(cards[0].attributes('data-author-role')).toBe(
      'Frontend Developer Internship · Casablanca'
    );
    expect(cards[0].attributes('data-content')).toBe('Build Vue.js interfaces.');
  });

  it('uses duration and level as fallback content when description is missing', () => {
    const wrapper = mountCarousel({
      offers: [
        {
          id: 'offer-1',
          title: 'Data Internship',
          company: 'DataCorp',
          location: 'Remote',
          description: '',
          duration: '3 months',
          level: 'Beginner',
        },
      ],
    });

    const card = wrapper.find('[data-test="recommendation-card"]');

    expect(card.exists()).toBe(true);
    expect(card.attributes('data-content')).toBe('3 months · Beginner');
  });

  it('uses default fallback content when description, duration and level are missing', () => {
    const wrapper = mountCarousel({
      offers: [
        {
          id: 'offer-1',
          title: 'Frontend Internship',
          company: 'Owltsy',
          location: 'Remote',
        },
      ],
    });

    const card = wrapper.find('[data-test="recommendation-card"]');

    expect(card.exists()).toBe(true);
    expect(card.attributes('data-content')).toBe(
      'Duration not specified · Level not specified'
    );
  });

  it('uses loop mode by default when there are at least two offers', () => {
    const wrapper = mountCarousel();

    expect(wrapper.find('.offers-frame').classes()).toContain('offers-frame--loop');
    expect(wrapper.find('.offers-frame').classes()).toContain('offers-frame--moving');
    expect(wrapper.find('.offers-toggle').text()).toContain('Scroll');
    expect(wrapper.find('[data-test="move-horizontal-icon"]').exists()).toBe(true);
  });

  it('does not loop when there is only one offer', () => {
    const wrapper = mountCarousel({
      offers: [offers[0]],
    });

    expect(wrapper.find('.offers-frame').classes()).toContain('offers-frame--loop');
    expect(wrapper.find('.offers-frame').classes()).not.toContain(
      'offers-frame--moving'
    );

    expect(wrapper.findAll('[data-test="recommendation-card"]')).toHaveLength(1);
  });

  it('switches from loop mode to scroll mode when clicking the toggle button', async () => {
    const wrapper = mountCarousel();

    await wrapper.find('.offers-toggle').trigger('click');

    expect(wrapper.find('.offers-frame').classes()).toContain('offers-frame--scroll');
    expect(wrapper.find('.offers-frame').classes()).toContain(
      'offers-frame--draggable'
    );
    expect(wrapper.find('.offers-frame').classes()).not.toContain(
      'offers-frame--moving'
    );

    expect(wrapper.find('.offers-toggle').text()).toContain('Loop');
    expect(wrapper.find('[data-test="repeat-icon"]').exists()).toBe(true);
  });

  it('switches back from scroll mode to loop mode', async () => {
    const wrapper = mountCarousel();

    await wrapper.find('.offers-toggle').trigger('click');
    await wrapper.find('.offers-toggle').trigger('click');

    expect(wrapper.find('.offers-frame').classes()).toContain('offers-frame--loop');
    expect(wrapper.find('.offers-frame').classes()).toContain('offers-frame--moving');
    expect(wrapper.find('.offers-toggle').text()).toContain('Scroll');
  });

  it('emits select-offer with the original offer when clicking an offer card', async () => {
    const wrapper = mountCarousel();

    await wrapper.find('.offer-card-button').trigger('click');

    expect(wrapper.emitted('select-offer')).toBeTruthy();
    expect(wrapper.emitted('select-offer')).toHaveLength(1);
    expect(wrapper.emitted('select-offer')[0]).toEqual([offers[0]]);
  });

  it('renders one card per offer in scroll mode', async () => {
    const wrapper = mountCarousel();

    await wrapper.find('.offers-toggle').trigger('click');

    const cards = wrapper.findAll('[data-test="recommendation-card"]');

    expect(cards).toHaveLength(2);
  });
});