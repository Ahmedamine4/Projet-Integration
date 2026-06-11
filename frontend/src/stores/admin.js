import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import api from '@/services/api'

function parseApiError(err, fallback) {
  return err.response?.data?.message || err.response?.data?.error || fallback
}

function asArray(data, keys = []) {
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key]
  }
  return Array.isArray(data) ? data : []
}

function normalizeInstitution(institution) {
  const directeur = institution.directeur?.[0] ?? institution.directeurs?.[0] ?? null
  return {
    ...institution,
    email_directeur:
      institution.email_directeur ??
      directeur?.utilisateur?.email ??
      directeur?.email ??
      institution.email,
  }
}

function normalizeSessionEvent(event) {
  const action = (event.action ?? event.type ?? 'LOGIN').toString().toUpperCase()
  return {
    ...event,
    action,
    utilisateur: {
      ...(event.utilisateur ?? {}),
      role: event.utilisateur?.role ?? event.role ?? event.role_utilisateur ?? '',
    },
  }
}

export const useAdminStore = defineStore('admin', () => {
  const professionnels = ref([])
  const utilisateurs = ref([])
  const connexions = ref([])
  const adminInstitutions = ref([])
  const userSearchResults = ref([])

  const loading = reactive({
    users: false,
    userSearch: false,
    pro: false,
    sessions: false,
    action: false,
    institutions: false,
  })

  const errors = reactive({
    users: null,
    userSearch: null,
    pro: null,
    sessions: null,
    institutions: null,
  })

  async function fetchAdminInstitutions() {
    loading.institutions = true
    errors.institutions = null
    try {
      const { data } = await api.get('/admin/institutions')
      adminInstitutions.value = asArray(data, ['institutions', 'data']).map(normalizeInstitution)
    } catch (err) {
      errors.institutions = parseApiError(err, 'Impossible de charger les institutions.')
    } finally {
      loading.institutions = false
    }
  }

  async function createInstitution(payload) {
    loading.action = true
    try {
      const { data } = await api.post('/admin/institutions', payload)
      const newInstitution = normalizeInstitution(data.institution ?? data.data ?? data)
      if (newInstitution?.institution_id) {
        const exists = adminInstitutions.value.some(
          (institution) => institution.institution_id === newInstitution.institution_id,
        )
        adminInstitutions.value = exists
          ? adminInstitutions.value.map((institution) =>
              institution.institution_id === newInstitution.institution_id ? newInstitution : institution,
            )
          : [newInstitution, ...adminInstitutions.value]
      } else {
        await fetchAdminInstitutions()
      }
      return data
    } catch (err) {
      throw new Error(parseApiError(err, "Impossible de créer l'institution."))
    } finally {
      loading.action = false
    }
  }

  async function fetchProfessionnelsEnAttente() {
    loading.pro = true
    errors.pro = null
    try {
      const { data } = await api.get('/admin/professionnels/en-attente')
      professionnels.value = asArray(data, ['professionnels', 'data'])
    } catch (err) {
      errors.pro = parseApiError(err, 'Impossible de charger les demandes PRO.')
    } finally {
      loading.pro = false
    }
  }

  async function validerProfessionnel(id) {
    loading.action = true
    try {
      const { data } = await api.patch(`/admin/professionnels/${id}/valider`)
      professionnels.value = professionnels.value.filter(
        (pro) => pro.professionnel_utilisateur_id !== id,
      )
      return data
    } catch (err) {
      throw new Error(parseApiError(err, 'Impossible de valider cette demande PRO.'))
    } finally {
      loading.action = false
    }
  }

  async function refuserProfessionnel(id) {
    loading.action = true
    try {
      const { data } = await api.patch(`/admin/professionnels/${id}/refuser`)
      professionnels.value = professionnels.value.filter(
        (pro) => pro.professionnel_utilisateur_id !== id,
      )
      return data
    } catch (err) {
      throw new Error(parseApiError(err, 'Impossible de refuser cette demande PRO.'))
    } finally {
      loading.action = false
    }
  }

  async function fetchUtilisateurs() {
    loading.users = true
    errors.users = null
    try {
      const { data } = await api.get('/admin/users')
      utilisateurs.value = asArray(data, ['users', 'utilisateurs', 'data'])
    } catch (err) {
      errors.users = parseApiError(err, 'Impossible de charger les utilisateurs.')
    } finally {
      loading.users = false
    }
  }

  async function searchUserByEmail(email) {
    const query = email.trim()
    userSearchResults.value = []
    errors.userSearch = null
    if (!query) return []

    loading.userSearch = true
    try {
      const { data } = await api.get('/admin/users/search', { params: { email: query } })
      const users = asArray(data, ['users', 'data']).filter(
        (user) => user.role !== 'administrateur' && user.role !== 'professionnel',
      )
      userSearchResults.value = users
      return users
    } catch (err) {
      errors.userSearch = parseApiError(err, 'Impossible de rechercher cet utilisateur.')
      throw new Error(errors.userSearch)
    } finally {
      loading.userSearch = false
    }
  }

  async function bloquerUtilisateur(id) {
    loading.action = true
    try {
      const { data } = await api.patch(`/admin/utilisateurs/${id}/bloquer`)
      const u = utilisateurs.value.find((user) => user.utilisateur_id === id)
      if (u) u.bloque = true
      return data
    } catch (err) {
      throw new Error(parseApiError(err, 'Impossible de bloquer cet utilisateur.'))
    } finally {
      loading.action = false
    }
  }

  async function debloquerUtilisateur(id) {
    loading.action = true
    try {
      const { data } = await api.patch(`/admin/utilisateurs/${id}/debloquer`)
      const u = utilisateurs.value.find((user) => user.utilisateur_id === id)
      if (u) u.bloque = false
      return data
    } catch (err) {
      throw new Error(parseApiError(err, 'Impossible de débloquer cet utilisateur.'))
    } finally {
      loading.action = false
    }
  }

  async function promoteToPro(id) {
    loading.action = true
    try {
      const { data } = await api.patch(`/admin/utilisateurs/${id}/promote-pro`)
      const u = utilisateurs.value.find((user) => user.utilisateur_id === id)
      if (u) u.role = 'professionnel'
      userSearchResults.value = userSearchResults.value.filter((user) => user.utilisateur_id !== id)
      return data
    } catch (err) {
      throw new Error(parseApiError(err, 'Impossible de promouvoir cet utilisateur en PRO.'))
    } finally {
      loading.action = false
    }
  }

  async function fetchConnexions() {
    loading.sessions = true
    errors.sessions = null
    try {
      const { data } = await api.get('/auth/admin/sessions', { params: { limit: 200 } })
      connexions.value = asArray(data, ['sessions', 'connexions', 'data']).map(normalizeSessionEvent)
    } catch (err) {
      errors.sessions = parseApiError(err, "Impossible de charger l'historique.")
    } finally {
      loading.sessions = false
    }
  }

  return {
    professionnels,
    utilisateurs,
    connexions,
    adminInstitutions,
    userSearchResults,
    loading,
    errors,
    fetchAdminInstitutions,
    createInstitution,
    fetchProfessionnelsEnAttente,
    validerProfessionnel,
    refuserProfessionnel,
    fetchUtilisateurs,
    searchUserByEmail,
    bloquerUtilisateur,
    debloquerUtilisateur,
    promoteToPro,
    fetchConnexions,
  }
})
