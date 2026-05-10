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
