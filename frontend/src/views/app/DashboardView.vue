<script setup>
import RoundChart from '@/components/dashboard/RoundChart.vue'
import { computed, ref } from 'vue'
import StudentHeader from '@/components/dashboard/StudentHeader.vue'
import BarreStats from '@/components/dashboard/BarreStats.vue'
import ScoreChart from '@/components/dashboard/ScoreChart.vue'
import Filtre from '@/components/common/forms/FilterDropdown.vue'

const student = ref({
    firstName: 'Mohamed Reda',
    lastName: 'EL GHAZOUANI',
    major: 'Génie Informatique',
    avatar: 'https://cdn-icons-png.flaticon.com/512/1250/1250689.png'
})

const requests = ref([
    {
        id: 1,
        title: 'Demande Lettre de Recomendation',
        professor: 'Pr. Ghailani',
        status: 'accepted',
        date: '2026-06-01'
    },
    {
        id: 2,
        title: 'Demande Stage',
        professor: 'Pr. El Haddad',
        status: 'pending',
        date: '2026-06-02'
    },
    {
        id: 3,
        title: 'Demande Stage',
        professor: 'Pr. Fissoune',
        status: 'rejected',
        date: '2026-05-31'
    }
])
const personalProjects = ref([
    {
        id: 1,
        title: 'Projet Integration',
        description: 'Plateforme de gestion universitaire.',
        technologies: ['Vue.js', 'Laravel', 'MySQL'] // ← Ajoute les techs utilisées
    },
    {
        id: 2,
        title: 'Projet Integration',
        description: 'Plateforme de gestion universitaire.',
        technologies: ['Vue.js', 'CSS', 'Laravel', 'Docker'] // ← Ajoute les techs
    },
    {
        id: 3,
        title: 'Dashboard Admin',
        description: 'Système de statistiques.',
        technologies: ['Vue.js', 'MySQL', 'Docker', 'C++', 'Java'] // ← Ajoute d'autres projets si besoin
    }
])

const statusOrder = {
    accepted: 1,
    pending: 2,
    rejected: 3
}

const selectedStatus=ref ('');


const sortedRequests = computed(() => {
  let data = [...requests.value];

  // Filtrer si un statut est choisi
  if (selectedStatus.value !== ''  && selectedStatus.value!=='all') {
    data = data.filter(
      requests => requests.status === selectedStatus.value
    );
  }

  // Trier par date (plus récent → plus ancien)
  data.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return data;
});

function statusLabel(status) {
    return { accepted: 'Acceptée', pending: 'En attente', rejected: 'Refusée' }[status]
}

/*const techStack = ref([
    { name: 'Vue.js', percent: 40, color: '#42b883' },
    { name: 'Laravel', percent: 25, color: '#ff2d20' },
    { name: 'TailwindCSS', percent: 20, color: '#38bdf8' },
    { name: 'MySQL', percent: 10, color: '#f59e0b' },
    { name: 'Docker', percent: 5, color: '#2496ed' },
])
*/

const techStack = computed(() => {
    // Compter les occurrences de chaque tech
    const techCount = {}

    personalProjects.value.forEach(project => {
        project.technologies.forEach(tech => {
            techCount[tech] = (techCount[tech] || 0) + 1
        })
    })

    // Calculer le total
    const totalTechs = Object.values(techCount).reduce((a, b) => a + b, 0)

    // Créer le tableau avec pourcentages
    return Object.entries(techCount)
        .map(([name, count]) => ({
            name,
            percent: Math.round((count / totalTechs) * 100),
            count,
            color: getTechColor(name)
        }))
        .sort((a, b) => b.count - a.count) // Trier par fréquence
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

    // Si la tech est dans le dictionnaire, retourne sa couleur
    if (colors[techName]) {
        return colors[techName]
    }

    // Sinon, génère une couleur aléatoire STABLE (même tech = même couleur)
    let hash = 0
    for (let i = 0; i < techName.length; i++) {
        hash = techName.charCodeAt(i) + ((hash << 5) - hash)
    }

    const hue = Math.abs(hash) % 360
    const saturation = 70 + Math.abs(hash % 30)
    const lightness = 50

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}
const categories = [
    { label: 'Domain 1', value: 45 },
    { label: 'Domain 2', value: 20 },
    { label: 'Domain 3', value: 10 },
    { label: 'Domain 6', value: 5 },
    { label: 'Autres', value: 35 }
]
const scoreHistory = [
    { month: 'Jan', score: 0 },
    { month: 'Fév', score: 25 },
    { month: 'Mar', score: 12 },
    { month: 'Avr', score: 50 },
    { month: 'Mai', score: 82 },
    { month: 'Jun', score: 65 }
]
</script>

<template>
  <div class="dashboard">
    <StudentHeader
      :student="student"
      :stats="[
        { label: 'Followers', value: 210 },
        { label: 'Projects', value: personalProjects.length },
        { label: 'Internships', value: 1 },
        { label: 'Letter of \n recommendation', value: 1 },
        { label: 'Certifications', value: 0 }
            
      ]"
    />
    <section class="section">
      <div class="section-header">
        <h2>Technologies utilisées</h2>
        <span>{{ techStack.length }}</span>
      </div>

      <RoundChart :tech-stack="techStack" />
    </section>
    <section class="section">
      <div class="section-header">
        <h2>Domains</h2>
        <span>{{ techStack.length }}</span>
      </div>

      <BarreStats :categories="categories" />
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
    <h2>Demandes envoyées</h2>

    <div class="right-side">
      <div class="filter-container">
        <label>Filtrer par statut :</label>

        <Filtre
            class="status-filter" placeholder style="padding-left: 28px;"
          v-model="selectedStatus"
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
              <th>Titre</th>
              <th>Professeur</th>
              <th>Date</th>
              <th>Statut</th>
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
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
    display: grid;
    /*grid-template-columns: 1.05fr .95fr;*/
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-lg);
    padding: var(--space-xl);
}

.dashboard>.section:nth-child(5) {
    grid-column: 1 / -1;
}


/* --- Sections & Cartes --- */
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
    padding-right: 2rem;
    padding-left: 2rem;
    padding-top:1rem;
    padding-bottom:1rem;
    border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.right-side {
  margin-left: auto; /* pousse tout à droite */
  display: flex;
  align-items: center;
  gap: 30px; /* espace filtre ↔ compteur */
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 10px; /* espace label ↔ dropdown */
}

.status-filter select {
  text-align: center;
  text-align-last: center; /* centre la valeur sélectionnée */
}

.section-header h2 {
    margin: 0;
    font-size: var(--font-size-lg);
}

.section-header span {
    opacity: .6;
}


/* ==========================================================================
   GLOBAL TABLE STYLES
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

/* ── Table Cell Contents ── */
.student-info {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
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


/* --- Responsive / Media Queries --- */
@media(max-width:1000px) {
    .dashboard {
        grid-template-columns: 1fr;
    }

    .student-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .student-stats {
        width: 100%;
        justify-content: space-between;
    }
}
</style>
