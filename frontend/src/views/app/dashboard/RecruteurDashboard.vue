<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  Plus,
  Briefcase,
  MapPin,
  Building2,
  MoveHorizontal,
  Repeat2,
  Users,
} from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth'
import { useRecruteurStore } from '@/stores/recruteur'
import OfferModal from '@/components/dashboard/recruteur/OfferModal.vue'
import BaseButton from '@/components/common/actions/BaseButton.vue'
import { useHorizontalDragScroll } from '@/composables/useHorizontalDragScroll'

const authStore = useAuthStore()
const recruteurStore = useRecruteurStore()

const { user } = storeToRefs(authStore)
const { offres, loadingOffres } = storeToRefs(recruteurStore)

const offers = offres
const loading = loadingOffres

const offerModalOpen = ref(false)
const viewMode = ref('loop')
const scrollerRef = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const selectedOfferId = ref(null)
const selectedOffer = computed(() =>
  offers.value.find(o => getOfferId(o) === selectedOfferId.value) || null
)

const demandes = ref([])
const loadingDemandes = ref(false)
const demandesError = ref('')

const typesOffres = computed(() =>
  Array.isArray(recruteurStore.typesOffres) ? recruteurStore.typesOffres : []
)

const loadingTypesOffres = computed(() => Boolean(recruteurStore.loadingTypesOffres))

const recruiterLastName = computed(() =>
  user.value?.lastName ||
  user.value?.nom ||
  'recruteur'
)

const todayLabel = computed(() =>
  new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
)

const stats = computed(() => ({
  total: offers.value.length,
  stage: offers.value.filter(o => String(o.type).toLowerCase() === 'stage').length,
  emploi: offers.value.filter(o => String(o.type).toLowerCase() === 'emploi').length,
}))

const canLoop = computed(() => offers.value.length >= 4)
const hasFewOffers = computed(() => offers.value.length > 0 && offers.value.length < 4)

const isLoopMode = computed(() => viewMode.value === 'loop')
const isScrollMode = computed(() => viewMode.value === 'scroll')
const shouldLoop = computed(() => isLoopMode.value && canLoop.value)

const modeButtonLabel = computed(() =>
  isLoopMode.value ? 'Scroll' : 'Loop'
)

onMounted(async () => {
  await Promise.all([
    fetchOffers(),
    fetchTypesOffres(),
  ])

  if (offers.value.length && !selectedOfferId.value) {
    await selectOffer(offers.value[0])
  }

  nextTick(updateScrollFades)
})

async function fetchOffers() {
  await recruteurStore.fetchMesOffres(1)
}

async function fetchTypesOffres() {
  if (typeof recruteurStore.fetchTypesOffres === 'function') {
    await recruteurStore.fetchTypesOffres()
  }
}

function getOfferId(offer) {
  return offer?.offre_id || offer?.id
}

function openOfferModal() {
  offerModalOpen.value = true
}

function closeOfferModal() {
  offerModalOpen.value = false
}

async function handleSubmitOffer(payload) {
  try {
    await recruteurStore.creerOffre({
      entreprise: payload.entreprise,
      localisation: payload.localisation,
      technologies: payload.technologies,
      description: payload.description,
      type: payload.type,
    })

    closeOfferModal()
    await fetchOffers()

    if (offers.value.length) {
      await selectOffer(offers.value[0])
    }
  } catch (err) {
    console.error('Erreur création offre:', err)
  }
}

async function selectOffer(offer) {
  const offreId = getOfferId(offer)
  if (!offreId) return

  selectedOfferId.value = offreId
  await fetchDemandesByOffer(offreId)
}

async function fetchDemandesByOffer(offreId) {
  loadingDemandes.value = true
  demandesError.value = ''
  demandes.value = []

  try {
    if (typeof recruteurStore.fetchDemandesParOffre !== 'function') {
      demandesError.value = 'La méthode fetchDemandesParOffre manque dans le store recruteur.'
      return
    }

    const result = await recruteurStore.fetchDemandesParOffre(offreId, 1)

    const source =
      result?.data?.data ||
      result?.data ||
      recruteurStore.demandesParOffre?.data ||
      recruteurStore.demandesParOffre ||
      []

    demandes.value = Array.isArray(source) ? source : []
  } catch (err) {
    console.error('Erreur chargement demandes:', err)
    demandesError.value = err.response?.data?.message || 'Impossible de charger les demandes.'
  } finally {
    loadingDemandes.value = false
  }
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR')
}

