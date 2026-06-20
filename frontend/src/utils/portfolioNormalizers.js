import { addDays, formatLocalDate } from '@/utils/date';

export function normalizeUser(data) {
  if (!data) return null;

  return {
    ...data,
    firstName: data.prenom ?? '',
    lastName: data.nom ?? '',
    phone: data.telephone ?? '',
  };
}

export function getCompetenceNames(item, type) {
  const groupedCompetences = item?.competences;

  if (groupedCompetences && !Array.isArray(groupedCompetences)) {
    const key = type === 'technologie' ? 'technologies' : 'domaines';
    return (groupedCompetences[key] ?? [])
      .map((competence) => competence?.nom)
      .filter(Boolean);
  }

  return [
    ...(Array.isArray(groupedCompetences) ? groupedCompetences : []),
    ...(item?.competence_dev ?? []).map((entry) => entry.competence),
  ]
    .filter((competence) => competence?.type === type)
    .map((competence) => competence.nom)
    .filter(Boolean);
}

const getExperience = (item) => item?.experience ?? item ?? {};

const getProject = (item) => item?.projet ?? item ?? {};

const getActivity = (item) => item?.activite ?? item ?? {};

const getCertification = (item) => item?.certification ?? item ?? {};

const isAcademicExperience = (experience, validation) =>
  experience.type_specifique === 'academique' || Boolean(validation);

const getValidationState = (experience, validation) => {
  const validationStatus = validation?.statut ?? '';
  const isAcademic = isAcademicExperience(experience, validation);
  const isValidatedAcademic = isAcademic && validationStatus === 'valide';

  return {
    isAcademic,
    validationStatus,
    isValidatedAcademic,
    effectiveVisibleToEveryone: Boolean(experience.visibilite) && (!isAcademic || isValidatedAcademic),
  };
};

export function normalizeProject(item) {
  const experience = getExperience(item);
  const project = getProject(item);
  const projectTechnologies = project.technologies?.length
    ? project.technologies
    : getCompetenceNames(experience, 'technologie');
  const projectDomains = project.domains?.length
    ? project.domains
    : getCompetenceNames(experience, 'domaine');
  const validationState = getValidationState(
    experience,
    project.validation ?? item?.validation
  );

  return {
    id: experience.experience_id,
    type: 'project',
    title: experience.titre ?? '',
    date: formatLocalDate(experience.date_experience),
    description: experience.description ?? '',
    visibleToEveryone: experience.visibilite ?? false,
    githubLink: project.lien_github ?? '',
    repositoryId: project.repository_id ?? '',
    isDraft: Boolean(experience.is_draft),
    technologiesLocked: Boolean(experience.technologies_locked),
    isGithubDraft: Boolean(experience.is_draft && project.repository_id),
    technologies: projectTechnologies,
    domains: projectDomains,
    imagePreview: experience.photo ?? project.photo ?? experience.documentations?.[0]?.captures ?? '',
    highlighted: Boolean(item?.highlighted ?? experience.highlighted),
    score: item?.score ?? experience.score ?? 0,
    techCount: item?.techCount ?? experience.techCount ?? 0,
    domaineCount: item?.domaineCount ?? experience.domaineCount ?? 0,
    ...validationState,
  };
}

export function normalizeActivity(item) {
  const experience = getExperience(item);
  const activity = getActivity(item);
  const validationState = getValidationState(
    experience,
    activity.validation ?? item?.validation
  );

  return {
    id: experience.experience_id,
    type: 'activity',
    title: experience.titre ?? '',
    date: formatLocalDate(experience.date_experience),
    description: experience.description ?? '',
    visibleToEveryone: experience.visibilite ?? false,
    activityType: activity.type ?? '',
    location: activity.lieu ?? '',
    club: activity.clubs?.[0]?.nom ?? '',
    technologies: getCompetenceNames(experience, 'technologie'),
    domains: getCompetenceNames(experience, 'domaine'),
    imagePreview: experience.photo ?? experience.documentations?.[0]?.captures ?? '',
    highlighted: Boolean(item?.highlighted ?? experience.highlighted),
    score: item?.score ?? experience.score ?? 0,
    techCount: item?.techCount ?? experience.techCount ?? 0,
    domaineCount: item?.domaineCount ?? experience.domaineCount ?? 0,
    ...validationState,
  };
}

export function normalizeCertification(item) {
  const experience = getExperience(item);
  const certification = getCertification(item);

  return {
    id: experience.experience_id,
    type: 'certificate',
    title: experience.titre ?? '',
    date: formatLocalDate(experience.date_experience),
    description: experience.description ?? '',
    visibleToEveryone: experience.visibilite ?? false,
    institution: certification.institution?.nom ?? '',
    certificateCode: certification.code ?? '',
    certificateURL: certification.lien_URL ?? certification.document ?? '',
    technologies: getCompetenceNames(experience, 'technologie'),
    domains: getCompetenceNames(experience, 'domaine'),
    imagePreview: '',
    highlighted: Boolean(item?.highlighted ?? experience.highlighted),
    score: item?.score ?? experience.score ?? 0,
    techCount: item?.techCount ?? experience.techCount ?? 0,
    domaineCount: item?.domaineCount ?? experience.domaineCount ?? 0,
  };
}

