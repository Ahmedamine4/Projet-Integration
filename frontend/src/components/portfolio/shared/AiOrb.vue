<script setup>
import { nextTick, reactive, ref } from 'vue';
import FolioCraftLogo from '@/assets/icons/FolioCraft.svg';
import { analyzeExperienceDescription } from '@/services/aiApi';
import { Sparkles } from 'lucide-vue-next';

const form = reactive({
  description: '',
});

const technologies = ref([]);
const domains = ref([]);
const isAnalyzingDescription = ref(false);
const analysisError = ref('');
const userMessage = ref('');
const descriptionInput = ref(null);

const resizeDescriptionInput = () => {
  if (!descriptionInput.value) return;

  descriptionInput.value.style.height = '34px';
  descriptionInput.value.style.height = `${descriptionInput.value.scrollHeight}px`;
};

const createSelectableItems = (items = []) => {
  return items.map((item) => ({
    name: typeof item === 'string' ? item : item.name,
    selected: true,
  }));
};

const analyzeDescription = async () => {
  if (!form.description.trim()) return;

  userMessage.value = form.description;
  isAnalyzingDescription.value = true;
  analysisError.value = '';
  technologies.value = [];
  domains.value = [];

  try {
    const data = await analyzeExperienceDescription(form.description);

    technologies.value = createSelectableItems(data.technologies);
    domains.value = createSelectableItems(data.domains);
    triggerAiSpeaking(3000);

    form.description = '';
    await nextTick();
    resizeDescriptionInput();
  } catch (error) {
    analysisError.value = error.message;
  } finally {
    isAnalyzingDescription.value = false;
  }
};

const isAiSpeaking = ref(false);

const triggerAiSpeaking = (duration = 6500) => {
  isAiSpeaking.value = true;

  setTimeout(() => {
    isAiSpeaking.value = false;
  }, duration);
};

const handleOrbChange = (event) => {
  if (event.target.checked) {
    triggerAiSpeaking(6500);
  }
};
</script>

