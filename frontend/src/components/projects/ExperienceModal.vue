<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { analyzeExperienceDescription } from '@/services/aiApi';
import Button from '@/components/common/Button.vue';
import Input from '@/components/common/Input.vue';
import DatePicker from '@/components/common/DatePicker.vue';
import Dropdown from '@/components/common/Dropdown.vue';
import Labels from '@/components/common/Labels.vue';
import ToggleSwitch from '@/components/common/ToggleSwitch.vue';
import ImageDropzone from '@/components/common/ImageDropzone.vue';
import CloseButton from '@/components/common/CloseButton.vue';
import Select from '@/components/common/Select.vue';
import Error from '@/components/common/Error.vue';

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
});

const emit = defineEmits(['close', 'submit']);

const experienceConfigs = {
  project: {
    label: 'Project',
    title: 'project',
    dateMode: 'single',
    showImageUpload: true,
    imageLabel: 'screenshot',
    imageAccept: 'image/*',
    imageRequired: true,
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
    showGithub: false,
    showAcademic: false,
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

const schoolOptions = [
  'ENSA Tanger',
  'ENSA Tetouan',
  'ENSA Al Hoceima',
  'FST Tanger',
];

const professorEmails = [
  'ahmed.elamrani@ensat.ac.ma',
  'fatima.zahra@ensat.ac.ma',
  'youssef.bennani@uae.ac.ma',
  'sara.lahlou@fstt.ac.ma',
  'nour.chaoui@encgt.ac.ma',
  'karim.boukhari@ensate.uae.ac.ma',
  'amina.tazi@fs-tanger.ac.ma',
  'mehdi.elidrissi@ensah.ma',
  'salma.aitali@fstt.ac.ma',
  'omar.benali@uae.ac.ma'
];

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
  if (!value) {
    resetForm();
    return;
  }
  Object.keys(form).forEach(key => {
    if (value[key] !== undefined) form[key] = value[key];
  });
  technologies.value = createSelectableItems(value.technologies ?? []);
  domains.value = createSelectableItems(value.domains ?? []);
  resetErrors();
}

const createSelectableItems = (items = []) =>
  items.map((name) => ({
    name,
    selected: true
  }));

const technologies = ref([]);
const domains = ref([]);

let descriptionTypingTimer = null;

const toggleLabel = (item) => {
  item.selected = !item.selected;
};

const getSelectedNames = (items) =>
  items.filter((item) => item.selected).map((item) => item.name);

const resetDetectedTags = () => {
  technologies.value = [];
  domains.value = [];
};

function resetErrors() {
  Object.keys(errors).forEach((key) => {
    errors[key] = '';
  });
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

    if (description.trim().length < 20) {
      resetDetectedTags();
      return;
    }

    descriptionTypingTimer = setTimeout(analyzeDescription, 2000);
  }
);

onUnmounted(() => {
  clearTimeout(descriptionTypingTimer);
  document.body.style.overflow = '';
});

function invalidDateRange(startDate, endDate) {
  return (
    startDate &&
    endDate &&
    new Date(endDate) <= new Date(startDate)
  );
}

const submitExperience = () => {
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

    if (invalidDateRange(form.startDate, form.endDate)) errors.endDate = 'End date must be after start date';
  }
  else if (!form.date) errors.date = `${capitalizedType.value} date is required`;

  if (!isEdit.value && config.imageRequired && !form.image) errors.image = `${capitalizedType.value} ${config.imageLabel} is required`;

  if (trimmedDescription.length < 20)
    errors.description = 'Description must be at least 20 characters';
  else if (trimmedDescription.length > MAX_TEXT_LEN)
    errors.description = `Description must be ${MAX_TEXT_LEN} characters or fewer`;

  if (config.showGithub) {
    if (!trimmedGithubLink)
      errors.githubLink = 'GitHub link is required';
    else if (!isValidGithubLink(trimmedGithubLink))
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

    if (form.isAcademic && !trimmedTeacherEmail)
      errors.teacherEmail = `Teacher email is required for academic ${props.type}s`;
    else if (
      form.isAcademic &&
      !professorEmails.includes(trimmedTeacherEmail)
    )
      errors.teacherEmail = 'Select a valid teacher email';
  }

  if (hasErrors()) return;

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
    institution: config.showAcademic && form.isAcademic
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