function getDemandeId(demande) {
  return demande?.demande_id || demande?.id || `${demande?.utilisateur_id}-${demande?.offre_id}`
}

function getStudentName(demande) {
  const u = demande?.utilisateur
  if (!u) return '—'
  return `${u.prenom || ''} ${u.nom || ''}`.trim() || '—'
}

function getStudentEmail(demande) {
  return demande?.utilisateur?.email || '—'
}

function updateScrollFades() {
  const scroller = scrollerRef.value

  if (!scroller || !isScrollMode.value || hasFewOffers.value) {
    canScrollLeft.value = false
    canScrollRight.value = false
    return
  }

  const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth
  canScrollLeft.value = scroller.scrollLeft > 1
  canScrollRight.value = scroller.scrollLeft < maxScrollLeft - 1
}

function prepareScrollMode() {
  const scroller = scrollerRef.value
  if (!scroller) return

  scroller.scrollLeft = 0
  updateScrollFades()
}

function toggleViewMode() {
  if (isLoopMode.value) {
    viewMode.value = 'scroll'
    nextTick(prepareScrollMode)
    return
  }

  viewMode.value = 'loop'
  updateScrollFades()
}

const {
  isDragging,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
} = useHorizontalDragScroll(scrollerRef, {
  enabled: isScrollMode,
  onScroll: updateScrollFades,
})

watch(
  () => offers.value.length,
  () => nextTick(updateScrollFades)
)

watch(isScrollMode, (scrollMode) => {
  if (!scrollMode) {
    updateScrollFades()
    return
  }

  nextTick(prepareScrollMode)
})
</script>

