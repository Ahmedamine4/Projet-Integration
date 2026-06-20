import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import FeedRightPanel from './feedRightPanel.vue';

vi.mock('lucide-vue-next', () => ({
  Award: {
    name: 'Award',
    props: ['size'],
    template: '<svg data-test="award-icon" />',
  },
  TrendingUp: {
    name: 'TrendingUp',
    props: ['size'],
    template: '<svg data-test="trending-icon" />',
  },
  UserPlus: {
    name: 'UserPlus',
    props: ['size'],
    template: '<svg data-test="user-plus-icon" />',
  },
  Activity: {
    name: 'Activity',
    props: ['size'],
    template: '<svg data-test="activity-icon" />',
  },
}));

const filters = {
  certifiedOnly: false,
  scope: 'speciality',
  sort: 'trending',
  technology: null,
  domain: null,
};

const trendingTechs = [
  {
    name: 'Vue.js',
    count: 12,
  },
  {
    name: 'Docker',
    count: 8,
  },
];

const suggestions = [
  {
    id: 1,
    name: 'Nour Bakkali',
    stack: 'Vue.js / Express',
  },
  {
    id: 2,
    name: 'Yassine Amrani',
    stack: 'AI / Python',
  },
];

const activities = [
  {
    id: 1,
    text: 'Nour recommended a project.',
  },
  {
    id: 2,
    text: 'Yassine published a new portfolio.',
  },
];

function mountPanel(props = {}) {
  return mount(FeedRightPanel, {
    props: {
      filters,
      trendingTechs,
      suggestions,
      activities,
      ...props,
    },
  });
}

function findButtonByText(wrapper, text) {
  return wrapper
    .findAll('button')
    .find((button) => button.text().includes(text));
}

