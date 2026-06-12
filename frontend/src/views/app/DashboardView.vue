<script setup>
import RoundChart from '@/components/dashboard/RoundChart.vue'
import { computed, ref, onMounted } from 'vue'
import StudentHeader from '@/components/dashboard/StudentHeader.vue'
import BarreStats from '@/components/dashboard/BarreStats.vue'
import ScoreChart from '@/components/dashboard/ScoreChart.vue'
import Filtre from '@/components/common/forms/FilterDropdown.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import RecommendationRequest from '@/views/TestRecommandationRequestView.vue'
import { useInstitutionStore } from '@/stores/institution'

const authStore = useAuthStore()

const student = computed(() => ({
    firstName: authStore.user?.firstName ?? authStore.user?.prenom ?? '',
    lastName: authStore.user?.lastName ?? authStore.user?.nom ?? '',
    major: authStore.user?.filiere ?? 'Computer Engineering',
    avatar: authStore.user?.photo ?? 'https://cdn-icons-png.flaticon.com/512/1250/1250689.png'
}))

const stats = ref({
    followers: 0,
    projets: 0,
    stages: 0,
    lettres_recommandation: 0,
    certifications: 0
})

const requests = ref([])
const technologies = ref([])
const domaines = ref([])
const scoreHistory = ref([])
const isLoading = ref(true)
const selectedStatus = ref('')
const selectedType = ref('')
const isRecommendationLoading = ref(false)
const institutionStore = useInstitutionStore()
const isModalOpen = ref(false)

onMounted(async () => {
    try {
        const [dashboardResult, validationsResult] = await Promise.allSettled([
            api.get('/etudiant/dashboard'),
            api.get('/etudiant/validations')
        ])

        if (dashboardResult.status === 'fulfilled') {
            const dashboardData = dashboardResult.value.data.data
            stats.value = dashboardData.stats
            technologies.value = dashboardData.technologies.map(t => ({
                name: t.nom,
                nivel: t.niveau
            }))
            const totalNiveau = dashboardData.domaines.reduce((sum, d) => sum + d.niveau, 0)
            domaines.value = dashboardData.domaines.map(d => ({
                label: d.nom,
                value: totalNiveau > 0 ? Math.round((d.niveau / totalNiveau) * 100) : 0
            }))
            scoreHistory.value = dashboardData.score_history.map(s => ({
                month: new Date(s.date).toLocaleString('en-US', { month: 'short' }),
                score: s.score
            }))
        } else {
            console.error('Dashboard error:', dashboardResult.reason)
        }

        if (validationsResult.status === 'fulfilled') {
            console.log('Validations raw:', validationsResult.value.data) // ← debug
            const validations = validationsResult.value.data.data
            requests.value = validations.map(v => ({
                id: v.experience_id ?? Date.now(),
                type: v.type,
                title: v.titre ?? `Request ${v.type}`,
                professor: v.traite_par?.nom ? `${v.traite_par.prenom ?? ''} ${v.traite_par.nom}`.trim() : 'N/A',
                status: v.statut === 'valide' ? 'accepted' : v.statut === 'refuse' ? 'rejected' : 'pending',
                date: v.date
            }))
        } else {
            console.error('Validations error:', validationsResult.reason)
        }
    } catch (err) {
        console.error('Dashboard loading error:', err)
    } finally {
        isLoading.value = false
    }
    institutionStore.fetchInstitutions()
})

const schoolOptions = computed(() =>
    institutionStore.institutions.map((i) => i.nom)
)

function handleSubmit(data) {
    isRecommendationLoading.value = true
    setTimeout(() => {
        isRecommendationLoading.value = false
        isModalOpen.value = false
    }, 800)
}

const sortedRequests = computed(() => {
    let data = [...requests.value]
    if (selectedStatus.value !== '' && selectedStatus.value !== 'all') {
        data = data.filter(r => r.status === selectedStatus.value)
    }
    if (selectedType.value !== '' && selectedType.value !== 'all') {
        data = data.filter(r => r.type === selectedType.value)
    }
    data.sort((a, b) => new Date(b.date) - new Date(a.date))
    return data
})

function statusLabel(status) {
    return { accepted: 'Accepted', pending: 'Pending', rejected: 'Rejected' }[status]
}

const techStack = computed(() => {
    const total = technologies.value.reduce((sum, t) => sum + t.nivel, 0)
    return technologies.value.map(t => ({
        name: t.name,
        percent: total > 0 ? Math.round((t.nivel / total) * 100) : 0,
        count: t.nivel,
        color: getTechColor(t.name)
    })).sort((a, b) => b.count - a.count)
})