<template>
  <div class="recruiter-page">
    <header class="page-header">
      <div class="page-header__left">
        <p class="page-header__eyebrow">Espace Recruteur</p>
        <h1 class="page-header__title">Bonjour, {{ recruiterLastName }}</h1>
        <p class="page-header__date">{{ todayLabel }}</p>
      </div>

      <div class="page-header__stats">
        <div class="stat-chip">
          <span class="stat-chip__num">{{ stats.total }}</span>
          <span class="stat-chip__label">Offres publiées</span>
        </div>

        <div class="stat-chip">
          <span class="stat-chip__num">{{ stats.stage }}</span>
          <span class="stat-chip__label">Stages</span>
        </div>

        <div class="stat-chip">
          <span class="stat-chip__num">{{ stats.emploi }}</span>
          <span class="stat-chip__label">Emplois</span>
        </div>
      </div>
    </header>

    <div class="section-top">
      <p class="section-lead">
        Gérez vos offres et facilitez la recherche de profils étudiants adaptés.
      </p>

      <BaseButton variant="submit" @click="openOfferModal">
        <Plus :size="16" />
        Publier une offre
      </BaseButton>
    </div>

    <section class="section">
      <div v-if="offers.length >= 4" class="offers-actions">
        <button
          type="button"
          class="offers-toggle"
          :aria-pressed="isScrollMode"
          @click="toggleViewMode"
        >
          <MoveHorizontal v-if="isLoopMode" :size="15" />
          <Repeat2 v-else :size="15" />
          {{ modeButtonLabel }}
        </button>
      </div>

      <Transition name="fade" mode="out-in">
        <div v-if="loading" class="empty-state">
          <p>Chargement des offres...</p>
        </div>

        <div
          v-else-if="offers.length"
          class="offers-frame"
          :class="{
            'offers-frame--few': hasFewOffers,
            'offers-frame--loop': isLoopMode,
            'offers-frame--scroll': isScrollMode,
            'offers-frame--moving': shouldLoop,
            'offers-frame--draggable': isScrollMode && !hasFewOffers,
            'offers-frame--dragging': isDragging,
            'has-left-fade': canScrollLeft,
            'has-right-fade': canScrollRight,
          }"
        >
          <div
            ref="scrollerRef"
            class="offers-scroller"
            @pointerdown="handlePointerDown"
            @pointermove="handlePointerMove"
            @pointerup="handlePointerUp"
            @pointercancel="handlePointerUp"
            @pointerleave="handlePointerUp"
            @scroll="updateScrollFades"
          >
            <div class="offers-track">
              <template v-if="shouldLoop">
                <div
                  v-for="copy in 2"
                  :key="copy"
                  class="offers-loop-set"
                >
                  <article
                    v-for="offer in offers"
                    :key="`${getOfferId(offer)}-${copy}`"
                    class="offer-card"
                    :class="{ 'offer-card--selected': selectedOfferId === getOfferId(offer) }"
                    @click="selectOffer(offer)"
                  >
                    <div class="offer-card__top">
                      <div class="offer-card__icon">
                        <Briefcase :size="18" />
                      </div>

                      <span class="badge">{{ offer.type }}</span>
                    </div>

                    <h3 class="offer-card__title">{{ offer.entreprise }}</h3>

                    <div class="offer-card__meta">
                      <span>
                        <Building2 :size="14" />
                        {{ offer.entreprise }}
                      </span>

                      <span>
                        <MapPin :size="14" />
                        {{ offer.localisation }}
                      </span>
                    </div>

                    <p class="offer-card__description">
                      {{ offer.description }}
                    </p>

                    <div v-if="offer.technologies?.length" class="tags">
                      <span
                        v-for="tech in offer.technologies"
                        :key="tech"
                        class="tag"
                      >
                        {{ tech }}
                      </span>
                    </div>

                    <button
                      type="button"
                      class="select-btn"
                      @click.stop="selectOffer(offer)"
                    >
                      Voir les demandes
                    </button>
                  </article>
                </div>
              </template>

              <template v-else>
                <article
                  v-for="offer in offers"
                  :key="getOfferId(offer)"
                  class="offer-card"
                  :class="{ 'offer-card--selected': selectedOfferId === getOfferId(offer) }"
                  @click="selectOffer(offer)"
                >
                  <div class="offer-card__top">
                    <div class="offer-card__icon">
                      <Briefcase :size="18" />
                    </div>

                    <span class="badge">{{ offer.type }}</span>
                  </div>

                  <h3 class="offer-card__title">{{ offer.entreprise }}</h3>

                  <div class="offer-card__meta">
                    <span>
                      <Building2 :size="14" />
                      {{ offer.entreprise }}
                    </span>

                    <span>
                      <MapPin :size="14" />
                      {{ offer.localisation }}
                    </span>
                  </div>

                  <p class="offer-card__description">
                    {{ offer.description }}
                  </p>

                  <div v-if="offer.technologies?.length" class="tags">
                    <span
                      v-for="tech in offer.technologies"
                      :key="tech"
                      class="tag"
                    >
                      {{ tech }}
                    </span>
                  </div>

                  <button
                    type="button"
                    class="select-btn"
                    @click.stop="selectOffer(offer)"
                  >
                    Voir les demandes
                  </button>
                </article>
              </template>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <Briefcase :size="34" />
          <p>Aucune offre publiée pour le moment.</p>
        </div>
      </Transition>
    </section>

    <section class="requests-section">
      <div class="requests-header">
        <div>
          <p class="section-eyebrow">Demandes reçues</p>
          <h2>
            {{ selectedOffer ? selectedOffer.entreprise : 'Sélectionnez une offre' }}
          </h2>
          <p v-if="selectedOffer" class="requests-subtitle">
            {{ selectedOffer.localisation }} · {{ selectedOffer.type }}
          </p>
        </div>

        <div class="requests-count">
          <Users :size="16" />
          {{ demandes.length }} demande(s)
        </div>
      </div>

      <div v-if="!selectedOffer" class="state-msg">
        Sélectionnez une offre en haut pour afficher ses demandes.
      </div>

      <div v-else-if="loadingDemandes" class="state-msg">
        Chargement des demandes...
      </div>

      <div v-else-if="demandesError" class="state-msg error">
        {{ demandesError }}
      </div>

      <div v-else-if="!demandes.length" class="state-msg">
        Aucune demande pour cette offre.
      </div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Étudiant</th>
              <th>Email</th>
              <th>Message</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="demande in demandes" :key="getDemandeId(demande)">
              <td>{{ getStudentName(demande) }}</td>
              <td class="email-cell">{{ getStudentEmail(demande) }}</td>
              <td class="message-cell">{{ demande.message || '—' }}</td>
              <td>{{ formatDate(demande.date || demande.createdAt || demande.date_demande) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <OfferModal
      :open="offerModalOpen"
      :loading="loadingTypesOffres"
      :type-options="typesOffres"
      @close="closeOfferModal"
      @submit="handleSubmitOffer"
    />
  </div>
</template>

<style scoped>
.recruiter-page {
  min-height: 100%;
  padding: var(--space-xl) clamp(var(--space-lg), 4vw, 3rem);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  font-family: var(--font-ui, 'DM Sans', sans-serif);
  color: var(--color-primary);
  background: var(--color-background);
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-lg);
  flex-wrap: wrap;
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.page-header__eyebrow,
.section-eyebrow {
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-secondary);
  margin-bottom: 0.35rem;
}

.page-header__title {
  font-size: clamp(1.8rem, 3.5vw, 2.6rem);
  font-weight: 700;
  line-height: 1.05;
  margin: 0 0 0.35rem;
  letter-spacing: -0.02em;
}

.page-header__date {
  font-size: var(--font-size-xs);
  color: var(--color-primary-hover);
  text-transform: capitalize;
}

.page-header__stats {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 6rem;
  flex: 1;
  padding: 0.65rem 1.1rem;
  border-radius: var(--radius-md);
  background: rgba(var(--color-surface-rgb), 0.6);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.stat-chip__num {
  font-size: 1.5rem;
  font-weight: var(--font-bold);
  line-height: 1;
  color: var(--color-secondary);
}

.stat-chip__label {
  font-size: var(--font-size-xxs);
  color: var(--color-primary-hover);
  text-align: center;
  margin-top: 4px;
  letter-spacing: 0.04em;
}

.section-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.section-lead {
  font-size: var(--font-size-sm);
  color: var(--color-primary-hover);
  line-height: 1.65;
  margin: 0;
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.offers-actions {
  display: flex;
  justify-content: flex-end;
}

.offers-toggle {
  position: relative;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  border: none;
  border-radius: var(--radius-sm);
  padding-block: var(--space-sm);
  padding-inline: 0.75rem var(--space-md);
  background-color: var(--color-primary);
  color: var(--color-background);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.offers-toggle:hover {
  background-color: rgba(var(--color-primary-rgb), 0.92);
  box-shadow: 0 7px 12px rgba(0, 0, 0, 0.16);
  transform: translateY(-1px);
}

.offers-frame {
  --offers-fade-width: clamp(2rem, 6vw, 4rem);
  position: relative;
  padding-block: var(--space-sm);
  overflow: hidden;
}

.offers-frame::before,
.offers-frame::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  width: 0;
  pointer-events: none;
  transition: width var(--transition-normal);
}

.offers-frame::before {
  left: 0;
  background: linear-gradient(
    to right,
    var(--color-background),
    rgba(var(--color-background-rgb), 0)
  );
}

.offers-frame::after {
  right: 0;
  background: linear-gradient(
    to left,
    var(--color-background),
    rgba(var(--color-background-rgb), 0)
  );
}

.offers-frame--moving::before,
.offers-frame--moving::after,
.offers-frame--scroll.has-left-fade::before,
.offers-frame--scroll.has-right-fade::after {
  width: var(--offers-fade-width);
}

.offers-frame--few {
  overflow: visible;
}

.offers-frame--few::before,
.offers-frame--few::after {
  display: none;
}

.offers-frame--few .offers-scroller {
  overflow: visible;
}

.offers-frame--few .offers-track {
  width: 100%;
  justify-content: flex-start;
}

.offers-scroller {
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
}

.offers-scroller::-webkit-scrollbar {
  display: none;
}

.offers-track {
  display: flex;
  align-items: stretch;
  width: max-content;
  gap: var(--space-lg);
}

.offers-loop-set {
  display: flex;
  align-items: stretch;
  gap: var(--space-lg);
}

.offers-frame--moving .offers-track {
  animation: offers-marquee 42s linear infinite;
}

.offers-frame--moving .offers-scroller:hover .offers-track {
  animation-play-state: paused;
}

.offers-frame--scroll .offers-track {
  animation: none;
  transform: none;
}

.offers-frame--draggable .offers-scroller {
  cursor: grab;
}

.offers-frame--dragging .offers-scroller {
  cursor: grabbing;
}

.offer-card {
  width: clamp(18rem, 28vw, 22rem);
  min-height: 16rem;
  flex: 0 0 auto;
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: var(--color-background);
  border: 1px solid rgba(var(--color-primary-rgb), 0.09);
  transition: var(--transition-fast);
  cursor: pointer;
}

.offer-card:hover,
.offer-card--selected {
  border-color: rgba(var(--color-secondary-rgb), 0.55);
  box-shadow: 0 6px 22px rgba(var(--color-primary-rgb), 0.08);
  transform: translateY(-2px);
}

.offer-card--selected {
  background: rgba(var(--color-secondary-rgb), 0.04);
}

.offer-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.offer-card__icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-secondary-rgb), 0.14);
  color: var(--color-secondary);
}

