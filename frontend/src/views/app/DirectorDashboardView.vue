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
import Pagination from '@/components/dashboard/PaginationComponent.vue';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const loadingStats = ref(false);
const loadingMembers = ref(false);
const loadingRequests = ref(false);
const dashboardLoaded = ref(false);
const savingProfessor = ref(false);
const actionLoadingId = ref('');
const error = ref('');

const memberType = ref('professeur');
const requestType = ref('inscription');

const notification = reactive({
  type: 'success',
  message: '',
});

const dashboard = reactive({
  institution: null,
  stats: {
    totalProfessors: 0,
    totalStudents: 0,
    pendingRequests: 0,
  },
});

const members = ref([]);
const pendingRequests = ref([]);

const memberPagination = reactive({
  page: 1,
  limit: 5,
  total: 0,
  totalPages: 1,
});

const requestsPagination = reactive({
  page: 1,
  limit: 5,
  total: 0,
  totalPages: 1,
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

const isLoading = computed(() =>
  loadingStats.value || loadingMembers.value || loadingRequests.value
);

const directorProfile = computed(() => ({
  firstName: user.value?.prenom || user.value?.firstName || 'Directeur',
  lastName: user.value?.nom || user.value?.lastName || '',
  major: dashboard.institution?.nom || 'Institution',
  avatar: user.value?.photo || 'https://cdn-icons-png.flaticon.com/512/1250/1250689.png',
}));

const stats = computed(() => [
  { label: 'Professeurs', value: dashboard.stats.totalProfessors },
  { label: 'Etudiants', value: dashboard.stats.totalStudents },
  { label: 'Demandes en attente', value: dashboard.stats.pendingRequests },
]);

const memberTitle = computed(() =>
  memberType.value === 'professeur' ? 'Professeurs' : 'Étudiants'
);

const requestTitle = computed(() =>
  requestType.value === 'inscription' ? "Demandes d'inscription" : "Demandes d'activité"
);

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

function setPagination(target, source = {}) {
  target.page = source.page || 1;
  target.limit = source.limit || target.limit || 5;
  target.total = source.totalItems || source.total || 0;
  target.totalPages = source.totalPages || 1;
}

async function loadStats() {
  if (!isDirector.value) return;

  loadingStats.value = true;
  error.value = '';

  try {
    const { data } = await api.get('/directeur/dashboard/stats');
    const payload = data.data || {};

    dashboard.institution = payload.institution || null;

    dashboard.stats = {
      totalProfessors: payload.stats?.totalProfessors || 0,
      totalStudents: payload.stats?.totalStudents || 0,
      pendingRequests: payload.stats?.totalPending || 0,
    };
  } catch (err) {
    error.value = getErrorMessage(err, 'Impossible de charger les statistiques.');
  } finally {
    loadingStats.value = false;
  }
}

async function loadMembers(page = memberPagination.page) {
  if (!isDirector.value) return;

  loadingMembers.value = true;
  error.value = '';

  try {
    const { data } = await api.get('/directeur/membres', {
      params: {
        type: memberType.value,
        page,
      },
    });

    const payload = data.data || {};

    members.value = payload.membres || [];
    setPagination(memberPagination, payload.pagination);
  } catch (err) {
    error.value = getErrorMessage(err, 'Impossible de charger les membres.');
  } finally {
    loadingMembers.value = false;
  }
}

async function loadRequests(page = requestsPagination.page) {
  if (!isDirector.value) return;

  loadingRequests.value = true;
  error.value = '';

  try {
    const { data } = await api.get('/directeur/demandes', {
      params: {
        type: requestType.value,
        page,
      },
    });

    const payload = data.data || {};

    pendingRequests.value = payload.demandes || [];
    setPagination(requestsPagination, payload.pagination);
  } catch (err) {
    error.value = getErrorMessage(err, 'Impossible de charger les demandes.');
  } finally {
    loadingRequests.value = false;
  }
}

async function loadDashboard() {
  if (!isDirector.value) return;

  await Promise.all([
    loadStats(),
    loadMembers(1),
    loadRequests(1),
  ]);

  dashboardLoaded.value = true;
}

async function loadDashboardWhenReady() {
  if (!authStore.profileChecked) {
    await authStore.fetchProfile();
  }

  await loadDashboard();
}

async function refreshDashboard() {
  await Promise.all([
    loadStats(),
    loadMembers(memberPagination.page),
    loadRequests(requestsPagination.page),
  ]);
}

async function addProfessor() {
  if (!professorForm.email) {
    error.value = 'Email du professeur requis.';
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(professorForm.email.trim())) {
    error.value = 'Format d\'email invalide.';
    return;
  }

  savingProfessor.value = true;
  error.value = '';

  try {
    const { data } = await api.post('/directeur/professeurs', {
      email: professorForm.email.trim(),
      prenom: professorForm.prenom || undefined,
      nom: professorForm.nom || undefined,
      departement: professorForm.departement || DEFAULT_PROFESSOR_DEPARTEMENT,
      specialite: professorForm.specialite || DEFAULT_PROFESSOR_SPECIALITE,
    });

    resetProfessorForm();

    if (data.emailSent === false) {
      const message = data.temporaryPassword
        ? `Professeur cree. Email non envoye. Mot de passe temporaire: ${data.temporaryPassword}`
        : 'Professeur cree, mais email non envoye. Verifiez la configuration email du backend.';

      showNotification(message, 'warning');
    } else {
      showNotification('Professeur cree et identifiants envoyes par email.');
    }

    memberType.value = 'professeur';

    await Promise.all([
      loadStats(),
      loadMembers(1),
    ]);
  } catch (err) {
    error.value = getErrorMessage(err, 'Impossible de creer le professeur.');
  } finally {
    savingProfessor.value = false;
  }
}

function getStudentId(request) {
  return (
    request.utilisateur_id ||
    request.etudiant?.etudiant_utilisateur_id ||
    request.etudiant?.utilisateur?.utilisateur_id ||
    request.etudiant_utilisateur_id ||
    request.etudiant_id ||
    request.etudiantId
  );
}

function getActivityExperienceId(request) {
  return (
    request.experience_id ||
    request.activite?.experience_id ||
    request.activite?.experience?.experience_id ||
    request.experienceId
  );
}

async function decideStudent(request, statut) {
  const etudiantId = getStudentId(request);

  if (!etudiantId) {
    error.value = 'Impossible de déterminer l’identifiant de l’étudiant.';
    return;
  }

  actionLoadingId.value = `inscription-${etudiantId}-${statut}`;
  error.value = '';

  try {
    await api.put('/directeur/demandes/inscription', {
      etudiantId,
      statut,
    });

    showNotification(statut === 'valide' ? 'Demande acceptée.' : 'Demande refusée.');

    await Promise.all([
      loadStats(),
      loadRequests(requestsPagination.page),
    ]);
  } catch (err) {
    error.value = getErrorMessage(err, 'Impossible de traiter la demande.');
  } finally {
    actionLoadingId.value = '';
  }
}

async function decideActivity(request, statut) {
  const experienceId = getActivityExperienceId(request);

  if (!experienceId) {
    error.value = 'Impossible de déterminer l’identifiant de l’activité.';
    return;
  }

  actionLoadingId.value = `activite-${experienceId}-${statut}`;
  error.value = '';

  try {
    await api.put('/directeur/demandes/activite', {
      experienceId,
      statut,
    });

    showNotification(statut === 'valide' ? 'Activité acceptée.' : 'Activité refusée.');

    await Promise.all([
      loadStats(),
      loadRequests(requestsPagination.page),
    ]);
  } catch (err) {
    error.value = getErrorMessage(err, 'Impossible de traiter la demande d’activité.');
  } finally {
    actionLoadingId.value = '';
  }
}

function changeMemberPage(page) {
  memberPagination.page = page;
  loadMembers(page);
}

function changeRequestsPage(page) {
  requestsPagination.page = page;
  loadRequests(page);
}

function changeMemberType(type) {
  if (memberType.value === type) return;

  memberType.value = type;
  memberPagination.page = 1;
  loadMembers(1);
}

function changeRequestType(type) {
  if (requestType.value === type) return;

  requestType.value = type;
  requestsPagination.page = 1;
  loadRequests(1);
}

function studentName(request) {
  const student = request.etudiant?.utilisateur || request.utilisateur;
  return [student?.prenom, student?.nom].filter(Boolean).join(' ') || 'Etudiant';
}

function studentEmail(request) {
  return request.etudiant?.utilisateur?.email || request.utilisateur?.email || '-';
}

function memberStudentName(member) {
  const student = member.etudiant?.utilisateur || member.utilisateur;
  return [student?.prenom, student?.nom].filter(Boolean).join(' ') || 'Étudiant';
}

function memberStudentEmail(member) {
  return member.etudiant?.utilisateur?.email || member.utilisateur?.email || '-';
}

function professorName(professor) {
  const professorUser = professor.utilisateur || professor;
  return [professorUser?.prenom, professorUser?.nom].filter(Boolean).join(' ') || 'Professeur';
}

function professorEmail(professor) {
  return professor.utilisateur?.email || professor.email || '-';
}

function activityStudentName(request) {
  const student = request.activite?.experience?.etudiant?.utilisateur;
  return [student?.prenom, student?.nom].filter(Boolean).join(' ') || 'Étudiant';
}

function activityStudentEmail(request) {
  return request.activite?.experience?.etudiant?.utilisateur?.email || '-';
}

function activityTitle(request) {
  return (
    request.activite?.experience?.titre ||
    request.activite?.titre ||
    request.experience?.titre ||
    'Activité'
  );
}

function getStudentActionId(request, statut) {
  const etudiantId = getStudentId(request);
  return `inscription-${etudiantId}-${statut}`;
}

function getActivityActionId(request, statut) {
  const experienceId = getActivityExperienceId(request);
  return `activite-${experienceId}-${statut}`;
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
        v-if="isAuthResolving || isLoading"
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
              :disabled="isLoading"
              @click="refreshDashboard"
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
          <div class="section-header section-header--with-tabs">
            <div>
              <h2>{{ memberTitle }}</h2>
              <span>{{ memberPagination.total }}</span>
            </div>

            <div class="tabs">
              <button
                type="button"
                class="tab"
                :class="{ 'tab--active': memberType === 'professeur' }"
                @click="changeMemberType('professeur')"
              >
                Professeurs
              </button>

              <button
                type="button"
                class="tab"
                :class="{ 'tab--active': memberType === 'etudiant' }"
                @click="changeMemberType('etudiant')"
              >
                Étudiants
              </button>
            </div>
          </div>

          <div class="table-responsive director-table-wrapper">
            <table
              v-if="memberType === 'professeur'"
              class="data-table"
            >
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
                  v-for="professor in members"
                  :key="professor.prof_utilisateur_id || professor.utilisateur_id || professor.id"
                  class="table-row"
                >
                  <td>
                    <span class="student-name">
                      {{ professorName(professor) }}
                    </span>
                  </td>

                  <td>{{ professorEmail(professor) }}</td>
                  <td>{{ professor.departement || '-' }}</td>
                  <td>{{ professor.specialite || '-' }}</td>
                </tr>

                <tr v-if="members.length === 0">
                  <td colspan="4">
                    Aucun professeur pour le moment.
                  </td>
                </tr>
              </tbody>
            </table>

            <table
              v-else
              class="data-table"
            >
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Niveau</th>
                  <th>Date début</th>
                  <th>Date fin</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="student in members"
                  :key="student.valide_etudiant_id || student.utilisateur_id"
                  class="table-row"
                >
                  <td>
                    <span class="student-name">
                      {{ memberStudentName(student) }}
                    </span>
                  </td>

                  <td>{{ memberStudentEmail(student) }}</td>
                  <td>{{ student.niveau || student.etudiant?.niveau || '-' }}</td>
                  <td>{{ formatDate(student.date_debut) }}</td>
                  <td>{{ formatDate(student.date_fin) }}</td>
                </tr>

                <tr v-if="members.length === 0">
                  <td colspan="5">
                    Aucun étudiant pour le moment.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-if="memberPagination.totalPages > 1"
            class="pagination-wrapper"
          >
            <Pagination
              :current-page="memberPagination.page"
              :total-pages="memberPagination.totalPages"
              @update:current-page="changeMemberPage"
            />
          </div>
        </section>

        <section class="section">
          <div class="section-header section-header--with-tabs">
            <div>
              <h2>{{ requestTitle }}</h2>
              <span>{{ requestsPagination.total }}</span>
            </div>

            <div class="tabs">
              <button
                type="button"
                class="tab"
                :class="{ 'tab--active': requestType === 'inscription' }"
                @click="changeRequestType('inscription')"
              >
                Inscriptions
              </button>

              <button
                type="button"
                class="tab"
                :class="{ 'tab--active': requestType === 'activite' }"
                @click="changeRequestType('activite')"
              >
                Activités
              </button>
            </div>
          </div>

          <div class="table-responsive director-table-wrapper">
            <table
              v-if="requestType === 'inscription'"
              class="data-table"
            >
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
                  v-for="request in pendingRequests"
                  :key="request.valide_etudiant_id || `${request.utilisateur_id}-${request.institution_id}`"
                  class="table-row"
                >
                  <td>
                    <span class="student-name">
                      {{ studentName(request) }}
                    </span>
                  </td>

                  <td>{{ studentEmail(request) }}</td>

                  <td>
                    {{ request.niveau || request.etudiant?.niveau || '-' }}
                  </td>

                  <td>
                    <span class="cell-date">
                      {{ formatDate(request.date_debut || request.date || request.created_at || request.createdAt) }}
                    </span>
                  </td>

                  <td>
                    <div class="table-actions">
                      <BaseButton
                        type="button"
                        variant="submit"
                        size="xs"
                        :loading="actionLoadingId === getStudentActionId(request, 'valide')"
                        @click="decideStudent(request, 'valide')"
                      >
                        <Check :size="15" />
                        Accepter
                      </BaseButton>

                      <BaseButton
                        type="button"
                        variant="ghost"
                        size="xs"
                        :loading="actionLoadingId === getStudentActionId(request, 'refuse')"
                        @click="decideStudent(request, 'refuse')"
                      >
                        <XCircle :size="15" />
                        Refuser
                      </BaseButton>
                    </div>
                  </td>
                </tr>

                <tr
                  v-if="pendingRequests.length === 0"
                  class="empty-row"
                >
                  <td colspan="5">
                    Aucune demande d'inscription en attente.
                  </td>
                </tr>
              </tbody>
            </table>

            <table
              v-else
              class="data-table"
            >
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>Email</th>
                  <th>Activité</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="request in pendingRequests"
                  :key="getActivityExperienceId(request) || request.valide_activite_id"
                  class="table-row"
                >
                  <td>
                    <span class="student-name">
                      {{ activityStudentName(request) }}
                    </span>
                  </td>

                  <td>{{ activityStudentEmail(request) }}</td>

                  <td>{{ activityTitle(request) }}</td>

                  <td>
                    <span class="cell-date">
                      {{ formatDate(request.date_d_action || request.created_at || request.createdAt) }}
                    </span>
                  </td>

                  <td>
                    <div class="table-actions">
                      <BaseButton
                        type="button"
                        variant="submit"
                        size="xs"
                        :loading="actionLoadingId === getActivityActionId(request, 'valide')"
                        @click="decideActivity(request, 'valide')"
                      >
                        <Check :size="15" />
                        Accepter
                      </BaseButton>

                      <BaseButton
                        type="button"
                        variant="ghost"
                        size="xs"
                        :loading="actionLoadingId === getActivityActionId(request, 'refuse')"
                        @click="decideActivity(request, 'refuse')"
                      >
                        <XCircle :size="15" />
                        Refuser
                      </BaseButton>
                    </div>
                  </td>
                </tr>

                <tr
                  v-if="pendingRequests.length === 0"
                  class="empty-row"
                >
                  <td colspan="5">
                    Aucune demande d'activité en attente.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-if="requestsPagination.totalPages > 1"
            class="pagination-wrapper"
          >
            <Pagination
              :current-page="requestsPagination.page"
              :total-pages="requestsPagination.totalPages"
              @update:current-page="changeRequestsPage"
            />
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

.section-header--with-tabs {
  align-items: flex-start;
}

.section-header h2 {
  margin: 0;
  font-size: var(--font-size-lg);
}

.section-header span {
  display: inline-block;
  margin-top: 0.25rem;
  opacity: 0.6;
}

.tabs {
  display: inline-flex;
  gap: 0.35rem;
  padding: 0.25rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-md);
  background: rgba(var(--color-primary-rgb), 0.03);
}

.tab {
  border: 0;
  border-radius: calc(var(--radius-md) - 2px);
  padding: 0.45rem 0.75rem;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: var(--font-size-sm);
  cursor: pointer;
  opacity: 0.72;
  transition: 0.2s ease;
}

.tab:hover {
  opacity: 1;
  background: rgba(var(--color-primary-rgb), 0.06);
}

.tab--active {
  opacity: 1;
  background: var(--color-background);
  box-shadow: 0 1px 4px rgba(var(--color-primary-rgb), 0.12);
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

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: var(--space-md);
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.08);
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

  .section-header,
  .section-header--with-tabs {
    align-items: flex-start;
    flex-direction: column;
  }

  .tabs {
    width: 100%;
  }

  .tab {
    flex: 1;
  }
}
</style>