<script setup>
import { computed, onMounted, ref } from 'vue';
import ExperienceModal from '@/components/portfolio/ExperienceModal.vue';
import { useProjectStore } from '@/stores/project';
import { useInternshipStore } from '@/stores/internship';
import { useActivityStore } from '@/stores/activity';
import { useInstitutionStore } from '@/stores/institution';

const message = {
  teacherName: 'Mohammed El Ghailani',
  content: 'Please add more details about your role in this experience, especially the tasks you completed and the tools you used. Also, clarify the final result or outcome before resubmitting.',
};

const institutionStore = useInstitutionStore();

const professorEmails = [
  'ahmed.elamrani@ensat.ac.ma',
  'fatima.zahra@ensat.ac.ma',
  'youssef.bennani@uae.ac.ma',
  'sara.lahlou@fstt.ac.ma',
  'nour.chaoui@encgt.ac.ma',
  'karim.boukhari@ensate.uae.ac.ma',
  'amina.tazi@fs-tanger.ac.ma',
  'mehdi.elidrissi@ensah.ma',
  'salma.aitali@fstt.ac.ma',
  'omar.benali@uae.ac.ma'
];

const projectStore = useProjectStore();
const internshipStore = useInternshipStore();
const activityStore = useActivityStore();

const experienceTypes = [
  { value: 'project', label: 'Projects' },
  { value: 'internship', label: 'Internships' },
  { value: 'activity', label: 'Activities' },
  { value: 'certificate', label: 'Certificates' },
];

const selectedType = ref('project');
const modalOpen = ref(false);
const modalMode = ref('create');
const selectedExperience = ref(null);
const pageError = ref('');

const isLoading = computed(() => 
  projectStore.loading ||
  internshipStore.loading ||
  activityStore.loading
);

const currentItems = computed(() => {
  if (selectedType.value === 'project') return projectStore.projects;
  if (selectedType.value === 'internship') return internshipStore.internships;
  if (selectedType.value === 'activity') return activityStore.activities;
  return [];
});

function openCreateModal() {
  pageError.value = '';

  if (selectedType.value === 'certificate') {
    pageError.value = `Certificate backend is not available yet.`;
    return;
  }

  modalMode.value = 'create';
  selectedExperience.value = null;
  modalOpen.value = true;
}

function openEditModal(experience) {
  pageError.value = '';

  if (experience.type === 'project' || experience.type === 'activity') {
    pageError.value = `${experience.type} edit is not available until the backend has an edit endpoint.`;
    return;
  }

  selectedType.value = experience.type;
  modalMode.value = 'edit';
  selectedExperience.value = experience;
  modalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
  selectedExperience.value = null;
  modalMode.value = 'create';
}

function getItemDetails(item) {
  return [
    item.githubLink && `GitHub: ${item.githubLink}`,
    item.certificateURL && `Certificate: ${item.certificateURL}`,
    item.certificateCode && `Code: ${item.certificateCode}`,
    item.activityType && `Activity type: ${item.activityType}`,
    item.location && `Location: ${item.location}`,
    item.club && `Club: ${item.club}`,
    item.missions && `Missions: ${item.missions}`,
    item.report && `Report: ${item.report}`,
    item.teacherEmail && `Teacher: ${item.teacherEmail}`,
    item.visibleToEveryone === false && 'Private',
  ].filter(Boolean);
}

async function handleSubmit(experience) {
  pageError.value = '';

  try {
    if (selectedType.value === 'project') {
      await projectStore.createProject(experience);
    }
    else if (selectedType.value === 'activity') {
      await activityStore.createActivity(experience);
    }
    else if (modalMode.value === 'edit') {
      await internshipStore.editInternship({
        ...selectedExperience.value,
        ...experience,
      });
    }
    else {
      await internshipStore.createInternship(experience);
    }

    closeModal();
  } catch (error) {
    pageError.value = error.response?.data?.message || error.message || 'Something went wrong';
  }
}

