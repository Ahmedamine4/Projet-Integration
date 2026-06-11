<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { analyzeExperienceDescription } from '@/services/aiApi';
import BaseButton from '@/components/common/actions/BaseButton.vue';
import BaseInput from '@/components/common/forms/BaseInput.vue';
import DatePicker from '@/components/common/forms/DatePicker.vue';
import BaseDropdown from '@/components/common/forms/BaseDropdown.vue';
import BaseLabels from '@/components/common/forms/BaseLabels.vue';
import ToggleSwitch from '@/components/common/forms/ToggleSwitch.vue';
import ImageDropzone from '@/components/common/forms/ImageDropzone.vue';
import CloseButton from '@/components/common/actions/CloseButton.vue';
import DeleteButton from '@/components/common/actions/DeleteButton.vue';
import BaseSelect from '@/components/common/forms/BaseSelect.vue';
import BaseError from '@/components/common/feedback/BaseError.vue';
import { useBodyScrollLock } from '@/composables/useBodyScrollLock';
import { formatLocalDate } from '@/utils/date';
import ModificationRequest from '@/components/common/display/ModificationRequest.vue';
import api from '@/services/api';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'create',
    validator: value => ['create', 'edit'].includes(value),
  },
  type: {
    type: String,
    default: 'project',
    validator: value => ['project', 'internship', 'activity', 'certificate'].includes(value),
  },
  initialValue: {
    type: Object,
    default: null,
  },
  schoolOptions: {
    type: Array,
    default: () => [],
  },
  academicInstitutions: {
    type: Array,
    default: () => [],
  },
  certificationInstitutionOptions: {
    type: Array,
    default: () => [],
  },
  professorEmails: {
    type: Array,
    default: () => [],
  },
  message: {
    type: Object,
    default: () => ({teacherName: '', content: ''}),
  },
});

const emit = defineEmits(['close', 'submit', 'delete']);

const experienceConfigs = {
  project: {
    label: 'Project',
    title: 'project',
    dateMode: 'single',
    showImageUpload: true,
    imageLabel: 'screenshot',
    imageAccept: 'image/*',
    imageRequired: true,
    cropWidth: 1280,
    cropHeight: 720,
    showGithub: true,
    showAcademic: true,
    showTags: true,
    showMissions: false,
    showActivityFields: false,
    showCertificateFields: false,
  },
  internship: {
    label: 'Internship',
    title: 'internship',
    dateMode: 'range',
    showImageUpload: true,
    imageLabel: 'photo',
    imageAccept: 'image/*',
    imageRequired: false,
    cropWidth: 1280,
    cropHeight: 720,
    showGithub: false,
    showAcademic: true,
    showTags: true,
    showMissions: true,
    showActivityFields: false,
    showCertificateFields: false,
  },
  activity: {
    label: 'Activity',
    title: 'activity',
    dateMode: 'single',
    showImageUpload: true,
    imageLabel: 'photo',
    imageAccept: 'image/*',
    imageRequired: false,
    cropWidth: 1280,
    cropHeight: 720,
    showGithub: false,
    showAcademic: true,
    showTags: true,
    showMissions: false,
    showActivityFields: true,
    showCertificateFields: false,
  },
  certificate: {
    label: 'Certificate',
    title: 'certificate',
    dateMode: 'single',
    showImageUpload: true,
    imageLabel: 'screenshot',
    imageAccept: 'image/*',
    imageRequired: false,
    cropWidth: 1280,
    cropHeight: 720,
    showGithub: false,
    showAcademic: false,
    showTags: true,
    showMissions: false,
    showActivityFields: false,
    showCertificateFields: true,
  },
};

const currentConfig = computed(() => experienceConfigs[props.type]);

const capitalizedType = computed(() => {
  return currentConfig.value.label;
});

const isEdit = computed(() => props.mode === 'edit');

const requiresAcademicTeacher = computed(() => {
  return props.type !== 'activity';
});

const fetchedProfessorEmails = ref([]);
const isLoadingProfessors = ref(false);
const hasFetchedProfessors = ref(false);
let professorRequestId = 0;

const selectedAcademicInstitution = computed(() => {
  return props.academicInstitutions.find((institution) => {
    return institution?.nom === form.institution;
  }) ?? null;
});

