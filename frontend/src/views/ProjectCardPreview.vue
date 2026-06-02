<script setup>
import FeedProject from '@/components/feed/feedProject.vue';
import Sidebar from '@/components/layout/AppSidebar.vue';

const mockUser = {
  prenom: 'Wissam',
  nom: 'Bakkali',
};

const mockProjects = [
  {
    id: 1,
    credibilityScore: 86,
    title: 'SmartStudyRoom Platform',
    description:
      'SmartStudyRoom is a complete web platform designed to help students find, reserve, and manage study rooms more efficiently. The project includes room availability management, booking slots, subscription handling, user authentication, payment tracking, and an admin dashboard for monitoring reservations. The goal is to create a simple, reliable, and user-friendly experience for students while giving administrators better control over resources and room usage.',
    date: '2026-05-20',
    imagePreview:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&auto=format&fit=crop',
    studentName: 'Nour El Amrani',
    schoolName: 'ENSA Tanger',
    feedReason: 'Same school',
    isVerified: true,
    recommendationsCount: 12,
    commentsCount: 5,
    githubReposCount: 3,
    technologies: ['Vue.js', 'Express.js', 'PostgreSQL', 'Docker'],
    domains: ['Web Development', 'DevOps'],
  },
  {
    id: 2,
    credibilityScore: 74,
    title: 'AI Portfolio Recommendation System',
    description:
      'A smart module that analyzes student projects, technologies, GitHub activity and professional objectives in order to suggest relevant skills, missing technologies and project ideas that can improve the quality of the portfolio.',
    date: '2026-05-24',
    imagePreview:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&auto=format&fit=crop',
    studentName: 'Yassine Berrada',
    schoolName: 'ENSA Tanger',
    feedReason: 'Following',
    isVerified: true,
    recommendationsCount: 8,
    commentsCount: 3,
    githubReposCount: 2,
    technologies: ['Python', 'FastAPI', 'PostgreSQL'],
    domains: ['Artificial Intelligence', 'Data Science'],
  },
];
</script>

<template>
  <div class="test-layout">
    <Sidebar :user="mockUser" />

    <main class="feed-page">
      <header class="feed-topbar">
        <div class="feed-title">
          <h1>Explore</h1>
          <p>
            Discover verified projects from your school and people you follow.
          </p>
        </div>

        <div class="feed-search">
          <input
            type="text"
            placeholder="Search projects, students or technologies..."
          >
        </div>
      </header>

      <div class="feed-layout">
        <section class="feed-list">
          <FeedProject
            v-for="project in mockProjects"
            :key="project.id"
            :project="project"
          />
        </section>

        <aside class="feed-filters">
          <div class="filters-header">
            <h2>Filters</h2>
            <button type="button">
              Reset
            </button>
          </div>

          <div class="filter-group">
            <label>Project source</label>

            <select>
              <option>All projects</option>
              <option>Same school</option>
              <option>Following</option>
              <option>Most recent</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Technologies</label>

            <div class="filter-chips">
              <button type="button">Vue.js</button>
              <button type="button">Express.js</button>
              <button type="button">PostgreSQL</button>
              <button type="button">Docker</button>
              <button type="button">Python</button>
              <button type="button">FastAPI</button>
            </div>
          </div>

          <div class="filter-group">
            <label>Domains</label>

            <div class="filter-chips">
              <button type="button">Web Development</button>
              <button type="button">DevOps</button>
              <button type="button">Artificial Intelligence</button>
              <button type="button">Data Science</button>
            </div>
          </div>

          <div class="filter-group">
            <label>Score</label>

            <select>
              <option>Any score</option>
              <option>80+ credibility score</option>
              <option>60+ credibility score</option>
              <option>Verified only</option>
            </select>
          </div>

          <button
            type="button"
            class="apply-filters"
          >
            Apply filters
          </button>
        </aside>
      </div>
    </main>
  </div>
</template>

<style scoped>
.test-layout {
  min-height: 100vh;
  display: flex;
  background-color: var(--color-background);
}

.feed-page {
  flex: 1;
  min-width: 0;
  padding: 2rem;
  overflow-x: hidden;
}

.feed-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-xl);
  margin-bottom: var(--space-xl);
}

.feed-title h1 {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.96);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: var(--font-bold);
  line-height: 1;
}

.feed-title p {
  margin: var(--space-xs) 0 0;
  color: rgba(var(--color-primary-rgb), 0.56);
  font-size: var(--font-size-sm);
}

.feed-search {
  width: min(100%, 28rem);
}

.feed-search input {
  width: 100%;
  height: 2.9rem;
  padding: 0 1rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  background-color: rgba(var(--color-surface-rgb), 0.55);
  color: rgba(var(--color-primary-rgb), 0.88);
  font-size: var(--font-size-sm);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.035);
}

.feed-search input::placeholder {
  color: rgba(var(--color-primary-rgb), 0.42);
}

.feed-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 18rem;
  align-items: start;
  gap: var(--space-xl);
}

.feed-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.feed-filters {
  position: sticky;
  top: 2rem;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  background-color: rgba(var(--color-surface-rgb), 0.55);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.045);
}

.filters-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.filters-header h2 {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.95);
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
}

.filters-header button {
  border: none;
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.48);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-semibold);
  cursor: pointer;
}

.filter-group {
  display: grid;
  gap: var(--space-sm);
}

.filter-group label {
  color: rgba(var(--color-primary-rgb), 0.58);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.filter-group select {
  width: 100%;
  height: 2.55rem;
  padding: 0 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  background-color: rgba(var(--color-background-rgb), 0.5);
  color: rgba(var(--color-primary-rgb), 0.82);
  font-size: var(--font-size-sm);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.filter-chips button {
  padding: 0.45rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  background-color: rgba(var(--color-background-rgb), 0.5);
  color: rgba(var(--color-primary-rgb), 0.58);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  cursor: pointer;
}

.filter-chips button:hover {
  border-color: rgba(var(--color-primary-rgb), 0.22);
  color: rgba(var(--color-primary-rgb), 0.9);
}

.apply-filters {
  height: 2.6rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-secondary-rgb), 0.35);
  background-color: rgba(var(--color-secondary-rgb), 0.16);
  color: rgba(var(--color-primary-rgb), 0.9);
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  cursor: pointer;
}

.apply-filters:hover {
  background-color: rgba(var(--color-secondary-rgb), 0.24);
}

@media (max-width: 1050px) {
  .feed-layout {
    grid-template-columns: 1fr;
  }

  .feed-filters {
    position: static;
    order: -1;
  }
}

@media (max-width: 760px) {
  .test-layout {
    flex-direction: column;
  }

  .feed-page {
    padding: 1.25rem;
  }

  .feed-topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .feed-search {
    width: 100%;
  }
}
</style>