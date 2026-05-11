export function getFilePreview(file) {
  if (!file) return '';
  return URL.createObjectURL(file);
}

export function buildProjectFormData(experience) {
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

export function buildInternshipFormData(experience) {
  const formData = new FormData();

  formData.append('titre', experience.title);
  formData.append('date_debut', experience.startDate);
  formData.append('date_fin', experience.endDate);
  formData.append('description', experience.description);
  formData.append('is_academique', experience.isAcademic);
  formData.append('email_professeur', experience.teacherEmail);
  //formData.append('visibleToEveryone', String(experience.visibleToEveryone));
  formData.append('technologies', JSON.stringify(experience.technologies));
  formData.append('domaines', JSON.stringify(experience.domains));
  formData.append('rapport_stage', experience.report);
  formData.append('missions_realisees', experience.missions);

  if (experience.image) {
    formData.append('photo', experience.image);
  }

  return formData;
}

async function handleExperienceSubmit(experience) {
  submitExperienceError.value = '';
  isSubmittingExperience.value = true;

  try {
    const experienceToSave = {
      ...experience,
      id: selectedExperience.value?.id ?? Date.now(),
      type: modalExperienceType.value,
      imagePreview: getFilePreview(experience.image) || selectedExperience.value?.imagePreview || '',
    };

    if (modalMode.value === 'edit') {
      experiences.value = experiences.value.map((item) =>
        item.id === experienceToSave.id ? experienceToSave : item
      );
      closeExperienceModal();
      return;
    }

    if (experienceToSave.type === 'project') {
      await api.post('/add-projet', buildProjectFormData(experienceToSave), {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    experiences.value.unshift(experienceToSave);
    closeExperienceModal();
  }
  catch(error) {
    submitExperienceError.value = error.response?.data?.message || 'Failed to save experience';
  }
  finally {
    isSubmittingExperience.value = false;
  }
}