const professorEmailOptions = computed(() => {
  if (form.isAcademic && requiresAcademicTeacher.value && form.institution) {
    return fetchedProfessorEmails.value;
  }

  return props.professorEmails;
});

const noTeachersForInstitutionMessage = 'The institution you selected has no teachers. Please select another institution.';

const selectedInstitutionHasNoTeachers = computed(() => (
  form.isAcademic &&
  requiresAcademicTeacher.value &&
  form.institution &&
  hasFetchedProfessors.value &&
  !isLoadingProfessors.value &&
  fetchedProfessorEmails.value.length === 0
));

const errors = reactive({
  title: '',
  date: '',
  startDate: '',
  endDate: '',
  image: '',
  description: '',
  githubLink: '',
  certificateURL: '',
  institution: '',
  teacherEmail: '',
});

const MAX_TEXT_LEN = 1200;

const domainColorRgb = '245, 158, 11';

const form = reactive({
  title: '',
  date: '',
  startDate: '',
  endDate: '',
  description: '',
  image: null,
  githubLink: '',
  certificateURL: '',
  certificateCode: '',
  activityType: '',
  location: '',
  club: '',
  missions: '',
  report: '',
  isAcademic: false,
  institution: '',
  teacherEmail: '',
  visibleToEveryone: true
});

function resetForm() {
  Object.keys(form).forEach(key => {
    if (key === 'image') form[key] = null;
    else if (key === 'isAcademic') form[key] = false;
    else if (key === 'visibleToEveryone') form[key] = true;
    else form[key] = '';
  });
  resetDetectedTags();
  resetErrors();
}

function fillForm() {
  const value = props.initialValue;
  isHydratingForm.value = true;
  resetForm();
  if (!value) {
    isHydratingForm.value = false;
    return;
  }
  Object.keys(form).forEach(key => {
    if (value[key] !== undefined) form[key] = value[key];
  });
  technologies.value = createSelectableItems(value.technologies ?? []);
  domains.value = createSelectableItems(value.domains ?? []);
  resetErrors();

  nextTick(() => {
    isHydratingForm.value = false;
  });
}

const createSelectableItems = (items = []) =>
  items.map((name) => ({
    name,
    selected: true
  }));

const technologies = ref([]);
const domains = ref([]);
const isHydratingForm = ref(false);

let descriptionTypingTimer = null;

const toggleLabel = (item) => {
  item.selected = !item.selected;
};

const getSelectedNames = (items) =>
  items.filter((item) => item.selected).map((item) => item.name);

const normalizeList = (items = []) => [...items].filter(Boolean).sort((a, b) => a.localeCompare(b));

const normalizeComparableValue = (value) => {
  if (Array.isArray(value)) return normalizeList(value);
  if (typeof value === 'string') return value.trim();
  return value ?? '';
};

function getComparableExperience(source = {}, config = currentConfig.value) {
  const sourceTechnologies = source === form
    ? getSelectedNames(technologies.value)
    : source.technologies ?? [];
  const sourceDomains = source === form
    ? getSelectedNames(domains.value)
    : source.domains ?? [];
  const isAcademicExperience = config.showAcademic && Boolean(source.isAcademic);
  const hasInstitutionField = config.showCertificateFields || isAcademicExperience;

  return {
    title: normalizeComparableValue(source.title),
    date: normalizeComparableValue(config.dateMode === 'range' ? source.startDate : source.date),
    startDate: normalizeComparableValue(source.startDate),
    endDate: normalizeComparableValue(source.endDate),
    description: normalizeComparableValue(source.description),
    technologies: config.showTags ? normalizeList(sourceTechnologies) : [],
    domains: config.showTags ? normalizeList(sourceDomains) : [],
    githubLink: config.showGithub ? normalizeComparableValue(source.githubLink) : '',
    certificateURL: config.showCertificateFields ? normalizeComparableValue(source.certificateURL) : '',
    certificateCode: config.showCertificateFields ? normalizeComparableValue(source.certificateCode) : '',
    isAcademic: isAcademicExperience,
    institution: hasInstitutionField ? normalizeComparableValue(source.institution) : '',
    teacherEmail: isAcademicExperience && requiresAcademicTeacher.value
      ? normalizeComparableValue(source.teacherEmail)
      : '',
    activityType: config.showActivityFields ? normalizeComparableValue(source.activityType) : '',
    location: config.showActivityFields ? normalizeComparableValue(source.location) : '',
    club: config.showActivityFields ? normalizeComparableValue(source.club) : '',
    missions: config.showMissions ? normalizeComparableValue(source.missions) : '',
    report: config.showMissions ? normalizeComparableValue(source.report) : '',
    visibleToEveryone: Boolean(source.visibleToEveryone),
    hasNewImage: source === form ? Boolean(source.image) : false,
  };
}

