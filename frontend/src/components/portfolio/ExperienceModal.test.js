// ============================================================
// ExperienceModal.test.js
// Vitest + Vue Test Utils tests for ExperienceModal.vue
// ============================================================

// ─────────────────────────────────────────────────────────────
// 1. IMPORTS AND MOCKS
// ─────────────────────────────────────────────────────────────
import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ExperienceModal from '@/components/portfolio/ExperienceModal.vue';

// Mock the AI analysis service
vi.mock('@/services/aiApi', () => ({
  analyzeExperienceDescription: vi.fn(),
}));

import { analyzeExperienceDescription } from '@/services/aiApi';

// ─────────────────────────────────────────────────────────────
// 2. HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Find a Button stub by its text content.
 * @param {import('@vue/test-utils').VueWrapper} wrapper
 * @param {string} text
 */
function buttonByText(wrapper, text) {
  return wrapper
    .findAllComponents({ name: 'Button' })
    .find(btn => btn.text().includes(text));
}

/**
 * Find an Input stub by its placeholder prop.
 * @param {import('@vue/test-utils').VueWrapper} wrapper
 * @param {string} placeholder
 */
function inputByPlaceholder(wrapper, placeholder) {
  return wrapper
    .findAllComponents({ name: 'Input' })
    .find(input => input.props('placeholder') === placeholder);
}

/**
 * Mount ExperienceModal with sensible defaults merged with custom props.
 * @param {object} props
 */
function mountModal(props = {}) {
  return mount(ExperienceModal, {
    props: {
      open: true,
      type: 'project',
      mode: 'create',
      loading: false,
      initialValue: null,
      professorEmails: ['teacher@school.com'],
      schoolOptions: ['ENSA Tanger'],
      ...props,
    },
    global: {
      stubs: modalStubs,
    },
  });
}

/** Fill every required field for a valid project form. */
async function fillValidProjectForm(wrapper) {
  // Title
  const titleInput = inputByPlaceholder(wrapper, 'Enter your project title');
  await titleInput.setValue('My Awesome Project');

  // Date
  const datePicker = wrapper
    .findAllComponents({ name: 'DatePicker' })
    .find(dp => dp.props('placeholder') === 'Select project date');
  await datePicker.setValue('2024-05-01');

  // Description (> 20 chars)
  await wrapper.find('textarea#description').setValue('This is a detailed description of my awesome project.');

  // Image
  const imageDropzone = wrapper.findComponent({ name: 'ImageDropzone' });
  await imageDropzone.setValue(new File(['img'], 'screenshot.png', { type: 'image/png' }));

  // GitHub link
  const githubInput = inputByPlaceholder(wrapper, 'https://github.com/username/project-name');
  await githubInput.setValue('https://github.com/student/project');
}

/** Fill every required field for a valid internship form. */
async function fillValidInternshipForm(wrapper) {
  const titleInput = inputByPlaceholder(wrapper, 'Enter your internship title');
  await titleInput.setValue('Summer Internship at TechCorp');

  const startDate = wrapper
    .findAllComponents({ name: 'DatePicker' })
    .find(dp => dp.props('placeholder') === 'Select start date');
  await startDate.setValue('2024-06-01');

  const endDate = wrapper
    .findAllComponents({ name: 'DatePicker' })
    .find(dp => dp.props('placeholder') === 'Select end date');
  await endDate.setValue('2024-08-31');

  await wrapper.find('textarea#description').setValue('Worked on backend services and improved performance significantly.');
}

/** Fill every required field for a valid activity form. */
async function fillValidActivityForm(wrapper) {
  const titleInput = inputByPlaceholder(wrapper, 'Enter your activity title');
  await titleInput.setValue('Hackathon 2024');

  const datePicker = wrapper
    .findAllComponents({ name: 'DatePicker' })
    .find(dp => dp.props('placeholder') === 'Select activity date');
  await datePicker.setValue('2024-04-10');

  await wrapper.find('textarea#description').setValue('Participated in a 24-hour hackathon and won first place.');

  const activityType = inputByPlaceholder(wrapper, 'Club event, competition, workshop...');
  await activityType.setValue('Competition');

  const location = inputByPlaceholder(wrapper, 'Where did it happen?');
  await location.setValue('ENSA Tanger');

  const club = inputByPlaceholder(wrapper, 'Club or organization name');
  await club.setValue('Dev Club');
}

