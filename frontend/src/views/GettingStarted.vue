<script setup>
import { ref, computed, reactive } from 'vue';
import GettingStartedStep from '@/components/getting-started/GettingStartedStep.vue';
import ProgressMeter from '@/components/common/ProgressMeter.vue';
import SchoolPathModal from '@/components/getting-started/SchoolPathModal.vue';

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

const stepData = reactive({
    school: { done: false },
    github: { done: false },
    linkedin: { done: false },
});

const doneCount = computed(() => steps.reduce((acc, step) => {
    return stepData[step.key].done ? acc + 1 : acc;
}, 0));

const isSchoolModalOpen = ref(false);

function isDone(key) {
    return stepData[key].done;
}

function handleStepAction(key) {
    const step = steps.find(step => step.key === key);

    if (!step) return;

    if (step.key === 'school') {
        isSchoolModalOpen.value = true;
        return;
    }

    stepData[key].done = true;
}

function completeSchoolStep() {
    stepData.school.done = true;
    isSchoolModalOpen.value= false;
}
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
                    :done="isDone(step.key)"
                    @action="handleStepAction(step.key)"
                />
            </div>
        </div>
    </div>
    <SchoolPathModal
        :open="isSchoolModalOpen"
        @close="isSchoolModalOpen = false"
        @complete="completeSchoolStep"
    />
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
</style>