const hasEditChanges = computed(() => {
  if (!isEdit.value || !props.initialValue) return true;

  const config = currentConfig.value;
  const current = getComparableExperience(form, config);
  const initial = getComparableExperience(props.initialValue, config);

  return JSON.stringify(current) !== JSON.stringify(initial);
});

const resetDetectedTags = () => {
  technologies.value = [];
  domains.value = [];
};

function resetErrors() {
  Object.keys(errors).forEach((key) => {
    errors[key] = '';
  });
}

async function fetchProfessorsForInstitution() {
  const requestId = ++professorRequestId;
  fetchedProfessorEmails.value = [];
  hasFetchedProfessors.value = false;
  errors.teacherEmail = '';

  if (
    !props.open ||
    !form.isAcademic ||
    !requiresAcademicTeacher.value ||
    !form.institution
  ) {
    return;
  }

  const institutionId = selectedAcademicInstitution.value?.institution_id;
  if (!institutionId) {
    form.teacherEmail = '';
    return;
  }

  isLoadingProfessors.value = true;

  try {
    const response = await api.get(`/getInstitutions/${institutionId}/professeurs`);
    if (requestId !== professorRequestId) return;

    fetchedProfessorEmails.value = (response.data?.data?.professeurs ?? [])
      .map((professor) => professor?.utilisateur?.email)
      .filter(Boolean);
    hasFetchedProfessors.value = true;

    if (!fetchedProfessorEmails.value.length) {
      form.teacherEmail = '';
      errors.teacherEmail = noTeachersForInstitutionMessage;
      return;
    }

    if (
      form.teacherEmail &&
      !fetchedProfessorEmails.value.includes(form.teacherEmail)
    ) {
      form.teacherEmail = '';
    }
  } catch {
    if (requestId === professorRequestId) {
      fetchedProfessorEmails.value = [];
      hasFetchedProfessors.value = false;
      form.teacherEmail = '';
    }
  } finally {
    if (requestId === professorRequestId) {
      isLoadingProfessors.value = false;
    }
  }
}

function hasErrors() {
  return Object.values(errors).some(Boolean);
}

function isValidGithubLink(link) {
  try {
    const url = new URL(link);
    return url.protocol === 'https:' && url.hostname === 'github.com';
  } catch {
    return false;
  }
};

function isValidURL(link) {
  try {
    const url = new URL(link);
    return ['http:', 'https:'].includes(url.protocol);
  }
  catch {
    return false;
  }
}

const isAnalyzingDescription = ref(false);
const analysisError = ref('');

const analyzeDescription = async () => {
  if (!form.description.trim()) return;

  isAnalyzingDescription.value = true;
  analysisError.value = '';

  try {
    const data = await analyzeExperienceDescription(form.description);

    technologies.value = createSelectableItems(data.technologies);
    domains.value = createSelectableItems(data.domains);
  } catch (error) {
    analysisError.value = error.message;
  } finally {
    isAnalyzingDescription.value = false;
  }
};

watch(
  () => form.description,
  (description) => {
    clearTimeout(descriptionTypingTimer);
    if (isHydratingForm.value) return;

    if (description.trim().length < 20) {
      resetDetectedTags();
      return;
    }

    descriptionTypingTimer = setTimeout(analyzeDescription, 2000);
  }
);

onUnmounted(() => {
  clearTimeout(descriptionTypingTimer);
});