export function normalizeInternship(item) {
  const experience = getExperience(item);
  const stage = experience.stage ?? item?.stage ?? item ?? {};
  const validationState = getValidationState(
    experience,
    stage.validation ?? item?.validation
  );
  const startDate = formatLocalDate(experience.date_experience);
  const endDate = addDays(experience.date_experience, stage.duree);

  return {
    id: experience.experience_id,
    type: 'internship',
    title: experience.titre ?? '',
    date: startDate,
    startDate,
    endDate,
    description: experience.description ?? '',
    visibleToEveryone: experience.visibilite ?? false,
    company: stage.company ?? stage.entreprise ?? '',
    location: stage.location ?? stage.lieu ?? '',
    missions: stage.missions_realisees ?? '',
    report: stage.rapport_stage ?? '',
    technologies: getCompetenceNames(experience, 'technologie'),
    domains: getCompetenceNames(experience, 'domaine'),
    imagePreview: '',
    highlighted: Boolean(item?.highlighted ?? experience.highlighted),
    ...validationState,
  };
}

export function normalizeCreatedInternship(data) {
  return normalizeInternship({
    ...data?.experience,
    stage: data?.stage,
    competences: data?.competences ?? [],
    documentations: data?.documentation ? [data.documentation] : [],
  });
}

export function normalizeEducation(institutions = []) {
  return [...institutions].sort((firstEntry, secondEntry) => {
    const firstDate = new Date(firstEntry.date_debut ?? firstEntry.date_fin ?? 0).getTime();
    const secondDate = new Date(secondEntry.date_debut ?? secondEntry.date_fin ?? 0).getTime();

    return secondDate - firstDate;
  }).map((entry) => {
    const startYear = entry.date_debut ? new Date(entry.date_debut).getFullYear() : '';
    const endDate = entry.date_fin ? new Date(entry.date_fin) : null;
    const endYear = endDate ? endDate.getFullYear() : '';
    const isPresent = endDate && endDate > new Date();
    const hasOpenEndDate = startYear && !endDate;

    let period = '';
    if (startYear && endYear) {
      period = isPresent ? `${startYear} - Present` : `${startYear} - ${endYear}`;
    } else if (hasOpenEndDate) {
      period = `${startYear} - Present`;
    } else if (startYear) {
      period = `${startYear}`;
    }

    return {
      id: entry.institution_id,
      school: entry.institution?.nom ?? 'Institution',
      level: entry.niveau ?? entry.statut ?? '',
      status: entry.statut ?? '',
      description: entry.description ?? '',
      period,
    };
  });
}

export function normalizeRecommendation(item, index = 0) {
  const professorUser = item?.professeur?.utilisateur ?? item?.professor?.user ?? {};
  const firstName = item?.authorFirstName ?? professorUser.prenom ?? professorUser.firstName ?? '';
  const lastName = item?.authorLastName ?? professorUser.nom ?? professorUser.lastName ?? '';
  const authorName = item?.authorName ?? `${firstName} ${lastName}`.trim();

  return {
    id: item?.id ?? `${item?.utilisateur_id ?? 'recommendation'}-${item?.prof_utilisateur_id ?? index}`,
    authorName: authorName || item?.professeur?.utilisateur?.email || 'Professor',
    authorRole: item?.authorRole ?? item?.professeur?.specialite ?? 'Recommendation',
    content: item?.content ?? item?.commentaire ?? item?.description ?? item?.objet ?? '',
    date: item?.date ?? item?.date_lettre ?? '',
    status: item?.statut ?? 'valide',
  };
}

function sortByFrequency(values = []) {
  const frequencies = values.reduce((counts, value) => {
    if (!value) return counts;

    counts.set(value, (counts.get(value) ?? 0) + 1);
    return counts;
  }, new Map());

  return [...frequencies]
    .sort(([firstValue, firstCount], [secondValue, secondCount]) => {
      if (firstCount < secondCount) return 1;
      if (firstCount > secondCount) return -1;
      return firstValue.localeCompare(secondValue);
    })
    .map(([value]) => value);
}

export function normalizePortfolio(data) {
  const user = normalizeUser(data?.utilisateur) ?? {};
  const projects = (data?.projets ?? []).map(normalizeProject);
  const activities = (data?.activites ?? []).map(normalizeActivity);
  const certifications = (data?.certifications ?? []).map(normalizeCertification);
  const internships = (data?.stages ?? []).map(normalizeInternship);
  const education = normalizeEducation(data?.institutions ?? []);
  const experiences = [...projects, ...activities, ...certifications, ...internships];
  const visibleSkillSources = experiences.filter((item) =>
    item.effectiveVisibleToEveryone ?? item.visibleToEveryone
  );

  return {
    id: data?.etudiant_utilisateur_id ?? user.utilisateur_id ?? '',
    user: {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      photo: user.photo ?? '',
      role: user.role ?? '',
      github: user.github ?? '',
      linkedin: user.linkedin ?? '',
      x: user.x ?? '',
      instagram: user.instagram ?? '',
    },
    headline: data?.niveau
      ? `${data.niveau} Student`
      : '',
    school: education[0]?.school ?? '',
    portfolio: data?.portfolio ?? null,
    badges: data?.badges ?? [],
    education,
    projects,
    internships,
    activities,
    certifications,
    skills: sortByFrequency(visibleSkillSources.flatMap((item) => item.technologies ?? [])),
    domains: sortByFrequency(visibleSkillSources.flatMap((item) => item.domains ?? [])),
    recommendations: (data?.recommandations ?? []).map(normalizeRecommendation),
  };
}