watch(() => props.open, (open) => {
  document.body.style.overflow = open ? 'hidden' : '';

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
</script>

<template>
  <Transition name="pop-up">
    <div class="modal-overlay" v-if="open">
      <div class="modal-card">
        <div class="modal-card__header">
          <h2>
            {{ `${isEdit ? 'Edit' : 'Create a new'} ${props.type}` }}
          </h2>
          <div class="close-button">
            <CloseButton size="lg" @click="emit('close')" />
          </div>
        </div>
        <form class="experience-form" @submit.prevent="submitExperience">
          <div class="experience-form__body">
            <div class="field">
              <Input
                v-model="form.title"
                :label="`${capitalizedType} title`"
                :placeholder="`Enter your ${props.type} title`"
              />
              <Error v-if="errors.title" variant="field">
                {{ errors.title }}
              </Error>
            </div>

            <div
              v-if="currentConfig.dateMode === 'single'"  
              class="field"
            >
              <DatePicker
                v-model="form.date"
                :label="`${capitalizedType} date`"
                :placeholder="`Select ${props.type} date`"
              />
              <Error v-if="errors.date" variant="field">
                {{ errors.date }}
              </Error>
            </div>


            <div v-else class="form-group">
              <div class="field">
                <DatePicker
                  v-model="form.startDate"
                  label="Start date"
                  placeholder="Select start date"
                />
                <Error v-if="errors.startDate" variant="field">
                  {{ errors.startDate }}
                </Error>
              </div>

              <div class="field">
                <DatePicker
                  v-model="form.endDate"
                  label="End date"
                  placeholder="Select end date"
                />
                <Error v-if="errors.endDate" variant="field">
                  {{ errors.endDate }}
                </Error>
              </div>
            </div>

            <div
              v-if="currentConfig.showImageUpload"
              class="field"
            >
              <ImageDropzone
                :title="`Upload ${props.type} ${currentConfig.imageLabel}`"
                :accept="currentConfig.imageAccept"
                v-model="form.image"
              />
              <Error v-if="errors.image" variant="field">
                {{ errors.image }}
              </Error>
            </div>

            <div class="field">
              <div class="form-group-textarea">
                <label for="description">Description</label>
                <textarea
                  ref="textareaElem"
                  id="description"
                  v-model="form.description"
                  @input="resizeTextarea"
                  :placeholder="`Describe your ${props.type}, its goal, features, and tools used...`"
                  :maxlength="MAX_TEXT_LEN"
                />
                <div class="textarea-meta">
                  <Error v-if="errors.description" variant="field">
                    {{ errors.description }}
                  </Error>

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

              <Labels
                title="Detected domains"
                :items="domains"
                :color-rgb="domainColorRgb"
                @toggle="toggleLabel"
              />

              <Labels
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
                  ref="missionsTextareaElem"
                  id="missions"
                  v-model="form.missions"
                  @input="resizeTextarea"
                  :placeholder="`Describe the tasks, responsibilities, and work completed during the internship...`"
                  :maxlength="MAX_TEXT_LEN"
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
              <Input
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
                <Input
                  v-model="form.activityType"
                  label="Activity type"
                  placeholder="Club event, competition, workshop..."
                />
              </div>

              <div class="field">
                <Input
                  v-model="form.location"
                  label="Location"
                  placeholder="Where did it happen?"
                />
              </div>

              <div class="field">
                <Input
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
                <Input
                  v-model="form.institution"
                  label="Issuing institution"
                  placeholder="Institution or platform name"
                />
              </div>

              <div class="field">
                <Input
                  v-model="form.certificateURL"
                  label="Certificate URL"
                  type="url"
                  placeholder="https://example.com/certificate"
                />
                <Error v-if="errors.certificateURL" variant="field">
                  {{ errors.certificateURL }}
                </Error>
              </div>

              <div class="field">
                <Input
                  v-model="form.certificateCode"
                  label="Certificate code"
                  placeholder="Certificate ID or verification code"
                />
              </div>
            </div>

            <div
              v-if="currentConfig.showGithub"
              class="field"
            >
              <Input
                v-model="form.githubLink"
                label="GitHub link"
                type="url"
                placeholder="https://github.com/username/project-name"
              />
              <Error v-if="errors.githubLink" variant="field">
                {{ errors.githubLink }}
              </Error>
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
                <div v-if="form.isAcademic" class="academic-form-group">
                  <div class="institution-field">
                    <Select
                      v-model="form.institution"
                      :options="schoolOptions"
                      label="Institution"
                      placeholder="Select the institution"
                    />
                    <Error v-if="errors.institution" variant="field">
                      {{ errors.institution }}
                    </Error>
                  </div>
                  <div class="field">
                    <Dropdown
                      v-model="form.teacherEmail"
                      :options="professorEmails"
                      label="Teacher email"
                      placeholder="teacher@school.com"
                      autocomplete="nope"
                    />
                    <Error v-if="errors.teacherEmail" variant="field">
                      {{ errors.teacherEmail }}
                    </Error>
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
            <Button
              type="button"
              variant="ghost"
              @click="$emit('close')"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="submit"
              :loading
            >
              {{ isEdit ? 'Save changes' : `Submit ${props.type}` }}
            </Button>
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
  --scrollbar-width: clamp(8px, 1vw, 12px);
  --scrollbar-padding: clamp(2px, 0.25vw, 3px);
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
  top: calc(100% + 0.5px);
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
  display: grid;
  gap: var(--modal-field-gap);
  padding: var(--modal-edge-space);
}

.experience-form__body::-webkit-scrollbar {
  width: var(--scrollbar-width);
}

.experience-form__body::-webkit-scrollbar-track {
  background: transparent;
}

.experience-form__body::-webkit-scrollbar-thumb {
  background-color: rgba(var(--color-primary-rgb), 0.22);
  border-radius: 999px;
  border: var(--scrollbar-padding) solid transparent;
  background-clip: content-box;
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
  justify-content: flex-end;
  gap: var(--space-sm);
  padding: var(--space-md) var(--modal-edge-space);
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.12);
}

.experience-form__footer::before {
  content: '';
  position: absolute;
  left: 0;
  right: var(--scrollbar-width);
  bottom: calc(100% + 0.5px);
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
    align-self: flex-end;
    height: 70vh;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }
}
</style>
