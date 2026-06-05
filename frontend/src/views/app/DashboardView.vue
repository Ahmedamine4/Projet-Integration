```vue
<script setup>
import { computed, ref } from 'vue'

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
        description: 'Plateforme de gestion universitaire.'
    },
    {
        id: 2,
        title: 'Projet Integration',
        description: 'Plateforme de gestion universitaire.'
    }
])

const statusOrder = {
    accepted: 1,
    pending: 2,
    rejected: 3
}

const sortedRequests = computed(() =>
    [...requests.value]
        .sort(
            (a, b) =>
                statusOrder[a.status]
                -
                statusOrder[b.status]
        )
)

function statusLabel(status) {

    return {

        accepted: 'Acceptée',

        pending: 'En attente',

        rejected: 'Refusée'

    }[status]

}
</script>



<template>

    <div class="dashboard">
        <div class="student-header">
    <!-- BLOC GAUCHE : Profil de l'étudiant -->
    <div class="student-profile">
        <img :src="student.avatar" class="student-avatar" alt="Avatar" />
        <div class="profile-info">
            <h2>{{ student.firstName }} {{ student.lastName }}</h2>
            <p>{{ student.major }}</p>
        </div>
    </div>

    <!-- BLOC DROITE : Conteneur global des statistiques -->
    <div class="student-stats-container">
        <div class="stat-card">
            <div class="stat-label">Followers</div>
            <div class="stat-value">210</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-label">Projets</div>
            <div class="stat-value">{{ personalProjects.length }}</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-label">Expérience</div>
            <div class="stat-value">3</div>
        </div>
    </div>
</div>
        <section class="section">
            <div class="section-header">
                <h2>Demandes envoyées</h2>
                <span>
                    {{ sortedRequests.length }}
                </span>
            </div>
            <div class="request-list">
                <article v-for="request in sortedRequests" :key="request.id" class="request-card">
                    <div class="card-header">

                        <div class="request-content">
                            <h3>{{ request.title }}</h3>
                            <p>{{ request.professor }}</p>
                            <small>{{ request.date }}</small>
                        </div>
                        <span class="status" :class="request.status">
                            {{ statusLabel(request.status) }}
                        </span>
                    </div>
                </article>
            </div>
        </section>
        <section class="section">
            <div class="section-header">
                <h2>Mes projets</h2>
                <span>
                    {{ personalProjects.length }}
                </span>
            </div>
            <div class="projects">
                <article v-for="project in personalProjects" :key="project.id" class="project-card">
                    <h3>
                        {{ project.title }}
                    </h3>
                    <p>
                        {{ project.description }}
                    </p>
                </article>
            </div>
        </section>
    </div>
</template>

<style scoped>
.dashboard {
    display: grid;
    grid-template-columns: 1.05fr .95fr;
    gap: var(--space-lg);
    padding: var(--space-xl);
}

.student-stats-container {
    display: flex;         
    flex-direction: row;  
    gap: 15px;            
}

.student-header {
    grid-column: 1/-1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    padding: 2rem;
    background: var(--color-background);
    border: 1px solid rgba(var(--color-primary-rgb), 0.08);
    border-radius: 28px;
}

.student-profile {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.student-avatar {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    object-fit: cover;
}

.student-profile h1 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 2rem;
}

.student-profile p {
    margin-top: .4rem;
    opacity: .65;
}

/* --- Section Stats (Ajoutée de la 2ème partie) --- */
.student-stats {
    display: flex;
    gap: 1rem;
}

.stat-card {
    min-width: 130px;
    padding: 1rem;
    text-align: center;
    border: 1px solid rgba(var(--color-primary-rgb), 0.08);
    border-radius: 18px;
    transition: var(--transition-fast);
}

.stat-card:hover {
    transform: translateY(-2px);
    border-color: rgba(var(--color-secondary-rgb), 0.35);
}

.stat-value {
    font-size: 2rem;
    font-weight: 700;
    font-family: var(--font-display);
    color: var(--color-primary);
}

.stat-label {
    margin-top: .4rem;
    opacity: .6;
    font-size: var(--font-size-sm);
}

/* --- Sections & Cartes --- */
.section {
    background: var(--color-background);
    border: 1px solid rgba(var(--color-primary-rgb), 0.08);
    border-radius: 28px;
    overflow: hidden;
}

.section-header {
    display: flex;
    justify-content: space-between;
    padding: 2rem;
    border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.section-header h2 {
    margin: 0;
    font-size: var(--font-size-lg);
}

.section-header span {
    opacity: .6;
}

.request-list,
.projects {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.request-card,
.project-card {
    padding: 1.5rem;
    border: 1px solid rgba(var(--color-primary-rgb), .08);
    border-radius: 18px;
    transition: var(--transition-fast);
}

.request-card:hover,
.project-card:hover {
    transform: translateY(-2px);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
}

.request-content {
    display: flex;
    flex-direction: column;
    gap: .6rem;
}

.request-content h3 {
    margin: 0;
}

.project-card h3 {
    margin: 0 0 .8rem;
}

.project-card p {
    opacity: .7;
}

/* --- Status --- */
.status {
    padding: 8px 14px;
    border-radius: 999px;
    font-size: var(--font-size-xs);
}

.accepted {
    color: var(--color-success);
    background: rgba(var(--color-success-rgb), .08);
}

.pending {
    color: var(--color-secondary);
    background: rgba(var(--color-secondary-rgb), .08);
}

.rejected {
    color: var(--color-error);
    background: rgba(var(--color-error-rgb), .08);
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
