import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import BarreStats from './BarreStats.vue';

describe('BarreStats', () => {
  const categories = [
    { label: 'Photos', value: 45 },
    { label: 'Videos', value: 30 },
    { label: 'Documents', value: 25 },
  ];

  function mountComponent(props = {}) {
    return mount(BarreStats, {
      props: {
        categories,
        ...props,
      },
    });
  }

  it('renders all categories in the legend', () => {
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain('Photos');
    expect(wrapper.text()).toContain('Videos');
    expect(wrapper.text()).toContain('Documents');
  });

  it('renders one storage segment per category', () => {
    const wrapper = mountComponent();

    const segments = wrapper.findAll('.storage-segment');

    expect(segments).toHaveLength(categories.length);
  });

  it('sets the correct percentage for each segment', () => {
    const wrapper = mountComponent();

    const segments = wrapper.findAll('.storage-segment');

    expect(segments[0].element.style.getPropertyValue('--percent')).toBe('45.0');
    expect(segments[1].element.style.getPropertyValue('--percent')).toBe('30.0');
    expect(segments[2].element.style.getPropertyValue('--percent')).toBe('25.0');
  });

  it('uses grey color for the last category', () => {
    const wrapper = mountComponent();

    const segments = wrapper.findAll('.storage-segment');

    expect(segments[2].element.style.background).toBe('rgb(192, 192, 192)');
  });

  it('displays category values in the legend', () => {
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain('45%');
    expect(wrapper.text()).toContain('30%');
    expect(wrapper.text()).toContain('25%');
  });

  it('dims other categories when a legend item is hovered', async () => {
    const wrapper = mountComponent();

    const legendItems = wrapper.findAll('.legend-item');

    await legendItems[0].trigger('mouseenter');

    expect(legendItems[0].classes()).toContain('active');
    expect(legendItems[1].classes()).toContain('dimmed');
    expect(legendItems[2].classes()).toContain('dimmed');

    await legendItems[0].trigger('mouseleave');

    expect(wrapper.findAll('.legend-item')[0].classes()).not.toContain('active');
    expect(wrapper.findAll('.legend-item')[1].classes()).not.toContain('dimmed');
    expect(wrapper.findAll('.legend-item')[2].classes()).not.toContain('dimmed');
  });

  it('dims other segments when a segment is hovered', async () => {
    const wrapper = mountComponent();

    const segments = wrapper.findAll('.storage-segment');

    await segments[1].trigger('mouseenter');

    expect(segments[0].classes()).toContain('dimmed');
    expect(segments[1].classes()).not.toContain('dimmed');
    expect(segments[2].classes()).toContain('dimmed');

    await segments[1].trigger('mouseleave');

    expect(wrapper.findAll('.storage-segment')[0].classes()).not.toContain('dimmed');
    expect(wrapper.findAll('.storage-segment')[1].classes()).not.toContain('dimmed');
    expect(wrapper.findAll('.storage-segment')[2].classes()).not.toContain('dimmed');
  });
});