/** Fill every required field for a valid certificate form. */
async function fillValidCertificateForm(wrapper) {
  const titleInput = inputByPlaceholder(wrapper, 'Enter your certificate title');
  await titleInput.setValue('AWS Certified Developer');

  const datePicker = wrapper
    .findAllComponents({ name: 'DatePicker' })
    .find(dp => dp.props('placeholder') === 'Select certificate date');
  await datePicker.setValue('2024-03-15');

  await wrapper.find('textarea#description').setValue('Passed the AWS Developer Associate certification exam successfully.');

  const certURL = inputByPlaceholder(wrapper, 'https://example.com/certificate');
  await certURL.setValue('https://example.com/my-cert');

  const certCode = inputByPlaceholder(wrapper, 'Certificate ID or verification code');
  await certCode.setValue('ABC-123');
}

// ─────────────────────────────────────────────────────────────
// 3. STUBS
// ─────────────────────────────────────────────────────────────

/**
 * Stubs for all child components.
 * Each stub that uses v-model supports modelValue / update:modelValue.
 * setValue() on these stubs triggers the update:modelValue event,
 * which causes the parent's reactive form fields to update.
 */
const modalStubs = {
  Input: {
    name: 'Input',
    template: `
      <div>
        <label v-if="label">{{ label }}</label>
        <input
          :placeholder="placeholder"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
        />
      </div>
    `,
    props: ['modelValue', 'label', 'placeholder', 'type'],
    emits: ['update:modelValue'],
  },

  DatePicker: {
    name: 'DatePicker',
    template: `
      <div>
        <label v-if="label">{{ label }}</label>
        <input
          type="date"
          :placeholder="placeholder"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
        />
      </div>
    `,
    props: ['modelValue', 'label', 'placeholder', 'maxDate', 'minDate'],
    emits: ['update:modelValue'],
  },

  ImageDropzone: {
    name: 'ImageDropzone',
    template: `
      <div>
        <span>{{ title }}</span>
        <input
          type="file"
          :accept="accept"
          @change="$emit('update:modelValue', $event.target.files[0] ?? null)"
        />
      </div>
    `,
    props: ['modelValue', 'title', 'accept'],
    emits: ['update:modelValue'],
  },

  Button: {
    name: 'Button',
    template: `<button :type="type" @click="$emit('click', $event)"><slot /></button>`,
    props: ['type', 'variant', 'loading'],
    emits: ['click'],
  },

  Error: {
    name: 'Error',
    template: `<span class="error-msg"><slot /></span>`,
    props: ['variant'],
  },

  CloseButton: {
    name: 'CloseButton',
    template: `<button class="close-btn" @click="$emit('click', $event)">Close</button>`,
    props: ['size'],
    emits: ['click'],
  },

  ToggleSwitch: {
    name: 'ToggleSwitch',
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
    props: ['modelValue', 'label'],
    emits: ['update:modelValue'],
  },

  Select: {
    name: 'Select',
    template: `
      <div>
        <label v-if="label">{{ label }}</label>
        <select
          :value="modelValue"
          @change="$emit('update:modelValue', $event.target.value)"
        >
          <option value="">{{ placeholder }}</option>
          <option v-for="opt in options" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
    `,
    props: ['modelValue', 'options', 'label', 'placeholder'],
    emits: ['update:modelValue'],
  },

  Dropdown: {
    name: 'Dropdown',
    template: `
      <div>
        <label v-if="label">{{ label }}</label>
        <select
          :value="modelValue"
          @change="$emit('update:modelValue', $event.target.value)"
        >
          <option value="">{{ placeholder }}</option>
          <option v-for="opt in options" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
    `,
    props: ['modelValue', 'options', 'label', 'placeholder', 'autocomplete'],
    emits: ['update:modelValue'],
  },

  Labels: {
    name: 'Labels',
    template: `
      <div>
        <span v-for="item in items" :key="item.name" class="label-item" @click="$emit('toggle', item)">
          {{ item.name }}
        </span>
      </div>
    `,
    props: ['items', 'title', 'colorRgb'],
    emits: ['toggle'],
  },
};

// ─────────────────────────────────────────────────────────────
// 4. TESTS
// ─────────────────────────────────────────────────────────────

