<script setup>
import { ref, reactive, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { analyzeProjectDescription } from '@/services/aiApi';
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
});

const emit = defineEmits(['close', 'submit']);

const errors = reactive({
  title: '',
  date: '',
  description: '',
  githubLink: '',
  institution: '',
  teacherEmail: '',
});

const MAX_EDIT_LEN = 1200;

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
  description: '',
  image: null,
  githubLink: '',
  isCertified: false,
  institution: '',
  teacherEmail: '',
  visibleToEveryone: true
});

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

const resetErrors = () => {
  errors.title = '';
  errors.date = '';
  errors.description = '';
  errors.githubLink = '';
  errors.institution = '';
  errors.teacherEmail = '';
};

const hasErrors = () => {
  return (
    errors.title ||
    errors.date ||
    errors.description ||
    errors.githubLink ||
    errors.institution ||
    errors.teacherEmail
  );
};

const isValidGithubLink = (link) => {
  try {
    const url = new URL(link);
    return url.protocol === 'https:' && url.hostname === 'github.com';
  } catch {
    return false;
  }
};

const isAnalyzingDescription = ref(false);
const analysisError = ref('');

const analyzeDescription = async () => {
  if (!form.description.trim()) return;

  isAnalyzingDescription.value = true;
  analysisError.value = '';

  try {
    const data = await analyzeProjectDescription(form.description);

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

    if (!description.trim()) {
      resetDetectedTags();
      return;
    }

    descriptionTypingTimer = setTimeout(analyzeDescription, 1000);
  }
);

onUnmounted(() => {
  clearTimeout(descriptionTypingTimer);
});

const submitProject = () => {
  resetErrors();

  const trimmedTitle = form.title.trim();
  const trimmedDescription = form.description.trim();
  const trimmedGithubLink = form.githubLink.trim();
  const trimmedTeacherEmail = form.teacherEmail.trim();

  if (!trimmedTitle) errors.title = 'Project title is required';

  if (!form.date) errors.date = 'Project date is required';

  if (trimmedDescription.length < 20)
    errors.description = 'Description must be at least 20 characters';

  if (!trimmedGithubLink) errors.githubLink = 'GitHub link is required';
  else if (!isValidGithubLink(trimmedGithubLink))
    errors.githubLink = 'Enter a valid GitHub project URL';

  if (form.isCertified && !form.institution)
    errors.institution = 'Institution is required for certified projects';

  if (form.isCertified && !trimmedTeacherEmail)
    errors.teacherEmail = 'Teacher email is required for certified projects';
  else if (
    form.isCertified &&
    !professorEmails.includes(trimmedTeacherEmail)
  )
    errors.teacherEmail = 'Select a valid teacher email';

  if (hasErrors()) return;

  emit('submit', {
    projectTitle: trimmedTitle,
    projectDate: form.date,
    projectImage: form.image,
    description: trimmedDescription,
    technologies: getSelectedNames(technologies.value),
    domains: getSelectedNames(domains.value),
    githubLink: trimmedGithubLink,
    projectType: form.isCertified ? 'academique' : 'personnel',
    institution: form.isCertified ? form.institution : '',
    teacherEmail: form.isCertified ? trimmedTeacherEmail : '',
    visibleToEveryone: form.visibleToEveryone
  });
};

const textareaElem = ref(null);

function resizeTextarea() {
  const textarea = textareaElem.value;
  if (!textarea) return;

  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
}

onMounted(resizeTextarea);

watch(() => props.open, (open) => {
  if (open) nextTick(resizeTextarea);
});
</script>

<template>
  <Transition name="pop-up">
    <div class="modal-overlay" v-if="open">
      <div class="modal-card">
        <div class="modal-card__header">
          <h2>Create a new project</h2>
          <div class="close-button">
            <CloseButton size="lg" @click="emit('close')" />
          </div>
        </div>
        <form class="project-form" @submit.prevent="submitProject">
          <div class="project-form__body">
            <div class="field">
              <Input
                v-model="form.title"
                label="Project title"
                placeholder="Enter your project title"
              />
              <Error v-if="errors.title" variant="field">
                {{ errors.title }}
              </Error>
            </div>

            <div class="field">
              <DatePicker
                v-model="form.date"
                label="Project date"
                placeholder="Select project date"
              />
              <Error v-if="errors.date" variant="field">
                {{ errors.date }}
              </Error>
            </div>

            <ImageDropzone v-model="form.image" />

            <div class="field">
              <div class="form-group-description">
                <label for="description">Description</label>

                <textarea
                  ref="textareaElem"
                  id="description"
                  v-model="form.description"
                  @input="resizeTextarea"
                  placeholder="Describe your project, its goal, features, and tools used..."
                />
              </div>
              <Error v-if="errors.description" variant="field">
                {{ errors.description }}
              </Error>
            </div>

            <p class="helper-text">
              Missing a technology? Make sure it is clearly mentioned in the description, then try again.
            </p>

            <div class="labels-section">
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

            <div class="field">
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

            <div class="certified-project-section">
              <ToggleSwitch
                v-model="form.isCertified"
                label="Certified project"
              />
              <Transition name="field-reveal">
                <div v-if="form.isCertified" class="form-group">
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

          <div class="project-form__footer">
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
              Submit project
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
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.modal-card {
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
  padding: var(--space-lg);
  background-color: var(--color-background);
}

.modal-card__header::after {
  content: '';
  position: absolute;
  left: 0;
  right: var(--scrollbar-width);
  top: 100%;
  height: 24px;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    var(--color-background),
    transparent
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

.project-form {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.project-form__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: grid;
  gap: 1.2rem;
  padding: var(--space-lg);
}

.project-form__body::-webkit-scrollbar {
  width: var(--scrollbar-width);
}

.project-form__body::-webkit-scrollbar-track {
  background: transparent;
}

.project-form__body::-webkit-scrollbar-thumb {
  background-color: rgba(var(--color-primary-rgb), 0.22);
  border-radius: 999px;
  border: var(--scrollbar-padding) solid transparent;
  background-clip: content-box;
}


.field {
  display: grid;
  gap: var(--space-xs);
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

.institution-field {
  display: grid;
  gap: var(--space-xs);
}

.certified-project-section {
  display: grid;
}

.form-group {
  margin-top: var(--space-md);
  display: grid;
  gap: var(--space-md);
}

.form-group-description {
  margin-top: var(--space-md);
  display: grid;
  gap: var(--space-xs);
}

:is(.form-group, .form-group-description) label {
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

.helper-text {
  margin: 0;
  color: var(--color-primary-hover);
  font-size: var(--font-size-xs);
}

.labels-section {
  display: grid;
  gap: 12px;
}

.project-form__footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  padding: var(--space-md);
}

.project-form__footer::before {
  content: '';
  position: absolute;
  left: 0;
  right: var(--scrollbar-width);
  bottom: 100%;
  height: 24px;
  pointer-events: none;
  background: linear-gradient(
    to top,
    var(--color-background),
    transparent
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
    opacity var(--transition-fast),
    max-height var(--transition-fast),
    margin-top var(--transition-fast);
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
