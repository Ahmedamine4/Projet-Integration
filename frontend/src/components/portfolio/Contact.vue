<script setup>
import gradiant from '@/assets/images/brown-gradiant.png';
import GmailCopyButton from '@/components/portfolio/GmailCopyButton.vue';
import ContactLink from '@/components/portfolio/ContactLink.vue';
import { ref } from 'vue';


const props = defineProps({
  email: {
    type: String,
    required: true,
  },
  canedit: {
    type: Boolean,
    default: false,
  },
  links: {
    type: Array,
    default: () => [],
  },
});


const editingPlatform = ref(null);

function startEdit(platform) {
  editingPlatform.value = platform;
}

function stopEdit() {
  editingPlatform.value = null;
}

function onLinkUpdated() {
  stopEdit();
}

</script>

<template>
  <div class="contact">
    <div class="contact__content">
    <h2>Interested in working together ?</h2>
    <p>Feel free to reach out to me for any inquiries, collaborations, or just to say hello !</p>
    <GmailCopyButton :email="props.email" />
    </div>
    <div class="contact__links">
      <ContactLink
        v-for="link in props.links"
        v-show="isOwner || link.href"
        :key="link.platform"
        :title="link.label"
        :platform="link.platform"
        :href="link.href"
        :isOwner="props.canedit"
        :isEditing="editingPlatform === link.platform"
        :disabled="editingPlatform !== null && editingPlatform !== link.platform"
        @edit="startEdit(link.platform)"
        @cancel="stopEdit"
        @updated="onLinkUpdated"
      />

    </div>
    <img :src="gradiant" alt="Gradiant" class="contact__gradiant" />
  </div>
</template>

<style scoped>

.contact {
  display: flex;
  justify-content: space-between;
  position: relative;
  background-color: #1A1412;
  color: var(--color-background);
  overflow: hidden;
  height: 60vh;
  min-height: 20rem;
  width: calc(100% - 20px);
  border-radius: var(--radius-md);
  padding-inline: 7%;
  letter-spacing: 0.02em;
  margin-inline: auto;
  margin-bottom: 10px;
  align-items: center;
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.1);
}
.contact__gradiant {
  display: flex; 
  object-fit: cover;
  position: absolute;
  top: -15rem;
  right: 0;
  margin: 0;
  opacity: 0.4;
  z-index: 0;
}
.contact h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.2;
}
.contact p {
  margin-top: var(--space-md);
  font-size: 0.9rem;
  font-weight: var(--font-light);
  line-height: 1.3;
  color: rgba(var(--color-background-rgb), 0.8);
}
.contact__content {
  position: relative;
  z-index: 1;
  max-width: 600px;
}
.contact__links {
  position: relative;
  width: 30%;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Responsive */
@media (max-width: 768px) {

}

@media (max-width: 480px) {

}
</style>