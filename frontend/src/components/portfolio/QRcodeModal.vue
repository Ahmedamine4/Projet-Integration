<script setup>
import { ref, watch, onUnmounted } from 'vue';
import CloseButton from '@/components/common/CloseButton.vue';
import QRCode from 'qrcode';
import Button from '@/components/common/Button.vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  username: {
    type: String,
    required: true,
  },
});

watch(() => props.open, (open) => {
  document.body.style.overflow = open ? 'hidden' : '';
});

onUnmounted(() => {
  document.body.style.overflow = '';
});

const emit = defineEmits(['close']);

const qrCodeDataUrl = ref('');

function close() {
  emit('close');
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return;

    const portfolioUrl = `${window.location.origin}/portfolio/${props.username}`;
    qrCodeDataUrl.value = await QRCode.toDataURL(portfolioUrl);
  }
);
</script>

<template>
  <Transition name="pop-up">
    <div class="modal-overlay" v-if="open">
      <div class="modal">
        <div class="modal__header">
          <div class="close-button">
            <CloseButton @click="close" />
          </div>
          <h3>{{ title }}</h3>
          <h5 class="modal-body-header">Scan this code to share your Portfolio in seconds.</h5>
        </div>

        <div class="modal__body">
          <div class="qrcode-wrapper">
            <img :src="qrCodeDataUrl" alt="Portfolio QR Code" class="qrcode" size=20rem/>
          </div>
        </div>

        <div class="modal__footer">
          <Button
              type="button"
              variant="ghost"
              @click="$emit('close')"
            >
              Close
            </Button>

            <Button
              type="submit"
              variant="submit"
              :loading
            >
              {{ `Copy link` }}
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
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
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
  max-height: min(40rem, 90vh);
  width: min(32rem, 100%);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.modal__header {
  position: relative;
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 0rem;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
  flex-direction: column;
  line-height: 10px;
  padding-top: 2rem;
  padding-bottom: 1rem;
}

.close-button {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
}

.modal__header > h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-medium);
  margin: 0;
}

.modal__body {
  padding: 0.75rem 1.8rem;
  min-height: 20rem;
  overflow: auto;
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
.modal-body-header{
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  color: rgba(var(--color-primary-rgb), 0.6);
}
.qrcode-wrapper{
  justify-self: center;
  height: fit-content;
  width: fit-content;
  margin: var(  --space-xl);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 16px rgba(0, 0, 0, 0.08);
  background-color: white;
}
.qrcode{
  height: 15rem;
}

.modal__footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
  flex-shrink: 0;
  background-color: var(--color-background);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

/* Pop-up transition */
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

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
  }

  .modal {
    width: 100%;
    align-self: end;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }
}

@media (max-width: 480px) {
  .modal__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>