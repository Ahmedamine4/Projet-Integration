<script setup>
import { ref } from 'vue';

import Button from '@/components/Button.vue';
import Card from '@/components/Card.vue';
import Input from '@/components/Input.vue';

const emit = defineEmits(['close', 'submit']);

const projectTitle = ref('');
const description = ref('');
const projectImage = ref(null);
const projectImageName = ref('');
const technologies = ref([]);
const projectType = ref('personal');
const teacherEmail = ref('');
const visibleToEveryone = ref(true);
const isDetectingTechnologies = ref(false);
const githubLink = ref('');

const handleFileChange = (event) => {
  const file = event.target.files[0];

  if (!file) return;

  projectImage.value = file;
  projectImageName.value = file.name;
};

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0];

  if (!file) return;

  projectImage.value = file;
  projectImageName.value = file.name;
};

const detectTechnologies = async () => {
  if (!description.value.trim()) return;

  isDetectingTechnologies.value = true;

  try {
    // TODO: replace later with AI/backend call
    technologies.value = ['Vue.js', 'Express.js', 'PostgreSQL'];
  } finally {
    isDetectingTechnologies.value = false;
  }
};

const removeTechnology = (index) => {
  technologies.value.splice(index, 1);
};

const submitProject = () => {
  emit('submit', {
    projectTitle: projectTitle.value,
    projectImage: projectImage.value,
    description: description.value,
    technologies: technologies.value,
    githubLink: githubLink.value,
    projectType: projectType.value,
    teacherEmail: projectType.value === 'certified' ? teacherEmail.value : '',
    visibleToEveryone: visibleToEveryone.value
  });
};
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-card">
      <button type="button" class="close-button" @click="$emit('close')">
        x
      </button>

      <Card title="Create a new project" size="sm">
        
        <form class="project-form" @submit.prevent="submitProject">
          <Input
            v-model="projectTitle"
            label="Project title"
            placeholder="Enter your project title"
          />

          <div
            class="drop-zone"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <p>Drag and drop your project screenshot here</p>
            <span>or click to upload</span>

            <input
              type="file"
              accept="image/*"
              @change="handleFileChange"
            />

            <p v-if="projectImageName" class="file-name">
              {{ projectImageName }}
            </p>
          </div>

          <div class="form-group">
            <label for="description">Description</label>

            <textarea
              id="description"
              v-model="description"
              placeholder="Describe your project, its goal, features, and tools used..."
            ></textarea>
          </div>

          <Button
            type="button"
            variant="submit"
            block
            :disabled="!description.trim() || isDetectingTechnologies"
            @click="detectTechnologies"
          >
            {{ isDetectingTechnologies ? 'Detecting technologies...' : 'Detect technologies' }}
          </Button>

          <p class="helper-text">
            Missing a technology? Make sure it is clearly mentioned in the description, then try again.
          </p>

          <div class="technology-tags">
            <span
              v-for="(technology, index) in technologies"
              :key="index"
              class="technology-tag"
            >
              {{ technology }}

              <button type="button" @click="removeTechnology(index)">
                x
              </button>
            </span>
          </div>
          <Input
             v-model="githubLink"
             label="GitHub link"
             type="url"
             placeholder="https://github.com/username/project-name"
             />

          <div class="form-group">
            <label>Project type</label>

            <div class="project-type-options">
              <label class="option-card">
                <input
                  v-model="projectType"
                  type="radio"
                  value="personal"
                />
                <span>Personal project</span>
              </label>

              <label class="option-card">
                <input
                  v-model="projectType"
                  type="radio"
                  value="certified"
                />
                <span>Certified project</span>
              </label>
            </div>
          </div>

          <Input
            v-if="projectType === 'certified'"
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
            <Button type="button" @click="$emit('close')">
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
   position: relative;
  inset: 200px;
  background: rgba(var(--color-surface-rgb), 0.75);
   /*background: var(--color-background);*/
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  z-index: 1000;
}

.modal-card {
  position: relative;
  width: 500px;
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
  background: white;
  color: var(--color-primary);
  cursor: pointer;
  font-weight: var(--font-bold);
  box-shadow: var(--shadow-sm);
  z-index: 2;
}

.close-button:hover {
  background: var(--color-primary);
  color: var(--color-background);
}

.project-form {
  display: grid;
  gap: var(--space-md);
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
  gap: var(--space-sm);
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
  margin: -8px 0 0;
  color: var(--color-primary-hover);
  font-size: var(--font-size-xs);
}

.technology-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.technology-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  border: 1px solid rgba(var(--color-secondary-rgb), 0.35);
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: var(--color-primary);
  border-radius: 999px;
  padding: 8px 12px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
}

.technology-tag button {
  border: none;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  font-weight: var(--font-bold);
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
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}
</style>