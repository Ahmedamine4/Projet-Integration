<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { Check, RefreshCw, UserPlus, XCircle } from 'lucide-vue-next';
import StudentHeader from '@/components/dashboard/StudentHeader.vue';
import BaseButton from '@/components/common/actions/BaseButton.vue';
import BaseInput from '@/components/common/forms/BaseInput.vue';
import BaseError from '@/components/common/feedback/BaseError.vue';
import BaseNotification from '@/components/common/feedback/BaseNotification.vue';
import BaseSpinner from '@/components/common/feedback/BaseSpinner.vue';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const loading = ref(false);
const dashboardLoaded = ref(false);
const savingProfessor = ref(false);
const actionLoadingId = ref('');
const error = ref('');
const notification = reactive({
  type: 'success',
  message: '',
});

const dashboard = reactive({
  institution: null,
  professors: [],
  pendingStudents: [],
  stats: {
    totalProfessors: 0,
    totalStudents: 0,
  },
});

const DEFAULT_PROFESSOR_DEPARTEMENT = 'Informatique';
const DEFAULT_PROFESSOR_SPECIALITE = 'Génie logiciel';

const professorForm = reactive({
  email: '',
  prenom: '',
  nom: '',
  departement: '',
  specialite: '',
});

const isDirector = computed(() => user.value?.role === 'directeur');
const isAuthResolving = computed(() => authStore.profileLoading || !authStore.profileChecked);

const directorProfile = computed(() => ({
  firstName: user.value?.prenom || user.value?.firstName || 'Directeur',
  lastName: user.value?.nom || user.value?.lastName || '',
  major: dashboard.institution?.nom || 'Institution',
  avatar: user.value?.photo || 'https://cdn-icons-png.flaticon.com/512/1250/1250689.png',
}));

const stats = computed(() => [
  { label: 'Professeurs', value: dashboard.stats.totalProfessors },
  { label: 'Etudiants', value: dashboard.stats.totalStudents },
  { label: 'Demandes en attente', value: dashboard.pendingStudents.length },
]);

function showNotification(message, type = 'success') {
  notification.message = message;
  notification.type = type;
}

function getErrorMessage(err, fallback) {
  return err.response?.data?.message || err.response?.data?.error || fallback;
}

function resetProfessorForm() {
  professorForm.email = '';
  professorForm.prenom = '';
  professorForm.nom = '';
  professorForm.departement = '';
  professorForm.specialite = '';
}

async function loadDashboard() {
  if (!isDirector.value || loading.value) return;

  loading.value = true;
  error.value = '';

  try {
    const { data } = await api.get('/directeur/dashboard/stats');
    const payload = data.data || {};

    dashboard.institution = payload.institution || null;
    dashboard.professors = payload.professors || [];
    dashboard.pendingStudents = payload.pendingStudents || [];
    dashboard.stats = {
      totalProfessors: payload.stats?.totalProfessors || 0,
      totalStudents: payload.stats?.totalStudents || 0,
    };
    dashboardLoaded.value = true;
  } catch (err) {
    error.value = getErrorMessage(err, 'Impossible de charger le dashboard directeur.');
  } finally {
    loading.value = false;
  }
}

async function loadDashboardWhenReady() {
  if (!authStore.profileChecked) {
    await authStore.fetchProfile();
  }

  await loadDashboard();
}

async function addProfessor() {
  if (!professorForm.email) {
    error.value = 'Email du professeur requis.';
    return;
  }

  savingProfessor.value = true;
  error.value = '';

  try {
    const { data } = await api.post('/directeur/professeurs', {
      email: professorForm.email,
      prenom: professorForm.prenom || undefined,
      nom: professorForm.nom || undefined,
      departement: professorForm.departement || DEFAULT_PROFESSOR_DEPARTEMENT,
      specialite: professorForm.specialite || DEFAULT_PROFESSOR_SPECIALITE,
    });

    resetProfessorForm();
    if (data.emailSent === false) {
      const fallbackMessage = 'Professeur cree, mais email non envoye. Verifiez la configuration email du backend.';
      const message = data.temporaryPassword
        ? `Professeur cree. Email non envoye. Mot de passe temporaire: ${data.temporaryPassword}`
        : fallbackMessage;
      showNotification(message, 'warning');
    } else {
      showNotification('Professeur cree et identifiants envoyes par email.');
    }
    await loadDashboard();
  } catch (err) {
    error.value = getErrorMessage(err, 'Impossible de creer le professeur.');
  } finally {
    savingProfessor.value = false;
  }
}

async function decideStudent(request, status) {
  const studentId = request.utilisateur_id;
  const institutionId = request.institution_id;
  const loadingId = `${studentId}-${status}`;

  actionLoadingId.value = loadingId;
  error.value = '';

  try {
    await api.patch(`/validation/decide/${studentId}/${institutionId}`, { status });
    showNotification(status === 'valide' ? 'Demande acceptee.' : 'Demande refusee.');
    await loadDashboard();
  } catch (err) {
    error.value = getErrorMessage(err, 'Impossible de traiter la demande.');
  } finally {
    actionLoadingId.value = '';
  }
}