.offer-card__title {
  margin: 0 0 var(--space-xs);
  font-size: var(--font-size-md);
  font-weight: var(--font-bold);
}

.offer-card__meta {
  display: grid;
  gap: 5px;
  margin-bottom: var(--space-sm);
  color: var(--color-primary-hover);
  font-size: var(--font-size-xs);
}

.offer-card__meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.offer-card__description {
  color: rgba(var(--color-primary-rgb), 0.72);
  font-size: var(--font-size-xs);
  line-height: 1.55;
  margin: 0 0 var(--space-sm);
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(var(--color-primary-rgb), 0.05);
  color: var(--color-primary-hover);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
}

.badge {
  display: inline-flex;
  align-items: center;
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  letter-spacing: 0.05em;
  padding: 3px 9px;
  border-radius: 999px;
  white-space: nowrap;
  background: rgba(var(--color-secondary-rgb), 0.13);
  color: #7a4700;
  text-transform: capitalize;
}

.select-btn {
  margin-top: var(--space-sm);
  border: none;
  border-radius: var(--radius-sm);
  padding: 7px 10px;
  background: var(--color-primary);
  color: var(--color-background);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  cursor: pointer;
}

.requests-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  background: var(--color-background);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.requests-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.requests-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.requests-subtitle {
  margin: 0.3rem 0 0;
  color: var(--color-primary-hover);
  font-size: var(--font-size-xs);
}