const todayValue = computed(() => formatLocalDate(new Date()));
const formBodyRef = ref(null);
const errorFieldOrder = [
  'title',
  'date',
  'startDate',
  'endDate',
  'image',
  'description',
  'certificateURL',
  'githubLink',
  'institution',
  'teacherEmail',
];

function invalidDateRange(startDate, endDate) {
  return (
    startDate &&
    endDate &&
    new Date(endDate) < new Date(startDate)
  );
}

async function scrollToFirstError() {
  await nextTick();

  const firstErrorKey = errorFieldOrder.find((key) => errors[key]);
  const formBody = formBodyRef.value;
  if (!firstErrorKey || !formBody) return;

  const field = formBody.querySelector(`[data-error-field="${firstErrorKey}"]`);
  if (!field) return;

  const focusTarget = field.querySelector('input, textarea, button, [tabindex]:not([tabindex="-1"])');
  focusTarget?.focus?.({ preventScroll: false });
}

const submitExperience = () => {
  if (isEdit.value && !hasEditChanges.value) return;

  resetErrors();

  const config = currentConfig.value;
  const trimmedTitle = form.title.trim();
  const trimmedDescription = form.description.trim();
  const trimmedGithubLink = form.githubLink.trim();
  const trimmedCertificateURL = form.certificateURL.trim();
  const trimmedCertificateCode = form.certificateCode.trim();
  const trimmedActivityType = form.activityType.trim();
  const trimmedLocation = form.location.trim();
  const trimmedClub = form.club.trim();
  const trimmedMissions = form.missions.trim();
  const trimmedReport = form.report.trim();
  const trimmedTeacherEmail = form.teacherEmail.trim();
  const trimmedInstitution = form.institution.trim();

  if (!trimmedTitle) errors.title = `${capitalizedType.value} title is required`;

  if (config.dateMode === 'range') {
    if (!form.startDate) errors.startDate = 'Start date is required';
    if (!form.endDate) errors.endDate = 'End date is required';

    if (invalidDateRange(form.startDate, form.endDate)) {
      errors.endDate = 'End date must be after start date';
    }
  }
  else if (!form.date) errors.date = `${capitalizedType.value} date is required`;

  if (!isEdit.value && config.imageRequired && !form.image) errors.image = `${capitalizedType.value} ${config.imageLabel} is required`;

  if (trimmedDescription.length < 20)
    errors.description = 'Description must be at least 20 characters';
  else if (trimmedDescription.length > MAX_TEXT_LEN)
    errors.description = `Description must be ${MAX_TEXT_LEN} characters or fewer`;

  if (config.showGithub) {
    if (trimmedGithubLink && !isValidGithubLink(trimmedGithubLink))
      errors.githubLink = 'Enter a valid GitHub project URL';
  }

  if (
    config.showCertificateFields &&
    trimmedCertificateURL &&
    !isValidURL(trimmedCertificateURL)
  ) errors.certificateURL = 'Enter a valid certificate URL';

  if (config.showAcademic) {
    if (form.isAcademic && !form.institution)
      errors.institution = `Institution is required for academic ${props.type}s`;

    if (requiresAcademicTeacher.value && selectedInstitutionHasNoTeachers.value)
      errors.teacherEmail = noTeachersForInstitutionMessage;
    else if (requiresAcademicTeacher.value && form.isAcademic && !trimmedTeacherEmail)
      errors.teacherEmail = `Teacher email is required for academic ${props.type}s`;
    else if (
      requiresAcademicTeacher.value &&
      form.isAcademic &&
      !professorEmailOptions.value.includes(trimmedTeacherEmail)
    )
      errors.teacherEmail = 'Select a valid teacher email';
  }

  if (hasErrors()) {
    scrollToFirstError();
    return;
  }

  emit('submit', {
    title: trimmedTitle,
    date: config.dateMode === 'range'
      ? form.startDate 
      : form.date,
    startDate: form.startDate,
    endDate: form.endDate,
    image: form.image,
    description: trimmedDescription,
    technologies: config.showTags
      ? getSelectedNames(technologies.value)
      : [],
    domains: config.showTags
      ? getSelectedNames(domains.value)
      : [],
    githubLink: config.showGithub
      ? trimmedGithubLink
      : '',
    certificateURL: config.showCertificateFields
      ? trimmedCertificateURL
      : '',
    certificateCode: config.showCertificateFields
      ? trimmedCertificateCode
      : '',
    isAcademic: config.showAcademic && form.isAcademic,
    institution: config.showCertificateFields
      ? trimmedInstitution
      : config.showAcademic && form.isAcademic
      ? trimmedInstitution
      : '',
    activityType: config.showActivityFields
      ? trimmedActivityType
      : '',
    location: config.showActivityFields
      ? trimmedLocation
      : '',
    club: config.showActivityFields
      ? trimmedClub
      : '',
    missions: config.showMissions
      ? trimmedMissions
      : '',
    report: config.showMissions
      ? trimmedReport
      : '',
    teacherEmail: config.showAcademic && form.isAcademic
      && requiresAcademicTeacher.value
      ? trimmedTeacherEmail
      : '',
    visibleToEveryone: form.visibleToEveryone,
  });
};

