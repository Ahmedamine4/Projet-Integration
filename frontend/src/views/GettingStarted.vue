<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import GettingStartedStep from '@/components/GettingStartedStep.vue';
import Sidebar from '@/components/Sidebar.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const expandedStep = ref(null);

const stepData = ref({
  school: { value: '', done: false },
  github: { value: '', done: false },
  linkedin: { value: '', done: false },
});

const schools = [
  'Ecole Nationale des Sciences Appliquees',
  'Faculte des Sciences',
  'Faculte des Sciences et Techniques',
  'Ecole Mohammadia d Ingenieurs',
  'Ecole Nationale Superieure d Informatique et d Analyse des Systemes',
  'Institut National des Postes et Telecommunications',
  'Universite Mohammed V',
  'Universite Hassan II',
  'Universite Cadi Ayyad',
  'Universite Ibn Tofail',
  'Universite Abdelmalek Essaadi',
  'Universite Sidi Mohamed Ben Abdellah',
  'Universite Moulay Ismail',
  'Universite Ibn Zohr',
  'Universite Hassan Premier',
  'Universite Mohammed Premier',
  'Al Akhawayn University',
  'Universite Internationale de Rabat',
  'Universite Internationale de Casablanca',
  'Ecole Hassania des Travaux Publics',
  'Institut Agronomique et Veterinaire Hassan II',
  'Ecole Nationale Superieure des Mines de Rabat',
  'Ecole Nationale d Architecture',
  'Ecole Superieure de Technologie',
  'Institut Superieur de Commerce et d Administration des Entreprises',
];

const steps = [
  {
    key: 'school',
    title: 'Choose your School',
    description: 'Choose your school from the list of supported schools',
    placeholder: 'Search for your school...',
    confirmText: 'Confirm',
    options: schools,
  },
  {
    key: 'github',
    title: 'Connect your GitHub account',
    description: 'Connect your GitHub account to your profile',
    placeholder: 'Enter your GitHub username...',
    confirmText: 'Connect',
  },
  {
    key: 'linkedin',
    title: 'Connect your LinkedIn account',
    description: 'Connect your LinkedIn account to your profile',
    placeholder: 'Enter your LinkedIn profile URL...',
    confirmText: 'Connect',
  },
];

function toggleStep(key) {
  expandedStep.value = expandedStep.value === key ? null : key;
}

function completeStep(key) {
  if (stepData.value[key].value.trim()) {
    stepData.value[key].done = true;
    expandedStep.value = null;
  }
}

function isDone(key) {
  return stepData.value[key].done;
}

</script>

<template>
  <main class="getting-started-shell">
    <Sidebar :user="user || undefined" />

    <div class="page-content">
      <h1>Let's get you set up,  </h1>
      <div class="wrapper-gettingstarted">
        <div class="wrapper-header">
          <h2>Getting Started</h2>
        </div>
        <div class="wrapper-steps">

          <GettingStartedStep
            v-for="step in steps"
            :key="step.key"
            v-model="stepData[step.key].value"
            :title="step.title"
            :description="step.description"
            :placeholder="step.placeholder"
            :confirm-text="step.confirmText"
            :done="isDone(step.key)"
            :expanded="expandedStep === step.key"
            :lock-when-done="step.lockWhenDone"
            :options="step.options"
            @toggle="toggleStep(step.key)"
            @complete="completeStep(step.key)"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.getting-started-shell {
  display: flex;
  min-height: 100vh;
  background: var(--color-background);
}

.page-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem var(--space-xl);
  gap: 3rem;
}
.wrapper-gettingstarted {
  display: flex;
  flex-direction: column;
  width: 75%;
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-md);
  height: fit-content;
  padding-bottom: 0;
}
.wrapper-header {
  display: flex;
  padding: 1.5rem;
  border-top-left-radius: var(--radius-md);
  border-top-right-radius: var(--radius-md);
}
.wrapper-steps {
  display: flex;
  flex-direction: column;
}

h2 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-medium);
    margin: 0;
}
</style>
