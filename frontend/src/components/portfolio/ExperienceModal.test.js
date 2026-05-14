import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ExperienceModal from './ExperienceModal.vue';
import { analyzeExperienceDescription } from '@/services/aiApi';

vi.mock('@/services/aiApi', () => ({
  analyzeExperienceDescription: vi.fn(),
}));

const buttonByText = (wrapper, text) => {
  const button = wrapper.findAll('button').find((btn) =>
    btn.text().includes(text)
  );

  if (!button) {
    throw new Error(`Button with text "${text}" not found`);
  }

  return button;
};

const inputByPlaceholder = (wrapper, placeholder) => {
  const input = wrapper.find(`input[placeholder="${placeholder}"]`);

  if (!input.exists()) {
    throw new Error(`Input with placeholder "${placeholder}" not found`);
  }

  return input;
};

const modalStubs = {
  Input: {
    props: [
      'modelValue',
      'label',
      'placeholder',
      'type',
      'autocomplete',
    ],
    emits: ['update:modelValue'],
    template: `
      <div>
        <label v-if="label">{{ label }}</label>
        <input
          :type="type || 'text'"
          :placeholder="placeholder"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
        />
      </div>
    `,
  },

  DatePicker: {
    props: [
      'modelValue',
      'label',
      'placeholder',
      'maxDate',
      'minDate',
    ],
    emits: ['update:modelValue'],
    template: `
      <div>
        <label v-if="label">{{ label }}</label>
        <input
          type="text"
          :placeholder="placeholder"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
        />
      </div>
    `,
  },

  ImageDropzone: {
    props: ['modelValue', 'title', 'accept'],
    emits: ['update:modelValue'],
    template: `
      <div>
        <p>{{ title }}</p>
        <button
          type="button"
          @click="$emit('update:modelValue', { name: 'image.png', type: 'image/png' })"
        >
          Upload image
        </button>
      </div>
    `,
  },

  Button: {
    props: ['type', 'variant', 'loading', 'block', 'disabled'],
    template: `
      <button :type="type || 'button'" :disabled="disabled">
        <slot />
      </button>
    `,
  },

  Error: {
    props: ['variant'],
    template: '<p data-test="error"><slot /></p>',
  },

  CloseButton: {
    props: ['size'],
    emits: ['click'],
    template: `
      <button type="button" @click="$emit('click')">
        Close
      </button>
    `,
  },

  ToggleSwitch: {
    props: ['modelValue', 'label'],
    emits: ['update:modelValue'],
    template: `
      <label>
        {{ label }}
        <input
          type="checkbox"
          :checked="modelValue"
          @change="$emit('update:modelValue', $event.target.checked)"
        />
      </label>
    `,
  },

  Select: {
    props: ['modelValue', 'options', 'label', 'placeholder'],
    emits: ['update:modelValue'],
    template: `
      <div>
        <label v-if="label">{{ label }}</label>
        <select
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
      </div>
    `,
  },

  Dropdown: {
    props: ['modelValue', 'options', 'label', 'placeholder', 'autocomplete'],
    emits: ['update:modelValue'],
    template: `
      <div>
        <label v-if="label">{{ label }}</label>
        <select
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
      </div>
    `,
  },

  Labels: {
    props: ['title', 'items', 'colorRgb'],
    emits: ['toggle'],
    template: `
      <div>
        <h3>{{ title }}</h3>
        <button
          v-for="item in items"
          :key="item.name"
          type="button"
          @click="$emit('toggle', item)"
        >
          {{ item.name }}
        </button>
      </div>
    `,
  },
};

const mountModal = (props = {}) => {
  return mount(ExperienceModal, {
    props: {
      open: true,
      type: 'project',
      professorEmails: ['teacher@school.com'],
      schoolOptions: ['ENSA Tanger'],
      ...props,
    },
    global: {
      stubs: modalStubs,
    },
  });
};

const fillValidProjectForm = async (wrapper) => {
  await inputByPlaceholder(wrapper, 'Enter your project title').setValue(
    'Portfolio Platform'
  );

  await inputByPlaceholder(wrapper, 'Select project date').setValue(
    '2026-05-10'
  );

  await wrapper.find('textarea#description').setValue(
    'This project is a Vue and Express portfolio platform with authentication and portfolio generation.'
  );

  await buttonByText(wrapper, 'Upload image').trigger('click');

  await inputByPlaceholder(
    wrapper,
    'https://github.com/username/project-name'
  ).setValue('https://github.com/student/portfolio-platform');
};

