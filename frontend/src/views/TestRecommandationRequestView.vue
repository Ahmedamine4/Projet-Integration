<script setup>
import { ref, computed, onMounted } from 'vue';
import { useInstitutionStore } from '@/stores/institution';
import Button from '@/components/common/actions/BaseButton.vue';
import RecommandationRequestModal from '@/components/StudentDashboard/RecommandationRequestModal.vue';

const isModalOpen = ref(false);
const isLoading = ref(false);

const institutionStore = useInstitutionStore();

onMounted(() => {
  institutionStore.fetchInstitutions();
});

const schoolOptions = computed(() =>
  institutionStore.institutions.map((institution) => institution.nom)
);
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
    <Button
      type="button"
      variant="submit"
      @click="isModalOpen = true"
    >
      Recommendation request 
    </Button>

    <RecommandationRequestModal
      :open="isModalOpen"
      :loading="isLoading"
      :school-options="schoolOptions"
      :academic-institutions="institutionStore.institutions"
      @close="isModalOpen = false"
      @submit="handleSubmit"
    />
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