describe('FeedRightPanel', () => {
  it('renders the main sections', () => {
    const wrapper = mountPanel();

    expect(wrapper.find('.feed-right-panel').exists()).toBe(true);

    expect(wrapper.text()).toContain('Filters');
    expect(wrapper.text()).toContain('Status');
    expect(wrapper.text()).toContain('Filière');
    expect(wrapper.text()).toContain('Tri');
    expect(wrapper.text()).toContain('Trending techs');
    expect(wrapper.text()).toContain('Who to follow');
    expect(wrapper.text()).toContain('Live activity');

    expect(wrapper.find('[data-test="award-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="trending-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="user-plus-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="activity-icon"]').exists()).toBe(true);
  });

  it('emits reset when clicking Reset', async () => {
    const wrapper = mountPanel();

    await findButtonByText(wrapper, 'Reset').trigger('click');

    expect(wrapper.emitted('reset')).toBeTruthy();
    expect(wrapper.emitted('reset')).toHaveLength(1);
  });

  it('marks "Tous les projets" as selected when certifiedOnly is false', () => {
    const wrapper = mountPanel({
      filters: {
        ...filters,
        certifiedOnly: false,
      },
    });

    const allProjectsButton = findButtonByText(wrapper, 'Tous les projets');
    const certifiedButton = findButtonByText(wrapper, 'Certifiés');

    expect(allProjectsButton.classes()).toContain('selected');
    expect(certifiedButton.classes()).not.toContain('selected');
  });

  it('marks "Certifiés" as selected when certifiedOnly is true', () => {
    const wrapper = mountPanel({
      filters: {
        ...filters,
        certifiedOnly: true,
      },
    });

    const allProjectsButton = findButtonByText(wrapper, 'Tous les projets');
    const certifiedButton = findButtonByText(wrapper, 'Certifiés');

    expect(certifiedButton.classes()).toContain('selected');
    expect(allProjectsButton.classes()).not.toContain('selected');
  });

  it('emits update:filters when clicking certified filter', async () => {
    const wrapper = mountPanel();

    await findButtonByText(wrapper, 'Certifiés').trigger('click');

    expect(wrapper.emitted('update:filters')).toBeTruthy();
    expect(wrapper.emitted('update:filters')[0]).toEqual([
      {
        ...filters,
        certifiedOnly: true,
      },
    ]);
  });

  it('emits update:filters when clicking all projects filter', async () => {
    const wrapper = mountPanel({
      filters: {
        ...filters,
        certifiedOnly: true,
      },
    });

    await findButtonByText(wrapper, 'Tous les projets').trigger('click');

    expect(wrapper.emitted('update:filters')).toBeTruthy();
    expect(wrapper.emitted('update:filters')[0]).toEqual([
      {
        ...filters,
        certifiedOnly: false,
      },
    ]);
  });

  it('emits update:filters when changing scope', async () => {
    const wrapper = mountPanel();

    const scopeSelect = wrapper.findAll('select')[0];

    await scopeSelect.setValue('school');

    expect(wrapper.emitted('update:filters')).toBeTruthy();
    expect(wrapper.emitted('update:filters')[0]).toEqual([
      {
        ...filters,
        scope: 'school',
      },
    ]);
  });

  it('emits update:filters when changing sort', async () => {
    const wrapper = mountPanel();

    const sortSelect = wrapper.findAll('select')[1];

    await sortSelect.setValue('recent');

    expect(wrapper.emitted('update:filters')).toBeTruthy();
    expect(wrapper.emitted('update:filters')[0]).toEqual([
      {
        ...filters,
        sort: 'recent',
      },
    ]);
  });

  it('renders trending technologies with counts', () => {
    const wrapper = mountPanel();

    expect(wrapper.text()).toContain('#Vue.js');
    expect(wrapper.text()).toContain('12');
    expect(wrapper.text()).toContain('#Docker');
    expect(wrapper.text()).toContain('8');
  });

  it('emits update:filters when selecting a technology', async () => {
    const wrapper = mountPanel();

    await findButtonByText(wrapper, '#Vue.js').trigger('click');

    expect(wrapper.emitted('update:filters')).toBeTruthy();
    expect(wrapper.emitted('update:filters')[0]).toEqual([
      {
        ...filters,
        technology: 'Vue.js',
      },
    ]);
  });

  it('emits technology null when clicking the already selected technology', async () => {
    const wrapper = mountPanel({
      filters: {
        ...filters,
        technology: 'Vue.js',
      },
    });

    await findButtonByText(wrapper, '#Vue.js').trigger('click');

    expect(wrapper.emitted('update:filters')).toBeTruthy();
    expect(wrapper.emitted('update:filters')[0]).toEqual([
      {
        ...filters,
        technology: null,
      },
    ]);
  });

  it('marks selected technology as selected', () => {
    const wrapper = mountPanel({
      filters: {
        ...filters,
        technology: 'Docker',
      },
    });

    const vueButton = findButtonByText(wrapper, '#Vue.js');
    const dockerButton = findButtonByText(wrapper, '#Docker');

    expect(dockerButton.classes()).toContain('selected');
    expect(vueButton.classes()).not.toContain('selected');
  });

  it('renders student suggestions', () => {
    const wrapper = mountPanel();

    expect(wrapper.text()).toContain('Nour Bakkali');
    expect(wrapper.text()).toContain('Vue.js / Express');
    expect(wrapper.text()).toContain('Yassine Amrani');
    expect(wrapper.text()).toContain('AI / Python');

    const avatars = wrapper.findAll('.suggestion-avatar');

    expect(avatars[0].text()).toBe('N');
    expect(avatars[1].text()).toBe('Y');

    expect(wrapper.findAll('.suggestion-item')).toHaveLength(2);
  });

  it('renders follow buttons for suggestions', () => {
    const wrapper = mountPanel();

    const followButtons = wrapper
      .findAll('.suggestion-item button')
      .filter((button) => button.text() === 'Follow');

    expect(followButtons).toHaveLength(2);
  });

  it('renders live activities when activities exist', () => {
    const wrapper = mountPanel();

    expect(wrapper.text()).toContain('Nour recommended a project.');
    expect(wrapper.text()).toContain('Yassine published a new portfolio.');
    expect(wrapper.findAll('.activity-list p')).toHaveLength(2);
  });

  it('does not render live activity section when activities list is empty', () => {
    const wrapper = mountPanel({
      activities: [],
    });

    expect(wrapper.text()).not.toContain('Live activity');
    expect(wrapper.find('.activity-list').exists()).toBe(false);
    expect(wrapper.find('[data-test="activity-icon"]').exists()).toBe(false);
  });
});