import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';

const STATUS_MAP = {
  en_attente: 'pending',
  valide: 'validated',
  refuse: 'refused',
};

// Maps internal singular item types to plural backend URL endpoints
const ROUTE_TYPE_MAP = {
  stage: 'stages',
  projet: 'projets',
  recommandation: 'recommandations',
};

const normalizeListItem = (item) => {
  return {
    ...item,
    id: item.experience_id || item.etudiant_id, 
    status: STATUS_MAP[item.statut] || item.statut,
    student: {
      firstName: item.etudiant?.prenom || '',
      lastName: item.etudiant?.nom || '',
    },
  };
};

const normalizeDetail = (item, type) => {
  // Normalize type string just in case 'recommandations' or 'recommandation' is passed
  if (type === 'recommandation' || type === 'recommandations') {
    const userNode = item.etudiant?.utilisateur || {};
    return {
      ...item,
      id: item.utilisateur_id,
      status: STATUS_MAP[item.statut] || item.statut,
      student: {
        firstName: userNode.prenom || '',
        lastName: userNode.nom || '',
        email: userNode.email || '',
        photo: userNode.photo || '',
        linkedin: userNode.linkedin || '',
        github: userNode.github || '',
      },
      experiences: item.etudiant?.experiences || [],
    };
  }

  const expNode = item.experience || {};
  const studentNode = expNode.etudiant?.utilisateur || {};

  const normalized = {
    ...item,
    id: item.experience_id,
    status: STATUS_MAP[item.statut] || item.statut,
    
    date_experience: expNode.date_experience || null,
    titre: expNode.titre || null,
    description: expNode.description || null,
    
    student: {
      firstName: studentNode.prenom || '',
      lastName: studentNode.nom || '',
    },
    
    comments: item.commentaire ? [{
      author: 'Professeur',
      date: item.date_d_action || new Date().toISOString(),
      text: item.commentaire,
    }] : [],
    
    domaines: (expNode.competence_dev || []).map(c => c.competence?.nom).filter(Boolean),
  };

  if ((type === 'stage' || type === 'stages') && item.stage) {
    normalized.duree = item.stage.duree;
    normalized.missions_realisees = item.stage.missions_realisees;
    normalized.rapport_stage = item.stage.rapport_stage;
  }

  if ((type === 'projet' || type === 'projets') && item.projet) {
    normalized.photo = item.projet.photo;
    normalized.lien_github = item.projet.lien_github;
    normalized.lien_youtube = item.projet.lien_youtube;
    normalized.technologies = item.projet.technologies || [];
    normalized.role = item.projet.role;
    normalized.resultat_obtenus = item.projet.resultat_obtenus;
  }

  return normalized;
};

export const useProfesseurStore = defineStore('professeur', () => {
  // --- State ---
  const demandes = ref([]);
  const pagination = ref({
    page: 1,
    totalPages: 1,
    total: 0,
    pageSize: 10
  });
  
  const filters = ref({
    type: '',   // 'stage', 'projet', 'recommandation'
    statut: '', // 'en_attente', 'valide', 'refuse'
    page: 1,
  });

  const loading = ref(false);
  const error = ref('');

  // --- Actions ---
  async function fetchDemandes() {
    loading.value = true;
    error.value = '';
    try {
      const params = Object.fromEntries(
        Object.entries(filters.value).filter(([_, v]) => v !== '')
      );

      const response = await api.get('/professeur/validations', { params });
      
      demandes.value = (response.data.data || []).map(normalizeListItem);
      pagination.value = response.data.pagination || pagination.value;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la récupération des demandes';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateFilter(key, value) {
    filters.value[key] = value;
    if (key !== 'page') {
      filters.value.page = 1; 
    }
    await fetchDemandes();
  }

  async function fetchDetail(type, id) {
    loading.value = true;
    error.value = '';
    try {
      // Safely convert type (e.g., 'recommandation' -> 'recommandations')
      const apiPathType = ROUTE_TYPE_MAP[type] || type;
      const response = await api.get(`/professeur/validations/${apiPathType}/${id}`);
      return normalizeDetail(response.data.data, type);
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la récupération des détails';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function submitDecision(type, id, actionData) {
    loading.value = true;
    error.value = '';
    try {
      let payload = actionData;
      let config = {};
      const apiPathType = ROUTE_TYPE_MAP[type] || type;

      // Handle multipart/form-data for recommendation file uploads
      if ((type === 'recommandation' || type === 'recommandations') && actionData.fichier) {
        payload = new FormData();
        if (actionData.statut) payload.append('statut', actionData.statut);
        if (actionData.commentaire) payload.append('commentaire', actionData.commentaire);
        payload.append('fichier', actionData.fichier); 
        
        config.headers = { 'Content-Type': 'multipart/form-data' };
      }

      await api.patch(`/professeur/validations/${apiPathType}/${id}`, payload, config);
      await fetchDemandes(); 
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la validation';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    demandes,
    pagination,
    filters,
    loading,
    error,
    fetchDemandes,
    updateFilter,
    fetchDetail,
    submitDecision,
  };
});