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
  Ban,
} from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth'
import { useRecruteurStore } from '@/stores/recruteur'
import OfferModal from '@/components/dashboard/recruteur/OfferModal.vue'
import BaseButton from '@/components/common/actions/BaseButton.vue'
import Pagination from '@/components/dashboard/PaginationComponent.vue'
import { useHorizontalDragScroll } from '@/composables/useHorizontalDragScroll'
import ProfessionnelHeader from '@/components/dashboard/ProfessionnelHeader.vue'

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
const demandes = ref([])
const loadingDemandes = ref(false)
const demandesError = ref('')
const terminatingOfferId = ref(null)

const demandesCurrentPage = ref(1)
const demandesTotalPages = ref(1)
const demandesTotalItems = ref(0)
const demandesLimit = 10

const selectedOffer = computed(() =>
  offers.value.find(o => getOfferId(o) === selectedOfferId.value) || null
)

const typesOffres = computed(() =>
  Array.isArray(recruteurStore.typesOffres) ? recruteurStore.typesOffres : []
)

const loadingTypesOffres = computed(() => Boolean(recruteurStore.loadingTypesOffres))

const recruiterLastName = computed(() =>
  user.value?.lastName ||
  user.value?.nom ||
  'recruteur'
)
const professionalProfile = computed(() => ({
  firstName:
    user.value?.firstName ||
    user.value?.prenom ||
    '',

  lastName:
    user.value?.lastName ||
    user.value?.nom ||
    '',

  avatar:
    user.value?.photo ||
    user.value?.avatar ||
    null,
}))

const headerStats = computed(() => [
  {
    label: 'Published Offers',
    value: offers.value.length,
  },
  {
    label: 'Pending Requests',
    value: demandesTotalItems.value,
  },
])

const todayLabel = computed(() =>
  new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
)

