import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import { normalizeProject } from '@/utils/portfolioNormalizers';

function buildProjectFormData(experience) {
  const formData = new FormData();

  formData.append('projectTitle', experience.title);
  formData.append('projectDate', experience.date);
  formData.append('description', experience.description);
  formData.append('githubLink', experience.githubLink);
  formData.append('projetType', experience.isAcademic ? 'academique' : 'personnel');
  formData.append('professorEmail', experience.teacherEmail);
  formData.append('visibilite', String(experience.visibleToEveryone));
  formData.append('technologies', JSON.stringify(experience.technologies));
  formData.append('domains', JSON.stringify(experience.domains));

  if (experience.image) {
    formData.append('img', experience.image);
  }

  return formData;
}

export const useProjectStore = defineStore('project', () => {
  const projects = ref([]);
  const loading = ref(false);
  const error = ref('');

  async function createProject(project) {
    loading.value = true;
    error.value = '';

    try {
      const response = await api.post('/add-projet', buildProjectFormData(project), {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const createdProject = normalizeProject(response.data.data);
      projects.value.unshift(createdProject);

      return createdProject;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create project';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function editProject(project) {
    loading.value = true;
    error.value = '';

    try {
      const response = await api.patch(
        `/projets/${project.id}`,
        buildProjectFormData(project),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const updatedProject = normalizeProject(response.data.data);
      projects.value = projects.value.map((item) =>
        item.id === updatedProject.id ? updatedProject : item
      );

      return updatedProject;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to edit project';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteProject(projectId) {
    loading.value = true;
    error.value = '';

    try {
      await api.delete(`/projets/${projectId}`);
      projects.value = projects.value.filter((item) => item.id !== projectId);
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete project';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    projects,
    loading,
    error,
    createProject,
    editProject,
    deleteProject,
  };
});