describe('ExperienceModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    document.body.style.overflow = '';
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.style.overflow = '';
  });

  it('does not render modal content when open is false', () => {
    const wrapper = mountModal({
      open: false,
    });

    expect(wrapper.find('.modal-overlay').exists()).toBe(false);
  });

  it('renders create project modal when open is true', () => {
    const wrapper = mountModal({
      open: true,
      type: 'project',
    });

    expect(wrapper.text()).toContain('Create a new project');
    expect(wrapper.text()).toContain('Project title');
    expect(wrapper.text()).toContain('Project date');
    expect(wrapper.text()).toContain('Upload project screenshot');
    expect(wrapper.text()).toContain('GitHub link');
    expect(wrapper.text()).toContain('Visible to everyone');
  });

  it('emits close when clicking the close button', async () => {
    const wrapper = mountModal();

    await buttonByText(wrapper, 'Close').trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('emits close when clicking cancel', async () => {
    const wrapper = mountModal();

    await buttonByText(wrapper, 'Cancel').trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('shows validation errors when submitting an empty project form', async () => {
    const wrapper = mountModal({
      type: 'project',
    });

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('Project title is required');
    expect(wrapper.text()).toContain('Project date is required');
    expect(wrapper.text()).toContain('Project screenshot is required');
    expect(wrapper.text()).toContain(
      'Description must be at least 20 characters'
    );
    expect(wrapper.text()).toContain('GitHub link is required');

    expect(wrapper.emitted('submit')).toBeFalsy();
  });

  it('emits submit with project payload when form is valid', async () => {
    const wrapper = mountModal({
      type: 'project',
    });

    await fillValidProjectForm(wrapper);

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.emitted('submit')).toBeTruthy();

    const payload = wrapper.emitted('submit')[0][0];

    expect(payload).toMatchObject({
      title: 'Portfolio Platform',
      date: '2026-05-10',
      startDate: '',
      endDate: '',
      description:
        'This project is a Vue and Express portfolio platform with authentication and portfolio generation.',
      githubLink: 'https://github.com/student/portfolio-platform',
      certificateURL: '',
      certificateCode: '',
      isAcademic: false,
      institution: '',
      teacherEmail: '',
      visibleToEveryone: true,
    });

    expect(payload.image).toEqual({
      name: 'image.png',
      type: 'image/png',
    });

    expect(payload.technologies).toEqual([]);
    expect(payload.domains).toEqual([]);
  });

  it('shows an error when GitHub link is invalid', async () => {
    const wrapper = mountModal({
      type: 'project',
    });

    await inputByPlaceholder(wrapper, 'Enter your project title').setValue(
      'Portfolio Platform'
    );

    await inputByPlaceholder(wrapper, 'Select project date').setValue(
      '2026-05-10'
    );

    await wrapper.find('textarea#description').setValue(
      'This project is a Vue portfolio platform with authentication and project management.'
    );

    await buttonByText(wrapper, 'Upload image').trigger('click');

    await inputByPlaceholder(
      wrapper,
      'https://github.com/username/project-name'
    ).setValue('https://gitlab.com/student/portfolio-platform');

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('Enter a valid GitHub project URL');
    expect(wrapper.emitted('submit')).toBeFalsy();
  });

  it('shows an error when internship end date is before start date', async () => {
    const wrapper = mountModal({
      type: 'internship',
    });

    await inputByPlaceholder(wrapper, 'Enter your internship title').setValue(
      'Frontend Internship'
    );

    await inputByPlaceholder(wrapper, 'Select start date').setValue(
      '2026-06-10'
    );

    await inputByPlaceholder(wrapper, 'Select end date').setValue(
      '2026-05-10'
    );

    await wrapper.find('textarea#description').setValue(
      'This internship focused on frontend development using Vue and responsive interface design.'
    );

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('End date must be after start date');
    expect(wrapper.emitted('submit')).toBeFalsy();
  });

  it('requires institution and teacher email when project is academic', async () => {
    const wrapper = mountModal({
      type: 'project',
      professorEmails: ['teacher@school.com'],
      schoolOptions: ['ENSA Tanger'],
    });

    await fillValidProjectForm(wrapper);

    const checkboxes = wrapper.findAll('input[type="checkbox"]');

    await checkboxes[0].setValue(true);

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain(
      'Institution is required for academic projects'
    );
    expect(wrapper.text()).toContain(
      'Teacher email is required for academic projects'
    );

    expect(wrapper.emitted('submit')).toBeFalsy();
  });

  it('emits academic project data when academic fields are valid', async () => {
    const wrapper = mountModal({
      type: 'project',
      professorEmails: ['teacher@school.com'],
      schoolOptions: ['ENSA Tanger'],
    });

    await fillValidProjectForm(wrapper);

    const checkboxes = wrapper.findAll('input[type="checkbox"]');

    await checkboxes[0].setValue(true);
    await flushPromises();

    const selects = wrapper.findAll('select');

    await selects[0].setValue('ENSA Tanger');
    await selects[1].setValue('teacher@school.com');

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.emitted('submit')).toBeTruthy();

    const payload = wrapper.emitted('submit')[0][0];

    expect(payload.isAcademic).toBe(true);
    expect(payload.institution).toBe('ENSA Tanger');
    expect(payload.teacherEmail).toBe('teacher@school.com');
  });

  it('runs AI analysis after description typing delay', async () => {
    vi.useFakeTimers();

    analyzeExperienceDescription.mockResolvedValue({
      technologies: ['Vue.js', 'Express.js'],
      domains: ['Web Development'],
    });

    const wrapper = mountModal({
      type: 'project',
    });

    await wrapper.find('textarea#description').setValue(
      'This project uses Vue.js and Express.js to build a certified portfolio platform.'
    );

    await vi.advanceTimersByTimeAsync(2000);
    await flushPromises();

    expect(analyzeExperienceDescription).toHaveBeenCalledWith(
      'This project uses Vue.js and Express.js to build a certified portfolio platform.'
    );

    expect(wrapper.text()).toContain('Vue.js');
    expect(wrapper.text()).toContain('Express.js');
    expect(wrapper.text()).toContain('Web Development');
  });
});