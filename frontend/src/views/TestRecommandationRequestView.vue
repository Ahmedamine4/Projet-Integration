<script setup>
import { ref } from 'vue';
import Button from '@/components/common/Button.vue';
import RecommandationRequestModal from '@/components/StudentDashboard/RecommandationRequestModal.vue';

const isModalOpen = ref(false);
const isLoading = ref(false);

const testSchools = ['ENSA Tanger', 'ENSA Tétouan', 'FST Tanger'];

const testProfessorEmails = [
  'prof1@uae.ac.ma',
  'prof2@uae.ac.ma',
  'prof3@uae.ac.ma',
];

function handleSubmit(data) {
  console.log('Recommendation request submitted:', data);

  isLoading.value = true;

  setTimeout(() => {
    isLoading.value = false;
    isModalOpen.value = false;
  }, 800);
}
</script>

<template>
  <main class="test-page">
    <h1>Recommendation Request Modal Test</h1>

    <Button type="button" variant="submit" @click="isModalOpen = true">
      Open recommendation request modal
    </Button>

    <RecommandationRequestModal
      :open="isModalOpen"
      :loading="isLoading"
      :school-options="testSchools"
      :professor-emails="testProfessorEmails"
      @close="isModalOpen = false"
      @submit="handleSubmit"
    />
  </main>
</template>

<style scoped>
.test-page {
  min-height: 100vh;
  display: grid;
  place-content: center;
  gap: 1.5rem;
  padding: 3rem;
}
</style>