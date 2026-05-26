<script setup>
import { ref, reactive, computed } from 'vue';
import ProgressMeter from '@/components/common/ProgressMeter.vue';
import Dropdown from '@/components/common/Dropdown.vue';
import YearInput from '@/components/common/YearInput.vue';
import Button from '@/components/common/Button.vue';
import CloseButton from '@/components/common/CloseButton.vue';
import { useBodyScrollLock } from '@/composables/useBodyScrollLock';

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
    placeholder: 'Search Bachelor / Licence school',
  },
  masterSchool: {
    title: 'Master school',
    placeholder: 'Search Master school',
  },
  phdInstitution: {
    title: 'PhD institution',
    placeholder: 'Search PhD institution',
  },
};

const studyingSchoolDescriptions = {
  bachelorSchool:
    'Choose the school or university where you are currently studying for your Bachelor or Licence.',
  masterSchool:
    'Choose the school or university where you are currently studying for your Master.',
  phdInstitution:
    'Choose the institution where you are currently studying for your PhD.',
};

const completedSchoolDescriptions = {
  bachelorSchool:
    'Choose the school or university where you studied for your Bachelor or Licence.',
  masterSchool:
    'Choose the school or university where you studied for your Master.',
  phdInstitution:
    'Choose the institution where you completed your PhD.',
};

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  schools: {
    type: Array,
    default: () => [],
  },
});

useBodyScrollLock(() => props.open);

const emit = defineEmits(['close', 'complete']);

const isCurrentlyStudying = ref(null);

const selectedLevelKey = ref('');

function selectLevel(key) {
  selectedLevelKey.value = key;
}

function isLevelSelected(key) {
  return selectedLevelKey.value === key;
}

const selectedLevel = computed(() => {
  return academicLevels.find((level) => {
    return level.key === selectedLevelKey.value;
  });
});

const schoolFieldsInputs = reactive({
  bachelorSchool: {
    schoolName: '',
    startYear: null,
    endYear: null,
  },
  masterSchool: {
    schoolName: '',
    startYear: null,
    endYear: null,
  },
  phdInstitution: {
    schoolName: '',
    startYear: null,
    endYear: null,
  },
});

function getInstitutionIdByName(name) {
  return props.schools.find((school) => {
    return school.nom.toLowerCase() === name.toLowerCase();
  })?.institution_id || '';
}

function isCurrentSchoolField(fieldKey) {
  const highestLevelFieldKey = selectedLevel.value?.fields.at(-1);

  return (
    isCurrentlyStudying.value === true &&
    fieldKey === highestLevelFieldKey
  );
}

const schoolPath = computed(() => {
  return Object.fromEntries(
    Object.entries(schoolFieldsInputs).map(([fieldKey, input]) => {
      return [
        fieldKey,
        {
          institutionId: getInstitutionIdByName(input.schoolName),
          startYear: input.startYear,
          endYear: input.endYear,
          isCurrent: isCurrentSchoolField(fieldKey),
        },
      ];
    })
  );
});

const completedStepsCount = computed(() => {
  if (isCurrentlyStudying.value === null) return 0;
  if (!selectedLevelKey.value) return 1;
  return Object.entries(schoolPath.value).reduce((acc, [fieldKey, school]) => {
    return isSchoolComplete(school, fieldKey) ? acc + 1 : acc;
  }, 2);
});

const currentStepIndex = ref(0);

const numOfSteps = computed(() => {
  if (!selectedLevel.value) return 2;
  return selectedLevel.value.fields.length + 2;
});

const currentSchoolFieldKey = computed(() => {
  if (currentStepIndex.value <= 1) return '';
  return selectedLevel.value.fields[currentStepIndex.value - 2];
});

const currentSchoolField = computed(() => {
  return schoolFields[currentSchoolFieldKey.value];
});

const currentSchoolFieldDescription = computed(() => {
  const highestLevelFieldKey = selectedLevel.value.fields.at(-1);

  if (
    isCurrentlyStudying.value === true &&
    currentSchoolFieldKey.value === highestLevelFieldKey
  ) {
    return studyingSchoolDescriptions[currentSchoolFieldKey.value];
  }
  return completedSchoolDescriptions[currentSchoolFieldKey.value];
});

