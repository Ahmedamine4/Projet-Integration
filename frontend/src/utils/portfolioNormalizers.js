import { formatLocalDate } from '@/utils/date';

export function normalizeUser(data) {
  if (!data) return null;

  return {
    ...data,
    firstName: data.firstName ?? data.prenom ?? '',
    lastName: data.lastName ?? data.nom ?? '',
    phone: data.phone ?? data.telephone ?? '',
  };
}

export const getCompetenceNames = (item, type) =>
  item?.competences
    ?.filter((competence) => competence.type === type)
    .map((competence) => competence.nom)
    .filter(Boolean) ?? [];

const getExperience = (item) => item?.experience ?? item ?? {};

const getProject = (item) => item?.projet ?? {};

const getActivity = (item) => item?.activite ?? item ?? {};

const getCertification = (item) => item?.certification ?? {};

export function normalizeProject(item) {
  const experience = getExperience(item);
  const project = getProject(item);

  return {
    id: experience.experience_id,
    type: 'project',
    title: experience.titre ?? '',
    date: formatLocalDate(experience.date_experience),
    description: experience.description ?? '',
    visibleToEveryone: experience.visibilite ?? false,
    githubLink: project.lien_github ?? '',
    technologies: project.technologies ?? getCompetenceNames(experience, 'technologie'),
    domains: project.domains ?? getCompetenceNames(experience, 'domaine'),
    imagePreview: project.photo ?? experience.documentations?.[0]?.captures ?? '',
  };
}

export function normalizeActivity(item) {
  const experience = getExperience(item);
  const activity = getActivity(item);

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
    imagePreview: experience.documentations?.[0]?.captures ?? '',
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
    institution: certification.validation?.institution?.nom ?? '',
    certificateCode: certification.code ?? '',
    certificateURL: certification.lien_URL ?? certification.document ?? '',
    technologies: getCompetenceNames(experience, 'technologie'),
    domains: getCompetenceNames(experience, 'domaine'),
  };
}

export function normalizeEducation(institutions = []) {
  return institutions.map((entry) => ({
    id: entry.institution_id,
    school: entry.institution?.nom ?? 'Institution',
    level: entry.niveau ?? entry.statut ?? '',
    description: entry.institution?.description ?? '',
    period: entry.date_d_action
      ? formatLocalDate(entry.date_d_action)
      : '',
  }));
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
  const experiences = [...projects, ...activities, ...certifications];

  return {
    id: data?.etudiant_utilisateur_id ?? user.utilisateur_id ?? '',
    user: {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      photo: user.photo ?? '',
      github: data?.github_API ?? '',
      linkedin: user.linkedin ?? '',
      twitter: user.twitter ?? '',
      instagram: user.instagram ?? '',
    },
    headline: data?.niveau
      ? `${data.niveau} Student`
      : 'Student',
    school: data?.institutions?.[0]?.institution?.nom ?? '',
    portfolio: data?.portfolio ?? null,
    badges: data?.badges ?? [],
    education: normalizeEducation(data?.institutions ?? []),
    projects,
    activities,
    certifications,
    skills: sortByFrequency(experiences.flatMap((item) => item.technologies ?? [])),
    domains: sortByFrequency(experiences.flatMap((item) => item.domains ?? [])),
    recommendations: data?.recommandations ?? [],
  };
}
