<script setup>
import { computed, reactive } from 'vue';
import GettingStartedStep from '@/components/GettingStartedStep.vue';

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

function isDone(key) {
    return stepData[key].done;
}

function handleStepAction(key) {
    const step = steps.find(step => step.key === key);

    if (!step) return;

    stepData[key].done = true;
}

const meterStyle = computed(() => {
    const completionPercentage = doneCount.value * 100 / steps.length;
    let background = '';
    if (completionPercentage <= 25) background = 'var(--color-error)';
    else if (completionPercentage <= 50) background = '#e07012';
    else if (completionPercentage <= 75) background = '#d9b20b';
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
                    :title="step.title"
                    :description="step.description"
                    :done="isDone(step.key)"
                    @action="handleStepAction(step.key)"
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
