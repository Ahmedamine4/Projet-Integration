<script setup>
import { useProjectStore } from '@/stores/project';
const projectStore = useProjectStore();
const project = projectStore.projects[0] || {};
</script>

<template>
  <div class="project-card">
  </div>
</template>

<style scoped>
.project-card {
  
}
</style>