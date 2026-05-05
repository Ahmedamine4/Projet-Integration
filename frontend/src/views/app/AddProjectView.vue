<script setup>
import { ref,reactive, watch, onUnmounted } from 'vue';
import { analyzeProjectDescription } from '@/services/aiApi';
import Button from '@/components/common/Button.vue';
import Card from '@/components/common/Card.vue';
import Input from '@/components/common/Input.vue';
import Dropdown from '@/components/common/Dropdown.vue';
import Labels from '@/components/common/Labels.vue';
import ToggleSwitch from '@/components/common/ToggleSwitch.vue';
import ImageDropzone from '@/components/common/ImageDropzone.vue';
import CloseButton from '@/components/common/CloseButton.vue';

const emit = defineEmits(['close', 'submit']);
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

const isAnalyzingDescription = ref(false);
const analysisError = ref('');

const analyzeDescription = async () => {
  if (!form.description.trim()) return;

  isAnalyzingDescription.value = true;
  analysisError.value = '';

  try {
    const data = await analyzeProjectDescription(form.description);

    console.log('Mapped AI data:', data);

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
  emit('submit', {
    projectTitle: form.title,
    projectDate: form.date,
    projectImage: form.image,
    description: form.description,
    technologies: getSelectedNames(technologies.value),
    domains: getSelectedNames(domains.value),
    githubLink: form.githubLink,
    projectType: form.isCertified ? 'certified' : 'personal',
    institution: form.isCertified ? form.institution : '',
    teacherEmail: form.isCertified ? form.teacherEmail : '',
    visibleToEveryone: form.visibleToEveryone
  });
};
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-card">
      <div class="close-button">
        <CloseButton size="lg" @click="emit('close')" />
      </div>

      <Card
        class="add-project-card"
        title="Create a new project"
        size="xxl"
      >
        <form class="project-form" @submit.prevent="submitProject">
          <Input
            v-model="form.title"
            label="Project title"
            placeholder="Enter your project title"
          />
          <Input
            v-model="form.date"
            label="Project date"
            type="date"
          />

          <ImageDropzone v-model="form.image" />

          <div class="form-group">
            <label for="description">Description</label>

            <textarea
              id="description"
              v-model="form.description"
              placeholder="Describe your project, its goal, features, and tools used..."
            />
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
          <Input
             v-model="form.githubLink"
             label="GitHub link"
             type="url"
             placeholder="https://github.com/username/project-name"
             />
          <div class="certified-project-section">
            <ToggleSwitch
              v-model="form.isCertified"
              label="Certified project"
            />
            <Transition name="field-reveal">
              <div v-if="form.isCertified" class="form-group">
                <div class="institution-field">
                  <Dropdown
                    v-model="form.institution"
                    :options="schoolOptions"
                    label="Institution"
                    placeholder="Select the institution"
                  />
                </div>
                <Dropdown
                  v-model="form.teacherEmail"
                  :options="professorEmails"
                  label="Teacher email"
                  placeholder="teacher@school.com"
                />
              </div>
            </Transition>
          </div>
          <ToggleSwitch
            v-model="form.visibleToEveryone"
            label="Visible to everyone"
          />

          <div class="form-actions">
            <Button
              type="button"
              variant="ghost"
              @click="$emit('close')"
            >
              Cancel
            </Button>

            <Button type="submit" variant="submit">
              Submit project
            </Button>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  min-height: 100vh;
  background: transparent !important;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: var(--space-lg);
}

:deep(.add-project-card > h2) {
  font-size: clamp(1.2rem, 1.2vw, 1.2rem) !important;
  line-height: 1.1;
  margin-bottom: 30px !important;
}

.modal-card {
  position: relative;
  width: 680px;
  max-width: calc(100vw - 48px);
  background: var(--color-background);
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-xl);
  overflow: visible;
}

.close-button {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
}

.project-form {
  display: grid;
  gap: 22px;
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
  margin-top: 22px;
  display: grid;
  gap: 22px;
}

.form-group label {
  font-size: var(--font-size-xs);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: var(--font-medium);
  color: var(--color-primary-hover);
}

textarea {
  width: 100%;
  min-height: 110px;
  resize: vertical;
  border: 1px solid rgba(var(--color-primary-rgb), 0.18);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  background: rgba(var(--color-surface-rgb), 0.32);
  color: var(--color-primary);
  font-family: var(--font-ui);
  font-size: var(--font-size-md);
}

textarea:focus {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.15);
}

.helper-text {
  /*margin: -8px 0 0;
  margin-top: -10px;
  margin-bottom: 8px;*/
  margin: 0;
  color: var(--color-primary-hover);
  font-size: var(--font-size-xs);
}

.labels-section {
  display: grid;
  gap: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  gap: 14px;

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


@media (max-width: 600px) {
  .modal-overlay {
    position: fixed;
    inset: 0;
    height: 100dvh;
    overflow: hidden;

    align-items: flex-end;
    padding: 0;
  }

  .modal-card {
    width: 100%;
    max-width: 100%;
    height: 92dvh;
    max-height: 92dvh;
    border-radius: 24px 24px 0 0;
    padding: 18px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  :deep(.add-project-card) {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  :deep(.add-project-card > h2) {
    text-align: left !important;
    margin: 0 48px 18px 0 !important;
    padding-left: 0 !important;
    min-height: 34px;
    line-height: 34px;
  }

  .project-form {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 4px;
    gap: 20px;
  }

  .helper-text {
    font-size: 0.68rem;
    line-height: 1.3;
    margin-top: -4px;
  }

  textarea {
    min-height: 90px;
  }

  .form-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    flex-shrink: 0;
    margin-top: 12px;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