const currentSchoolEndYearLabel = computed(() => {
  if (isCurrentSchoolField(currentSchoolFieldKey.value)) {
    return 'Expected completion year';
  }

  return 'Completion year';
});

const isCurrentStepComplete = computed(() => {
  if (currentStepIndex.value === 0) {
    return isCurrentlyStudying.value !== null;
  }

  if (currentStepIndex.value === 1) {
    return Boolean(selectedLevelKey.value);
  }

  const currentSchool = schoolPath.value[currentSchoolFieldKey.value];

  return isSchoolComplete(currentSchool, currentSchoolFieldKey.value);
});

function isSchoolComplete(school, fieldKey) {
  return Boolean(
    school.institutionId &&
    isValidYear(school.startYear) &&
    isValidYear(school.endYear) &&
    isSchoolYearRangeValid(school, fieldKey)
  );
}

function resetSchoolField(fieldKey) {
  schoolFieldsInputs[fieldKey].schoolName = '';
  schoolFieldsInputs[fieldKey].startYear = null;
  schoolFieldsInputs[fieldKey].endYear = null;
}

function resetCurrentStep() {
  if (currentStepIndex.value === 0) {
    isCurrentlyStudying.value = null;
    return;
  }
  if (currentStepIndex.value === 1) {
    selectedLevelKey.value = '';
    return;
  }
  resetSchoolField(currentSchoolFieldKey.value);
}

function resetSchoolPath() {
  isCurrentlyStudying.value = null;
  selectedLevelKey.value = '';

  resetSchoolField('bachelorSchool');
  resetSchoolField('masterSchool');
  resetSchoolField('phdInstitution');

  currentStepIndex.value = 0;
}

const stepDirection = ref('forward');

function close() {
  resetSchoolPath();
  emit('close');
}

function complete() {
  emit('complete', {
    isCurrentlyStudying: isCurrentlyStudying.value,
    academicLevel: selectedLevelKey.value,
    schoolPath: schoolPath.value,
  });
  resetSchoolPath();
}

function goBack() {
  if (currentStepIndex.value === 0) {
    close();
    return;
  }
  resetCurrentStep();
  stepDirection.value = 'backward';
  currentStepIndex.value--;
}

function goNext() {
  if (completedStepsCount.value === numOfSteps.value) {
    complete();
    return;
  }
  stepDirection.value = 'forward';
  currentStepIndex.value++;
}

const currentYear = new Date().getFullYear();
const minSchoolYear = 1980;

function getPreviousSchoolFieldKey(fieldKey = currentSchoolFieldKey.value) {
  const fields = selectedLevel.value?.fields ?? [];
  const index = fields.indexOf(fieldKey);

  return index > 0 ? fields[index - 1] : '';
}

function getPreviousSchoolEndYear(fieldKey = currentSchoolFieldKey.value) {
  const previousFieldKey = getPreviousSchoolFieldKey(fieldKey);

  return previousFieldKey
    ? schoolFieldsInputs[previousFieldKey].endYear
    : null;
}

function getStartMinYear() {
  const previousEndYear = Number(getPreviousSchoolEndYear());

  return previousEndYear
    ? Math.max(previousEndYear, minSchoolYear)
    : minSchoolYear;
}

function getStartMaxYear() {
  const endYear = Number(schoolFieldsInputs[currentSchoolFieldKey.value].endYear);

  if (endYear) return Math.min(endYear, currentYear);

  return currentYear;
}

function getEndMinYear() {
  const startYear = schoolFieldsInputs[currentSchoolFieldKey.value].startYear;

  if (isCurrentSchoolField(currentSchoolFieldKey.value)) {
    return Math.max(Number(startYear) || minSchoolYear, currentYear);
  }

  if (isValidYear(startYear)) return startYear;

  return getStartMinYear();
}

function getEndMaxYear() {
  if (isCurrentSchoolField(currentSchoolFieldKey.value)) return null;

  return currentYear;
}

function isValidYear(value) {
  const year = Number(value);

  return /^\d{4}$/.test(String(value)) && year >= minSchoolYear;
}

