<script setup>
import { ref,reactive, watch, onUnmounted } from 'vue';
import { X } from 'lucide-vue-next';

import Button from '@/components/Button.vue';
import Card from '@/components/Card.vue';
import Input from '@/components/Input.vue';
import Dropdown from '@/components/common/Dropdown.vue';
import Labels from '@/components/common/Labels.vue';
import ToggleSwitch from '@/components/common/ToggleSwitch.vue';
import ImageDropzone from '@/components/common/ImageDropzone.vue';
import { analyzeProjectDescription } from '@/services/aiApi';

const emit = defineEmits(['close', 'submit']);
const domainColorRgb = '245, 158, 11';

const schoolOptions = [
  'ENSA Tanger',
  'ENSA Tétouan',
  'ENSA Al Hoceima',
  'FST Tanger',
  'FS Tanger',
  'ENCG Tanger',
  'Other'
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
      <button type="button" class="close-button" @click="$emit('close')">
        <X :size="18" :stroke-width="2.5" />
      </button>

      <Card class="add-project-card" title="Create a new project" size="xxl">
        
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
            ></textarea>
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

          <ToggleSwitch
  v-model="form.isCertified"
  label="Certified project"
/>

<div v-if="form.isCertified" class="form-group">
  <label>Institution</label>

  <Dropdown
    v-model="form.institution"
    :options="schoolOptions"
    placeholder="Select the institution"
    :visible-options="4"
  />
</div>

<Input
  v-if="form.isCertified"
  v-model="form.teacherEmail"
  label="Teacher email"
  type="email"
  placeholder="teacher@school.com"
/>

          <ToggleSwitch
  v-model="form.visibleToEveryone"
  label="Visible to everyone"
/>

          <div class="form-actions">
            <Button type="button" class="cancel-button" @click="$emit('close')">
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
  box-shadow: 0 24px 70px rgba(var(--color-primary-rgb), 0.22);

  padding: var(--space-xl);
  overflow: visible;
}

.close-button {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  font-weight: var(--font-bold);
  
  z-index: 2;
}

.close-button:hover {
  background: var(--color-primary);
  color: var(--color-background);
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

.form-group {
  display: grid;
  gap:  8px;
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
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  background: transparent;
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
  /*margin: -8px 0 0;*/
  /*margin-top: -10px;
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
.hidden-input {
  display: none !important;
}
.cancel-button {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
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
 .close-button {
    top: 18px;
    right: 18px;
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>