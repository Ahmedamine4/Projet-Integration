<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import BaseButton from '@/components/common/actions/BaseButton.vue';
import CloseButton from '@/components/common/actions/CloseButton.vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  file: {
    type: [File, Blob],
    default: null,
  },
  title: {
    type: String,
    default: 'Crop image',
  },
  outputWidth: {
    type: Number,
    default: 1280,
  },
  outputHeight: {
    type: Number,
    default: 720,
  },
});

const emit = defineEmits(['close', 'crop']);

const cropperRef = ref(null);
const imageUrl = ref('');

const aspectRatio = computed(() => props.outputWidth / props.outputHeight);
const outputLabel = computed(() => `${props.outputWidth} x ${props.outputHeight} px`);

function releaseImageUrl() {
  if (!imageUrl.value) return;
  URL.revokeObjectURL(imageUrl.value);
  imageUrl.value = '';
}

watch(
  () => props.file,
  (file) => {
    releaseImageUrl();

    if (file) {
      imageUrl.value = URL.createObjectURL(file);
    }
  },
  { immediate: true }
);

function cropImage() {
  const result = cropperRef.value?.getResult?.();
  const canvas = result?.canvas;

  if (!canvas || !props.file) return;

  canvas.toBlob((blob) => {
    if (!blob) return;

    const mimeType = props.file.type || 'image/jpeg';
    const extension = mimeType === 'image/png' ? 'png' : 'jpg';
    const baseName = props.file.name?.replace(/\.[^.]+$/, '') || 'cropped-image';
    const croppedFile = new File([blob], `${baseName}-cropped.${extension}`, {
      type: mimeType,
    });

    emit('crop', croppedFile);
  }, props.file.type || 'image/jpeg', 0.92);
}

onBeforeUnmount(releaseImageUrl);
</script>

<template>
  <Teleport to="body">
    <Transition name="pop-up">
      <div
        v-if="open"
        class="cropper-modal"
      >
        <section class="cropper-modal__panel">
          <header class="cropper-modal__header">
            <div class="close-button">
              <CloseButton @click="emit('close')" />
            </div>
            <h3>{{ title }}</h3>
            <p>{{ outputLabel }}</p>
          </header>

          <div class="cropper-modal__body">
            <Cropper
              v-if="imageUrl"
              ref="cropperRef"
              class="image-cropper"
              :src="imageUrl"
              :stencil-props="{ aspectRatio }"
              :canvas="{
                width: outputWidth,
                height: outputHeight,
              }"
              image-restriction="stencil"
              :auto-zoom="true"
              :transitions="true"
            />
          </div>

          <footer class="cropper-modal__footer">
            <BaseButton
              type="button"
              variant="ghost"
              class="cropper-action"
              @click="emit('close')"
            >
              Cancel
            </BaseButton>
            <BaseButton
              type="button"
              variant="submit"
              class="cropper-action"
              @click="cropImage"
            >
              Crop image
            </BaseButton>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cropper-modal {
  position: fixed;
  inset: 0;
  background: rgba(var(--color-primary-rgb), 0.3);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: var(--space-lg);
}

.cropper-modal__panel {
  display: flex;
  flex-direction: column;
  width: min(34rem, 100%);
  max-height: min(34rem, 88vh);
  overflow: hidden;
  border-radius: var(--radius-md);
  background: var(--color-background);
  box-shadow: var(--shadow-md);
}

.cropper-modal__header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  flex-shrink: 0;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
  padding: 1.5rem 1.8rem;
}

.close-button {
  order: 2;
}

.cropper-modal__header h3,
.cropper-modal__header p {
  margin: 0;
}

.cropper-modal__header h3 {
  color: var(--color-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-medium);
}

.cropper-modal__header p {
  color: rgba(var(--color-primary-rgb), 0.72);
  font-size: var(--font-size-sm);
}

.cropper-modal__body {
  min-height: 18rem;
  overflow: hidden;
  padding: 1rem 1.5rem;
  background: var(--color-background);
}

.image-cropper {
  width: 100%;
  height: min(48vh, 23rem);
  border-radius: var(--radius-md);
  background:
    linear-gradient(
      165deg,
      rgba(var(--color-secondary-rgb), 0.1),
      transparent 45%
    ),
    linear-gradient(
      180deg,
      rgba(var(--color-background-rgb), 0.4),
      var(--color-surface)
    );
}

.cropper-modal__footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-sm);
  flex-shrink: 0;
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.08);
  background: var(--color-background);
  padding: 1rem 1.8rem;
}

.cropper-action {
  min-width: 6rem;
}

:deep(.vue-advanced-cropper__background),
:deep(.vue-advanced-cropper__foreground) {
  background:
    linear-gradient(
      165deg,
      rgba(var(--color-secondary-rgb), 0.1),
      transparent 45%
    ),
    linear-gradient(
      180deg,
      rgba(var(--color-background-rgb), 0.4),
      var(--color-surface)
    );
}

:deep(.vue-advanced-cropper__stencil) {
  border-color: var(--color-background);
}

.pop-up-enter-active,
.pop-up-leave-active {
  transition: opacity 0.24s ease;
}

.pop-up-enter-from,
.pop-up-leave-to {
  opacity: 0;
}

.pop-up-enter-to,
.pop-up-leave-from {
  opacity: 1;
}

.pop-up-enter-from .cropper-modal__panel,
.pop-up-leave-to .cropper-modal__panel {
  transform: scale(0.97);
}

.pop-up-enter-active .cropper-modal__panel,
.pop-up-leave-active .cropper-modal__panel {
  transition: transform 0.4s var(--ease-overshoot);
}

.pop-up-enter-to .cropper-modal__panel,
.pop-up-leave-from .cropper-modal__panel {
  transform: scale(1);
}

@media (max-width: 768px) {
  .cropper-modal {
    padding: 0;
  }

  .cropper-modal__panel {
    width: 100%;
    align-self: end;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }
}

@media (max-width: 480px) {
  .cropper-modal__header {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.25rem var(--space-lg);
  }

  .close-button {
    position: absolute;
    top: var(--space-md);
    right: var(--space-md);
  }

  .cropper-modal__body,
  .cropper-modal__footer {
    padding-inline: var(--space-lg);
  }
}
</style>
