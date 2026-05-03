<script setup>
import { ref, watch } from 'vue';
import{ X } from 'lucide-vue-next';

import Button from '@/components/Button.vue';
import Card from '@/components/Card.vue';
import Input from '@/components/Input.vue';

const emit = defineEmits(['close', 'submit']);

const projectTitle = ref('');
const description = ref('');
const projectImage = ref(null);
const projectImageName = ref('No file selected');
/*const technologies = ref([]);*/
const makeSelectableItems = (items = []) => {
  return items.map((item) => ({
    name: item,
    selected: true
  }));
};

const technologies = ref(
  makeSelectableItems(['Vue.js', 'Express.js', 'PostgreSQL', 'Docker'])
);

const domains = ref(
  makeSelectableItems(['Web Development', 'DevOps', 'Cybersecurity', 'Data Science'])
);

const isCertifiedProject = ref(false);
const teacherEmail = ref('');
const visibleToEveryone = ref(true);
const githubLink = ref('');

const toggleTechnology = (index) => {
  technologies.value[index].selected = !technologies.value[index].selected;
};

const toggleDomain = (index) => {
  domains.value[index].selected = !domains.value[index].selected;
};
const isAnalyzingDescription = ref(false);
const analysisError = ref('');

let descriptionTypingTimer = null;

const handleFileChange = (event) => {
  const file = event.target.files[0];

   if (!file) {
    projectImage.value = null;
    projectImageName.value = 'No file selected';
    return;
  }

  projectImage.value = file;
  projectImageName.value = file.name;
  
};

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0];

  if (!file) return;

  projectImage.value = file;
  projectImageName.value = file.name;
};

watch(description, () => {
  clearTimeout(descriptionTypingTimer);

  if (!description.value.trim()) {
    technologies.value = [];
    domains.value = [];
    analysisError.value = '';
    return;
  }

  descriptionTypingTimer = setTimeout(() => {
    analyzeDescription();
  }, 1000);
});

const analyzeDescription = async () => {
  technologies.value = makeSelectableItems(['Vue.js', 'Express.js', 'PostgreSQL', 'Docker']);
  domains.value = makeSelectableItems(['Web Development', 'DevOps']);
};
 

