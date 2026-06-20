<script setup>
import { Users, FolderKanban, GraduationCap, Mail, Award } from 'lucide-vue-next'
import Button from '@/components/common/actions/BaseButton.vue'

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

const emit = defineEmits(['request-recommendation'])

const iconMap = {
  'Followers': Users,
  'Follower': Users,
  'Projects': FolderKanban,
  'Internships': GraduationCap,
  'Letter of \n recommendation': Mail,
  'Certifications': Award,
}

function getStatColor(label, value) {
  if (label === 'Followers' || label === 'Follower') return 'black'
  if (value === 0) return 'red'
  if (value >= 3) return 'green'
  return 'orange'
}

const colorMap = {
  black: '#413e3c',
  green: '#23a279',
  orange: '#ec6c0f',
  red: '#bd1f1e'
}
</script>

<template>
  <div class="student-header">
    <!-- LEFT: Student profile -->
    <div class="student-profile">
      <!-- Correction ici : Utilisation de student.avatar comme validé par le validateur de props -->
      <img v-if="student.avatar" :src="student.avatar" class="student-avatar" alt="Avatar">
      <div class="profile-info">
        <h2>Welcome, {{ student.firstName }} {{ student.lastName }}</h2>
        <Button
          class="rec-button"
          type="button"
          variant="submit"
          size="xs"
          @click="emit('request-recommendation')"
        >
          Request a letter of recommendation
        </Button>
      </div>
    </div>

    <!-- RIGHT: Stats -->
    <div class="student-stats-container">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="stat-card"
        :style="{ '--accent': colorMap[getStatColor(stat.label, stat.value)] }"
      >
        <div class="stat-top">
          <component
            :is="iconMap[stat.label]"
            class="stat-icon"
            :size="20"
            :stroke-width="1.75"
          />
          <span class="stat-value">{{ stat.value }}</span>
        </div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-header {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: var(--color-background);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: 28px;
  box-sizing: border-box;
}

/* ── Profile ── */
.student-profile {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.student-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.student-profile h2 {
  margin: 0;
  font-family: var(--font-ui);
  font-size: 1.75rem;
  color: var(--color-primary);
}

.rec-button {
  width: fit-content;
}

/* ── Stats container ── */
.student-stats-container {
  display: flex;
  flex-direction: row;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

/* ── Stat card ── */
.stat-card {
  min-width: 120px;
  padding: 1rem 1.2rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-left: 4px solid var(--accent, #ccc);
  border-radius: 18px;
  transition: var(--transition-fast);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  background: var(--color-background);
  box-sizing: border-box;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
}

.stat-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-icon {
  opacity: 0.6;
  color: var(--accent, #ccc);
  flex-shrink: 0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  font-family: var(--font-ui);
  color: var(--color-primary);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-size-xxs);
  opacity: 0.55;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
  white-space: pre-line; /* Permet de prendre en compte le \n dans le label */
}

/* === TABLET (1024px) === */
@media (max-width: 1024px) {
  .student-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .student-profile {
    width: 100%;
  }

  .student-stats-container {
    width: 100%;
    justify-content: flex-start;
  }
}

/* === MOBILE (640px et moins) === */
@media (max-width: 640px) {
  .student-header {
    border-radius: 16px;
    padding: 1.25rem;
    gap: 1.25rem;
  }

  .student-profile {
    flex-direction: column; /* On empile la photo et le texte pour gagner de la place */
    align-items: center;
    text-align: center;
    gap: 1rem;
  }

  .student-avatar {
    width: 80px;
    height: 80px;
  }

  .profile-info {
    width: 100%;
    align-items: center;
  }

  .student-profile h2 {
    font-size: 1.3rem; /* Taille lisible et harmonieuse */
    line-height: 1.3;
    word-break: break-word;
  }

  .rec-button {
    width: 100%; /* Le bouton prend toute la largeur pour être "thumb-friendly" */
    max-width: 100%;
    justify-content: center;
  }

  .student-stats-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* Grille parfaite sur deux colonnes */
    gap: 10px;
  }

  .stat-card {
    min-width: unset;
    width: 100%;
    padding: 0.85rem;
    border-radius: 14px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.65rem;
    line-height: 1.2;
  }
}
</style>