.requests-count {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(var(--color-primary-rgb), 0.05);
  color: var(--color-primary-hover);
  font-size: var(--font-size-xs);
}

.state-msg {
  text-align: center;
  padding: 2rem;
  color: rgba(var(--color-primary-rgb), 0.45);
  font-size: var(--font-size-sm);
}

.state-msg.error {
  color: #991b1b;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

th {
  padding: 10px 12px;
  text-align: left;
  font-weight: 500;
  color: #374151;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

td {
  padding: 10px 12px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
}

.email-cell {
  color: #6b7280;
  font-size: 0.8rem;
}

.message-cell {
  max-width: 420px;
  color: rgba(var(--color-primary-rgb), 0.75);
  line-height: 1.5;
}

tr:hover td {
  background: #fafafa;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  min-height: 12rem;
  color: rgba(var(--color-primary-rgb), 0.35);
  font-size: var(--font-size-sm);
  text-align: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes offers-marquee {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(calc(-50% - (var(--space-lg) / 2)));
  }
}

@media (max-width: 600px) {
  .recruiter-page {
    padding: var(--space-md) var(--space-sm);
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-header__stats {
    width: 100%;
  }

  .stat-chip {
    flex: 1;
  }

  .section-top {
    align-items: flex-start;
  }

  .offers-actions {
    justify-content: flex-start;
  }

  .offers-track,
  .offers-loop-set {
    gap: var(--space-md);
  }

  .offer-card {
    width: min(85vw, 21rem);
  }

  .requests-section {
    padding: var(--space-md);
  }
}
</style>