<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { Plus, Briefcase, MapPin, Building2 } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import OfferModal from '@/components/dashboard/recruteur/OfferModal.vue';
import BaseButton from '@/components/common/actions/BaseButton.vue';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const offers = ref([]);
const loading = ref(false);
const offerModalOpen = ref(false);

const recruiterLastName = computed(() => user.value?.lastName || 'recruteur');

const todayLabel = computed(() =>
  new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
);

const stats = computed(() => ({
  total: offers.value.length,
  stage: offers.value.filter(o => o.type === 'stage').length,
  emploi: offers.value.filter(o => o.type === 'emploi').length,
}));

onMounted(async () => {
  await fetchOffers();
});

async function fetchOffers() {
  loading.value = true;

  try {
    // À remplacer par ton appel API réel
    // const { data } = await api.get('/recruteur/offres');
    // offers.value = data.data;

    offers.value = [];
  } finally {
    loading.value = false;
  }
}

function openOfferModal() {
  offerModalOpen.value = true;
}

function closeOfferModal() {
  offerModalOpen.value = false;
}

async function handleSubmitOffer(payload) {
  try {
    const utilisateurId =
      user.value?.utilisateur_id ||
      user.value?.id ||
      user.value?.idUtilisateur;

    const data = {
      entreprise: payload.entreprise,
      localisation: payload.localisation,
      technologies: payload.technologies,
      description: payload.description,
      type: payload.type,
      utilisateur_id: utilisateurId,
    };

    // À remplacer par ton endpoint réel
    // await api.post('/offres', data);

    offers.value.unshift({
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
    });

    closeOfferModal();
  } catch (err) {
    console.error(err);
  }
}
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
      <Transition name="fade" mode="out-in">
        <div v-if="loading" class="empty-state">
          <p>Chargement des offres...</p>
        </div>

        <div v-else-if="offers.length" class="cards-grid">
          <article
            v-for="offer in offers"
            :key="offer.id"
            class="offer-card"
          >
            <div class="offer-card__top">
              <div class="offer-card__icon">
                <Briefcase :size="18" />
              </div>

              <span class="badge">
                {{ offer.type }}
              </span>
            </div>

            <h3 class="offer-card__title">
              {{ offer.entreprise }}
            </h3>

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

            <div class="tags">
              <span
                v-for="tech in offer.technologies"
                :key="tech"
                class="tag"
              >
                {{ tech }}
              </span>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <Briefcase :size="34" />
          <p>Aucune offre publiée pour le moment.</p>
        </div>
      </Transition>
    </section>

    <OfferModal
      :open="offerModalOpen"
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

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
  gap: var(--space-sm);
}

.offer-card {
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: var(--color-background);
  border: 1px solid rgba(var(--color-primary-rgb), 0.09);
  transition: var(--transition-fast);
}

.offer-card:hover {
  border-color: rgba(var(--color-secondary-rgb), 0.35);
  box-shadow: 0 6px 22px rgba(var(--color-primary-rgb), 0.08);
  transform: translateY(-2px);
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
}
</style>