<style scoped>
.container-vao {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.input-orb:checked ~ .container-chat-ia {
  width: 500px;
  height: 350px;
  filter: blur(0px);
  opacity: 1;
  transform: translate(-430px, -280px);
}

.input-orb:checked ~ .orb {
  filter: drop-shadow(0 0 12px rgba(255, 122, 24, 0.3))
    drop-shadow(0 0 5px rgba(255, 82, 0, 0.3));
  transform-origin: left top;
  transform: translate(-50%, -50%);

  & .icons .logo-icon {
    opacity: 1;
    filter: brightness(0) invert(1) drop-shadow(0 0 4px #ffffff);
  }

  &:hover {
    transform: translate(-60%, -60%) scale(1.1);

    & .icons .logo-icon {
      opacity: 0;
      transform: scale(1.1);
      filter: brightness(0) invert(1) drop-shadow(0 0 4px #ffffff);
    }

    & .icons .close-icon {
      color: #ffffff;
      transform: scale(1.1);
      filter: brightness(0) invert(1) drop-shadow(0 0 4px #ffffff);
      opacity: 1;
    }
  }

  &:active {
    transform: translate(-50%, -50%) scale(0.9);
  }
}

.input-orb:not(:checked) ~ .orb {
  filter: drop-shadow(0 0 4px rgba(255, 255, 255))
    drop-shadow(0 0 12px rgba(255, 255, 255))
    drop-shadow(0 0 12px rgba(255, 122, 24, 0.3))
    drop-shadow(0 0 5px rgba(255, 82, 0, 0.3));
  transform: scale(1) translate(-50%, -50%);

  & .ball {
    animation: circle2 4.2s ease-in-out infinite;
  }

  &:hover {
    transform: scale(1.2) translate(-50%, -50%);
    filter: drop-shadow(0 0 4px rgba(255, 255, 255))
      drop-shadow(0 0 8px rgba(255, 255, 255))
      drop-shadow(0 0 12px rgba(255, 255, 255))
      drop-shadow(0 0 10px rgba(255, 122, 24, 0.3))
      drop-shadow(0 6px 26px rgba(255, 82, 0, 0.3));

    & .icons .logo-icon {
      transform: scale(1.1);
      filter: brightness(0) invert(1) drop-shadow(0 0 4px #ffffff);
      opacity: 1;
    }
  }

  &:active {
    transform: scale(1.2) translate(-50%, -50%);
    filter: drop-shadow(0 0 4px rgba(255, 255, 255))
      drop-shadow(0 0 8px rgba(255, 255, 255))
      drop-shadow(0 0 12px rgba(255, 255, 255))
      drop-shadow(0 0 10px rgba(255, 122, 24, 0.3))
      drop-shadow(0 6px 26px rgba(255, 82, 0, 0.3));
  }
}

@keyframes circle2 {
  0% {
    transform: scale(1.5);
  }

  15% {
    transform: scale(1.53);
  }

  30% {
    transform: scale(1.48);
  }

  45% {
    transform: scale(1.44);
  }

  60% {
    transform: scale(1.47);
  }

  85% {
    transform: scale(1.53);
  }

  100% {
    transform: scale(1.5);
  }
}

.container-chat-ia {
  opacity: 0;
  background: #fafafa;
  filter: blur(50px);
  display: flex;
  flex-direction: column;
  width: 64px;
  height: 64px;
  padding: 0.5rem;
  border-radius: 2rem;
  box-shadow:
    6px 6px 12px rgba(255, 82, 0, 0.1),
    -6px 6px 12px rgba(255, 184, 77, 0.1);
  gap: 6px;
  transition: all 0.6s cubic-bezier(0.175, 0.885, 0, 1.1);
}

.container-title {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0rem;
  gap: 6px;

  & svg {
    color: #ff7a18;
    animation: animation-color-svg 8s 1s infinite both;
  }

  & .text-title {
    font-size: 14px;
    font-weight: 500;
    background-image: linear-gradient(
      to left,
      #ff7a18 0% 20%,
      #ffb84d 50%,
      #ff7a18 80% 100%
    );
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    background-size: 800px;
    animation: animation-color-text 8s infinite linear;
  }
}

@keyframes animation-color-svg {
  0%,
  30% {
    color: #ff7a18;
  }

  15% {
    color: #ffb84d;
  }
}

@keyframes animation-color-text {
  0% {
    background-position: -800px;
  }

  50% {
    background-position: 0px;
  }
}

.container-chat {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  font-size: 13px;
  background-image: linear-gradient(
    to top left,
    rgb(255, 122, 24, 0.22),
    rgb(255, 184, 77, 0.22)
  );
  border-radius: 1.5rem;
  overflow: hidden;

  &::after {
    position: absolute;
    content: "";
    inset: 0;
    background: repeating-conic-gradient(
        rgba(255, 255, 255, 0.2) 0.0000001%,
        rgb(255, 239, 214, 0.8) 0.000104%
      )
      60% 60%/600% 600%;
  }
}

.container-chat-limit {
  display: flex;
  flex: 1;
  overflow-y: auto;
  -webkit-mask: linear-gradient(0deg, white 85%, transparent 95% 100%);
  mask: linear-gradient(0deg, white 85%, transparent 95% 100%);
  z-index: 999;
}

.chats {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 2rem 1rem 1rem 1rem;
  gap: 0.25rem;
  animation: none;
}

.chat-user {
  display: flex;
  justify-content: end;

  & p {
    opacity: 1;
    transform: translateY(0);
    width: 85%;
    line-height: 1.3;
    padding: 0.625rem;
    color: #8a5a2b;
    border-radius: 0.625rem 0.625rem 0 0.625rem;
    background-color: rgba(255, 246, 232, 0.7);
  }
}

.chat-ia {
  display: flex;

  & p {
    opacity: 0;
    transform: translateY(10px);
    width: 85%;
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    line-height: 1;
    padding: 0.625rem 0;
    color: #5a2e0d;
    animation: animation-chat 1s calc(var(--delay) * 1s) both
      cubic-bezier(0.175, 0.885, 0.32, 1.275);

    & span {
      opacity: 0;
      transform: translateY(10px);
      display: block;
      animation: animation-chat 0.5s calc(var(--delay) * 0.6s + var(--word) * 0.1s)
        both cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
  }
}

.chat-result {
  display: flex;

  & div {
    width: 85%;
    color: #5a2e0d;
    padding: 0rem 0;
    line-height: 1.3;
  }
}

.result-title {
  font-weight: 600;
  margin-bottom: 1.3rem;
}

.result-section {
  margin-top: 0rem;
  margin-bottom: 1rem;
}

.result-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.result-tag {
  font-size: 12px;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  color: #8a5a2b;
  background: rgba(255, 246, 232, 0.8);
}

.error-message {
  color: #cc5759;
}

.chat-input-form {
  position: relative;
  z-index: 999;
  display: flex;
  align-items: flex-end;
  gap: 0.4rem;
  padding-inline: 0.5rem;
  padding-block: 0.9rem;
  background: rgba(255, 255, 255, 0.75);
  border-top: 1px solid rgba(255, 122, 24, 0.16);
  padding-right: 15%;
}

.chat-input {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  height: 34px;
  max-height: 96px;
  overflow-y: auto;
  padding: 0.55rem 0.75rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.18);
  border-radius: 0.8rem;
  background: rgba(var(--color-surface-rgb), 0.32);
  color: var(--color-primary);
  font-size: 12px;
  line-height: 1.2;
}

.chat-input::placeholder {
  color: rgba(90, 46, 13, 0.55);
}

.chat-send-button {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  color: #ffffff;
  background: #ff7a18;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.chat-send-button:hover {
  transform: scale(1.05);
  background: #ff8b2d;
}

.chat-send-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@keyframes animation-chat {
  100% {
    opacity: 1;
    transform: translateY(0px);
  }
}

.orb {
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: left top;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  display: flex;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  z-index: 999999;
}

.icons {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition: all 0.3s ease-in-out;
  z-index: 999;
}

.logo-icon {
  filter: brightness(0) invert(1);
  width: 24px;
  height: 24px;
  object-fit: contain;
  flex-shrink: 0;
  opacity: 0.5;
  transition: all 0.3s ease-in-out;
}

.close-icon {
  position: absolute;
  width: 24px;
  height: 24px;
  opacity: 0;
  color: #ffffff;
  filter: drop-shadow(0 0 4px #ffffff);
  transition: all 0.3s ease-in-out;
}

.ball {
  display: flex;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 50px;
  background-color: #ff7a18;
  filter: url(#gooey);
}

.container-lines {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background-image: radial-gradient(
    ellipse at center,
    rgba(255, 255, 255, 0.75) 15%,
    #ffb84d 50%
  );
  clip-path: polygon(
    50% 25%,
    65% 30%,
    75% 42%,
    75% 58%,
    65% 70%,
    50% 75%,
    35% 70%,
    26% 58%,
    25% 42%,
    35% 30%
  );
  animation: none;
  pointer-events: none;
}

.orb.is-ai-speaking .container-lines {
  animation: animation-ball 8s both ease;
}

@keyframes animation-ball {
  2% {
    clip-path: polygon(
      50% 25%,
      50% 0,
      75% 42%,
      75% 58%,
      65% 70%,
      50% 75%,
      35% 70%,
      26% 58%,
      25% 42%,
      50% 0
    );
  }

  4% {
    clip-path: polygon(
      50% 25%,
      70% 0,
      75% 42%,
      85% 66%,
      65% 100%,
      50% 75%,
      35% 100%,
      15% 65%,
      25% 42%,
      30% 0
    );
  }

  6% {
    clip-path: polygon(
      50% 25%,
      50% 15%,
      75% 42%,
      75% 58%,
      65% 70%,
      50% 75%,
      35% 70%,
      26% 58%,
      25% 42%,
      50% 15%
    );
  }

  7%,
  59% {
    clip-path: polygon(
      50% 25%,
      100% 12%,
      75% 42%,
      85% 66%,
      65% 70%,
      50% 75%,
      35% 70%,
      15% 65%,
      25% 42%,
      0 12%
    );
  }

  9%,
  57% {
    clip-path: polygon(
      50% 25%,
      50% 0,
      75% 42%,
      75% 58%,
      65% 70%,
      50% 75%,
      35% 70%,
      26% 58%,
      25% 42%,
      50% 0
    );
  }

  12%,
  55%,
  61% {
    clip-path: polygon(
      50% 25%,
      65% 30%,
      75% 42%,
      75% 58%,
      65% 70%,
      50% 75%,
      35% 70%,
      26% 58%,
      25% 42%,
      35% 30%
    );
  }
}

.container-borders {
  position: relative;
  display: flex;
  width: 56px;
  height: 56px;
  margin: 4px;
  border-radius: 50px;
  border-top: 8px solid #ffb84d;
  border-left: 8px solid #ffb84d;
}

.container-rings {
  aspect-ratio: 1;
  border-radius: 50%;
  position: absolute;
  inset: 0;
  perspective: 11rem;

  &:before,
  &:after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(255, 122, 24, 1);
    border-radius: 50%;
    border: 6px solid transparent;
    mask:
      linear-gradient(#fff 0 0) padding-box,
      linear-gradient(#fff 0 0);
    background: linear-gradient(white, #ff7a18, #ff9f1c, #ffb84d, #fff3d6)
      border-box;
    mask-composite: exclude;
  }
}

.container-rings::before {
  animation: ring180 10s linear infinite;
}

.container-rings::after {
  animation: ring90 10s linear infinite;
}

@keyframes ring180 {
  0% {
    transform: rotateY(180deg) rotateX(180deg) rotateZ(180deg);
  }

  50% {
    transform: rotateY(360deg) rotateX(360deg) rotateZ(360deg) scale(1.1);
  }

  100% {
    transform: rotateY(540deg) rotateX(540deg) rotateZ(540deg);
  }
}

@keyframes ring90 {
  0% {
    transform: rotateY(90deg) rotateX(90deg) rotateZ(90deg);
  }

  50% {
    transform: rotateY(270deg) rotateX(270deg) rotateZ(270deg) scale(1.1);
  }

  100% {
    transform: rotateY(450deg) rotateX(450deg) rotateZ(450deg);
  }
}

/* RESPONSIVE PHONE */
@media (max-width: 600px) {
  .container-vao {
    width: 60px;
    height: 35px;
  }

  .input-orb:checked ~ .container-chat-ia {
    width: min(92vw, 360px);
    height: min(70vh, 460px);
    transform: translate(calc(-100% + 56px), calc(-100% - 18px));
    border-radius: 1.4rem;
  }

  .container-chat-ia {
    padding: 0.4rem;
    gap: 5px;
  }

  .container-title {
    gap: 4px;
  }

  .container-title .text-title {
    font-size: 12px;
  }

  .container-chat {
    font-size: 12px;
    border-radius: 1.1rem;
  }

  .chats {
    padding: 1.4rem 0.75rem 0.75rem 0.75rem;
  }

  .chat-ia p,
  .chat-user p,
  .chat-result div {
    width: 100%;
  }

  .chat-ia p {
    line-height: 1.15;
  }

  .chat-user p {
    padding: 0.55rem;
  }

  .result-title {
    margin-bottom: 1rem;
  }

  .result-tag {
    font-size: 11px;
    padding: 0.22rem 0.45rem;
  }

  .chat-input-form {
    padding: 0.55rem;
    padding-right: 0.55rem;
    gap: 0.35rem;
  }

  .chat-input {
    height: 36px;
    max-height: 72px;
    font-size: 11px;
    padding: 0.5rem 0.65rem;
  }

  .chat-send-button {
    width: 32px;
    height: 32px;
  }

  .orb {
    width: 44px;
    height: 44px;
  }

  .ball {
    width: 44px;
    height: 44px;
  }

  .logo-icon,
  .close-icon {
    width: 22px;
    height: 22px;
  }

  .container-lines {
    width: 88px;
    height: 88px;
  }
}

@media (max-width: 380px) {
  .input-orb:checked ~ .container-chat-ia {
    width: 90vw;
    height: 68vh;
    transform: translate(calc(-100% + 54px), calc(-100% - 16px));
  }

  .container-title .text-title {
    font-size: 11px;
  }

  .chats {
    padding-inline: 0.6rem;
  }
}
</style>

<template>
  <div class="container-vao">
    <input
      type="checkbox"
      class="input-orb"
      id="v.a.o."
      name="v.a.o."
      style="display: none;"
      @change="handleOrbChange"
    />

    <label for="v.a.o." class="orb" :class="{ 'is-ai-speaking': isAiSpeaking }">
      <div class="icons">
        <img class="logo-icon" :src="FolioCraftLogo" alt="FolioCraft">

        <svg
          class="close-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59L7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12L5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4"
          ></path>
        </svg>
      </div>

      <div class="ball">
        <div class="container-lines"></div>
        <div class="container-rings"></div>
      </div>

      <svg style="pointer-events: none;">
        <filter id="gooey">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6"></feGaussianBlur>
          <feColorMatrix
            values="1 0 0 0 0
            0 1 0 0 0 
            0 0 1 0 0
            0 0 0 20 -10"
          ></feColorMatrix>
        </filter>
      </svg>
    </label>

    <div class="container-chat-ia">
      <div class="container-title">
        <Sparkles :size="20" />

        <p class="text-title">
          <span>What are</span>
          <span> you looking for ?</span>
        </p>
      </div>

      <div class="container-chat">
        <div class="container-chat-limit">
          <div class="chats">
            <div class="chat-ia" style="--delay: 2">
              <p>
                <span style="--word: 1">Hi</span>
                <span style="--word: 2">there!</span>
                <span style="--word: 3">I'm</span>
                <span style="--word: 4">an</span>
                <span style="--word: 5">adaptive</span>
                <span style="--word: 6">assistant.</span>
                <span style="--word: 7">To</span>
                <span style="--word: 8">save</span>
                <span style="--word: 9">you</span>
                <span style="--word: 10">time</span>
                <span style="--word: 11">scrolling,</span>
                <span style="--word: 12">paste</span>
                <span style="--word: 13">a</span>
                <span style="--word: 14">job</span>
                <span style="--word: 15">description</span>
                <span style="--word: 16">or</span>
                <span style="--word: 17">tell</span>
                <span style="--word: 18">me</span>
                <span style="--word: 19">what</span>
                <span style="--word: 20">role</span>
                <span style="--word: 21">you're</span>
                <span style="--word: 22">hiring</span>
                <span style="--word: 23">for,</span>
                <span style="--word: 24">and</span>
                <span style="--word: 25">I'll</span>
                <span style="--word: 26">instantly</span>
                <span style="--word: 27">surface</span>
                <span style="--word: 28">the</span>
                <span style="--word: 29">most</span>
                <span style="--word: 30">relevant</span>
                <span style="--word: 31">projects</span>
                <span style="--word: 32">and</span>
                <span style="--word: 33">skills</span>
                <span style="--word: 34">from</span>
                <span style="--word: 35">this</span>
                <span style="--word: 36">portfolio.</span>
              </p>
            </div>

            <div v-if="userMessage" class="chat-user">
              <p>{{ userMessage }}</p>
            </div>

            <div v-if="isAnalyzingDescription" class="chat-result">
              <div>
                <p class="result-title">Analyzing your description...</p>
              </div>
            </div>

            <div v-if="analysisError" class="chat-result">
              <div>
                <p class="error-message">{{ analysisError }}</p>
              </div>
            </div>

            <div
              v-if="technologies.length || domains.length"
              class="chat-result"
            >
              <div>
                <p class="result-title">Here is what I detected:</p>

                <div v-if="technologies.length" class="result-section">
                  <p class="result-label">Technologies</p>
                  <div class="result-tags">
                    <span
                      v-for="technology in technologies"
                      :key="technology.name"
                      class="result-tag"
                    >
                      {{ technology.name }}
                    </span>
                  </div>
                </div>

                <div v-if="domains.length" class="result-section">
                  <p class="result-label">Domains</p>
                  <div class="result-tags">
                    <span
                      v-for="domain in domains"
                      :key="domain.name"
                      class="result-tag"
                    >
                      {{ domain.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form class="chat-input-form" @submit.prevent="analyzeDescription">
          <textarea
            ref="descriptionInput"
            v-model="form.description"
            class="chat-input"
            placeholder="Paste a job description..."
            @input="resizeDescriptionInput"
            @keydown.enter.prevent="analyzeDescription"
          ></textarea>

          <button
            type="submit"
            class="chat-send-button"
            :disabled="isAnalyzingDescription || !form.description.trim()"
            aria-label="Send description"
          >
            <svg
              v-if="!isAnalyzingDescription"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14z"
              />
            </svg>

            <span v-else>...</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>