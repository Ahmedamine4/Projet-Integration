<script setup>
import { Users, FolderKanban, GraduationCap , Mail, Award, School, ClipboardClock } from 'lucide-vue-next'

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

const iconMap = {
  'Followers': Users,
  'Follower': Users,
  'Projects': FolderKanban,
  'Internships': GraduationCap ,       
  'Letter of \n recommendation': Mail,  
  'Certifications': Award,
  'Etudiants': GraduationCap,
  'Professeurs': School,
  'Demandes en attente': ClipboardClock
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
      <img v-if="student.photo" :src="student.photo" class="student-avatar" alt="Avatar">
      <div class="profile-info">
        <h2>Welcome, {{ student.firstName }} {{ student.lastName }}</h2>
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
}

/* ── Profile ── */
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

/* ── Stats container ── */
.student-stats-container {
  display: flex;
  flex-direction: row;
  gap: 15px;
}

/* ── Stat card ── */
.stat-card {
  min-width: 130px;
  padding: 1rem 1.2rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-left: 4px solid var(--accent, #ccc);
  border-radius: 18px;
  transition: var(--transition-fast);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-left-color: var(--accent, #ccc);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
}

/* Number + icon row */
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

/* Label below */
.stat-label {
  font-size: var(--font-size-sm);
  opacity: 0.55;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

/* ── Responsive ── */
@media (max-width: 1000px) {
  .student-header {
    flex-direction: column;
    align-items: stretch;
  }

  .student-stats-container {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .student-header {
    gap: 1.25rem;
    padding: 1.25rem;
    border-radius: 22px;
    overflow: hidden;
  }

  .student-profile {
    width: 100%;
    gap: 0.75rem;
    min-width: 0;
  }

  .student-avatar {
    width: 56px;
    height: 56px;
  }

  .profile-info {
    min-width: 0;
  }

  .student-profile h2 {
    font-size: 1.45rem;
    line-height: 1.15;
    word-break: break-word;
    overflow-wrap: break-word;
  }

  .student-stats-container {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.65rem;
  }

  .stat-card {
    min-width: 0;
    padding: 0.8rem 0.65rem;
    border-radius: 16px;
  }

  .stat-top {
    gap: 0.35rem;
  }

  .stat-value {
    font-size: 1.55rem;
  }

  .stat-label {
    font-size: 0.68rem;
    line-height: 1.15;
    letter-spacing: 0.03em;
    word-break: break-word;
  }
}
</style>