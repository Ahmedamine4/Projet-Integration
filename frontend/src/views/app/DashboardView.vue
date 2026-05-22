<script setup>
import { ref } from 'vue';
import Project from '@/components/portfolio/Project.vue';

const project = ref({
  id: "cmpgz1ulc0003pn3vmqh9f6l8",
  type: "project",
  title: "TaskFlow Board",
  date: "2026-05-11T23:00:00.000Z",
  description: "A collaborative project management dashboard that helps teams organize tasks, track progress, manage deadlines, and centralize project files in one visual workspace. It includes board and table views, task assignments, due dates, status labels, and progress tracking to make team coordination easier and more transparent.",
  visibleToEveryone: true,
  githubLink: "https://github.com/sweta-devnani/taskflow-board",
  technologies: ["Vue.js", "Pinia", "Express", "Prisma"],
  domains: ["Project Management", "Team Collaboration"],
  imagePreview: "https://xfnburehcqkcmebvpfqh.supabase.co/storage/v1/object/public/projets/1779457499504-54-Best-Project-Management-Tools-for-2023.webp",
});
</script>

<template>
  <div>
    <Project :project />
  </div>
</template>

<style scoped>
div {
  display: grid;
  place-items: center;
  height: 100%;
}
</style>