const submitProject = () => {
  const selectedTechnologies = technologies.value
    .filter((technology) => technology.selected)
    .map((technology) => technology.name);

  const selectedDomains = domains.value
    .filter((domain) => domain.selected)
    .map((domain) => domain.name);

  emit('submit', {
    projectTitle: projectTitle.value,
    projectImage: projectImage.value,
    description: description.value,
    technologies: selectedTechnologies,
    domains: selectedDomains,
    githubLink: githubLink.value,
    projectType: isCertifiedProject.value ? 'certified' : 'personal',
    teacherEmail: isCertifiedProject.value ? teacherEmail.value : '',
    visibleToEveryone: visibleToEveryone.value
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
            v-model="projectTitle"
            label="Project title"
            placeholder="Enter your project title"
          />

          <label
  class="drop-zone"
  for="projectImage"
  @dragover.prevent
  @drop.prevent="handleDrop"
>
  <p>Drag and drop your project screenshot here</p>
  <span>or click to upload</span>

  <input
    id="projectImage"
    type="file"
    accept="image/*"
    class="hidden-input"
    @change="handleFileChange"
  />

  <p class="file-name">
    {{ projectImageName }}
  </p>
</label>

          <div class="form-group">
            <label for="description">Description</label>

            <textarea
              id="description"
              v-model="description"
              placeholder="Describe your project, its goal, features, and tools used..."
            ></textarea>
          </div>

          <p class="helper-text">
            Missing a technology? Make sure it is clearly mentioned in the description, then try again.
          </p>

          <div class="labels-section">
  <div v-if="domains.length" class="label-group">
    <p class="label-title">Detected domains</p>

    <div class="technology-tags">
      <span
        v-for="(domain, index) in domains"
        :key="`domain-${domain.name}-${index}`"
        class="technology-tag domain-tag"
        :class="{ inactive: !domain.selected }"
      >
        {{ domain.name }}

        <button type="button" @click="toggleDomain(index)">
          {{ domain.selected ? 'x' : '+' }}
        </button>
      </span>
    </div>
  </div>

  <div v-if="technologies.length" class="label-group">
    <p class="label-title">Detected technologies</p>

    <div class="technology-tags">
      <span
        v-for="(technology, index) in technologies"
        :key="`technology-${technology.name}-${index}`"
        class="technology-tag"
        :class="{ inactive: !technology.selected }"
      >
        {{ technology.name }}

        <button type="button" @click="toggleTechnology(index)">
          {{ technology.selected ? 'x' : '+' }}
        </button>
      </span>
    </div>
  </div>
</div>
          <Input
             v-model="githubLink"
             label="GitHub link"
             type="url"
             placeholder="https://github.com/username/project-name"
             />

          <div class="visibility-row">
          <span>Certified project</span>

            <label class="visibility-toggle">
             <input
             v-model="isCertifiedProject"
             type="checkbox"
              />
             <span></span>
           </label>
           </div>

          <Input
           v-if="isCertifiedProject"
           v-model="teacherEmail"
           label="Teacher email"
           type="email"
           placeholder="teacher@school.com"
           />

          <div class="visibility-row">
            <span>Visible to everyone</span>

            <label class="visibility-toggle">
              <input
                v-model="visibleToEveryone"
                type="checkbox"
              />
              <span></span>
            </label>
          </div>

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
 
.form-subtitle {
  margin: 0 0 var(--space-lg);
  font-size: var(--font-size-xs);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-primary-hover);
}

.drop-zone {
  border: 1.5px dashed rgba(var(--color-primary-rgb), 0.35);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  text-align: center;
  background: var(--color-surface);
}

.drop-zone p {
  margin: 0;
  font-weight: var(--font-medium);
}

.drop-zone span {
  display: block;
  margin-top: var(--space-sm);
  color: var(--color-primary-hover);
  font-size: var(--font-size-sm);
}

.drop-zone input {
  margin-top: var(--space-md);
}

.file-name {
  margin-top: var(--space-sm);
  color: var(--color-success);
  font-size: var(--font-size-sm);
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

.label-group {
  display: grid;
  gap: 8px;
}

.label-title {
  margin: 0;
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  color: var(--color-primary-hover);
}

.technology-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.technology-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(var(--color-secondary-rgb), 0.35);
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: var(--color-primary);
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 0.75rem;
  font-weight: var(--font-medium);
}

.domain-tag {
   border-color: rgba(245, 158, 11, 0.45);
  background: rgba(245, 158, 11, 0.14);
  color: var(--color-primary);
}

.technology-tag.inactive {
  background: #eeeeee;
  border-color: #dddddd;
  color: #777777;
}

.technology-tag button {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-weight: var(--font-bold);
  font-size: 0.8rem;
  padding: 0;
}

.project-type-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
}

.option-card {
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  font-weight: var(--font-medium);
}

.option-card:hover {
  border-color: var(--color-secondary);
  background: rgba(var(--color-secondary-rgb), 0.08);
}

input[type="radio"] {
  accent-color: var(--color-secondary);
}

.visibility-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: var(--font-medium);
  margin-top: 4px;
  margin-bottom: 4px;
}



.visibility-toggle input {
  display: none;
}

.visibility-toggle span {
  display: block;
  width: 46px;
  height: 24px;
  border-radius: 999px;
  background: var(--color-surface);
  position: relative;
  cursor: pointer;
  transition: var(--transition-fast);
}

.visibility-toggle span::before {
  content: "";
  position: absolute;
  width: 18px;
  height: 18px;
  top: 3px;
  left: 3px;
  border-radius: 50%;
  background: var(--color-background);
  transition: var(--transition-fast);
}

.visibility-toggle input:checked + span {
  background: var(--color-secondary);
}

.visibility-toggle input:checked + span::before {
  transform: translateX(22px);
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
    align-items: flex-end;
    padding: 0;
  }

  .modal-card {
    width: 100%;
    max-width: 100%;
    max-height: 92vh;
    border-radius: 24px 24px 0 0;
    padding: 18px;
  }

  .project-form {
    gap: var(--space-sm);
  }

  .drop-zone {
    padding: var(--space-md);
  }

  textarea {
    min-height: 80px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }

  .close-button {
    top: 12px;
    right: 12px;
  }
  
}
</style>