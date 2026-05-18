import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';

function buildProjectFormData(experience) {
  const formData = new FormData();

  formData.append('projectTitle', experience.title);
  formData.append('projectDate', experience.date);
  formData.append('description', experience.description);
  formData.append('githubLink', experience.githubLink);
  formData.append('projetType', experience.isAcademic ? 'academique' : 'personnel');
  formData.append('professorEmail', experience.teacherEmail);
  formData.append('visibleToEveryone', String(experience.visibleToEveryone));
  formData.append('technologies', JSON.stringify(experience.technologies));
  formData.append('domains', JSON.stringify(experience.domains));

  if (experience.image) {
    formData.append('img', experience.image);
  }

  return formData;
}

function normalizeProject(data) {
  return {
    id: data.experience.experience_id,
    type: 'project',
    title: data.experience.titre ?? '',
    date: data.experience.date_experience ?? '',
    description: data.experience.description ?? '',
    visibleToEveryone: data.experience.visibilite ?? false,
    githubLink: data.projet.lien_github ?? '',
    technologies: data.projet.technologies ?? [],
    domains: data.projet.domains ?? [],
    imagePreview: data.projet.photo ?? '',
  };
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

  return {
    projects,
    loading,
    error,
    createProject,
  };
});
