<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import GettingStartedStep from '@/components/getting-started/GettingStartedStep.vue';
import ProgressMeter from '@/components/common/ProgressMeter.vue';
import SchoolPathModal from '@/components/getting-started/SchoolPathModal.vue';
import { useInstitutionStore } from '@/stores/institution';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';

const authStore = useAuthStore();

const institutionStore = useInstitutionStore();

onMounted(institutionStore.fetchInstitutions);

const steps = [
  {
    key: 'school',
    title: 'Build your academic path',
    description: 'Choose your current level and add your schools',
  },
  {
    key: 'github',
    title: 'Connect your GitHub account',
    description: 'Connect your GitHub account to your profile',
  },
  {
    key: 'linkedin',
    title: 'Connect your LinkedIn account',
    description: 'Connect your LinkedIn account to your profile',
  },
];

const stepStatus = reactive({
  school: 'todo',
  github: 'todo',
  linkedin: 'todo',
});

const doneCount = computed(() =>
  steps.reduce((acc, step) => {
    return stepStatus[step.key] === 'done' ? acc + 1 : acc;
  }, 0),
);

const isSchoolModalOpen = ref(false);

function handleStepAction(key) {
  const step = steps.find((step) => step.key === key);

  if (!step) return;

  if (step.key === 'school') {
    isSchoolModalOpen.value = true;
    return;
  }

  stepStatus[key] = 'done';
}

async function completeSchoolStep(schoolData) {
  await api.post('/select-institutions', {
    etudiantId: authStore.user.utilisateur_id,
    institutionId: Object.values(schoolData.schoolPath)
      .map(school => school.institutionId)
      .filter(Boolean),
  });
  institutionStore.setSchoolPath(schoolData.schoolPath);
  stepStatus.school = 'pending';
  isSchoolModalOpen.value = false;
}
</script>

<template>
  <div class="page-content">
    <h1>Let's get you set up,</h1>
    <div class="wrapper-getting-started">
      <div class="wrapper-header">
        <h2>Getting Started</h2>

        <div class="step-meter__track">
          <span>
            {{ `${doneCount} / ${steps.length}` }}
          </span>
          <ProgressMeter
            :value="doneCount"
            :max="steps.length"
          />
        </div>
      </div>
      <div class="wrapper-steps">
        <GettingStartedStep
          v-for="step in steps"
          :key="step.key"
          :title="step.title"
          :description="step.description"
          :status="stepStatus[step.key]"
          @action="handleStepAction(step.key)"
        />
      </div>
    </div>
  </div>
  <SchoolPathModal
    :open="isSchoolModalOpen"
    :schools="institutionStore.institutions"
    @close="isSchoolModalOpen = false"
    @complete="completeSchoolStep"
  />
</template>

<style scoped>
.page-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-width: 0;
  padding: 3rem 12vw;
  gap: 3rem;
}

.wrapper-getting-started {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 80rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-md);
  height: fit-content;
  padding-bottom: 0;
}

.wrapper-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.5rem;
  border-top-left-radius: var(--radius-md);
  border-top-right-radius: var(--radius-md);
}

.wrapper-steps {
  display: flex;
  flex-direction: column;
}

.wrapper-header > h2 {
  flex-shrink: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-medium);
  margin: 0;
}

.step-meter__track {
  display: flex;
  width: 15rem;
  max-width: 40%;
  align-items: center;
  gap: 0.75rem;
}

.step-meter__track > span {
  flex-shrink: 0;
  font-size: var(--font-size-sm);
  color: rgba(var(--color-primary-rgb), 0.72);
}

@media (max-width: 768px) {
  .page-content {
    padding-inline: 6vw;
  }
}

@media (max-width: 480px) {
  .page-content {
    padding-inline: 1rem;
  }

  .wrapper-header {
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
