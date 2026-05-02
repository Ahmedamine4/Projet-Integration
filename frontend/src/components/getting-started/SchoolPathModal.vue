<script setup>
import { ref, reactive, computed } from 'vue';
import ProgressMeter from '@/components/common/ProgressMeter.vue';
import Dropdown from '@/components/common/Dropdown.vue';
import Button from '@/components/common/Button.vue';
import { schools } from '@/data/schools';

const academicLevels = [
  {
    key: 'bachelor',
    title: 'Bachelor / Licence',
    description: 'I am building a path for a Bachelor or Licence degree.',
    fields: ['bachelorSchool'],
  },
  {
    key: 'master',
    title: 'Master',
    description: 'I am building a path that includes a Master degree.',
    fields: ['bachelorSchool', 'masterSchool'],
  },
  {
    key: 'phd',
    title: 'PhD',
    description: 'I am building a path that includes doctoral studies.',
    fields: ['bachelorSchool', 'masterSchool', 'phdInstitution'],
  },
];

const schoolFields = {
  bachelorSchool: {
    title: 'Bachelor / Licence school',
    description:
      'Choose the school or university where you studied for your Bachelor or Licence.',
    placeholder: 'Search Bachelor / Licence school',
  },
  masterSchool: {
    title: 'Master school',
    description:
      'Choose the school or university where you studied for your Master.',
    placeholder: 'Search Master school',
  },
  phdInstitution: {
    title: 'PhD institution',
    description:
      'Choose the institution where you are doing or completed your PhD.',
    placeholder: 'Search PhD institution',
  },
};

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'complete']);

const selectedLevelKey = ref('');

function selectLevel(key) {
  selectedLevelKey.value = key;
}

function selected(key) {
  return selectedLevelKey.value === key;
}

const selectedLevel = computed(() => {
  return academicLevels.find((level) => {
    return level.key === selectedLevelKey.value;
  });
});

const schoolFieldsInputs = reactive({
  bachelorSchool: '',
  masterSchool: '',
  phdInstitution: '',
});

const schoolPath = computed(() => {
  const bachelorSchool =
    schools.includes(schoolFieldsInputs.bachelorSchool)
      ? schoolFieldsInputs.bachelorSchool
      : '';
  const masterSchool = 
    schools.includes(schoolFieldsInputs.masterSchool)
      ? schoolFieldsInputs.masterSchool
      : '';
  const phdInstitution = 
    schools.includes(schoolFieldsInputs.phdInstitution)
      ? schoolFieldsInputs.phdInstitution
      : '';
  return { bachelorSchool, masterSchool, phdInstitution };
});

const completedStepsCount = computed(() => {
  if (!selectedLevelKey.value) return 0;
  return Object.values(schoolPath.value).reduce((acc, school) => {
    return school ? acc + 1 : acc;
  }, 1);
});

const currentStepIndex = ref(0);

const numOfSteps = computed(() => {
  if (!selectedLevel.value) return 1;
  return selectedLevel.value.fields.length + 1;
});

const currentSchoolFieldKey = computed(() => {
  if (currentStepIndex.value === 0) return '';
  return selectedLevel.value.fields[currentStepIndex.value - 1];
});

const currentSchoolField = computed(() => {
  return schoolFields[currentSchoolFieldKey.value];
});

function resetCurrentStep() {
  if (currentStepIndex.value === 0) {
    selectedLevelKey.value = '';
  } else {
    schoolFieldsInputs[currentSchoolFieldKey.value] = '';
  }
}

function resetSchoolPath() {
  selectedLevelKey.value = '';

  schoolFieldsInputs.bachelorSchool = '';
  schoolFieldsInputs.masterSchool = '';
  schoolFieldsInputs.phdInstitution = '';

  currentStepIndex.value = 0;
}

const stepDirection = ref('forward');

function goBack() {
  if (currentStepIndex.value === 0) {
    resetSchoolPath();
    emit('close');
    return;
  }
  resetCurrentStep();
  stepDirection.value = 'backward';
  currentStepIndex.value--;
}

