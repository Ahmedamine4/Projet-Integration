import { defineComponent } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ExperienceModal from './ExperienceModal.vue';
import { analyzeExperienceDescription } from '@/services/aiApi';
import api from '@/services/api';

vi.mock('@/services/aiApi', () => ({
  analyzeExperienceDescription: vi.fn(),
}));

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('@/composables/useBodyScrollLock', () => ({
  useBodyScrollLock: vi.fn(),
}));

vi.mock('@/utils/date', () => ({
  formatLocalDate: vi.fn(() => '2026-06-10'),
}));

const BaseButtonStub = defineComponent({
  name: 'BaseButton',
  props: {
    type: {
      type: String,
      default: 'button',
    },
    variant: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  template: `
    <button
      :type="type"
      data-test="base-button"
      :data-variant="variant"
      :disabled="disabled || loading"
      @click="$emit('click')"
    >
      <slot />
    </button>
  `,
});

const BaseInputStub = defineComponent({
  name: 'BaseInput',
  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  template: `
    <label
      data-test="base-input"
      :data-label="label"
    >
      <span>{{ label }}</span>
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', $event.target.value)"
      >
    </label>
  `,
});

const DatePickerStub = defineComponent({
  name: 'DatePicker',
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
    maxDate: {
      type: String,
      default: '',
    },
    minDate: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  template: `
    <label
      data-test="date-picker"
      :data-label="label"
      :data-max-date="maxDate"
      :data-min-date="minDate"
    >
      <span>{{ label }}</span>
      <input
        type="date"
        :value="modelValue"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', $event.target.value)"
      >
    </label>
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
    <label
      data-test="base-dropdown"
      :data-label="label"
    >
      <span>{{ label }}</span>
      <input
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
    <label
      data-test="base-select"
      :data-label="label"
    >
      <span>{{ label }}</span>
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
    </label>
  `,
});

const BaseLabelsStub = defineComponent({
  name: 'BaseLabels',
  props: {
    title: {
      type: String,
      default: '',
    },
    items: {
      type: Array,
      default: () => [],
    },
    colorRgb: {
      type: String,
      default: '',
    },
  },
  emits: ['toggle'],
  template: `
    <section
      data-test="base-labels"
      :data-title="title"
    >
      <h4>{{ title }}</h4>
      <button
        v-for="item in items"
        :key="item.name"
        type="button"
        data-test="label-item"
        :data-name="item.name"
        :data-selected="String(item.selected)"
        @click="$emit('toggle', item)"
      >
        {{ item.name }}
      </button>
    </section>
  `,
});

const ToggleSwitchStub = defineComponent({
  name: 'ToggleSwitch',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  template: `
    <label
      data-test="toggle-switch"
      :data-label="label"
    >
      <span>{{ label }}</span>
      <input
        type="checkbox"
        :checked="modelValue"
        @change="$emit('update:modelValue', $event.target.checked)"
      >
    </label>
  `,
});

const ImageDropzoneStub = defineComponent({
  name: 'ImageDropzone',
  props: {
    modelValue: {
      type: Object,
      default: null,
    },
    title: {
      type: String,
      default: '',
    },
    accept: {
      type: String,
      default: '',
    },
    initialPreviewUrl: {
      type: String,
      default: '',
    },
    initialFileName: {
      type: String,
      default: '',
    },
    cropWidth: {
      type: Number,
      default: 0,
    },
    cropHeight: {
      type: Number,
      default: 0,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    function uploadImage() {
      const file = new File(['image'], 'project.png', {
        type: 'image/png',
      });

      emit('update:modelValue', file);
    }

    return {
      props,
      uploadImage,
    };
  },
  template: `
    <div
      data-test="image-dropzone"
      :data-title="title"
      :data-accept="accept"
      :data-initial-preview-url="initialPreviewUrl"
      :data-initial-file-name="initialFileName"
      :data-crop-width="cropWidth"
      :data-crop-height="cropHeight"
    >
      <button
        type="button"
        data-test="upload-image"
        @click="uploadImage"
      >
        Upload image
      </button>
    </div>
  `,
});

const CloseButtonStub = defineComponent({
  name: 'CloseButton',
  props: {
    size: {
      type: String,
      default: 'md',
    },
  },
  emits: ['click'],
  template: `
    <button
      type="button"
      data-test="close-button"
      :data-size="size"
      @click="$emit('click')"
    >
      Close
    </button>
  `,
});

const DeleteButtonStub = defineComponent({
  name: 'DeleteButton',
  props: {
    type: {
      type: String,
      default: 'button',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  template: `
    <button
      :type="type"
      data-test="delete-button"
      :disabled="disabled"
      @click="$emit('click')"
    >
      <slot />
    </button>
  `,
});

const BaseErrorStub = defineComponent({
  name: 'BaseError',
  props: {
    variant: {
      type: String,
      default: 'field',
    },
  },
  template: `
    <p
      data-test="base-error"
      :data-variant="variant"
    >
      <slot />
    </p>
  `,
});

const ModificationRequestStub = defineComponent({
  name: 'ModificationRequest',
  props: {
    writerName: {
      type: String,
      default: '',
    },
  },
  template: `
    <div
      data-test="modification-request"
      :data-writer-name="writerName"
    >
      <slot />
    </div>
  `,
});

const schoolOptions = ['EMSI', 'ENSIAS'];
const professorEmails = ['teacher@school.com', 'professor@school.com'];

const academicInstitutions = [
  {
    institution_id: 1,
    nom: 'EMSI',
  },
  {
    institution_id: 2,
    nom: 'ENSIAS',
  },
];

const initialProject = {
  id: 1,
  title: 'Existing Project',
  date: '2026-05-01',
  startDate: '',
  endDate: '',
  description: 'Existing project description with enough characters.',
  image: null,
  imagePreview: 'https://example.com/existing-project.png',
  githubLink: 'https://github.com/user/existing-project',
  technologies: ['Vue.js'],
  domains: ['Web Development'],
  isAcademic: false,
  institution: '',
  teacherEmail: '',
  visibleToEveryone: true,
};

function mountModal(props = {}) {
  return mount(ExperienceModal, {
    props: {
      open: true,
      loading: false,
      mode: 'create',
      type: 'project',
      initialValue: null,
      schoolOptions,
      academicInstitutions,
      professorEmails,
      message: {
        teacherName: '',
        content: '',
      },
      ...props,
    },
    attachTo: document.body,
    global: {
      stubs: {
        BaseButton: BaseButtonStub,
        BaseInput: BaseInputStub,
        DatePicker: DatePickerStub,
        BaseDropdown: BaseDropdownStub,
        BaseLabels: BaseLabelsStub,
        ToggleSwitch: ToggleSwitchStub,
        ImageDropzone: ImageDropzoneStub,
        CloseButton: CloseButtonStub,
        DeleteButton: DeleteButtonStub,
        BaseSelect: BaseSelectStub,
        BaseError: BaseErrorStub,
        ModificationRequest: ModificationRequestStub,
        Transition: true,
      },
    },
  });
}

async function mountOpenedModal(props = {}) {
  const wrapper = mountModal({
    ...props,
    open: false,
  });

  await wrapper.setProps({
    open: true,
  });

  await flushPromises();

  return wrapper;
}

function findInputByLabel(wrapper, label) {
  const field = wrapper
    .findAll('[data-test="base-input"]')
    .find((input) => input.attributes('data-label') === label);

  return field.find('input');
}

function findDateByLabel(wrapper, label) {
  const field = wrapper
    .findAll('[data-test="date-picker"]')
    .find((input) => input.attributes('data-label') === label);

  return field.find('input');
}

function findDropdownByLabel(wrapper, label) {
  const field = wrapper
    .findAll('[data-test="base-dropdown"]')
    .find((input) => input.attributes('data-label') === label);

  return field.find('input');
}

function findSelectByLabel(wrapper, label) {
  const field = wrapper
    .findAll('[data-test="base-select"]')
    .find((input) => input.attributes('data-label') === label);

  return field.find('select');
}

function findToggleByLabel(wrapper, label) {
  const field = wrapper
    .findAll('[data-test="toggle-switch"]')
    .find((input) => input.attributes('data-label') === label);

  return field.find('input');
}

async function fillValidProject(wrapper) {
  await findInputByLabel(wrapper, 'Project title').setValue('New Project');
  await findDateByLabel(wrapper, 'Project date').setValue('2026-06-01');

  await wrapper
    .find('#description')
    .setValue('This is a valid project description with enough characters.');

  await wrapper.find('[data-test="upload-image"]').trigger('click');

  await findInputByLabel(wrapper, 'GitHub link').setValue(
    'https://github.com/user/project'
  );
}

async function fillValidInternship(wrapper) {
  await findInputByLabel(wrapper, 'Internship title').setValue('Frontend Internship');
  await findDateByLabel(wrapper, 'Start date').setValue('2026-01-01');
  await findDateByLabel(wrapper, 'End date').setValue('2026-06-01');

  await wrapper
    .find('#description')
    .setValue('This is a valid internship description with enough characters.');
}

async function fillValidCertificate(wrapper) {
  await findInputByLabel(wrapper, 'Certificate title').setValue('Vue Certificate');
  await findDateByLabel(wrapper, 'Certificate date').setValue('2026-03-01');

  await wrapper
    .find('#description')
    .setValue('This is a valid certificate description with enough characters.');
}

describe('ExperienceModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    analyzeExperienceDescription.mockResolvedValue({
      technologies: ['Vue.js', 'Express.js'],
      domains: ['Web Development'],
    });

    api.get.mockResolvedValue({
      data: {
        data: {
          professeurs: [
            {
              utilisateur: {
                email: 'teacher@school.com',
              },
            },
            {
              utilisateur: {
                email: 'professor@school.com',
              },
            },
          ],
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('does not render when open is false', () => {
    const wrapper = mountModal({
      open: false,
    });

    expect(wrapper.find('.modal-overlay').exists()).toBe(false);
  });

  it('renders create project modal by default', () => {
    const wrapper = mountModal();

    expect(wrapper.find('.modal-overlay').exists()).toBe(true);
    expect(wrapper.text()).toContain('Create a new project');
    expect(wrapper.text()).toContain('Project title');
    expect(wrapper.text()).toContain('Project date');
    expect(wrapper.text()).toContain('GitHub link');
    expect(wrapper.text()).toContain('Academic project');
    expect(wrapper.text()).toContain('Visible to everyone');

    expect(wrapper.find('[data-test="image-dropzone"]').attributes('data-title')).toBe(
      'Upload project screenshot'
    );
  });

  it('emits close when clicking the close button', async () => {
    const wrapper = mountModal();

    await wrapper.find('[data-test="close-button"]').trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('emits close when clicking cancel', async () => {
    const wrapper = mountModal();

    const cancelButton = wrapper
      .findAll('[data-test="base-button"]')
      .find((button) => button.text() === 'Cancel');

    await cancelButton.trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('emits close when clicking the overlay background', async () => {
    const wrapper = mountModal();

    await wrapper.find('.modal-overlay').trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('shows required errors when submitting an empty project form', async () => {
    const wrapper = mountModal();

    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('Project title is required');
    expect(wrapper.text()).toContain('Project date is required');
    expect(wrapper.text()).toContain('Project screenshot is required');
    expect(wrapper.text()).toContain('Description must be at least 20 characters');
    expect(wrapper.text()).toContain('GitHub link is required');

    expect(wrapper.emitted('submit')).toBeFalsy();
  });

  it('shows an error when GitHub URL is invalid', async () => {
    const wrapper = mountModal();

    await fillValidProject(wrapper);
    await findInputByLabel(wrapper, 'GitHub link').setValue('https://gitlab.com/user/project');

    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('Enter a valid GitHub project URL');
    expect(wrapper.emitted('submit')).toBeFalsy();
  });

  it('emits submit with a valid project payload', async () => {
    const wrapper = mountModal();

    await fillValidProject(wrapper);
    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('submit')).toBeTruthy();

    const payload = wrapper.emitted('submit')[0][0];

    expect(payload).toMatchObject({
      title: 'New Project',
      date: '2026-06-01',
      startDate: '',
      endDate: '',
      description: 'This is a valid project description with enough characters.',
      technologies: [],
      domains: [],
      githubLink: 'https://github.com/user/project',
      certificateURL: '',
      certificateCode: '',
      isAcademic: false,
      institution: '',
      teacherEmail: '',
      visibleToEveryone: true,
    });

    expect(payload.image).toBeInstanceOf(File);
    expect(payload.image.name).toBe('project.png');
  });

  it('shows academic fields when academic project is enabled', async () => {
    const wrapper = mountModal();

    await findToggleByLabel(wrapper, 'Academic project').setValue(true);

    expect(wrapper.text()).toContain('Institution');
    expect(wrapper.text()).toContain('Teacher email');
  });

  it('validates academic project institution and teacher email', async () => {
    const wrapper = mountModal();

    await fillValidProject(wrapper);
    await findToggleByLabel(wrapper, 'Academic project').setValue(true);

    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('Institution is required for academic projects');
    expect(wrapper.text()).toContain('Teacher email is required for academic projects');
    expect(wrapper.emitted('submit')).toBeFalsy();
  });

  it('validates teacher email against fetched professor emails', async () => {
    const wrapper = mountModal();

    await fillValidProject(wrapper);
    await findToggleByLabel(wrapper, 'Academic project').setValue(true);
    await findSelectByLabel(wrapper, 'Institution').setValue('EMSI');

    await flushPromises();

    expect(api.get).toHaveBeenCalledWith('/getInstitutions/1/professeurs');

    await findDropdownByLabel(wrapper, 'Teacher email').setValue('wrong@school.com');

    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('Select a valid teacher email');
    expect(wrapper.emitted('submit')).toBeFalsy();
  });

  it('emits academic fields when academic project is valid', async () => {
    const wrapper = mountModal();

    await fillValidProject(wrapper);
    await findToggleByLabel(wrapper, 'Academic project').setValue(true);
    await findSelectByLabel(wrapper, 'Institution').setValue('EMSI');

    await flushPromises();

    expect(api.get).toHaveBeenCalledWith('/getInstitutions/1/professeurs');

    await findDropdownByLabel(wrapper, 'Teacher email').setValue('teacher@school.com');

    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('submit')).toBeTruthy();

    const payload = wrapper.emitted('submit')[0][0];

    expect(payload).toMatchObject({
      isAcademic: true,
      institution: 'EMSI',
      teacherEmail: 'teacher@school.com',
    });
  });

  it('renders internship specific fields', () => {
    const wrapper = mountModal({
      type: 'internship',
    });

    expect(wrapper.text()).toContain('Create a new internship');
    expect(wrapper.text()).toContain('Start date');
    expect(wrapper.text()).toContain('End date');
    expect(wrapper.text()).toContain('Completed missions');
    expect(wrapper.text()).toContain('Internship report URL');
    expect(wrapper.text()).not.toContain('GitHub link');
  });

  it('validates internship date range', async () => {
    const wrapper = mountModal({
      type: 'internship',
    });

    await fillValidInternship(wrapper);
    await findDateByLabel(wrapper, 'End date').setValue('2025-12-01');

    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('End date must be after start date');
    expect(wrapper.emitted('submit')).toBeFalsy();
  });

  it('emits submit with a valid internship payload', async () => {
    const wrapper = mountModal({
      type: 'internship',
    });

    await fillValidInternship(wrapper);

    await wrapper
      .find('#missions')
      .setValue('I completed frontend integration and API connection tasks.');

    await findInputByLabel(wrapper, 'Internship report URL').setValue(
      'https://example.com/report.pdf'
    );

    await wrapper.find('form').trigger('submit');

    const payload = wrapper.emitted('submit')[0][0];

    expect(payload).toMatchObject({
      title: 'Frontend Internship',
      date: '2026-01-01',
      startDate: '2026-01-01',
      endDate: '2026-06-01',
      githubLink: '',
      missions: 'I completed frontend integration and API connection tasks.',
      report: 'https://example.com/report.pdf',
    });
  });

  it('renders activity specific fields', () => {
    const wrapper = mountModal({
      type: 'activity',
    });

    expect(wrapper.text()).toContain('Create a new activity');
    expect(wrapper.text()).toContain('Activity type');
    expect(wrapper.text()).toContain('Location');
    expect(wrapper.text()).toContain('Club');
    expect(wrapper.text()).not.toContain('Teacher email');
  });

  it('renders certificate specific fields', () => {
    const wrapper = mountModal({
      type: 'certificate',
    });

    expect(wrapper.text()).toContain('Create a new certificate');
    expect(wrapper.text()).toContain('Issuing institution');
    expect(wrapper.text()).toContain('Certificate URL');
    expect(wrapper.text()).toContain('Certificate code');
    expect(wrapper.text()).not.toContain('Academic certificate');
  });

  it('validates certificate URL when invalid', async () => {
    const wrapper = mountModal({
      type: 'certificate',
    });

    await fillValidCertificate(wrapper);
    await findInputByLabel(wrapper, 'Certificate URL').setValue('not-a-url');

    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('Enter a valid certificate URL');
    expect(wrapper.emitted('submit')).toBeFalsy();
  });

  it('renders edit mode with initial values', async () => {
    const wrapper = await mountOpenedModal({
      mode: 'edit',
      initialValue: initialProject,
    });

    expect(wrapper.text()).toContain('Edit project');

    expect(findInputByLabel(wrapper, 'Project title').element.value).toBe(
      'Existing Project'
    );

    expect(findDateByLabel(wrapper, 'Project date').element.value).toBe(
      '2026-05-01'
    );

    expect(wrapper.find('#description').element.value).toBe(
      'Existing project description with enough characters.'
    );

    expect(findInputByLabel(wrapper, 'GitHub link').element.value).toBe(
      'https://github.com/user/existing-project'
    );

    expect(wrapper.find('[data-test="image-dropzone"]').attributes('data-initial-preview-url')).toBe(
      'https://example.com/existing-project.png'
    );
  });

  it('disables save button in edit mode when there are no changes', async () => {
    const wrapper = await mountOpenedModal({
      mode: 'edit',
      initialValue: initialProject,
    });

    const saveButton = wrapper
      .findAll('[data-test="base-button"]')
      .find((button) => button.text() === 'Save changes');

    expect(saveButton.element.disabled).toBe(true);
  });

  it('emits submit in edit mode after changing a field', async () => {
    const wrapper = await mountOpenedModal({
      mode: 'edit',
      initialValue: initialProject,
    });

    await findInputByLabel(wrapper, 'Project title').setValue('Updated Project');
    await wrapper.find('form').trigger('submit');

    const payload = wrapper.emitted('submit')[0][0];

    expect(payload.title).toBe('Updated Project');
    expect(payload.githubLink).toBe('https://github.com/user/existing-project');
  });

  it('emits delete in edit mode', async () => {
    const wrapper = await mountOpenedModal({
      mode: 'edit',
      initialValue: initialProject,
    });

    await wrapper.find('[data-test="delete-button"]').trigger('click');

    expect(wrapper.emitted('delete')).toBeTruthy();
    expect(wrapper.emitted('delete')).toHaveLength(1);
  });

  it('renders modification request in edit academic mode when message exists', async () => {
    const wrapper = await mountOpenedModal({
      mode: 'edit',
      initialValue: {
        ...initialProject,
        isAcademic: true,
        institution: 'EMSI',
        teacherEmail: 'teacher@school.com',
      },
      message: {
        teacherName: 'Professor Smith',
        content: 'Please improve the description.',
      },
    });

    expect(wrapper.find('[data-test="modification-request"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="modification-request"]').attributes('data-writer-name')).toBe(
      'Professor Smith'
    );
    expect(wrapper.text()).toContain('Please improve the description.');
  });

  it('analyzes description and renders detected labels', async () => {
    const wrapper = mountModal();

    await wrapper
      .find('#description')
      .setValue('This project uses Vue.js and Express.js for web development.');

    vi.advanceTimersByTime(2000);
    await flushPromises();

    expect(analyzeExperienceDescription).toHaveBeenCalledWith(
      'This project uses Vue.js and Express.js for web development.'
    );

    expect(wrapper.text()).toContain('Detected technologies');
    expect(wrapper.text()).toContain('Vue.js');
    expect(wrapper.text()).toContain('Express.js');

    expect(wrapper.text()).toContain('Detected domains');
    expect(wrapper.text()).toContain('Web Development');
  });

  it('does not render detected labels when AI analysis fails', async () => {
    analyzeExperienceDescription.mockRejectedValueOnce(
      new Error('AI unavailable')
    );

    const wrapper = mountModal();

    await wrapper
      .find('#description')
      .setValue('This project uses Vue.js and Express.js for web development.');

    vi.advanceTimersByTime(2000);
    await flushPromises();

    expect(analyzeExperienceDescription).toHaveBeenCalledWith(
      'This project uses Vue.js and Express.js for web development.'
    );

    expect(wrapper.text()).not.toContain('Vue.js');
    expect(wrapper.text()).not.toContain('Express.js');
    expect(wrapper.text()).not.toContain('Web Development');
  });

  it('can toggle detected labels before submit', async () => {
    const wrapper = mountModal();

    await wrapper
      .find('#description')
      .setValue('This project uses Vue.js and Express.js for web development.');

    vi.advanceTimersByTime(2000);
    await flushPromises();

    const vueLabel = wrapper
      .findAll('[data-test="label-item"]')
      .find((label) => label.attributes('data-name') === 'Vue.js');

    await vueLabel.trigger('click');

    await findInputByLabel(wrapper, 'Project title').setValue('New Project');
    await findDateByLabel(wrapper, 'Project date').setValue('2026-06-01');
    await wrapper.find('[data-test="upload-image"]').trigger('click');
    await findInputByLabel(wrapper, 'GitHub link').setValue(
      'https://github.com/user/project'
    );

    await wrapper.find('form').trigger('submit');

    const payload = wrapper.emitted('submit')[0][0];

    expect(payload.technologies).toEqual(['Express.js']);
    expect(payload.domains).toEqual(['Web Development']);
  });
});