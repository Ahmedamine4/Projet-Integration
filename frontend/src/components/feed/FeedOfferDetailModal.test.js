import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import FeedOfferDetailModal from './FeedOfferDetailModal.vue';

vi.mock('lucide-vue-next', () => ({
  X: {
    name: 'X',
    props: ['size', 'strokeWidth'],
    template: '<svg data-test="x-icon" />',
  },
}));

const offer = {
  id: 'offer-1',
  title: 'Frontend Developer Internship',
  company: 'Owltsy',
  location: 'Casablanca',
  duration: '6 months',
  level: 'Internship',
  description: 'Work on a Vue.js platform with a modern frontend team.',
  technologies: ['Vue.js', 'Node.js', 'PostgreSQL'],
};

function mountModal(props = {}) {
  return mount(FeedOfferDetailModal, {
    props: {
      offer,
      ...props,
    },
    global: {
      stubs: {
        Teleport: true,
      },
    },
  });
}

function getApplyButton(wrapper) {
  return wrapper
    .findAll('button')
    .find((button) => button.text() === 'Apply');
}

function getCloseFooterButton(wrapper) {
  return wrapper
    .findAll('button')
    .find((button) => button.text() === 'Close');
}

describe('FeedOfferDetailModal', () => {
  it('does not render when offer is null', () => {
    const wrapper = mountModal({
      offer: null,
    });

    expect(wrapper.find('.offer-detail-overlay').exists()).toBe(false);
    expect(wrapper.find('.offer-detail-modal').exists()).toBe(false);
  });

  it('renders the offer details when offer exists', () => {
    const wrapper = mountModal();

    expect(wrapper.find('.offer-detail-overlay').exists()).toBe(true);

    const dialog = wrapper.find('[role="dialog"]');

    expect(dialog.exists()).toBe(true);
    expect(dialog.attributes('aria-modal')).toBe('true');
    expect(dialog.attributes('aria-labelledby')).toBe('feed-offer-detail-title');

    expect(wrapper.text()).toContain('Frontend Developer Internship');
    expect(wrapper.text()).toContain('Owltsy');
    expect(wrapper.text()).toContain('Casablanca');
    expect(wrapper.text()).toContain('6 months');
    expect(wrapper.text()).toContain('Internship');
    expect(wrapper.text()).toContain(
      'Work on a Vue.js platform with a modern frontend team.'
    );
  });

  it('renders technologies when offer has technologies', () => {
    const wrapper = mountModal();

    expect(wrapper.text()).toContain('Technologies');
    expect(wrapper.text()).toContain('Vue.js');
    expect(wrapper.text()).toContain('Node.js');
    expect(wrapper.text()).toContain('PostgreSQL');

    expect(wrapper.findAll('.offer-detail-tech-chip')).toHaveLength(3);
  });

  it('does not render technologies section when technologies list is empty', () => {
    const wrapper = mountModal({
      offer: {
        ...offer,
        technologies: [],
      },
    });

    expect(wrapper.text()).not.toContain('Technologies');
    expect(wrapper.findAll('.offer-detail-tech-chip')).toHaveLength(0);
  });

  it('shows fallback values when optional fields are missing', () => {
    const wrapper = mountModal({
      offer: {
        id: 'offer-2',
        title: 'Backend Developer Internship',
        company: '',
        location: '',
        duration: '',
        level: '',
        description: '',
        technologies: [],
      },
    });

    expect(wrapper.text()).toContain('Backend Developer Internship');
    expect(wrapper.text()).toContain('Company not specified');
    expect(wrapper.text()).toContain('No description provided.');

    const infoCards = wrapper.findAll('.offer-detail-info-card');

    expect(infoCards[0].text()).toContain('Company');
    expect(infoCards[0].text()).toContain('Not specified');

    expect(infoCards[1].text()).toContain('Location');
    expect(infoCards[1].text()).toContain('Not specified');

    expect(infoCards[2].text()).toContain('Duration');
    expect(infoCards[2].text()).toContain('Not specified');

    expect(infoCards[3].text()).toContain('Level');
    expect(infoCards[3].text()).toContain('Not specified');
  });

  it('emits close when clicking the header close button', async () => {
    const wrapper = mountModal();

    await wrapper.find('.offer-detail-close').trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('emits close when clicking the footer close button', async () => {
    const wrapper = mountModal();

    await getCloseFooterButton(wrapper).trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('emits close when clicking the overlay background', async () => {
    const wrapper = mountModal();

    await wrapper.find('.offer-detail-overlay').trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('does not emit close when clicking inside the modal', async () => {
    const wrapper = mountModal();

    await wrapper.find('.offer-detail-modal').trigger('click');

    expect(wrapper.emitted('close')).toBeFalsy();
  });

  it('emits apply with the offer when clicking Apply', async () => {
    const wrapper = mountModal();

    await getApplyButton(wrapper).trigger('click');

    expect(wrapper.emitted('apply')).toBeTruthy();
    expect(wrapper.emitted('apply')).toHaveLength(1);
    expect(wrapper.emitted('apply')[0]).toEqual([offer]);
  });

  it('renders the X icon in the close button', () => {
    const wrapper = mountModal();

    expect(wrapper.find('[data-test="x-icon"]').exists()).toBe(true);
  });
});