function getTechColor(techName) {
    const colors = {
        'Vue.js': '#42b883',
        'Laravel': '#ff2d20',
        'TailwindCSS': '#38bdf8',
        'MySQL': '#f59e0b',
        'Docker': '#2496ed',
        'React': '#61dafb',
        'Node.js': '#68a063',
        'PostgreSQL': '#336791'
    }
    if (colors[techName]) return colors[techName]
    let hash = 0
    for (let i = 0; i < techName.length; i++) {
        hash = techName.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = Math.abs(hash) % 360
    const saturation = 70 + Math.abs(hash % 30)
    return `hsl(${hue}, ${saturation}%, 50%)`
}
</script>

<template>
  <div class="dashboard">
    <StudentHeader
      :student="student"
      :stats="[
        { label: 'Followers', value: stats.followers },
        { label: 'Projects', value: stats.projets },
        { label: 'Internships', value: stats.stages },
        { label: 'Letter of \n recommendation', value: stats.lettres_recommandation },
        { label: 'Certifications', value: stats.certifications }
      ]"
    />

    <div class="recommendation-bar">
      <RecommendationRequest />
    </div>

    <section class="section">
      <div class="section-header">
        <h2>Technologies Used</h2>
        <span>{{ techStack.length }}</span>
      </div>
      <RoundChart :tech-stack="techStack" />
    </section>

    <section class="section">
      <div class="section-header">
        <h2>Domains</h2>
        <span>{{ domaines.length }}</span>
      </div>
      <BarreStats :categories="domaines" />
    </section>

    <section class="section">
      <div class="section-header">
        <h2>Score Evolution</h2>
        <span>{{ scoreHistory.length }}</span>
      </div>
      <ScoreChart :scores="scoreHistory" />
    </section>

    <section class="section">
      <div class="section-header">
        <h2>Submitted Requests</h2>

        <div class="right-side">
          <div class="filter-container">
            <label>Filter by type:</label>
            <Filtre
              v-model="selectedType"
              class="status-filter"
              placeholder
              style="padding-left: 28px;"
              :options="[
                'all',
                'stage',
                'projet',
                'activite',
                'recommandation'
              ]"
            />
          </div>
          <div class="filter-container">
            <label>Filter by status:</label>
            <Filtre
              v-model="selectedStatus"
              class="status-filter"
              placeholder
              style="padding-left: 28px;"
              :options="[
                'all',
                'accepted',
                'pending',
                'rejected'
              ]"
            />
          </div>
          <span>{{ sortedRequests.length }}</span>
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Professor</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="request in sortedRequests"
              :key="request.id"
              class="table-row"
            >
              <td><span class="cell-title">{{ request.title }}</span></td>
              <td><span class="student-name">{{ request.professor }}</span></td>
              <td><span class="cell-date">{{ request.date }}</span></td>
              <td>
                <span
                  class="status-badge"
                  :class="{
                    'status-badge--validated': request.status === 'accepted',
                    'status-badge--pending': request.status === 'pending',
                    'status-badge--refused': request.status === 'rejected'
                  }"
                >
                  {{ statusLabel(request.status) }}
                </span>
              </td>
            </tr>
            <tr v-if="sortedRequests.length === 0">
              <td colspan="4" style="text-align:center; opacity:0.5; padding: 2rem;">
                No requests found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-lg);
    padding: var(--space-xl);
}

/* StudentHeader spans full width (child 1) */
.dashboard > *:nth-child(1) {
    grid-column: 1 / -1;
}

/* recommendation-bar spans full width (child 2) */
.dashboard > *:nth-child(2) {
    grid-column: 1 / -1;
}

/* Last section (Submitted Requests) spans full width (child 6) */
.dashboard > .section:last-child {
    grid-column: 1 / -1;
}

.recommendation-bar {
    display: flex;
    justify-content: flex-end;
}

.recommendation-bar :deep(main) {
    min-height: unset;
    display: flex;
    justify-content: flex-end;
    padding: 0;
    gap: 0;
}

.recommendation-bar :deep(h1) {
    display: none;
}

/* --- Sections --- */
.section {
    background: var(--color-background);
    border: 1px solid rgba(var(--color-primary-rgb), 0.08);
    border-radius: 28px;
    overflow: visible;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.section-header h2 {
    margin: 0;
    font-size: var(--font-size-lg);
}

.section-header span {
    opacity: .6;
}

.right-side {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 30px;
}

.filter-container {
    display: flex;
    align-items: center;
    gap: 10px;
}

.status-filter select {
    text-align: center;
    text-align-last: center;
}

/* ==========================================================================
   TABLE
   ========================================================================== */
.table-responsive {
    width: 100%;
    overflow-x: auto;
    border: 1px solid rgba(var(--color-primary-rgb), 0.09);
    border-radius: var(--radius-md);
    background: var(--color-background);
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    white-space: nowrap;
}

.data-table th {
    padding: var(--space-sm) var(--space-md);
    font-size: var(--font-size-xxs);
    font-weight: var(--font-bold);
    color: var(--color-primary-hover);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 2px solid rgba(var(--color-primary-rgb), 0.06);
    background: rgba(var(--color-primary-rgb), 0.02);
}

.data-table td {
    padding: var(--space-sm) var(--space-md);
    vertical-align: middle;
    border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.06);
    transition: background var(--transition-fast);
}

.table-row {
    cursor: pointer;
    transition: background var(--transition-fast);
}

.table-row:hover td {
    background: rgba(var(--color-secondary-rgb), 0.03);
}

.table-row:last-child td {
    border-bottom: none;
}

.student-name {
    font-size: var(--font-size-md);
    font-weight: var(--font-medium);
}

.cell-title {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: var(--font-size-md);
    color: rgba(var(--color-primary-rgb), 0.8);
}

.cell-date {
    font-size: var(--font-size-md);
    color: var(--color-primary-hover);
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--font-size-xxs);
    font-weight: var(--font-medium);
    letter-spacing: 0.04em;
    padding: 4px 10px;
    border-radius: 999px;
}

.status-badge--pending {
    background: rgba(var(--color-secondary-rgb), 0.13);
    color: #7a4700;
}

.status-badge--validated {
    background: rgba(var(--color-success-rgb), 0.12);
    color: var(--color-success);
}

.status-badge--refused {
    background: rgba(var(--color-error-rgb), 0.1);
    color: var(--color-error);
}

/* --- Responsive --- */
@media (max-width: 1000px) {
    .dashboard {
        grid-template-columns: 1fr;
    }
}
</style>