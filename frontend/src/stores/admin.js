import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useAdminStore = defineStore('admin', () => {
    const professionnels = ref([])
    const utilisateurs   = ref([])
    const connexions     = ref([])
    const loading        = ref(false)
    const error          = ref(null)

    async function fetchProfessionnelsEnAttente() {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.get('/admin/professionnels/en-attente')
            professionnels.value = data.professionnels
        } catch (err) {
            error.value = err.response?.data?.error || 'Erreur chargement'
        } finally {
            loading.value = false
        }
    }

    async function validerProfessionnel(id) {
        const { data } = await api.patch(`/admin/professionnels/${id}/valider`)
        professionnels.value = professionnels.value.filter(
            p => p.professionnel_utilisateur_id !== id
        )
        return data
    }

    async function refuserProfessionnel(id) {
        const { data } = await api.patch(`/admin/professionnels/${id}/refuser`)
        professionnels.value = professionnels.value.filter(
            p => p.professionnel_utilisateur_id !== id
        )
        return data
    }

    async function assignerDirecteur(payload) {
        const { data } = await api.post('/admin/assigner-directeur', payload)
        return data
    }

    // ── Utilisateurs ──────────────────────────────────────
    async function fetchUtilisateurs() {
        loading.value = true
        error.value = null
        try {
            // Route: GET /api/auth/users (Auth + Admin)
            const { data } = await api.get('/auth/users')
            utilisateurs.value = data.users || data.utilisateurs || data
        } catch (err) {
            error.value = err.response?.data?.error || 'Erreur chargement utilisateurs'
        } finally {
            loading.value = false
        }
    }

    async function bloquerUtilisateur(id) {
        try {
            const { data } = await api.patch(`/admin/utilisateurs/${id}/bloquer`)
            const u = utilisateurs.value.find(u => u.utilisateur_id === id)
            if (u) u.bloque = true
            return data
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || 'Erreur blocage (Backend)'
            throw new Error(msg)
        }
    }

    async function debloquerUtilisateur(id) {
        try {
            const { data } = await api.patch(`/admin/utilisateurs/${id}/debloquer`)
            const u = utilisateurs.value.find(u => u.utilisateur_id === id)
            if (u) u.bloque = false
            return data
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || 'Erreur déblocage (Backend)'
            throw new Error(msg)
        }
    }

    async function supprimerUtilisateur(id) {
        // Route: DELETE /api/admin/utilisateurs/:id  (à créer côté backend)
        loading.value = true
        try {
            await api.delete(`/admin/utilisateurs/${id}`)
            utilisateurs.value = utilisateurs.value.filter(u => u.utilisateur_id !== id)
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || 'Erreur suppression'
            throw new Error(msg)
        } finally {
            loading.value = false
        }
    }

    async function promoteToPro(id) {
        // Route: PATCH /api/admin/utilisateurs/:id/promote-pro  (à créer côté backend)
        loading.value = true
        try {
            const { data } = await api.patch(`/admin/utilisateurs/${id}/promote-pro`)
            const u = utilisateurs.value.find(u => u.utilisateur_id === id)
            if (u) u.role = 'professionnel'
            return data
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || 'Erreur promotion'
            throw new Error(msg)
        } finally {
            loading.value = false
        }
    }

    async function fetchConnexions() {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.get('/auth/admin/sessions')
            connexions.value = data.sessions || data.connexions || data
        } catch (err) {
            error.value = err.response?.data?.error || 'Erreur chargement historique'
        } finally {
            loading.value = false
        }
    }

    return {
        professionnels, utilisateurs, connexions, loading, error,
        fetchProfessionnelsEnAttente, validerProfessionnel, refuserProfessionnel,
        assignerDirecteur,
        fetchUtilisateurs, bloquerUtilisateur, debloquerUtilisateur, supprimerUtilisateur, promoteToPro,
        fetchConnexions,
    }
})