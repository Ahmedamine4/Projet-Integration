import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';

const STATUS_MAP = {
  en_attente: 'pending',
  valide: 'validated',
  refuse: 'refused',
};

const normalizeListItem = (item) => {
  return {
    ...item,
    id: item.experience_id || item.id,
    experience_id: item.experience_id || item.id,
    status: item.status || STATUS_MAP[item.statut] || item.statut,
    titre: item.titre || item.experience?.titre || null,
    student: item.student || {
      // Backend renvoie etudiant: { nom, prenom }
      firstName: item.etudiant?.prenom || '',
      lastName: item.etudiant?.nom || '',
    },
  };
};

const normalizeDetail = (item, type) => {
  const normalized = {
    ...item,
    id: item.experience_id || item.id,
    experience_id: item.experience_id || item.id,
    status: item.status || STATUS_MAP[item.statut] || item.statut,
    date_experience: 
      item.experience?.date_experience || 
      item.stage?.experience?.date_experience || 
      item.projet?.experience?.date_experience || null,
    titre: item.titre || item.experience?.titre || null,
    description: item.description || item.experience?.description || item.stage?.description || item.projet?.description || item.contexte || null,
    student: item.student || {
      // Backend fetchDetail renvoie experience.etudiant.utilisateur
      firstName: item.experience?.etudiant?.utilisateur?.prenom || '',
      lastName: item.experience?.etudiant?.utilisateur?.nom || '',
    },
    comments: item.commentaire ? [{
      author: 'Professeur',
      date: item.date_d_action || new Date().toISOString(),
      text: item.commentaire,
    }] : [],
  };

  if (type === 'stages' && item.stage) {
    normalized.duree = item.stage.duree;
    normalized.missions_realisees = item.stage.missions_realisees;
    normalized.rapport_stage = item.stage.rapport_stage;
    normalized.domaines = item.stage.domaines || item.stage.domains || item.domaines || [];
    normalized.technologies = item.stage.technologies || item.stage.techno || item.technologies || [];
  }

  if (type === 'projets' && item.projet) {
    normalized.photo = item.projet.photo;
    normalized.lien_github = item.projet.lien_github;
    normalized.lien_youtube = item.projet.lien_youtube;
    normalized.technologies = item.projet.technologies;
    normalized.domains = item.projet.domains;
    normalized.role = item.projet.role;
    normalized.resultat_obtenus = item.projet.resultat_obtenus;
  }

  normalized.documentations = [];
  if (item.rapport_stage) normalized.documentations.push({ label: 'Rapport', url: item.rapport_stage });
  if (item.stage?.rapport_stage) normalized.documentations.push({ label: 'Rapport de stage', url: item.stage.rapport_stage });
  if (item.documentation) normalized.documentations.push({ label: 'Documentation', url: item.documentation });
  if (item.stage?.documentation) normalized.documentations.push({ label: 'Documentation', url: item.stage.documentation });
  if (item.projet?.documentation) normalized.documentations.push({ label: 'Documentation', url: item.projet.documentation });
  const docArrays = item.documentations || item.stage?.documentations || item.projet?.documentations || [];
  if (Array.isArray(docArrays)) {
    docArrays.forEach((d, i) => {
      if (!d) return;
      if (typeof d === 'string') normalized.documentations.push({ label: `Document ${i + 1}`, url: d });
      else normalized.documentations.push({ label: d.label || d.name || `Document ${i + 1}`, url: d.url || d.value || d.lien || d.path });
    });
  }

  return normalized;
};

export const useProfesseurStore = defineStore('professeur', () => {
  const stages = ref([]);
  const projets = ref([]);
  const loading = ref(false);
  const error = ref('');

  async function fetchStages() {
    loading.value = true;
    error.value = '';
    try {
      const response = await api.get('/professeur/validations/stages');
      stages.value = (response.data.data || []).map(normalizeListItem);
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la récupération des stages';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchProjets() {
    loading.value = true;
    error.value = '';
    try {
      const response = await api.get('/professeur/validations/projets');
      projets.value = (response.data.data || []).map(normalizeListItem);
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la récupération des projets';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchDetail(type, experienceId) {
    loading.value = true;
    error.value = '';
    try {
      const response = await api.get(`/professeur/validations/${type}/${experienceId}`);
      return normalizeDetail(response.data.data, type);
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la récupération des détails';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function submitDecision(type, experienceId, actionData) {
    loading.value = true;
    error.value = '';
    try {
      await api.patch(`/professeur/validations/${type}/${experienceId}`, actionData);

      if (type === 'stages') await fetchStages();
      if (type === 'projets') await fetchProjets();
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la validation';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    stages,
    projets,
    loading,
    error,
    fetchStages,
    fetchProjets,
    fetchDetail,
    submitDecision,
  };
});