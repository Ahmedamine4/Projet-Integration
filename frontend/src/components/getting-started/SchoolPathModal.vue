<script setup>
import { ref, reactive, computed } from 'vue';
import ProgressMeter from '@/components/common/ProgressMeter.vue';
import Button from '@/components/common/Button.vue';
import { schools } from '@/data/schools';

const academicLevels = [
  {
    key: 'bachelor',
    title: 'Bachelor / Licence',
    description: 'I am building a path for a Bachelor or Licence degree.',
    fields : ['bachelorSchool']
  },
  {
    key: 'master',
    title: 'Master',
    description: 'I am building a path that includes a Master degree.',
    fields : ['bachelorSchool', 'masterSchool']
  },
  {
    key: 'phd',
    title: 'PhD',
    description: 'I am building a path that includes doctoral studies.',
    fields : ['bachelorSchool', 'masterSchool', 'phdInstitution']
  }
];

const schoolFields = {
  bachelorSchool: {
    title: 'Bachelor / Licence school',
    description: 'Choose the school or university where you studied for your Bachelor or Licence.',
    placeholder: 'Search Bachelor / Licence school'
  },
  masterSchool: {
    title: 'Master school',
    description: 'Choose the school or university where you studied for your Master.',
    placeholder: 'Search Master school'
  },
  phdInstitution: {
    title: 'PhD institution',
    description: 'Choose the institution where you are doing or completed your PhD.',
    placeholder: 'Search PhD institution'
  }
};

defineProps({
  open: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'complete']);

const selectedLevelKey = ref('');

function selectLevel(key) {
  selectedLevelKey.value = key;
}

function selected(key) {
  return selectedLevelKey.value === key;
}

const showSchoolStep = ref(false);

function goNext() {
  if (selectedLevelKey.value) showSchoolStep.value = true;
}
</script>
<template>
  <Transition name="pop-up">
    <div class="modal-overlay" v-if="open">
      <div class="modal">
        <div class="modal__header">
          <h3>Build your academic path</h3>

          <div class="step-meter__track">
            <span>0 / 4</span>
            <ProgressMeter
              :value="0"
              :max="4"
            />
          </div>
        </div>
        <div class="modal__body">
          <div
            class="level-picker"
            v-if="!showSchoolStep"
          >
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
        </div>
        <div class="modal__footer">
          <Button
            variant="ghost"
            class="back-button"
            @click="emit('close')"
          >
            Back
          </Button>

          <Button
            variant="submit"
            class="next-button"
            :disabled="!selectedLevelKey"
            @click="goNext"
          >
            Next
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
  width: min(34rem, 100%);
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
  min-height: 15rem;
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

h3 {
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
</style>