<script setup>
defineProps({
  student: {
    type: Object,
    required: true,
    validator: (obj) => obj.firstName && obj.lastName && obj.major && obj.avatar
  },
  stats: {
    type: Array,
    required: true
  }
})
function getStatColor(label ,value) {
  if (label === 'Followers' || label === 'Follower') {
    return 'black'
  }  
  if (value === 0) return 'red'
  if (value >= 3) return 'green'

  return 'orange'
  }
</script>

<template>
  <div class="student-header">
    <!-- BLOC GAUCHE : Profil de l'étudiant -->
    <div class="student-profile">
      <img
        :src="student.avatar"
        class="student-avatar"
        alt="Avatar"
      >
      <div class="profile-info">
        <h2>{{ student.firstName }} {{ student.lastName }}</h2>
        <p>{{ student.major }}</p>
      </div>
    </div>

    <!-- BLOC DROITE : Conteneur global des statistiques -->
    <div class="student-stats-container">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="stat-card"
      >
        <div
          class="stat-label"
          :class="getStatColor(stat.label, stat.value)"
        >
          {{ stat.label }}
        </div>

        <div class="stat-value">
          {{ stat.value }}
        </div>
      </div>
    </div>


  </div>
</template>

<style scoped>
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

.student-profile h2 {
  margin: 0;
  font-family: var(--font-ui);
  font-size: 2rem;
}

.student-profile p {
  margin-top: 0.4rem;
  opacity: 0.65;
}

.student-stats-container {
  display: flex;
  flex-direction: row;
  gap: 15px;
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
  font-family: var(--font-ui);
  color: var(--color-primary);
}

/*.stat-label {
  margin-top: 0.4rem;
  opacity: 0.6;
  font-size: var(--font-size-sm);
}*/
.stat-label {
  display: flex;
  align-items: center;
  font-size: var(--font-size-md);
  gap: 5px;
  white-space: pre-line;
  min-height: 60px;
}

.stat-label::before {
  content: "";
  width: 5px;
  height: 20px;
  border-radius: 999px;
  background: #ccc;
}

/* Couleurs conditionnelles */
.stat-label.black::before {
  background: #413e3c;
}

.stat-label.green::before {
  background: #23a279;
}

.stat-label.orange::before {
  background: #ec6c0f;
}

.stat-label.red::before {
  background: #bd1f1e;
}


@media (max-width: 1000px) {
  .student-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .student-stats-container {
    width: 100%;
    justify-content: space-between;
  }
}
</style>