function isSchoolYearRangeValid(school, fieldKey) {
  const startYear = Number(school.startYear);
  const endYear = Number(school.endYear);

  if (startYear > currentYear) return false;
  if (endYear < startYear) return false;
  if (school.isCurrent && endYear < currentYear) return false;
  if (!school.isCurrent && endYear > currentYear) return false;

  const previousEndYear = Number(getPreviousSchoolEndYear(fieldKey));

  if (previousEndYear && startYear < previousEndYear) return false;

  return true;
}
</script>
<template>
  <Transition name="pop-up">
    <div class="modal-overlay" v-if="open">
      <div class="modal">
        <div class="modal__header">
          <div class="close-button">
            <CloseButton @click="close" />
          </div>
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
              <div class="study-status-picker" v-if="currentStepIndex === 0">
                <h3 class="step-title">Study status</h3>
                <span class="step-description">
                  Tell us whether you are currently studying so we can shape your academic path around your situation.
                </span>
                <button
                  class="option"
                  :class="{ selected: isCurrentlyStudying === true }"
                  type="button"
                  @click="isCurrentlyStudying = true"
                >
                  <span class="option__title">
                    I am currently studying
                  </span>

                  <span class="option__description">
                    Use this if you are enrolled in a program right now.
                  </span>
                </button>

                <button
                  class="option"
                  :class="{ selected: isCurrentlyStudying === false }"
                  type="button"
                  @click="isCurrentlyStudying = false"
                >
                  <span class="option__title">
                    I am not currently studying
                  </span>

                  <span class="option__description">
                    Use this if you have completed your studies or are not enrolled right now.
                  </span>
                </button>
              </div>

              <div class="level-picker" v-else-if="currentStepIndex === 1">
                <h3 class="step-title">Academic level</h3>
                <span class="step-description">
                  {{ isCurrentlyStudying
                      ? 'Choose the academic level you are currently working toward.'
                      : 'Select the highest academic level you have completed.'
                  }}
                </span>
                <button
                  v-for="level in academicLevels"
                  :key="level.key"
                  class="option"
                  :class="{ selected: isLevelSelected(level.key) }"
                  type="button"
                  @click="selectLevel(level.key)"
                >
                  <span class="option__title">
                    {{ level.title }}
                  </span>

                  <span class="option__description">
                    {{ level.description }}
                  </span>
                </button>
              </div>

              <div class="school-step" v-else>
                <h3 class="step-title">
                  {{ currentSchoolField.title }}
                </h3>
                <span class="step-description">
                  {{ currentSchoolFieldDescription }}
                </span>
                <Dropdown
                  :options="schools.map(school => school?.nom)"
                  :placeholder="currentSchoolField.placeholder"
                  v-model="schoolFieldsInputs[currentSchoolFieldKey].schoolName"
                />

                <YearInput
                  v-model="schoolFieldsInputs[currentSchoolFieldKey].startYear"
                  label="Start year"
                  placeholder="YYYY"
                  :min="getStartMinYear()"
                  :max="getStartMaxYear()"
                />

                <YearInput
                  v-model="schoolFieldsInputs[currentSchoolFieldKey].endYear"
                  :label="currentSchoolEndYearLabel"
                  placeholder="YYYY"
                  :min="getEndMinYear()"
                  :max="getEndMaxYear()"
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
            :disabled="!isCurrentStepComplete"
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
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
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
  width: min(32rem, 100%);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.modal__header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.close-button {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
}

.step-meter__track {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 12rem;
  max-width: 45%;
  margin-inline: var(--space-md);
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
  position: sticky;
  bottom: 0;
  z-index: 10;
  flex-shrink: 0;
  background-color: var(--color-background);
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

.level-picker,
.study-status-picker {
  display: grid;
  gap: 0.75rem;
}

.option {
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

.option:hover {
  border-color: rgba(var(--color-secondary-rgb), 0.45);
  background: rgba(var(--color-surface-rgb), 0.38);
  transform: scale(1.01);
}

.option.selected {
  border-color: rgba(var(--color-secondary-rgb), 0.75);
  background: rgba(var(--color-secondary-rgb), 0.08);
  transform: scale(1);
}

.option__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
}

.option__description {
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

@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
  }
  .modal {
    width: 100%;
    align-self: end;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }
}

@media (max-width: 480px) {
  .modal__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .step-meter__track {
    width: 98%;
    max-width: none;
    margin-inline: 0;
  }
}
</style>