function goNext() {
  if (!selectedLevelKey.value) return;
  if (completedStepsCount.value === numOfSteps.value) {
    emit('complete', schoolPath.value);
    resetSchoolPath();
    return;
  }
  stepDirection.value = 'forward';
  currentStepIndex.value++;
}
</script>
<template>
  <Transition name="pop-up">
    <div class="modal-overlay" v-if="open">
      <div class="modal">
        <div class="modal__header">
          <h3>Build your academic path</h3>

          <div class="step-meter__track">
            <span>
              {{ completedStepsCount }} / {{ numOfSteps }}
            </span>
            <ProgressMeter
              :value="completedStepsCount"
              :max="numOfSteps"
            />
          </div>
        </div>

        <div class="modal__body">
          <Transition :name="`step-${stepDirection}`" mode="out-in">
            <div :key="currentStepIndex">
              <div class="level-picker" v-if="currentStepIndex === 0">
                <h3 class="step-title">Academic level</h3>
                <span class="step-description">
                  Choose the highest academic level you want to include in your path.
                </span>
                <button
                  v-for="level in academicLevels"
                  :key="level.key"
                  class="level-option"
                  :class="{ selected: selected(level.key) }"
                  type="button"
                  @click="selectLevel(level.key)"
                >
                  <span class="level-option__title">
                    {{ level.title }}
                  </span>

                  <span class="level-option__description">
                    {{ level.description }}
                  </span>
                </button>
              </div>

              <div class="school-step" v-else>
                <h3 class="step-title">
                  {{ currentSchoolField.title }}
                </h3>
                <span class="step-description">
                  {{ currentSchoolField.description }}
                </span>
                <Dropdown
                  :options="schools"
                  :placeholder="currentSchoolField.placeholder"
                  v-model="schoolFieldsInputs[currentSchoolFieldKey]"
                />
              </div>
            </div>
          </Transition>
        </div>

        <div class="modal__footer">
          <Button
            variant="ghost"
            class="back-button"
            @click="goBack"
          >
            {{ currentStepIndex > 0 ? 'Back' : 'Close' }}
          </Button>

          <Button
            variant="submit"
            class="next-button"
            :disabled="
              !selectedLevelKey ||
              currentStepIndex > 0 &&
              !schoolPath[currentSchoolFieldKey]"
            @click="goNext"
          >
            {{ completedStepsCount < numOfSteps ? 'Next' : 'Complete'}}
          </Button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(var(--color-primary-rgb), 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-lg);
}

.modal {
  display: flex;
  flex-direction: column;
  background: var(--color-background);
  max-height: min(32rem, 90vh);
  width: min(36rem, 100%);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.step-meter__track {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 12rem;
  max-width: 45%;
}

.step-meter__track > span {
  flex-shrink: 0;
  font-size: var(--font-size-sm);
  color: rgba(var(--color-primary-rgb), 0.72);
}

.modal__body {
  padding: 0.75rem 1.8rem;
  min-height: 20rem;
  overflow: auto;
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.back-button,
.next-button {
  min-width: 6rem;
}

.modal__header > h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-medium);
  margin: 0;
}

.level-picker {
  display: grid;
  gap: 0.75rem;
}

.level-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  min-height: 3.25rem;
  padding: 0.75rem 1rem;
  text-align: left;
  font: inherit;
  background: rgba(var(--color-surface-rgb), 0.25);
  color: var(--color-primary);
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    transform var(--transition-fast);
}

.level-option:hover {
  border-color: rgba(var(--color-secondary-rgb), 0.45);
  background: rgba(var(--color-surface-rgb), 0.38);
  transform: scale(1.01);
}

.level-option.selected {
  border-color: rgba(var(--color-secondary-rgb), 0.75);
  background: rgba(var(--color-secondary-rgb), 0.08);
  transform: scale(1);
}

.level-option__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
}

.level-option__description {
  font-size: var(--font-size-xs);
  color: rgba(var(--color-primary-rgb), 0.62);
}

.school-step {
  display: grid;
  gap: 0.75rem;
}

.step-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-medium);
  color: var(--color);
}

.step-description {
  display: block;
  font-size: var(--font-size-sm);
  color: rgba(var(--color-primary-rgb), 0.65);
  line-height: 1.5;
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

.pop-up-enter-from .modal,
.pop-up-leave-to .modal {
  transform: scale(0.97);
}

.pop-up-enter-active .modal,
.pop-up-leave-active .modal {
  transition: transform 0.4s var(--ease-overshoot);
}

.pop-up-enter-to .modal,
.pop-up-leave-from .modal {
  transform: scale(1);
}

.step-forward-enter-from,
.step-backward-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}

.step-forward-leave-to,
.step-backward-enter-from {
  opacity: 0;
  transform: translateX(-1rem);
}

.step-forward-enter-to,
.step-forward-leave-from,
.step-backward-enter-to,
.step-backward-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.step-forward-enter-active,
.step-forward-leave-active,
.step-backward-enter-active,
.step-backward-leave-active {
  transition:
    opacity var(--transition-normal),
    transform 0.4s var(--ease-overshoot);
}
</style>