const textareaElem = ref(null);
const missionsTextareaElem = ref(null);

function resizeOneTextarea(textarea) {
  if (!textarea) return;

  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function resizeTextarea() {
  resizeOneTextarea(textareaElem.value);
  resizeOneTextarea(missionsTextareaElem.value);
}

onMounted(resizeTextarea);

useBodyScrollLock(() => props.open);

watch(() => props.open, (open) => {
  if (!open) return;

  if (isEdit.value) fillForm();
  else resetForm();

  nextTick(resizeTextarea);
});

function resetAcademicErrors() {
  errors.institution = '';
  errors.teacherEmail = '';
}

watch(
  () => form.isAcademic,
  (value) => {
    if (!value) resetAcademicErrors();
});

watch(
  [
    () => props.open,
    () => props.type,
    () => form.isAcademic,
    () => form.institution,
    () => props.academicInstitutions,
  ],
  fetchProfessorsForInstitution
);

function getFileNameFromUrl(url) {
  if (!url) return '';

  const cleanUrl = url.split('?')[0];
  const fileName = cleanUrl.split('/').pop();

  return fileName ? decodeURIComponent(fileName) : '';
}

const existingImagePreview = computed(() => {
  return isEdit.value ? props.initialValue?.imagePreview || '' : '';
});

const existingImageName = computed(() => {
  return getFileNameFromUrl(existingImagePreview.value);
});
</script>

<template>
  <Transition name="pop-up">
    <div
      v-if="open"
      class="modal-overlay"
      @click.self="emit('close')"
    >
      <div class="modal-card">
        <div class="modal-card__header">
          <h2>
            {{ `${isEdit ? 'Edit' : 'Create a new'} ${props.type}` }}
          </h2>
          <div class="close-button">
            <CloseButton
              size="lg"
              @click="emit('close')"
            />
          </div>
        </div>
        <form
          class="experience-form"
          @submit.prevent="submitExperience"
        >
          <div
            ref="formBodyRef"
            class="experience-form__body"
          >
            <ModificationRequest
              v-if="
                props.mode === 'edit' &&
                  form.isAcademic &&
                  message.teacherName &&
                  message.content"
              :writer-name="message.teacherName"
            >
              {{ message.content }}
            </ModificationRequest>
            <div
              class="field"
              data-error-field="title"
            >
              <BaseInput
                v-model="form.title"
                :label="`${capitalizedType} title`"
                :placeholder="`Enter your ${props.type} title`"
              />
              <BaseError
                v-if="errors.title"
                variant="field"
              >
                {{ errors.title }}
              </BaseError>
            </div>

            <div
              v-if="currentConfig.dateMode === 'single'"
              class="field"
              data-error-field="date"
            >
              <DatePicker
                v-model="form.date"
                :label="`${capitalizedType} date`"
                :placeholder="`Select ${props.type} date`"
                :max-date="todayValue"
              />
              <BaseError
                v-if="errors.date"
                variant="field"
              >
                {{ errors.date }}
              </BaseError>
            </div>


            <div
              v-else
              class="form-group"
            >
              <div
                class="field"
                data-error-field="startDate"
              >
                <DatePicker
                  v-model="form.startDate"
                  label="Start date"
                  placeholder="Select start date"
                  :max-date="todayValue"
                />
                <BaseError
                  v-if="errors.startDate"
                  variant="field"
                >
                  {{ errors.startDate }}
                </BaseError>
              </div>

              <div
                class="field"
                data-error-field="endDate"
              >
                <DatePicker
                  v-model="form.endDate"
                  label="End date"
                  placeholder="Select end date"
                  :min-date="form.startDate"
                />
                <BaseError
                  v-if="errors.endDate"
                  variant="field"
                >
                  {{ errors.endDate }}
                </BaseError>
              </div>
            </div>

            <div
              v-if="currentConfig.showImageUpload"
              class="field"
              data-error-field="image"
            >
              <ImageDropzone
                v-model="form.image"
                :title="`Upload ${props.type} ${currentConfig.imageLabel}`"
                :accept="currentConfig.imageAccept"
                :initial-preview-url="existingImagePreview"
                :initial-file-name="existingImageName"
                :crop-width="currentConfig.cropWidth"
                :crop-height="currentConfig.cropHeight"
              />
              <BaseError
                v-if="errors.image"
                variant="field"
              >
                {{ errors.image }}
              </BaseError>
            </div>

            <div
              class="field"
              data-error-field="description"
            >
              <div class="form-group-textarea">
                <label for="description">Description</label>
                <textarea
                  id="description"
                  ref="textareaElem"
                  v-model="form.description"
                  :placeholder="`Describe your ${props.type}, its goal, features, and tools used...`"
                  :maxlength="MAX_TEXT_LEN"
                  @input="resizeTextarea"
                />
                <div class="textarea-meta">
                  <BaseError
                    v-if="errors.description"
                    variant="field"
                  >
                    {{ errors.description }}
                  </BaseError>

                  <span class="textarea-counter">
                    {{ form.description.length }}/{{ MAX_TEXT_LEN }}
                  </span>
                </div>
              </div>
            </div>

            <div class="labels-section">
              <p class="helper-text">
                Missing a technology? Make sure it is clearly mentioned in the description, then try again.
              </p>

              <BaseLabels
                title="Detected domains"
                :items="domains"
                :color-rgb="domainColorRgb"
                @toggle="toggleLabel"
              />

              <BaseLabels
                title="Detected technologies"
                :items="technologies"
                @toggle="toggleLabel"
              />
            </div>

            <div
              v-if="currentConfig.showMissions"
              class="field"
            >
              <div class="form-group-textarea">
                <label for="missions">Completed missions</label>
                <textarea
                  id="missions"
                  ref="missionsTextareaElem"
                  v-model="form.missions"
                  :placeholder="`Describe the tasks, responsibilities, and work completed during the internship...`"
                  :maxlength="MAX_TEXT_LEN"
                  @input="resizeTextarea"
                />

                <span class="textarea-counter">
                  {{ form.missions.length }}/{{ MAX_TEXT_LEN }}
                </span>
              </div>
            </div>

            <div
              v-if="currentConfig.showMissions"
              class="field"
            >
              <BaseInput
                v-model="form.report"
                label="Internship report URL"
                type="url"
                placeholder="https://example.com/internship-report.pdf"
              />
            </div>

            <div
              v-if="currentConfig.showActivityFields"
              class="form-group"
            >
              <div class="field">
                <BaseInput
                  v-model="form.activityType"
                  label="Activity type"
                  placeholder="Club event, competition, workshop..."
                />
              </div>

              <div class="field">
                <BaseInput
                  v-model="form.location"
                  label="Location"
                  placeholder="Where did it happen?"
                />
              </div>

              <div class="field">
                <BaseInput
                  v-model="form.club"
                  label="Club"
                  placeholder="Club or organization name"
                />
              </div>
            </div>

            <div
              v-if="currentConfig.showCertificateFields"
              class="form-group"
            >
              <div class="field">
                <BaseDropdown
                  v-model="form.institution"
                  :options="certificationInstitutionOptions"
                  label="Issuing institution"
                  placeholder="Institution or platform name"
                  autocomplete="nope"
                />
              </div>

              <div
                class="field"
                data-error-field="certificateURL"
              >
                <BaseInput
                  v-model="form.certificateURL"
                  label="Certificate URL"
                  type="url"
                  placeholder="https://example.com/certificate"
                />
                <BaseError
                  v-if="errors.certificateURL"
                  variant="field"
                >
                  {{ errors.certificateURL }}
                </BaseError>
              </div>

              <div class="field">
                <BaseInput
                  v-model="form.certificateCode"
                  label="Certificate code"
                  placeholder="Certificate ID or verification code"
                />
              </div>
            </div>

            <div
              v-if="currentConfig.showGithub"
              class="field"
              data-error-field="githubLink"
            >
              <BaseInput
                v-model="form.githubLink"
                label="GitHub link"
                type="url"
                placeholder="https://github.com/username/project-name"
              />
              <BaseError
                v-if="errors.githubLink"
                variant="field"
              >
                {{ errors.githubLink }}
              </BaseError>
            </div>

            <div
              v-if="currentConfig.showAcademic"
              class="academic-experience-section"
            >
              <ToggleSwitch
                v-model="form.isAcademic"
                :label="`Academic ${props.type}`"
              />
              <Transition name="field-reveal">
                <div
                  v-if="form.isAcademic"
                  class="academic-form-group"
                >
                  <div
                    class="institution-field"
                    data-error-field="institution"
                  >
                    <BaseSelect
                      v-model="form.institution"
                      :options="schoolOptions"
                      label="Institution"
                      placeholder="Select the institution"
                    />
                    <BaseError
                      v-if="errors.institution"
                      variant="field"
                    >
                      {{ errors.institution }}
                    </BaseError>
                  </div>
                  <div
                    v-if="requiresAcademicTeacher"
                    class="field"
                    data-error-field="teacherEmail"
                  >
                    <BaseDropdown
                      v-model="form.teacherEmail"
                      :options="professorEmailOptions"
                      label="Teacher email"
                      :placeholder="isLoadingProfessors ? 'Loading teachers...' : 'teacher@school.com'"
                      autocomplete="nope"
                    />
                    <BaseError
                      v-if="errors.teacherEmail"
                      variant="field"
                    >
                      {{ errors.teacherEmail }}
                    </BaseError>
                  </div>
                </div>
              </Transition>
            </div>

            <ToggleSwitch
              v-model="form.visibleToEveryone"
              label="Visible to everyone"
            />
          </div>

          <div class="experience-form__footer">
            <DeleteButton
              v-if="isEdit"
              type="button"
              :disabled="loading"
              @click="emit('delete')"
            >
              Delete
            </DeleteButton>
            <div class="experience-form__footer-actions">
              <BaseButton
                type="button"
                variant="ghost"
                :disabled="loading"
                @click="$emit('close')"
              >
                Cancel
              </BaseButton>

              <BaseButton
                type="submit"
                variant="submit"
                :loading
                :disabled="isEdit && !hasEditChanges"
              >
                {{ isEdit ? 'Save changes' : `Submit ${props.type}` }}
              </BaseButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(var(--color-primary-rgb), 0.3);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.modal-card {
  --modal-edge-space: var(--space-lg);
  --modal-field-gap: var(--space-md);
  --modal-inner-gap: var(--space-xs);
  --scrollbar-width: 10px;
  position: relative;
  display: flex;
  flex-direction: column;
  width: clamp(34rem, 42vw, 46rem);
  max-width: 100vw;
  background-color: var(--color-background);
  height: calc(100vh - 2 * var(--space-sm));
  border-radius: var(--radius-md);
  margin-inline: var(--space-sm);
  overflow: hidden;
}

.modal-card__header {
  position: sticky;
  top: 0;
  z-index: 10;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--modal-edge-space);
  background-color: var(--color-background);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.12);
}