onMounted(() => {
  internshipStore.fetchInternships().catch((error) => {
    pageError.value = error.response?.data?.message || 'Failed to fetch internships';
  });
  activityStore.fetchActivities().catch((error) => {
    pageError.value = error.response?.data?.message || 'Failed to fetch activities';
  });
});
</script>

<template>
  <section class="test-page">
    <h1>Experience Test</h1>

    <div class="actions">
      <button
        v-for="type in experienceTypes"
        :key="type.value"
        type="button"
        :class="{ active: selectedType === type.value }"
        @click="selectedType = type.value"
      >
        {{ type.label }}
      </button>
    </div>

    <div class="actions">
      <button type="button" @click="openCreateModal()">
        Add {{ selectedType }}
      </button>
      <button
        v-if="selectedType === 'internship'"
        type="button"
        @click="internshipStore.fetchInternships()"
      >
        Refresh internships
      </button>
      <button
        v-if="selectedType === 'activity'"
        type="button"
        @click="activityStore.fetchActivities()"
      >
        Refresh activities
      </button>
    </div>

    <p v-if="isLoading">Loading...</p>
    <p v-if="pageError" class="error">{{ pageError }}</p>
    <p v-if="projectStore.error" class="error">{{ projectStore.error }}</p>
    <p v-if="internshipStore.error" class="error">{{ internshipStore.error }}</p>
    <p v-if="activityStore.error" class="error">{{ activityStore.error }}</p>

    <div class="list">
      <p v-if="!currentItems.length">No {{ selectedType }} items yet.</p>

      <div
        v-for="item in currentItems"
        :key="item.id"
        class="item"
      >
        <img
          v-if="item.imagePreview"
          :src="item.imagePreview"
          :alt="item.title"
        />

        <div>
          <h2>{{ item.title }}</h2>
          <p>
            {{ item.startDate || item.date }}
            <span v-if="item.endDate">to {{ item.endDate }}</span>
          </p>
          <p>{{ item.description }}</p>

          <p
            v-for="detail in getItemDetails(item)"
            :key="detail"
          >
            {{ detail }}
          </p>

          <div class="tags">
            <span
              v-for="technology in item.technologies ?? []"
              :key="`technology-${item.id}-${technology}`"
            >
              {{ technology }}
            </span>
            <span
              v-for="domain in item.domains ?? []"
              :key="`domain-${item.id}-${domain}`"
            >
              {{ domain }}
            </span>
          </div>
        </div>

        <button type="button" @click="openEditModal(item)">
          Edit
        </button>
      </div>
    </div>

    <ExperienceModal
      :message
      :mode="modalMode"
      :type="selectedType"
      :initial-value="selectedExperience"
      :open="modalOpen"
      :loading="isLoading"
      :school-options="institutionStore.selectedInstitutions.map(institution => institution.nom)"
      :professor-emails="professorEmails"
      @close="closeModal"
      @submit="handleSubmit"
    />
  </section>
</template>

<style scoped>
.test-page {
  padding: 24px;
}

.actions {
  display: flex;
  gap: 8px;
  margin: 16px 0;
}

button {
  padding: 8px 12px;
  border: 1px solid #bbb;
  background: #fff;
  cursor: pointer;
}

button.active {
  background: #eee;
  font-weight: 700;
}

.error {
  color: #b00020;
}

.list {
  display: grid;
  gap: 12px;
}

.item {
  display: grid;
  grid-template-columns: 10rem 1fr auto;
  gap: var(--space-lg);
  padding: 12px;
  border: 1px solid #ddd;
  align-items: center;
}

.item img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border: 1px solid var(--color-primary-hover);
}

.item h2,
.item p {
  margin: 0 0 6px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tags span {
  padding: 2px 6px;
  border: 1px solid #ddd;
  font-size: 12px;
}
</style>