describe('ExperienceModal', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.style.overflow = '';
  });

  // ──────────────────────────────────────────────────────────
  // COMMON BEHAVIOR
  // ──────────────────────────────────────────────────────────
  describe('common behavior', () => {

    it('does not render modal content when open is false', () => {
      const wrapper = mountModal({ open: false });
      expect(wrapper.find('.modal-overlay').exists()).toBe(false);
    });

    it('renders the modal when open is true', () => {
      const wrapper = mountModal({ open: true, type: 'project' });
      expect(wrapper.find('.modal-overlay').exists()).toBe(true);
      expect(wrapper.find('h2').text()).toContain('Create a new project');
    });

    it('emits close when clicking the CloseButton', async () => {
      const wrapper = mountModal();
      await wrapper.findComponent({ name: 'CloseButton' }).trigger('click');
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('emits close when clicking the Cancel button', async () => {
      const wrapper = mountModal();
      const cancelBtn = buttonByText(wrapper, 'Cancel');
      await cancelBtn.trigger('click');
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('locks body scroll when the modal opens', async () => {
  const wrapper = mountModal({ open: false });

  await wrapper.setProps({ open: true });

  expect(document.body.style.overflow).toBe('hidden');
});

   it('clears body scroll when the modal closes', async () => {
  const wrapper = mountModal({ open: true });

  await wrapper.setProps({ open: false });

  expect(document.body.style.overflow).toBe('');
});

    it('clears body scroll lock when the component unmounts', () => {
      const wrapper = mountModal({ open: true });
      wrapper.unmount();
      expect(document.body.style.overflow).toBe('');
    });

    it('shows a description error when description has fewer than 20 characters', async () => {
      const wrapper = mountModal();
      await wrapper.find('textarea#description').setValue('Too short');
      await wrapper.find('form').trigger('submit');
      expect(wrapper.text()).toContain('Description must be at least 20 characters');
    });

    it('runs AI analysis after a 2000ms typing delay', async () => {
      vi.useFakeTimers();
      analyzeExperienceDescription.mockResolvedValueOnce({
        technologies: ['Vue.js', 'Express.js'],
        domains: ['Web Development'],
      });

      const wrapper = mountModal();
      await wrapper.find('textarea#description').setValue(
        'This is a project that uses Vue.js and Express.js for web development.'
      );

      await vi.advanceTimersByTimeAsync(2000);
      await flushPromises();

      expect(analyzeExperienceDescription).toHaveBeenCalledWith(
        'This is a project that uses Vue.js and Express.js for web development.'
      );
      expect(wrapper.text()).toContain('Vue.js');
      expect(wrapper.text()).toContain('Express.js');
      expect(wrapper.text()).toContain('Web Development');
    });

    it('clears detected tags when description becomes shorter than 20 characters', async () => {
      vi.useFakeTimers();
      analyzeExperienceDescription.mockResolvedValueOnce({
        technologies: ['Vue.js'],
        domains: ['Web Development'],
      });

      const wrapper = mountModal();
      await wrapper.find('textarea#description').setValue(
        'This is a detailed description that should trigger analysis.'
      );
      await vi.advanceTimersByTimeAsync(2000);
      await flushPromises();

      expect(wrapper.text()).toContain('Vue.js');

      // Now shorten the description below 20 chars
      await wrapper.find('textarea#description').setValue('Too short');
      await flushPromises();

      expect(wrapper.text()).not.toContain('Vue.js');
      expect(wrapper.text()).not.toContain('Web Development');
    });

    it('includes selected labels in the submit payload', async () => {
      vi.useFakeTimers();
      analyzeExperienceDescription.mockResolvedValueOnce({
        technologies: ['Vue.js', 'Express.js'],
        domains: ['Web Development'],
      });

      const wrapper = mountModal({ type: 'project' });
      await fillValidProjectForm(wrapper);

      // Replace the description with the AI-triggering text
      await wrapper.find('textarea#description').setValue(
        'This is a project that uses Vue.js and Express.js for web development.'
      );
      await vi.advanceTimersByTimeAsync(2000);
      await flushPromises();

      await wrapper.find('form').trigger('submit');

      const payload = wrapper.emitted('submit')?.[0]?.[0];
      expect(payload).toBeDefined();
      expect(payload.technologies).toContain('Vue.js');
      expect(payload.technologies).toContain('Express.js');
      expect(payload.domains).toContain('Web Development');
    });

    it('excludes toggled-off labels from the submit payload', async () => {
      vi.useFakeTimers();
      analyzeExperienceDescription.mockResolvedValueOnce({
        technologies: ['Vue.js', 'Express.js'],
        domains: ['Web Development'],
      });

      const wrapper = mountModal({ type: 'project' });
      await fillValidProjectForm(wrapper);

      await wrapper.find('textarea#description').setValue(
        'This is a project that uses Vue.js and Express.js for web development.'
      );
      await vi.advanceTimersByTimeAsync(2000);
      await flushPromises();

      // Click the first Labels stub item to deselect "Vue.js"
      const labelsComponents = wrapper.findAllComponents({ name: 'Labels' });
      // "Detected technologies" is the second Labels component
      const techLabels = labelsComponents[1];
      const vuejsItem = techLabels.findAll('.label-item').find(el => el.text() === 'Vue.js');
      await vuejsItem.trigger('click');
      await flushPromises();

      await wrapper.find('form').trigger('submit');

      const payload = wrapper.emitted('submit')?.[0]?.[0];
      expect(payload).toBeDefined();
      expect(payload.technologies).not.toContain('Vue.js');
      expect(payload.technologies).toContain('Express.js');
    });

  });

  // ──────────────────────────────────────────────────────────
  // PROJECT TYPE
  // ──────────────────────────────────────────────────────────
  describe('project type', () => {

    it('renders project-specific fields', () => {
      const wrapper = mountModal({ type: 'project' });
      const text = wrapper.text();

      expect(text).toContain('Project title');
      expect(text).toContain('Project date');
      expect(text).toContain('Upload project screenshot');
      expect(wrapper.findComponent({ name: 'Input' })
        .props('placeholder')).toBe('Enter your project title');

      const githubInput = inputByPlaceholder(wrapper, 'https://github.com/username/project-name');
      expect(githubInput).toBeTruthy();

      // Academic project toggle should be present
      const toggles = wrapper.findAllComponents({ name: 'ToggleSwitch' });
      const academicToggle = toggles.find(t => t.props('label') === 'Academic project');
      expect(academicToggle).toBeTruthy();

      // Visible to everyone toggle should be present
      const visibleToggle = toggles.find(t => t.props('label') === 'Visible to everyone');
      expect(visibleToggle).toBeTruthy();
    });

    it('shows required errors when submitting an empty project form', async () => {
      const wrapper = mountModal({ type: 'project' });
      await wrapper.find('form').trigger('submit');

      const text = wrapper.text();
      expect(text).toContain('Project title is required');
      expect(text).toContain('Project date is required');
      expect(text).toContain('Project screenshot is required');
      expect(text).toContain('Description must be at least 20 characters');
      expect(text).toContain('GitHub link is required');

      expect(wrapper.emitted('submit')).toBeFalsy();
    });

    it('emits the correct payload when a valid project form is submitted', async () => {
      const wrapper = mountModal({ type: 'project' });
      await fillValidProjectForm(wrapper);
      await wrapper.find('form').trigger('submit');

      expect(wrapper.emitted('submit')).toBeTruthy();
      const payload = wrapper.emitted('submit')[0][0];

      expect(payload.title).toBe('My Awesome Project');
      expect(payload.date).toBe('2024-05-01');
      expect(payload.description).toBe('This is a detailed description of my awesome project.');
      expect(payload.image).toBeInstanceOf(File);
      expect(payload.githubLink).toBe('https://github.com/student/project');
      expect(payload.certificateURL).toBe('');
      expect(payload.certificateCode).toBe('');
      expect(payload.isAcademic).toBe(false);
      expect(payload.institution).toBe('');
      expect(payload.teacherEmail).toBe('');
      expect(payload.visibleToEveryone).toBe(true);
    });

    it('shows an error for an invalid GitHub link', async () => {
      const wrapper = mountModal({ type: 'project' });
      await fillValidProjectForm(wrapper);

      // Override GitHub link with an invalid one
      const githubInput = inputByPlaceholder(wrapper, 'https://github.com/username/project-name');
      await githubInput.setValue('https://gitlab.com/student/project');

      await wrapper.find('form').trigger('submit');

      expect(wrapper.text()).toContain('Enter a valid GitHub project URL');
      expect(wrapper.emitted('submit')).toBeFalsy();
    });

    it('requires institution and teacher email for academic projects', async () => {
      const wrapper = mountModal({ type: 'project' });
      await fillValidProjectForm(wrapper);

      // Enable the academic toggle (first ToggleSwitch)
      const toggles = wrapper.findAllComponents({ name: 'ToggleSwitch' });
      const academicToggle = toggles.find(t => t.props('label') === 'Academic project');
      await academicToggle.find('input[type="checkbox"]').setChecked(true);
      await flushPromises();

      await wrapper.find('form').trigger('submit');

      const text = wrapper.text();
      expect(text).toContain('Institution is required for academic projects');
      expect(text).toContain('Teacher email is required for academic projects');
      expect(wrapper.emitted('submit')).toBeFalsy();
    });

    it('emits correct payload for an academic project with valid institution and teacher email', async () => {
      const wrapper = mountModal({ type: 'project' });
      await fillValidProjectForm(wrapper);

      const toggles = wrapper.findAllComponents({ name: 'ToggleSwitch' });
      const academicToggle = toggles.find(t => t.props('label') === 'Academic project');
      await academicToggle.find('input[type="checkbox"]').setChecked(true);
      await flushPromises();

      // Select institution (first <select>)
      const selects = wrapper.findAll('select');
      await selects[0].setValue('ENSA Tanger');

      // Select teacher email (second <select>)
      await selects[1].setValue('teacher@school.com');

      await wrapper.find('form').trigger('submit');

      expect(wrapper.emitted('submit')).toBeTruthy();
      const payload = wrapper.emitted('submit')[0][0];
      expect(payload.isAcademic).toBe(true);
      expect(payload.institution).toBe('ENSA Tanger');
      expect(payload.teacherEmail).toBe('teacher@school.com');
    });

    it('requires teacher email when academic project has no teacher selected', async () => {
  const wrapper = mountModal({ type: 'project' });

  await fillValidProjectForm(wrapper);

  const toggles = wrapper.findAllComponents({ name: 'ToggleSwitch' });
  const academicToggle = toggles.find(
    t => t.props('label') === 'Academic project'
  );

  await academicToggle.find('input[type="checkbox"]').setChecked(true);
  await flushPromises();

  const selects = wrapper.findAll('select');
  await selects[0].setValue('ENSA Tanger');

  await wrapper.find('form').trigger('submit');

  expect(wrapper.text()).toContain(
    'Teacher email is required for academic projects'
  );

  expect(wrapper.emitted('submit')).toBeFalsy();
});

  });

  // ──────────────────────────────────────────────────────────
  // INTERNSHIP TYPE
  // ──────────────────────────────────────────────────────────
  describe('internship type', () => {

    it('renders internship-specific fields', () => {
      const wrapper = mountModal({ type: 'internship' });
      const text = wrapper.text();

      expect(text).toContain('Start date');
      expect(text).toContain('End date');
      expect(text).toContain('Completed missions');
      expect(text).toContain('Internship report URL');
      expect(text).toContain('Academic internship');

      // Should NOT show GitHub link
      const githubInput = inputByPlaceholder(wrapper, 'https://github.com/username/project-name');
      expect(githubInput).toBeFalsy();
    });

    it('shows required errors when submitting an empty internship form', async () => {
      const wrapper = mountModal({ type: 'internship' });
      await wrapper.find('form').trigger('submit');

      const text = wrapper.text();
      expect(text).toContain('Internship title is required');
      expect(text).toContain('Start date is required');
      expect(text).toContain('End date is required');
      expect(text).toContain('Description must be at least 20 characters');

      // Internship does NOT require image or GitHub
      expect(text).not.toContain('Internship photo is required');
      expect(text).not.toContain('GitHub link is required');
    });

    it('shows an error when end date is before start date', async () => {
      const wrapper = mountModal({ type: 'internship' });
      await fillValidInternshipForm(wrapper);

      // Override dates to be invalid
      const startDate = wrapper
        .findAllComponents({ name: 'DatePicker' })
        .find(dp => dp.props('placeholder') === 'Select start date');
      await startDate.setValue('2026-06-10');

      const endDate = wrapper
        .findAllComponents({ name: 'DatePicker' })
        .find(dp => dp.props('placeholder') === 'Select end date');
      await endDate.setValue('2026-05-10');

      await wrapper.find('form').trigger('submit');

      expect(wrapper.text()).toContain('End date must be after start date');
      expect(wrapper.emitted('submit')).toBeFalsy();
    });

    it('emits the correct payload for a valid internship', async () => {
      const wrapper = mountModal({ type: 'internship' });
      await fillValidInternshipForm(wrapper);

      await wrapper.find('textarea#missions').setValue('Built REST APIs and wrote unit tests.');
      const reportInput = inputByPlaceholder(wrapper, 'https://example.com/internship-report.pdf');
      await reportInput.setValue('https://example.com/my-report.pdf');

      await wrapper.find('form').trigger('submit');

      expect(wrapper.emitted('submit')).toBeTruthy();
      const payload = wrapper.emitted('submit')[0][0];

      expect(payload.title).toBe('Summer Internship at TechCorp');
      expect(payload.date).toBe('2024-06-01');  // date = startDate for range mode
      expect(payload.startDate).toBe('2024-06-01');
      expect(payload.endDate).toBe('2024-08-31');
      expect(payload.missions).toBe('Built REST APIs and wrote unit tests.');
      expect(payload.report).toBe('https://example.com/my-report.pdf');
      expect(payload.githubLink).toBe('');
      expect(payload.image).toBeNull();
      expect(payload.isAcademic).toBe(false);
    });

    it('requires institution and teacher email for academic internships', async () => {
      const wrapper = mountModal({ type: 'internship' });
      await fillValidInternshipForm(wrapper);

      const toggles = wrapper.findAllComponents({ name: 'ToggleSwitch' });
      const academicToggle = toggles.find(t => t.props('label') === 'Academic internship');
      await academicToggle.find('input[type="checkbox"]').setChecked(true);
      await flushPromises();

      await wrapper.find('form').trigger('submit');

      const text = wrapper.text();
      expect(text).toContain('Institution is required for academic internships');
      expect(text).toContain('Teacher email is required for academic internships');
      expect(wrapper.emitted('submit')).toBeFalsy();
    });

  });

  // ──────────────────────────────────────────────────────────
  // ACTIVITY TYPE
  // ──────────────────────────────────────────────────────────
  describe('activity type', () => {

    it('renders activity-specific fields', () => {
      const wrapper = mountModal({ type: 'activity' });
      const text = wrapper.text();

      expect(text).toContain('Activity title');
      expect(text).toContain('Activity date');
      expect(text).toContain('Activity type');
      expect(text).toContain('Location');
      expect(text).toContain('Club');
      expect(text).toContain('Upload activity photo');

      // Should NOT show GitHub link
      const githubInput = inputByPlaceholder(wrapper, 'https://github.com/username/project-name');
      expect(githubInput).toBeFalsy();

      // Should NOT show Academic toggle
      const toggles = wrapper.findAllComponents({ name: 'ToggleSwitch' });
      const academicToggle = toggles.find(t => t.props('label') === 'Academic activity');
      expect(academicToggle).toBeFalsy();
    });

    it('emits the correct payload for a valid activity', async () => {
      const wrapper = mountModal({ type: 'activity' });
      await fillValidActivityForm(wrapper);
      await wrapper.find('form').trigger('submit');

      expect(wrapper.emitted('submit')).toBeTruthy();
      const payload = wrapper.emitted('submit')[0][0];

      expect(payload.title).toBe('Hackathon 2024');
      expect(payload.date).toBe('2024-04-10');
      expect(payload.description).toBe('Participated in a 24-hour hackathon and won first place.');
      expect(payload.activityType).toBe('Competition');
      expect(payload.location).toBe('ENSA Tanger');
      expect(payload.club).toBe('Dev Club');
      expect(payload.githubLink).toBe('');
      expect(payload.isAcademic).toBe(false);
      expect(payload.teacherEmail).toBe('');
      expect(payload.institution).toBe('');
      // image is optional for activities
      expect(payload.image).toBeNull();
    });

    it('shows required errors when submitting an empty activity form', async () => {
      const wrapper = mountModal({ type: 'activity' });
      await wrapper.find('form').trigger('submit');

      const text = wrapper.text();
      expect(text).toContain('Activity title is required');
      expect(text).toContain('Activity date is required');
      expect(text).toContain('Description must be at least 20 characters');

      // Activity does NOT require image or GitHub
      expect(text).not.toContain('Activity photo is required');
      expect(text).not.toContain('GitHub link is required');
    });

  });

  // ──────────────────────────────────────────────────────────
  // CERTIFICATE TYPE
  // ──────────────────────────────────────────────────────────
  describe('certificate type', () => {

    it('renders certificate-specific fields', () => {
      const wrapper = mountModal({ type: 'certificate' });
      const text = wrapper.text();

      expect(text).toContain('Certificate title');
      expect(text).toContain('Certificate date');
      expect(text).toContain('Issuing institution');
      expect(text).toContain('Certificate URL');
      expect(text).toContain('Certificate code');
      expect(text).toContain('Upload certificate screenshot');

      // Should NOT show GitHub link
      const githubInput = inputByPlaceholder(wrapper, 'https://github.com/username/project-name');
      expect(githubInput).toBeFalsy();

      // Should NOT show Academic toggle
      const toggles = wrapper.findAllComponents({ name: 'ToggleSwitch' });
      const academicToggle = toggles.find(t => t.props('label') === 'Academic certificate');
      expect(academicToggle).toBeFalsy();
    });

    it('shows an error for an invalid certificate URL', async () => {
      const wrapper = mountModal({ type: 'certificate' });
      await fillValidCertificateForm(wrapper);

      // Override with an invalid URL
      const certURL = inputByPlaceholder(wrapper, 'https://example.com/certificate');
      await certURL.setValue('wrong-url');

      await wrapper.find('form').trigger('submit');

      expect(wrapper.text()).toContain('Enter a valid certificate URL');
      expect(wrapper.emitted('submit')).toBeFalsy();
    });

    it('emits the correct payload for a valid certificate', async () => {
      const wrapper = mountModal({ type: 'certificate' });
      await fillValidCertificateForm(wrapper);
      await wrapper.find('form').trigger('submit');

      expect(wrapper.emitted('submit')).toBeTruthy();
      const payload = wrapper.emitted('submit')[0][0];

      expect(payload.title).toBe('AWS Certified Developer');
      expect(payload.date).toBe('2024-03-15');
      expect(payload.description).toBe('Passed the AWS Developer Associate certification exam successfully.');
      expect(payload.certificateURL).toBe('https://example.com/my-cert');
      expect(payload.certificateCode).toBe('ABC-123');
      expect(payload.githubLink).toBe('');
      expect(payload.isAcademic).toBe(false);

      // NOTE: The current component only emits institution when showAcademic is true
      // and isAcademic is true. Certificate uses form.institution for "Issuing institution"
      // visually, but since showAcademic is false for certificate, institution is always ''
      // in the emitted payload. This appears to be a bug — the issuing institution entered
      // for a certificate is silently dropped. To fix this, the submit handler should emit:
      //   institution: config.showCertificateFields ? trimmedInstitution : (config.showAcademic && form.isAcademic ? trimmedInstitution : '')
      // For now, we test current behavior:
      expect(payload.institution).toBe('');
    });

  });

  // ──────────────────────────────────────────────────────────
  // EDIT MODE
  // ──────────────────────────────────────────────────────────
  describe('edit mode', () => {

    const projectInitialValue = {
      title: 'Existing Project',
      date: '2023-11-20',
      description: 'This is the existing project description that is long enough.',
      githubLink: 'https://github.com/student/existing-project',
      image: null,
      technologies: ['React', 'Node.js'],
      domains: ['Full Stack'],
    };

    it('renders the edit title and Save changes button', () => {
      const wrapper = mountModal({
        mode: 'edit',
        type: 'project',
        initialValue: projectInitialValue,
      });

      expect(wrapper.find('h2').text()).toContain('Edit project');
      const saveBtn = buttonByText(wrapper, 'Save changes');
      expect(saveBtn).toBeTruthy();
    });

    it('pre-fills the form with initialValue in edit mode', async () => {
  const wrapper = mountModal({
    open: false,
    mode: 'edit',
    type: 'project',
    initialValue: projectInitialValue,
  });

  await wrapper.setProps({ open: true });
  await flushPromises();

  const titleInput = wrapper.find('input[placeholder="Enter your project title"]');

expect(titleInput.exists()).toBe(true);
expect(titleInput.element.value).toBe('Existing Project');
});
    it('does not require an image when editing a project', async () => {
  const wrapper = mountModal({
    open: false,
    mode: 'edit',
    type: 'project',
    initialValue: projectInitialValue,
  });

  await wrapper.setProps({ open: true });
  await flushPromises();

  await wrapper.find('form').trigger('submit.prevent');
  await flushPromises();

  expect(wrapper.text()).not.toContain('Project screenshot is required');
  expect(wrapper.emitted('submit')).toBeTruthy();
});
  });

});