function studentName(request) {
  const student = request.etudiant?.utilisateur;
  return [student?.prenom, student?.nom].filter(Boolean).join(' ') || 'Etudiant';
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

onMounted(loadDashboardWhenReady);

watch(
  () => [authStore.profileChecked, user.value?.role],
  ([profileChecked]) => {
    if (profileChecked && isDirector.value && !dashboardLoaded.value) {
      loadDashboard();
    }
  },
);
</script>

<template>
  <div class="dashboard">
    <BaseNotification
      :message="notification.message"
      :type="notification.type"
      @close="notification.message = ''"
    />

    <section
      v-if="!isAuthResolving && !isDirector"
      class="section section--full access-panel"
    >
      <h1>Acces reserve au directeur</h1>
      <p>Ce dashboard est disponible uniquement pour les utilisateurs avec le role directeur.</p>
    </section>

    <template v-else>
      <StudentHeader
        :student="directorProfile"
        :stats="stats"
      />

      <BaseError v-if="error">
        {{ error }}
      </BaseError>

      <section
        v-if="isAuthResolving || loading"
        class="section section--full loading-panel"
      >
        <BaseSpinner />
        Chargement du dashboard...
      </section>

      <template v-else>
        <section class="section section--full">
          <div class="section-header">
            <h2>Ajouter un professeur</h2>
            <BaseButton
              type="button"
              variant="ghost"
              size="xs"
              :disabled="loading"
              @click="loadDashboard"
            >
              <RefreshCw :size="16" />
              Actualiser
            </BaseButton>
          </div>

          <form
            class="professor-form"
            @submit.prevent="addProfessor"
          >
            <BaseInput
              v-model="professorForm.email"
              label="Email"
              type="email"
              placeholder="professeur@institution.ma"
              required
            />
            <BaseInput
              v-model="professorForm.prenom"
              label="Prenom"
              placeholder="Prenom"
            />
            <BaseInput
              v-model="professorForm.nom"
              label="Nom"
              placeholder="Nom"
            />
            <BaseInput
              v-model="professorForm.departement"
              label="Departement"
              placeholder="Informatique"
            />
            <BaseInput
              v-model="professorForm.specialite"
              label="Specialite"
              placeholder="Génie logiciel"
            />
            <BaseButton
              type="submit"
              variant="submit"
              size="sm"
              :loading="savingProfessor"
            >
              <UserPlus :size="16" />
              Ajouter
            </BaseButton>
          </form>
        </section>

        <section class="section">
          <div class="section-header">
            <h2>Professeurs</h2>
            <span>{{ dashboard.professors.length }}</span>
          </div>

          <div class="table-responsive director-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Departement</th>
                  <th>Specialite</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="professor in dashboard.professors"
                  :key="professor.prof_utilisateur_id"
                  class="table-row"
                >
                  <td>
                    <span class="student-name">
                      {{ professor.utilisateur?.prenom }} {{ professor.utilisateur?.nom }}
                    </span>
                  </td>
                  <td>{{ professor.utilisateur?.email }}</td>
                  <td>{{ professor.departement || '-' }}</td>
                  <td>{{ professor.specialite || '-' }}</td>
                </tr>
                <tr v-if="dashboard.professors.length === 0">
                  <td colspan="4">
                    Aucun professeur pour le moment.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="section">
          <div class="section-header">
            <h2>Demandes d'inscription</h2>
            <span>{{ dashboard.pendingStudents.length }}</span>
          </div>

          <div class="table-responsive director-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Etudiant</th>
                  <th>Email</th>
                  <th>Niveau</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="request in dashboard.pendingStudents"
                  :key="`${request.utilisateur_id}-${request.institution_id}`"
                  class="table-row"
                >
                  <td>
                    <span class="student-name">{{ studentName(request) }}</span>
                  </td>
                  <td>{{ request.etudiant?.utilisateur?.email || '-' }}</td>
                  <td>{{ request.niveau || request.etudiant?.niveau || '-' }}</td>
                  <td>
                    <span class="cell-date">{{ formatDate(request.date) }}</span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <BaseButton
                        type="button"
                        variant="submit"
                        size="xs"
                        :loading="actionLoadingId === `${request.utilisateur_id}-valide`"
                        @click="decideStudent(request, 'valide')"
                      >
                        <Check :size="15" />
                        Accepter
                      </BaseButton>
                      <BaseButton
                        type="button"
                        variant="ghost"
                        size="xs"
                        :loading="actionLoadingId === `${request.utilisateur_id}-refuse`"
                        @click="decideStudent(request, 'refuse')"
                      >
                        <XCircle :size="15" />
                        Refuser
                      </BaseButton>
                    </div>
                  </td>
                </tr>
                <tr
                  v-if="dashboard.pendingStudents.length === 0"
                  class="empty-row"
                >
                  <td colspan="5">
                    Aucune demande en attente.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </template>
  </div>
</template>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: var(--space-lg);
  padding: var(--space-xl);
}

.section,
.error--global {
  grid-column: span 1;
}

.section--full,
.error--global {
  grid-column: 1 / -1;
}

.section {
  overflow: hidden;
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-lg);
  background: var(--color-background);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.section-header h2 {
  margin: 0;
  font-size: var(--font-size-lg);
}

.section-header span {
  opacity: 0.6;
}

.professor-form {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr)) auto;
  gap: var(--space-md);
  align-items: end;
  padding: var(--space-lg);
}

.table-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.director-table-wrapper {
  border: 0;
  border-radius: 0;
}

.data-table .empty-row:last-child td {
  border-bottom: 0;
}

.loading-panel,
.access-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  align-items: center;
  justify-content: center;
  min-height: 14rem;
  padding: var(--space-xl);
  text-align: center;
}

.access-panel h1 {
  margin: 0;
  font-size: var(--font-size-xl);
}

.access-panel p {
  max-width: 34rem;
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.68);
}

@media (max-width: 1100px) {
  .dashboard {
    grid-template-columns: 1fr;
  }

  .professor-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .dashboard {
    padding: var(--space-md);
  }

  .professor-form {
    grid-template-columns: 1fr;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
