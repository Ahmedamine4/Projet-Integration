import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import FeedFiltersPanel from './FeedFiltersPanel.vue';

vi.mock('lucide-vue-next', () => ({
  ChevronDown: {
    name: 'ChevronDown',
    props: ['size', 'strokeWidth'],
    template: '<svg data-test="chevron-down-icon" />',
  },
  Layers: {
    name: 'Layers',
    props: ['size', 'strokeWidth'],
    template: '<svg data-test="layers-icon" />',
  },
  RotateCcw: {
    name: 'RotateCcw',
    props: ['size'],
    template: '<svg data-test="reset-icon" />',
  },
  SlidersHorizontal: {
    name: 'SlidersHorizontal',
    props: ['size', 'strokeWidth'],
    template: '<svg data-test="sliders-icon" />',
  },
  Sparkles: {
    name: 'Sparkles',
    props: ['size', 'strokeWidth'],
    template: '<svg data-test="sparkles-icon" />',
  },
  Cpu: {
    name: 'Cpu',
    props: ['size', 'strokeWidth'],
    template: '<svg data-test="cpu-icon" />',
  },
}));

const BaseInputStub = defineComponent({
  name: 'BaseInput',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  template: `
    <label data-test="base-input">
      <span>{{ label }}</span>
      <input
        data-test="search-input"
        :value="modelValue"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', $event.target.value)"
      >
    </label>
  `,
});

const BaseSelectStub = defineComponent({
  name: 'BaseSelect',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    options: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  template: `
    <select
      data-test="domain-select"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option value="">{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option"
        :value="option"
      >
        {{ option }}
      </option>
    </select>
  `,
});

const BaseDropdownStub = defineComponent({
  name: 'BaseDropdown',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    options: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: '',
    },
    visibleOptions: {
      type: Number,
      default: 4,
    },
  },
  emits: ['update:modelValue'],
  template: `
    <div data-test="technology-dropdown">
      <input
        data-test="technology-input"
        :value="modelValue"
        :placeholder="placeholder"
        :data-visible-options="visibleOptions"
        @input="$emit('update:modelValue', $event.target.value)"
      >

      <span
        v-for="option in options"
        :key="option"
        data-test="technology-option"
      >
        {{ option }}
      </span>
    </div>
  `,
});

const defaultFilters = {
  source: 'all',
  sort: 'trending',
  domain: null,
  technology: null,
};

const technologies = [
  'Vue.js',
  { name: 'Express.js' },
  { label: 'Docker' },
  { title: 'PostgreSQL' },
  { nom: 'Python' },
  { wrong: 'ignored' },
];

const domains = ['Web Development', 'AI', 'Data'];

function mountPanel(props = {}) {
  return mount(FeedFiltersPanel, {
    props: {
      search: '',
      filters: defaultFilters,
      technologies,
      domains,
      ...props,
    },
    global: {
      stubs: {
        BaseInput: BaseInputStub,
        BaseSelect: BaseSelectStub,
        BaseDropdown: BaseDropdownStub,
      },
    },
  });
}

