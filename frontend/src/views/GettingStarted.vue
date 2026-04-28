<script setup>
import { useRouter } from 'vue-router';
import { ArrowDown, CircleCheck } from 'lucide-vue-next';
import { CircleDashed } from 'lucide-vue-next';
import { ref, computed } from 'vue';
import Button from '@/components/Button.vue';
import Input from '@/components/Input.vue';

const router = useRouter();

// Track expanded step
const expandedStep = ref(null);

// Track completion state per step
const stepData = ref({
  school: { value: '', done: false },
  github: { value: '', done: false },
  linkedin: { value: '', done: false },
});

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

function isLoading(key) {
  return !stepData.value[key].done;
}
</script>

<template>
  <section class="">
    <header class=""></header>

    <div class="page-content">
      <h1>Let's get you set up,  </h1>
      <div class="wrapper-gettingstarted">
        <div class="wrapper-header">
          <h2>Getting Started</h2>
        </div>
        <div class="wrapper-steps">

          <!-- Step 1: Choose School -->
          <div class="step" :class="{ expanded: expandedStep === 'school' }" @click="toggleStep('school')">
            <div class="step-main">
              <div class="left">
                <CircleCheck v-if="isDone('school')" class="step-icon" />
                <CircleDashed v-else class="step-icon loading" />
                <div class="description">
                  <h3>Choose your School</h3>
                  <p>Choose your school from the list of supported schools</p>
                </div>
              </div>
              <div class="boutton">
                <ArrowDown class="step-arrow" :class="{ rotated: expandedStep === 'school' }" />
              </div>
            </div>
            <Transition name="step">
            <div class="step-expandable" v-if="expandedStep === 'school'" @click.stop>
              <Input
                v-model="stepData.school.value"
                label=""
                placeholder="Search for your school..."
                autocomplete="given-name"
            />
              <button class="step-confirm" @click="completeStep('school')">Confirm</button>
            </div>
            </Transition>
          </div>

          <!-- Step 2: GitHub -->
          <div class="step" :class="{ expanded: expandedStep === 'github' }" @click="toggleStep('github')">
            <div class="step-main">
              <div class="left">
                <CircleCheck v-if="isDone('github')" class="step-icon" />
                <CircleDashed v-else class="step-icon loading" />
                <div class="description">
                  <h3>Connect your GitHub account</h3>
                  <p>Connect your GitHub account to your profile</p>
                </div>
              </div>
              <div class="boutton">
                <ArrowDown class="step-arrow" :class="{ rotated: expandedStep === 'github' }" />
              </div>
            </div>
            <div class="step-expandable" v-if="expandedStep === 'github'" @click.stop>
              <Input
                v-model="stepData.github.value"
                label=""
                placeholder="Enter your GitHub username..."
                autocomplete="username"
              />
              <button class="step-confirm" @click="completeStep('github')">Connect</button>
            </div>
          </div>

          <!-- Step 3: LinkedIn -->
          <div class="step" 
                :class="{ 
                    expanded: expandedStep === 'linkedin',
                    done: isDone('linkedin')
                }" 
                @click="!isDone('linkedin') && toggleStep('linkedin')">
            <div class="step-main">
              <div class="left">
                <CircleCheck v-if="isDone('linkedin')" class="step-icon" />
                <CircleDashed v-else class="step-icon loading" />
                <div class="description">
                  <h3>Connect your LinkedIn account</h3>
                  <p>Connect your LinkedIn account to your profile</p>
                </div>
              </div>
              <div class="boutton">
                <ArrowDown class="step-arrow" :class="{ rotated: expandedStep === 'linkedin' }" />
              </div>
            </div>
            <div class="step-expandable" v-if="expandedStep === 'linkedin'" @click.stop>
              <input
                class="step-input"
                type="text"
                placeholder="Enter your LinkedIn profile URL..."
                v-model="stepData.linkedin.value"
              />
              <button class="step-confirm" @click="completeStep('linkedin')">Connect</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 3rem;
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

.step {
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.08);
  transition: var(--transition-normal);
  cursor: pointer;
}
.step.done {
  cursor: default;
}
.step:hover:not(.done) {
  background-color: rgba(var(--color-surface-rgb), 0.3);
}

.step-main {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
}

.left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}
.step-icon {
  align-self: flex-start;
  width: 1.8rem;
  height: 1.8rem;
  color: var(--color-background);
  fill: var(--color-success);
}
.step-icon.loading {
  scale: 0.8;
  color: rgba(var(--color-primary-rgb), 0.3);
  fill: var(--color-primary);
}
.description {
  display: flex;
  flex-direction: column;
  padding-top: 0.24rem;
  padding-bottom: 0.24rem;
  gap: 0.4rem;
}
.boutton {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 1rem;
}
.step-arrow {
  transition: transform 0.25s ease;
}
.step-arrow.rotated {
  transform: rotate(180deg);
}

.step-expandable {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
  cursor: default;
  transition: var(--transition-normal);
}
.step-input {
    flex: 1;
    padding: 0.6rem 1rem;
    border: 1px solid rgba(var(--color-primary-rgb), 0.15);
    border-radius: var(--radius-md);
    background: rgba(var(--color-surface-rgb), 0.4);
    color: var(--color-primary);
    font-size: var(--font-size-sm);
    outline: none;
    transition: border-color 0.2s ease;
}
.step-input::placeholder {
    color: rgba(var(--color-primary-rgb), 0.35);
}
.step-input:focus {
    border-color: rgba(var(--color-primary-rgb), 0.4);
}
.step-confirm {
  padding: 0.6rem 1.25rem;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-success);
  color: var(--color-background);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: opacity 0.2s ease;
  white-space: nowrap;
}
.step-confirm:hover {
    opacity: 0.85;
}

h2 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-medium);
    margin: 0;
}
h3 {
    font-size: var(--font-size-md);
    font-weight: var(--font-medium);
    margin: 0;
}
p {
    font-size: var(--font-size-sm);
    font-weight: var(--font-regular);
    color: rgba(var(--color-primary-rgb), 0.6);
    margin: 0;
}
.step-enter-from,
.step-leave-to {
    margin-bottom: 0;
    max-height: 0;
    opacity: 0;
    transform: translateY(-0.35rem);
}

.step-enter-to,
.step-leave-from {
    margin-bottom: var(--space-md);
    max-height: 6rem;
    opacity: 1;
    transform: translateY(0);
}
</style>