.modal-card__header::after {
  content: '';
  position: absolute;
  left: 0;
  right: var(--scrollbar-width);
  top: 100%;
  height: 24px;
  pointer-events: none;
  backdrop-filter: blur(4px);
  mask-image: linear-gradient(
    to bottom,
    black 0%,
    black 20%,
    rgba(0, 0, 0, 0.65) 55%,
    transparent 100%
  );
  -webkit-backdrop-filter: blur(4px);
  -webkit-mask-image: linear-gradient(
    to bottom,
    black 0%,
    black 20%,
    rgba(0, 0, 0, 0.65) 55%,
    transparent 100%
  );
}

.modal-card__header h2 {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.2rem;
  line-height: 1.2;
}

.close-button {
  display: inline-flex;
  flex-shrink: 0;
}

.experience-form {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.experience-form__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scroll-behavior: smooth;
  display: grid;
  gap: var(--modal-field-gap);
  padding: var(--modal-edge-space);
}

.field,
.institution-field {
  display: grid;
  gap: var(--modal-inner-gap);
}
 
.file-name {
  margin-top: var(--space-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
}

.file-name--empty {
  color: var(--color-error);
}

.file-name--selected {
  color: var(--color-success);
}

.form-group,
.academic-form-group {
  display: grid;
  gap: var(--modal-field-gap);
}

.academic-form-group {
  margin-top: var(--space-md);
}

.form-group-textarea {
  display: grid;
  gap: var(--modal-inner-gap);
}

:is(.form-group, .form-group-textarea) label {
  font-size: var(--font-size-xs);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: var(--font-medium);
  color: var(--color-primary-hover);
}

textarea {
  width: 100%;
  min-height: 110px;
  resize: none;
  border: 1px solid rgba(var(--color-primary-rgb), 0.18);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  background: rgba(var(--color-surface-rgb), 0.32);
  color: var(--color-primary);
  font-family: var(--font-ui);
  font-size: var(--font-size-md);
  overflow: hidden;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

textarea:focus {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.15);
}

.textarea-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  min-height: 1rem;
}

