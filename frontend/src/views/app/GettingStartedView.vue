<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import GettingStartedStep from '@/components/getting-started/GettingStartedStep.vue';
import ProgressMeter from '@/components/common/display/ProgressMeter.vue';
import SchoolPathModal from '@/components/getting-started/SchoolPathModal.vue';
import { useInstitutionStore } from '@/stores/institution';
import { useGithubStore } from '@/stores/github';
import Button from '@/components/common/Button.vue';
import { GithubIcon } from 'lucide-vue-next';
import gettingStartedIllustration from '@/assets/getting-started-illustration.png';

const institutionStore = useInstitutionStore();
const githubStore = useGithubStore();

onMounted(() => {
  institutionStore.fetchInstitutions();

  const params = new URLSearchParams(window.location.search);

  if (params.get('github') === 'connected') {
    stepStatus.github = 'done';
  }
});

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
  key: 'phone',
  title: 'Add your phone number',
  description: 'Add a phone number to secure your profile',
  },
];

const stepStatus = reactive({
  school: 'todo',
  github: 'todo',
  phone: 'todo',
});

const doneCount = computed(() =>
  steps.reduce((acc, step) => {
    return stepStatus[step.key] !== 'todo' ? acc + 1 : acc;
  }, 0),
);

const isSchoolModalOpen = ref(false);
const selectedStep = ref(null);
const phoneForm = reactive({
  countryCode: '+212',
  phoneNumber: '',
});

const countryCodes = [
  { label: '🇲🇦 +212', value: '+212' },
  { label: '🇫🇷 +33', value: '+33' },
  { label: '🇪🇸 +34', value: '+34' },
  { label: '🇺🇸 +1', value: '+1' },
];

async function handleStepAction(key) {
  const step = steps.find((step) => step.key === key);

  if (!step) return;

  if (step.key === 'school') {
    isSchoolModalOpen.value = true;
    return;
  }
  selectedStep.value = selectedStep.value === key ? null : key;
  }
  async function connectGithub() {
  await githubStore.connectGithub();
  }
function completeSchoolStep(schoolData) {
  institutionStore.setSchoolPath(schoolData.schoolPath);
  stepStatus.school = 'done';
  isSchoolModalOpen.value = false;
}
function savePhoneNumber() {
  if (!phoneForm.phoneNumber.trim()) return;

  console.log('Phone:', {
    countryCode: phoneForm.countryCode,
    phoneNumber: phoneForm.phoneNumber,
  });

  stepStatus.phone = 'done';
  selectedStep.value = null;
}
</script>

<template>
  <div class="getting-started-page">
  <div class="page-content">
  
    <h1>Let's get you set up,</h1>
    <p class="page-subtitle">
  Complete these quick steps to build and secure your verified portfolio.
</p>
    <div class="wrapper-getting-started">
            <img
          class="getting-started-illustration"
          :src="gettingStartedIllustration"
          alt=""
        />
      <div class="wrapper-header">
        <h2>Getting Started</h2>

        <div class="step-meter__track">
          <span>
            {{ `${doneCount} / ${steps.length}` }}
          </span>
          <ProgressMeter :value="doneCount" :max="steps.length" />
        </div>
      </div>
      <div class="wrapper-steps">
        <div v-for="step in steps" :key="step.key" class="step-wrapper">
          <GettingStartedStep
            :step-key="step.key"
            :title="step.title"
            :description="step.description"
            :status="stepStatus[step.key]"
            @action="handleStepAction(step.key)"
          />

          <Transition name="field-reveal">
            <div
              v-if="selectedStep === 'github' && step.key === 'github'"
              class="step-action-panel"
            >
              <p>
                Authorize GitHub to connect your account and import your repositories.
              </p>

                              <Button
                class="github-button"
                type="button"
                variant="submit"
                :loading="githubStore.loading"
                @click.stop="connectGithub"
              >
                <GithubIcon class="github-button-icon" />
                Connect with GitHub
              </Button>
            </div>
          </Transition>
          <Transition name="field-reveal">
              <div
                v-if="selectedStep === 'phone' && step.key === 'phone'"
                class="step-action-panel"
              >
                

                <div class="phone-form">
                  

              <div class="phone-input-wrapper">
                <span class="phone-prefix">+212</span>

                <input
                  v-model="phoneForm.phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                />
              </div>

                  <Button
                  class="phone-button"
                    type="button"
                    variant="submit"
                    @click="savePhoneNumber"
                  >
                    Save phone number
                  </Button>
                </div>
              </div>
            </Transition>
        </div>
      </div>
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
  align-items: flex-start;
  width: clamp(16rem, 75vw, 80rem);
  margin-inline: auto;
  padding: clamp(1.5rem, 4vw, 2rem) clamp(1.25rem, 5vw, var(--space-xl));
  gap: 3rem;
  position: relative;
  /*overflow: hidden;*/
}
.getting-started-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 18% 35%, rgba(236, 72, 153, 0.12), transparent 32%),
    radial-gradient(circle at 50% 45%, rgba(249, 115, 22, 0.2), transparent 40%),
    linear-gradient(120deg, #fff7ed 0%, #fffaf5 50%, #ffffff 100%);
}
.page-content h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.1;
}
.page-subtitle {
  margin: -1rem 0 0;
  color: rgba(var(--color-primary-rgb), 0.6);
  font-size: var(--font-size-md);
}

.wrapper-getting-started {
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-md);
  height: fit-content;
  padding-bottom: 0;
  position: relative;
  background: rgba(255, 255, 255, 0.86);
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

@media (max-width: 480px) {
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
.step-wrapper {
  display: flex;
  flex-direction: column;
}

.step-action-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-sm);
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.06);
  padding: var(--space-lg) var(--space-lg) var(--space-lg) 6.4rem;
  text-align: left;
}

.step-action-panel p {
  margin: 0;
  color: rgba(var(--color-primary-rgb),0.6);
  font-size: var(--font-size-sm);
}

.field-reveal-enter-from,
.field-reveal-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.field-reveal-enter-active,
.field-reveal-leave-active {
  transition:
    opacity var(--transition-normal),
    transform var(--transition-normal);
}

.field-reveal-enter-to,
.field-reveal-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.phone-form {
  display: grid;
  gap: var(--space-sm);
  width: min(100%, 28rem);
}
.phone-input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  height: 3rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.18);
  border-radius: var(--radius-md);
  background: rgba(var(--color-surface-rgb), 0.32);
  overflow: hidden;
}
.phone-input-wrapper input {
  flex: 1;
  height: 100%;
  border: none;
  background: transparent;
  padding: 0 1rem;
  color: var(--color-primary);
  font-size: var(--font-size-md);
}

.phone-input-wrapper input:focus {
  outline: none;
}

.phone-prefix {
  display: inline-flex;
  align-items: center;
  height: 100%;
  padding: 0 1rem;
  border-right: 1px solid rgba(var(--color-primary-rgb), 0.12);
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
}
.github-button {
  background: #111;
  color: white;
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.18);
}
.github-button-icon {
  width: 1.1rem;
  height: 1.1rem;
  color: white;
  stroke: white;
}
.phone-button {
  width: fit-content;
  min-width: 0;
  padding-inline: 1.25rem;
  align-self: flex-start;
}
.getting-started-illustration {
  position: absolute;
  top: clamp(-3rem, -6vw, -1.5rem);
 right: clamp(1rem, 4vw, 2rem);
  width: clamp(8rem, 14vw, 14rem);
  pointer-events: none;
  z-index: 2;
}


</style>