const stats = computed(() => ({
  publiees: offers.value.length,
  terminees: offers.value.filter(
    o => String(o.statut || '').toUpperCase() === 'TERMINEE'
  ).length,
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

function isOfferTerminated(offer) {
  return String(offer?.statut || '').toUpperCase() === 'TERMINEE'
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
  } catch (err) {
    console.error('Erreur création offre:', err)
  }
}

async function selectOffer(offer) {
  const offreId = getOfferId(offer)
  if (!offreId) return

  if (selectedOfferId.value === offreId) {
    selectedOfferId.value = null
    demandes.value = []
    demandesError.value = ''
    demandesCurrentPage.value = 1
    demandesTotalPages.value = 1
    demandesTotalItems.value = 0
    return
  }

  selectedOfferId.value = offreId
  demandesCurrentPage.value = 1
  await fetchDemandesByOffer(offreId, 1)
}

async function handleDemandesPageChange(page) {
  if (!selectedOfferId.value) return

  demandesCurrentPage.value = page
  await fetchDemandesByOffer(selectedOfferId.value, page)
}

function normalizeDemandesResponse(result) {
  const payload = result || {}

  const data = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.demandes)
      ? payload.demandes
      : Array.isArray(payload)
        ? payload
        : []

  return {
    data,
    total: Number(payload.total || payload.totalItems || data.length || 0),
    page: Number(payload.page || demandesCurrentPage.value || 1),
    totalPages: Number(payload.totalPages || 1),
  }
}

async function fetchDemandesByOffer(offreId, page = demandesCurrentPage.value) {
  loadingDemandes.value = true
  demandesError.value = ''
  demandes.value = []

  try {
    const result = await recruteurStore.fetchDemandesParOffre(offreId, page, demandesLimit)
    const normalized = normalizeDemandesResponse(result)

    demandes.value = normalized.data
    demandesCurrentPage.value = normalized.page
    demandesTotalPages.value = Math.max(1, normalized.totalPages)
    demandesTotalItems.value = normalized.total
  } catch (err) {
    console.error('Erreur chargement demandes:', err)
    demandesError.value = err.response?.data?.message || 'Impossible de charger les demandes.'
    demandesTotalPages.value = 1
    demandesTotalItems.value = 0
  } finally {
    loadingDemandes.value = false
  }
}

async function handleTerminateOffer(offer) {
  const offreId = getOfferId(offer)
  if (!offreId || isOfferTerminated(offer)) return

  const confirmed = window.confirm(`Terminer l'offre chez ${offer.entreprise} ?`)
  if (!confirmed) return

  terminatingOfferId.value = offreId

  try {
    await recruteurStore.terminerOffre(offreId)
    await fetchOffers()

    if (selectedOfferId.value === offreId) {
      selectedOfferId.value = null
      demandes.value = []
      demandesError.value = ''
      demandesCurrentPage.value = 1
      demandesTotalPages.value = 1
      demandesTotalItems.value = 0
    }
  } catch (err) {
    console.error('Erreur terminaison offre:', err)
    alert(err.response?.data?.message || 'Impossible de terminer cette offre.')
  } finally {
    terminatingOfferId.value = null
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

function getInitials(demande) {
  const u = demande?.utilisateur
  const first = u?.prenom?.charAt(0) || ''
  const last = u?.nom?.charAt(0) || ''
  return `${first}${last}` || 'ET'
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
    <ProfessionnelHeader
     :student="professionalProfile"
     :stats="headerStats"
    />

    <div class="section-top">
      <p class="section-lead">
        Manage your offers and easily find suitable student profiles.
      </p>

      <BaseButton variant="submit" @click="openOfferModal">
        <Plus :size="16" />
        Post an offer
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
          <p>Loading offers...</p>
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
                    :class="{
                      'offer-card--selected': selectedOfferId === getOfferId(offer),
                      'offer-card--terminated': isOfferTerminated(offer),
                    }"
                    @click="selectOffer(offer)"
                  >
                    <div class="offer-card__top">
                      <div class="offer-card__icon">
                        <Briefcase :size="18" />
                      </div>

                      <div class="offer-card__badges">
                        <span class="badge">{{ offer.type }}</span>
                        <span
                          v-if="isOfferTerminated(offer)"
                          class="badge badge--terminated"
                        >
                          Closed
                        </span>
                      </div>
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

                    <div class="offer-actions">
                      <button
                        type="button"
                        class="select-btn"
                        @click.stop="selectOffer(offer)"
                      >
                        {{ selectedOfferId === getOfferId(offer) ? 'Hide' : 'View applications' }}
                      </button>

                      <button
                        type="button"
                        class="terminate-btn"
                        :disabled="isOfferTerminated(offer) || terminatingOfferId === getOfferId(offer)"
                        @click.stop="handleTerminateOffer(offer)"
                      >
                        <Ban :size="13" />
                        {{ isOfferTerminated(offer) ? 'Closed' : 'Close offer' }}
                      </button>
                    </div>
                  </article>
                </div>
              </template>

              <template v-else>
                <article
                  v-for="offer in offers"
                  :key="getOfferId(offer)"
                  class="offer-card"
                  :class="{
                    'offer-card--selected': selectedOfferId === getOfferId(offer),
                    'offer-card--terminated': isOfferTerminated(offer),
                  }"
                  @click="selectOffer(offer)"
                >
                  <div class="offer-card__top">
                    <div class="offer-card__icon">
                      <Briefcase :size="18" />
                    </div>

                    <div class="offer-card__badges">
                      <span class="badge">{{ offer.type }}</span>
                      <span
                        v-if="isOfferTerminated(offer)"
                        class="badge badge--terminated"
                      >
                        Closed
                      </span>
                    </div>
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

                  <div class="offer-actions">
                    <button
                      type="button"
                      class="select-btn"
                      @click.stop="selectOffer(offer)"
                    >
                      {{ selectedOfferId === getOfferId(offer) ? 'Hide' : 'View applications' }}
                    </button>

                    <button
                      type="button"
                      class="terminate-btn"
                      :disabled="isOfferTerminated(offer) || terminatingOfferId === getOfferId(offer)"
                      @click.stop="handleTerminateOffer(offer)"
                    >
                      <Ban :size="13" />
                      {{ isOfferTerminated(offer) ? 'Closed' : 'Close offer' }}
                    </button>
                  </div>
                </article>
              </template>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <Briefcase :size="34" />
          <p>No offers posted yet.</p>
        </div>
      </Transition>
    </section>

    <section class="requests-section users-tab">
      <div class="tab-header">
        <div class="tab-header__title-row">
          <Users class="tab-header__icon" :size="18" />

          <div>
            <h2 class="tab-header__title">Applications received</h2>
            <p class="tab-header__desc">
              {{
                selectedOffer
                  ? `${selectedOffer.entreprise} · ${selectedOffer.localisation} · ${selectedOffer.type}`
                  : 'Select an offer to display the associated applications.'
              }}
            </p>
          </div>
        </div>
      </div>

      <div class="toolbar">
        <div></div>

        <span class="toolbar__count">
          {{ demandesTotalItems }} application(s)
        </span>
      </div>

      <div v-if="!selectedOffer" class="state-empty">
        <Users class="state-empty__icon" :size="34" />
        <p>Select an offer above to display its applications.</p>
      </div>

      <div v-else-if="loadingDemandes" class="state-center">
        Loading applications...
      </div>

      <div v-else-if="demandesError" class="state-center error">
        {{ demandesError }}
      </div>

      <div v-else-if="!demandes.length" class="state-empty">
        <Users class="state-empty__icon" :size="34" />
        <p>No applications for this offer.</p>
      </div>

      <template v-else>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Message</th>
                <th class="th-center">Date</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="demande in demandes" :key="getDemandeId(demande)">
                <td>
                  <div class="user-cell">
                    <span class="avatar">{{ getInitials(demande) }}</span>
                    <span>{{ getStudentName(demande) }}</span>
                  </div>
                </td>

                <td class="td-muted">
                  {{ getStudentEmail(demande) }}
                </td>

                <td class="message-cell">
                  {{ demande.message || '—' }}
                </td>

                <td class="td-center td-muted">
                  {{ formatDate(demande.date || demande.createdAt || demande.date_demande) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="demandesTotalPages > 1" class="pagination-row">
          <Pagination
            :current-page="demandesCurrentPage"
            :total-pages="demandesTotalPages"
            @update:current-page="handleDemandesPageChange"
          />
        </div>
      </template>
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

.page-header__eyebrow {
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
  min-height: 17rem;
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

.offer-card--terminated {
  opacity: 0.68;
}

.offer-card__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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
  flex-shrink: 0;
}

.offer-card__badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 5px;
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

.badge--terminated {
  background: #fee2e2;
  color: #991b1b;
}

.offer-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: var(--space-sm);
}

.select-btn,
.terminate-btn {
  border: none;
  border-radius: var(--radius-sm);
  padding: 7px 10px;
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.select-btn {
  background: var(--color-primary);
  color: var(--color-background);
}

.terminate-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #fee2e2;
  color: #991b1b;
}

.terminate-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.select-btn:hover,
.terminate-btn:not(:disabled):hover {
  transform: translateY(-1px);
}

.users-tab {
  font-family: var(--font-ui);
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

.tab-header {
  margin-bottom: var(--space-sm);
}

.tab-header__title-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
}

.tab-header__icon {
  color: var(--color-secondary);
  margin-top: 2px;
  flex-shrink: 0;
}

.tab-header__title {
  font-size: var(--font-size-md);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  margin: 0 0 2px;
}

.tab-header__desc {
  font-size: var(--font-size-xs);
  color: var(--color-primary-hover);
  margin: 0;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.toolbar__count {
  font-size: var(--font-size-xs);
  color: var(--color-primary-hover);
  white-space: nowrap;
}

.state-center,
.state-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xl) 0;
  color: var(--color-primary-hover);
  font-size: var(--font-size-sm);
  text-align: center;
}

.state-center.error {
  color: #991b1b;
}

.state-empty__icon {
  opacity: 0.25;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-md);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

thead tr {
  background: var(--color-background);
}

th {
  padding: 10px var(--space-md);
  text-align: left;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-primary-hover);
  border-bottom: 1.5px solid var(--color-surface);
  white-space: nowrap;
}

.th-center {
  text-align: center;
}

td {
  padding: 12px var(--space-md);
  border-bottom: 1px solid var(--color-surface);
  color: var(--color-primary);
  vertical-align: middle;
}

.td-center {
  text-align: center;
}

.td-muted {
  color: var(--color-primary-hover);
  font-size: var(--font-size-xs);
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover td {
  background: rgba(var(--color-secondary-rgb), 0.03);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-background);
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
  text-transform: uppercase;
}

.message-cell {
  max-width: 420px;
  color: rgba(var(--color-primary-rgb), 0.75);
  line-height: 1.5;
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--space-sm);
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

  .pagination-row {
    justify-content: center;
  }
}
</style>