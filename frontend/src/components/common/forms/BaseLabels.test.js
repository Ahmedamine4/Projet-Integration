import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import BaseLabels from './BaseLabels.vue';

vi.mock('lucide-vue-next', () => ({
  X: {
    name: 'X',
    props: ['size', 'strokeWidth'],
    template: '<svg data-test="x-icon" />',
  },
  Plus: {
    name: 'Plus',
    props: ['size', 'strokeWidth'],
    template: '<svg data-test="plus-icon" />',
  },
}));

const items = [
  {
    name: 'Vue.js',
    selected: true,
  },
  {
    name: 'Docker',
    selected: false,
  },
];

function mountBaseLabels(props = {}) {
  return mount(BaseLabels, {
    props: {
      title: 'Technologies',
      items,
      ...props,
    },
  });
}

describe('BaseLabels', () => {
  it('does not render when items list is empty', () => {
    const wrapper = mountBaseLabels({
      items: [],
    });

    expect(wrapper.find('.label-group').exists()).toBe(false);
  });

  it('renders the title and all items', () => {
    const wrapper = mountBaseLabels();

    expect(wrapper.find('.label-group').exists()).toBe(true);
    expect(wrapper.text()).toContain('Technologies');
    expect(wrapper.text()).toContain('Vue.js');
    expect(wrapper.text()).toContain('Docker');

    expect(wrapper.findAll('.label-tag')).toHaveLength(2);
  });

  it('renders selected item with X icon and without inactive class', () => {
    const wrapper = mountBaseLabels();

    const vueTag = wrapper
      .findAll('.label-tag')
      .find((tag) => tag.text().includes('Vue.js'));

    expect(vueTag.exists()).toBe(true);
    expect(vueTag.classes()).not.toContain('inactive');
    expect(vueTag.find('[data-test="x-icon"]').exists()).toBe(true);
    expect(vueTag.find('[data-test="plus-icon"]').exists()).toBe(false);
  });

  it('renders unselected item with Plus icon and inactive class', () => {
    const wrapper = mountBaseLabels();

    const dockerTag = wrapper
      .findAll('.label-tag')
      .find((tag) => tag.text().includes('Docker'));

    expect(dockerTag.exists()).toBe(true);
    expect(dockerTag.classes()).toContain('inactive');
    expect(dockerTag.find('[data-test="plus-icon"]').exists()).toBe(true);
    expect(dockerTag.find('[data-test="x-icon"]').exists()).toBe(false);
  });

  it('emits toggle with the selected item when clicking its button', async () => {
    const wrapper = mountBaseLabels();

    const vueTag = wrapper
      .findAll('.label-tag')
      .find((tag) => tag.text().includes('Vue.js'));

    await vueTag.find('button').trigger('click');

    expect(wrapper.emitted('toggle')).toBeTruthy();
    expect(wrapper.emitted('toggle')[0]).toEqual([
      {
        name: 'Vue.js',
        selected: true,
      },
    ]);
  });

  it('emits toggle with the inactive item when clicking its button', async () => {
    const wrapper = mountBaseLabels();

    const dockerTag = wrapper
      .findAll('.label-tag')
      .find((tag) => tag.text().includes('Docker'));

    await dockerTag.find('button').trigger('click');

    expect(wrapper.emitted('toggle')).toBeTruthy();
    expect(wrapper.emitted('toggle')[0]).toEqual([
      {
        name: 'Docker',
        selected: false,
      },
    ]);
  });

  it('applies the custom colorRgb as a CSS variable', () => {
    const wrapper = mountBaseLabels({
      colorRgb: '249, 115, 22',
    });

    const firstTag = wrapper.find('.label-tag');

    expect(firstTag.attributes('style')).toContain(
      '--label-color-rgb: 249, 115, 22'
    );
  });
});