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
      <header class="feed-header">
        <div class="feed-header-main">
          <div>
            <span class="feed-eyebrow">Project Feed</span>

            <h1>Projects from your network</h1>

            <p>
              Discover recent projects from students in your school and people you follow.
            </p>
          </div>
        </div>

        <div class="feed-toolbar">
          <input
            type="text"
            placeholder="Search by project, student, technology..."
          >

          <select>
            <option>All projects</option>
            <option>Same school</option>
            <option>Following</option>
            <option>Most recent</option>
          </select>

          <select>
            <option>All technologies</option>
            <option>Vue.js</option>
            <option>Express.js</option>
            <option>PostgreSQL</option>
          </select>
        </div>

        <div class="feed-active-context">
          <span>
            Showing projects related to your school and followed students
          </span>
        </div>
      </header>

      <section class="feed-project-list">
        <FeedProject
          v-for="project in mockProjects"
          :key="project.id"
          :project="project"
        />
      </section>
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
  padding: 2.5rem;
  overflow-x: hidden;
}

.feed-header {
  margin-bottom: var(--space-xl);
  padding: var(--space-xl);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  background-color: rgba(var(--color-surface-rgb), 0.48);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.045);
}

.feed-header-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-xl);
  margin-bottom: var(--space-lg);
}

.feed-eyebrow {
  display: inline-block;
  margin-bottom: var(--space-xs);
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.feed-header h1 {
  margin: 0;
  color: rgba(var(--color-primary-rgb), 0.96);
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: var(--font-bold);
  line-height: 1.1;
}

.feed-header p {
  max-width: 38rem;
  margin: var(--space-sm) 0 0;
  color: rgba(var(--color-primary-rgb), 0.6);
  font-size: var(--font-size-sm);
  line-height: 1.6;
}
.feed-toolbar {
  display: grid;
  grid-template-columns: minmax(16rem, 1fr) auto auto;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.feed-toolbar input,
.feed-toolbar select {
  height: 2.6rem;
  padding: 0 0.9rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  background-color: rgba(var(--color-background-rgb), 0.55);
  color: rgba(var(--color-primary-rgb), 0.85);
  font-size: var(--font-size-sm);
}

.feed-active-context {
  padding-top: var(--space-sm);
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.07);
}

.feed-active-context span {
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
}

.feed-project-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

@media (max-width: 760px) {
  .test-layout {
    flex-direction: column;
  }

  .feed-page {
    padding: 1.5rem;
  }

  .feed-header-main {
    flex-direction: column;
  }

  .feed-summary {
    width: 100%;
    text-align: left;
  }

  .feed-toolbar {
    grid-template-columns: 1fr;
  }
}
</style>