.textarea-counter {
  margin: 0;
  color: var(--color-primary-hover);
  font-size: var(--font-size-xxs);
  margin-left: auto;
  white-space: nowrap;
  text-align: right;
}

.helper-text {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-xxs);
}

.labels-section {
  display: grid;
  gap: var(--modal-field-gap);
}

.academic-experience-section {
  display: grid;
}

.experience-form__footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  gap: var(--space-sm);
  padding: var(--space-md) var(--modal-edge-space);
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.12);
}

.experience-form__footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
}

.experience-form__footer::before {
  content: '';
  position: absolute;
  left: 0;
  right: var(--scrollbar-width);
  bottom: 100%;
  height: 24px;
  pointer-events: none;
  backdrop-filter: blur(4px);
  mask-image: linear-gradient(
    to top,
    black 0%,
    black 20%,
    rgba(0, 0, 0, 0.65) 55%,
    transparent 100%
  );
  -webkit-backdrop-filter: blur(4px);
  -webkit-mask-image: linear-gradient(
    to top,
    black 0%,
    black 20%,
    rgba(0, 0, 0, 0.65) 55%,
    transparent 100%
  );
}

.field-reveal-enter-from,
.field-reveal-leave-to {
  opacity: 0;
  margin-top: 0;
  max-height: 0;
}

