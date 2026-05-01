<script setup>
import { computed, ref, reactive } from 'vue';
import GettingStartedStep from '@/components/GettingStartedStep.vue';

const expandedStep = ref(null);

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

const stepData = reactive({
    school: { value: '', done: false },
    github: { value: '', done: false },
    linkedin: { value: '', done: false },
});

const doneCount = computed(() => steps.reduce((acc, step) => {
    return stepData[step.key].done ? acc + 1 : acc;
}, 0));

function toggleStep(key) {
    expandedStep.value = expandedStep.value === key ? null : key;
}

function completeStep(key) {
    const step = steps.find(step => step.key === key);
    const value = stepData[key].value.trim();

    if (!step || !value) return;

    if (step.options?.length && !step.options.includes(value))
        return;

    stepData[key].done = true;
    expandedStep.value = null;
}

function isDone(key) {
    return stepData[key].done;
}


const meterStyle = computed(() => {
    const completionPercentage = doneCount.value * 100 / steps.length;
    let background = '';
    if (completionPercentage < 25) background = 'var(--color-error)';
    else if (completionPercentage < 50) background = '#e07012';
    else if (completionPercentage < 75) background = '#d9b20b';
    else background = 'var(--color-success)';
    return {
        width : `${completionPercentage}%`,
        background
    };
});

</script>

<template>
    <div class="page-content">
        <h1>Let's get you set up,  </h1>
        <div class="wrapper-getting-started">
            <div class="wrapper-header">
                <h2>Getting Started</h2>

                <div class="step-meter__track">
                    <span>
                        {{ `${doneCount} / ${steps.length}` }}
                    </span>
                    <div class="step-meter__bar">
                        <div
                            class="step-meter__fill"
                            :style="meterStyle"
                        />
                    </div>
                </div>
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
</template>

<style scoped>
.page-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem var(--space-xl);
    gap: 3rem;
}
.wrapper-getting-started {
    display: flex;
    flex-direction: column;
    width: clamp(16rem, 75vw, 80rem);
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

.step-meter__bar {
    flex: 1;
    min-width: 6rem;
    overflow: hidden;
    height: 0.38rem;
    border-radius: 999px;
    background-color: rgba(var(--color-primary-rgb), 0.12);
}

.step-meter__fill {
    height: 100%;
    border-radius: inherit;
    background: var(--color-success);
    transition:
        width 0.48s var(--ease-overshoot),
        background var(--transition-normal);
}
</style>