describe('FeedFiltersPanel', () => {
  it('renders the panel title and filter sections', () => {
    const wrapper = mountPanel();

    expect(wrapper.text()).toContain('Filters');
    expect(wrapper.text()).toContain('Search');
    expect(wrapper.text()).toContain('Discovery');
    expect(wrapper.text()).toContain('Sort by');
    expect(wrapper.text()).toContain('Domains');
    expect(wrapper.text()).toContain('Technologies');

    expect(wrapper.find('[data-test="sliders-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="sparkles-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="layers-icon"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="cpu-icon"]').exists()).toBe(true);
  });

  it('marks the active source and sort chips', () => {
    const wrapper = mountPanel({
      filters: {
        ...defaultFilters,
        source: 'following',
        sort: 'recent',
      },
    });

    const followingChip = wrapper
      .findAll('.filter-chip')
      .find((chip) => chip.text() === 'Following');

    const recentChip = wrapper
      .findAll('.filter-chip')
      .find((chip) => chip.text() === 'Recent');

    expect(followingChip.classes()).toContain('is-active');
    expect(recentChip.classes()).toContain('is-active');
  });

  it('emits update:search when typing in the search input', async () => {
    const wrapper = mountPanel();

    await wrapper.find('[data-test="search-input"]').setValue('portfolio');

    expect(wrapper.emitted('update:search')).toBeTruthy();
    expect(wrapper.emitted('update:search')[0]).toEqual(['portfolio']);
  });

  it('emits update:filters when clicking a source chip', async () => {
    const wrapper = mountPanel();

    const sameSchoolChip = wrapper
      .findAll('.filter-chip')
      .find((chip) => chip.text() === 'Same school');

    await sameSchoolChip.trigger('click');

    expect(wrapper.emitted('update:filters')).toBeTruthy();
    expect(wrapper.emitted('update:filters')[0]).toEqual([
      {
        ...defaultFilters,
        source: 'same-school',
      },
    ]);
  });

  it('emits update:filters when clicking a sort chip', async () => {
    const wrapper = mountPanel();

    const recentChip = wrapper
      .findAll('.filter-chip')
      .find((chip) => chip.text() === 'Recent');

    await recentChip.trigger('click');

    expect(wrapper.emitted('update:filters')).toBeTruthy();
    expect(wrapper.emitted('update:filters')[0]).toEqual([
      {
        ...defaultFilters,
        sort: 'recent',
      },
    ]);
  });

  it('emits update:filters when selecting a domain', async () => {
    const wrapper = mountPanel();

    await wrapper.find('[data-test="domain-select"]').setValue('AI');

    expect(wrapper.emitted('update:filters')).toBeTruthy();
    expect(wrapper.emitted('update:filters')[0]).toEqual([
      {
        ...defaultFilters,
        domain: 'AI',
      },
    ]);
  });

  it('emits domain as null when domain is cleared', async () => {
    const wrapper = mountPanel({
      filters: {
        ...defaultFilters,
        domain: 'AI',
      },
    });

    await wrapper.find('[data-test="domain-select"]').setValue('');

    expect(wrapper.emitted('update:filters')).toBeTruthy();
    expect(wrapper.emitted('update:filters')[0]).toEqual([
      {
        ...defaultFilters,
        domain: null,
      },
    ]);
  });

  it('normalizes technology options from strings and objects', () => {
    const wrapper = mountPanel();

    const renderedTechnologies = wrapper
      .findAll('[data-test="technology-option"]')
      .map((option) => option.text());

    expect(renderedTechnologies).toEqual([
      'Vue.js',
      'Express.js',
      'Docker',
      'PostgreSQL',
      'Python',
    ]);
  });

  it('emits update:filters when selecting a technology', async () => {
    const wrapper = mountPanel();

    await wrapper.find('[data-test="technology-input"]').setValue('Docker');

    expect(wrapper.emitted('update:filters')).toBeTruthy();
    expect(wrapper.emitted('update:filters')[0]).toEqual([
      {
        ...defaultFilters,
        technology: 'Docker',
      },
    ]);
  });

  it('emits technology as null when technology is cleared', async () => {
    const wrapper = mountPanel({
      filters: {
        ...defaultFilters,
        technology: 'Docker',
      },
    });

    await wrapper.find('[data-test="technology-input"]').setValue('');

    expect(wrapper.emitted('update:filters')).toBeTruthy();
    expect(wrapper.emitted('update:filters')[0]).toEqual([
      {
        ...defaultFilters,
        technology: null,
      },
    ]);
  });

  it('passes visibleOptions 5 to BaseDropdown', () => {
    const wrapper = mountPanel();

    expect(wrapper.find('[data-test="technology-input"]').attributes('data-visible-options')).toBe(
      '5'
    );
  });

  it('emits reset when clicking the reset button', async () => {
    const wrapper = mountPanel();

    await wrapper.find('.btn-reset').trigger('click');

    expect(wrapper.emitted('reset')).toBeTruthy();
    expect(wrapper.emitted('reset')).toHaveLength(1);
  });
});