.field-reveal-enter-active,
.field-reveal-leave-active {
  overflow: hidden;
  transition:
    opacity var(--transition-normal),
    max-height var(--transition-normal),
    margin-top var(--transition-normal);
}

.field-reveal-enter-to,
.field-reveal-leave-from {
  opacity: 1;
  max-height: 8rem;
}

.pop-up-enter-from,
.pop-up-leave-to {
  opacity: 0;
}

.pop-up-enter-active,
.pop-up-leave-active {
  transition: opacity var(--transition-normal);
}

.pop-up-enter-to,
.pop-up-leave-from {
  opacity: 1;
}

.pop-up-enter-from .modal-card,
.pop-up-leave-to .modal-card {
  transform: scale(0.97);
}

.pop-up-enter-active .modal-card,
.pop-up-leave-active .modal-card {
  transition: transform 0.4s var(--ease-overshoot);
}

.pop-up-enter-to .modal-card,
.pop-up-leave-from .modal-card {
  transform: scale(1);
}

@media (max-width: 980px) {
  .modal-card {
    margin-inline: auto;
  }
}

@media (max-width: 480px) {
  .modal-card {
    width: 100%;
    max-width: none;
    margin-inline: 0;
    align-self: flex-end;
    height: 70vh;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }
}
</style>
