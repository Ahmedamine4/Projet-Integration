import { defineStore } from 'pinia';
import api from '@/services/api';

const USE_MOCK = true;
const FEED_STUDENTS_ENDPOINT = '/feed/students';
const USE_MOCK_FOLLOW = false;
const MOCK_SUGGESTED_STUDENTS = [
  {
    id: 'cmq8df62g0001qv3yfa7kwkxm',
    userId: 'cmq8df62g0001qv3yfa7kwkxm',
    portfolioUserId: 'cmq8df62g0001qv3yfa7kwkxm',
    utilisateur_id: 'cmq8df62g0001qv3yfa7kwkxm',

    name: 'Test Etudiant',
    speciality: 'Étudiant test DB',
    schoolName: 'Compte local',
    stack: ['Vue 3', 'Node.js'],
    technologies: ['Vue 3', 'Node.js'],
    domains: ['Web Frontend'],

    rankScore: 999,
    portfolioScore: 0,
    isFollowing: false,
  },
];
const MOCK_STUDENTS_FROM_SCHOOL = [
  {
    id: 'cmq8dwlml0000qv5lkuxtdqdu',
    portfolioUserId: 'cmq8yl8660003qn3zbl6xqja6',
    name: 'Amine Kettani',
    speciality: 'Software Engineering Student',
    schoolName: 'ENSA Casablanca',
    stack: ['Vue 3', 'FastAPI'],
    technologies: ['Vue 3', 'FastAPI', 'PostgreSQL'],
    domains: ['Web Frontend', 'Web Backend'],
    rankScore: 82,
    portfolioScore: 82,
    isFollowing: false,
  },
  {
    id: 'cmq8efenu000bqv5lu13zr2a8',
    portfolioUserId: 'cmq8efenu000bqv5lu13zr2a8',
    name: 'Nour Berrada',
    speciality: 'Cybersecurity Student',
    schoolName: 'ENSA Casablanca',
    stack: ['Linux', 'Security'],
    technologies: ['Linux', 'Python', 'Networking'],
    domains: ['Cybersecurity'],
    rankScore: 88,
    portfolioScore: 88,
    isFollowing: false,
  },
];
function extractArray(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function getRankScore(item) {
  return Number(
    item.rankScore ??
    item.rankingScore ??
    item.matchScore ??
    item.score ??
    item.feedScore ??
    item.portfolioScore ??
    item.credibilityScore ??
    item.scoreCredibilite ??
    0
  );
}

function normalizeStudent(student) {
  const name =
    student.name ||
    student.nomComplet ||
    [student.prenom || student.firstName, student.nom || student.lastName]
      .filter(Boolean)
      .join(' ') ||
    'Étudiant';

  return {
    id: student.id,
    portfolioUserId:
      student.portfolioUserId ||
      student.utilisateur_id ||
      student.userId ||
      student.id,

    initials: student.initials || getInitials(name),
    name,

    speciality:
      student.speciality ||
      student.specialite ||
      student.objectifProfessionnel ||
      'Student',

    schoolName:
      student.schoolName ||
      student.institution?.nom ||
      student.school?.nom ||
      'Institution non renseignée',

    stack:
      student.stack ||
      student.technologies?.slice?.(0, 2) ||
      [],

    technologies: student.technologies || [],
    domains: student.domains || student.domaines || [],

    rankScore: getRankScore(student),

    portfolioScore:
      Number(
        student.portfolioScore ??
        student.credibilityScore ??
        student.scoreCredibilite ??
        0
      ),

    isFollowing: Boolean(student.isFollowing),
    raw: student,
  };
}

function sortByScore(items) {
  return [...items].sort((a, b) => (b.rankScore || 0) - (a.rankScore || 0));
}

export const useFeedStudentStore = defineStore('feedStudent', {
  state: () => ({
    suggestedStudents: [],
    studentsFromSchool: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchFeedStudents(scope = 'suggested') {
      this.loading = true;
      this.error = null;

      try {
        if (USE_MOCK) {
          if (scope === 'school') {
            this.studentsFromSchool = sortByScore(
              MOCK_STUDENTS_FROM_SCHOOL.map(normalizeStudent)
            );
          } else {
            this.suggestedStudents = sortByScore(
              MOCK_SUGGESTED_STUDENTS.map(normalizeStudent)
            );
          }

          return;
        }

        const response = await api.get(FEED_STUDENTS_ENDPOINT, {
          params: { scope },
        });

        const students = extractArray(response.data, [
          'students',
          'suggestedStudents',
          'users',
        ]).map(normalizeStudent);

        if (scope === 'school') {
          this.studentsFromSchool = sortByScore(students);
        } else {
          this.suggestedStudents = sortByScore(students);
        }
      } catch (error) {
        console.error('Erreur chargement étudiants feed:', error);

        this.error =
          error.response?.data?.message ||
          'Impossible de charger les étudiants.';

        if (scope === 'school') {
          this.studentsFromSchool = [];
        } else {
          this.suggestedStudents = [];
        }
      } finally {
        this.loading = false;
      }
    },

    async toggleFollow(student) {
  const targetId =
    student.portfolioUserId ||
    student.userId ||
    student.utilisateur_id ||
    student.id;

  if (!targetId) return;

  const previousValue = student.isFollowing;
  student.isFollowing = !student.isFollowing;

  try {
    if (USE_MOCK_FOLLOW) return;

    if (student.isFollowing) {
      await api.post('/follow', {
        targetId,
      });
    } else {
      await api.delete(`/follow/${targetId}`);
    }
  } catch (error) {
    console.error('Erreur follow/unfollow étudiant:', error);
    student.isFollowing = previousValue;
  }
}
  },
});