<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import Switcher from '@/components/common/Switcher.vue';
import StatusFilterDropdown from '@/components/common/StatusFilterDropdown.vue';
import DetailModal from '@/components/prof/DetailModal.vue';
import { Clock, CheckCircle, XCircle } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useProfesseurStore } from '@/stores/professeur';

const profStore = useProfesseurStore();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const professorLastName = computed(() => user.value?.lastName || 'enseignant');


const activeTab = ref('stages');
const tabOptions = [
  { value: 'stages',  label: 'Demandes de Stages' },
  { value: 'projets', label: 'Projets Académiques' },
  { value: 'lettres', label: 'Lettres de Recommandation' },
];

const stageFilter  = ref('tous');
const projetFilter = ref('tous');

const filterOptions = [
  { value: 'tous',      label: 'Tous' },
  { value: 'pending',   label: 'En attente' },
  { value: 'validated', label: 'Validé' },
  { value: 'refused',   label: 'Refusé' },
];

const stages = computed(() => profStore.stages);
const projets = computed(() => profStore.projets);

onMounted(async () => {
  await Promise.all([
    profStore.fetchStages(),
    profStore.fetchProjets(),
  ]);
});



const filteredStages = computed(() => {
  if (stageFilter.value === 'tous') return stages.value;
  return stages.value.filter(s => s.status === stageFilter.value);
});

const filteredProjets = computed(() => {
  if (projetFilter.value === 'tous') return projets.value;
  return projets.value.filter(p => p.status === projetFilter.value);
});


const pendingStages  = computed(() => stages.value.filter(s => s.status === 'pending').length);
const pendingProjets = computed(() => projets.value.filter(p => p.status === 'pending').length);

const todayLabel = computed(() =>
  new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
);

const detailModalOpen = ref(false);
const detailModalItem = ref(null);
const detailModalItemType = ref('');

async function openDetail(itemType, item) {
  detailModalOpen.value = true;
  detailModalItemType.value = itemType;
  detailModalItem.value = null;

  const type = itemType === 'stage' ? 'stages' : 'projets';
  const experienceId = item.experience_id || item.id;

  try {
    detailModalItem.value = await profStore.fetchDetail(type, experienceId);
  } catch (err) {
    showToast(err.response?.data?.message || err.message || 'Impossible de charger le détail.', 'error');
    closeDetail();
  }
}

function closeDetail() {
  detailModalOpen.value = false;
  detailModalItemType.value = '';
  detailModalItem.value = null;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
const toast = ref({ show: false, msg: '', type: 'success' });
let toastTimer = null;
function showToast(msg, type = 'success') {
  clearTimeout(toastTimer);
  toast.value = { show: true, msg, type };
  toastTimer = setTimeout(() => { toast.value.show = false; }, 3800);
}

// ─── Actions ──────────────────────────────────────────────────────────────────
async function handleSubmitDecision({ actionType, itemType, experienceId, payload }) {
  if (!detailModalItem.value) return;

  try {
    const type = itemType === 'stage' ? 'stages' : 'projets';
    await profStore.submitDecision(type, experienceId, payload);

    if (actionType === 'validate') {
      detailModalItem.value.status = 'validated';
    } else if (actionType === 'refuse') {
      detailModalItem.value.status = 'refused';
    }

    const label = itemType === 'stage' ? 'Stage' : 'Projet';
    const studentName = `${detailModalItem.value.student?.firstName || detailModalItem.value.experience?.utilisateur?.prenom || 'étudiant'} ${detailModalItem.value.student?.lastName || detailModalItem.value.experience?.utilisateur?.nom || ''}`.trim();
    const message = actionType === 'validate'
      ? `${label} de ${studentName} validé avec succès.`
      : actionType === 'refuse'
        ? `${label} de ${studentName} refusé.`
        : `Commentaire envoyé à ${studentName}.`;

    showToast(message, actionType === 'refuse' ? 'error' : actionType === 'comment' ? 'info' : 'success');
    closeDetail();
  } catch (err) {
    showToast(err.response?.data?.message || err.message || 'Erreur lors de la soumission.', 'error');
  }
}





// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(s) {
  const first = s?.firstName || s?.prenom || 'U';
  const last = s?.lastName || s?.nom || '';
  return `${(first[0] || 'U')}${(last[0] || '')}`.toUpperCase();
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}



</script>

<template>
  <div class="prof-page">

    <!-- ── Page header ──────────────────────────────────────────────────────── -->
    <header class="page-header">
      <div class="page-header__left">
        <p class="page-header__eyebrow">Espace Enseignant</p>
        <h1 class="page-header__title">Bonjour, Pr. {{ professorLastName }}</h1>
        <p class="page-header__date">{{ todayLabel }}</p>
      </div>
      <div class="page-header__stats">
        <div class="stat-chip">
          <span class="stat-chip__num">{{ pendingStages }}</span>
          <span class="stat-chip__label">Stages en attente</span>
        </div>
        <div class="stat-chip">
          <span class="stat-chip__num">{{ pendingProjets }}</span>
          <span class="stat-chip__label">Projets en attente</span>
        </div>
        <div class="stat-chip">
          <span class="stat-chip__num">0</span>
          <span class="stat-chip__label">Lettres rédigées</span>
        </div>
      </div>
    </header>

    <!-- ── Tabs ─────────────────────────────────────────────────────────────── -->
    <div class="tabs-wrap">
      <Switcher v-model="activeTab" :options="tabOptions" />
    </div>

    <!-- ── Content ──────────────────────────────────────────────────────────── -->
    <div class="tab-content">
      <Transition name="slide" mode="out-in">

        <!-- ══ STAGES ══ -->
        <section v-if="activeTab === 'stages'" key="stages" class="section">
          <div class="section-top">
            <StatusFilterDropdown
              v-model="stageFilter"
              :options="filterOptions"
            />
          </div>

          <Transition name="fade" mode="out-in">
            <div
              v-if="filteredStages.length"
              :key="stageFilter"
              class="cards-grid"
            >
              <article
                v-for="s in filteredStages"
                :key="s.id"
                class="req-card req-card--compact"
                :class="`req-card--${s.status}`"
                @click="openDetail('stage', s)"
              >
                <div class="req-card__accent" />
                <div class="req-card__compact-body">
                  <div class="avatar">{{ initials(s.student) }}</div>
                  <div class="req-card__compact-info">
                    <div class="req-card__compact-top">
                      <p class="req-card__student-name">{{ s.student.firstName }} {{ s.student.lastName }}</p>
                      <Clock v-if="s.status === 'pending'" :size="20" color="var(--color-secondary)" />
                      <CheckCircle v-else-if="s.status === 'validated'" :size="20" color="var(--color-success)" />
                      <XCircle v-else-if="s.status === 'refused'" :size="20" color="var(--color-error)" />
                    </div>
                    <p class="req-card__compact-title">{{ s.titre }}</p>
                  </div>
                </div>
                <div class="req-card__click-hint">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  Voir le détail
                </div>
              </article>
            </div>

            <div v-else :key="`empty-${stageFilter}`" class="empty-state">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <p>Aucune demande avec ce statut.</p>
            </div>
          </Transition>
        </section>

        <!-- ══ PROJETS ══ -->
        <section v-else-if="activeTab === 'projets'" key="projets" class="section">
          <div class="section-top">
            <StatusFilterDropdown
              v-model="projetFilter"
              :options="filterOptions"
            />
          </div>

          <Transition name="fade" mode="out-in">
            <div
              v-if="filteredProjets.length"
              :key="projetFilter"
              class="cards-grid"
            >
              <article
                v-for="p in filteredProjets"
                :key="p.id"
                class="req-card req-card--compact"
                :class="`req-card--${p.status}`"
                @click="openDetail('projet', p)"
              >
                <div class="req-card__accent" />
                <div class="req-card__compact-body">
                  <div class="avatar">{{ initials(p.student) }}</div>
                  <div class="req-card__compact-info">
                    <div class="req-card__compact-top">
                      <p class="req-card__student-name">{{ p.student.firstName }} {{ p.student.lastName }}</p>
                      <Clock v-if="p.status === 'pending'" :size="20" color="var(--color-secondary)" />
                      <CheckCircle v-else-if="p.status === 'validated'" :size="20" color="var(--color-success)" />
                      <XCircle v-else-if="p.status === 'refused'" :size="20" color="var(--color-error)" />
                    </div>
                    <p class="req-card__compact-title">{{ p.titre }}</p>
                  </div>
                </div>
                <div class="req-card__click-hint">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  Voir le détail
                </div>
              </article>
            </div>

            <div v-else :key="`empty-${projetFilter}`" class="empty-state">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <p>Aucun projet avec ce statut.</p>
            </div>
          </Transition>
        </section>

        <!-- ══ LETTRES ══ -->
        <section v-else key="lettres" class="section">
          <p>Section en cours de construction...</p>
        </section> 

      </Transition>
    </div>

    <!-- ══ DETAIL MODAL ══ -->
    <DetailModal
      :open="detailModalOpen"
      :item="detailModalItem"
      :itemType="detailModalItemType"
      @close="closeDetail"
      @submit-decision="handleSubmitDecision"
    />

    <!-- ── Toast ─────────────────────────────────────────────────────────────── -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="`toast--${toast.type}`">
        <svg v-if="toast.type === 'success'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <svg v-else-if="toast.type === 'error'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        {{ toast.msg }}
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.prof-page {
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

.tabs-wrap {
  width: fit-content;
  max-width: 100%;
  margin: 0 auto;
  display: block;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 0.25rem;
}
.tabs-wrap::-webkit-scrollbar { display: none; }


.tab-content { flex: 1; }
.section { display: flex; flex-direction: column; gap: var(--space-md); }

.section-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  flex-wrap: wrap;
}
.section-lead {
  font-size: var(--font-size-sm);
  color: var(--color-primary-hover);
  line-height: 1.65;
  margin: 0;
  padding-top: 0.2rem;
}


.filter-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font: inherit;
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  letter-spacing: 0.04em;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.14);
  background: rgba(var(--color-primary-rgb), 0.03);
  color: var(--color-primary-hover);
  cursor: pointer;
  transition: var(--transition-fast);
  white-space: nowrap;
}
.filter-chip:hover {
  border-color: rgba(var(--color-secondary-rgb), 0.35);
  color: var(--color-secondary);
  background: rgba(var(--color-secondary-rgb), 0.06);
}
.filter-chip--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-background);
}
.filter-chip--active:hover {
  background: var(--color-primary);
  color: var(--color-background);
}
.filter-chip__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  border-radius: 999px;
  background: rgba(var(--color-secondary-rgb), 0.18);
  color: var(--color-secondary);
  font-size: 0.6rem;
  font-weight: var(--font-bold);
  padding: 0 4px;
}
.filter-chip--active .filter-chip__count {
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
}


.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
  gap: var(--space-sm);
}


.req-card {
  position: relative;
  background: var(--color-background);
  border: 1px solid rgba(var(--color-primary-rgb), 0.09);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
}
.req-card--compact {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: var(--space-md);
}
.req-card--compact:hover {
  border-color: rgba(var(--color-secondary-rgb), 0.35);
  box-shadow: 0 6px 22px rgba(var(--color-primary-rgb), 0.08);
  transform: translateY(-2px);
}
.req-card__accent {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 3px;
  background: rgba(var(--color-secondary-rgb), 0.35);
  transition: background var(--transition-normal);
}
.req-card--validated .req-card__accent { background: var(--color-success); }
.req-card--refused   .req-card__accent { background: var(--color-error); }
.req-card--validated,
.req-card--refused { opacity: 0.82; }

.req-card__compact-body {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  margin-top: 6px;
}
.req-card__compact-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.req-card__compact-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-xs);
  width: 100%;
  margin-bottom: 2px;
}
.req-card__student-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  line-height: 1;
  margin: 0;
  flex: 1;
  min-width: 0;
  word-break: break-word;
}
.req-card__compact-title {
  font-size: var(--font-size-xs);
  color: rgba(var(--color-primary-rgb), 0.7);
  line-height: 1.45;
  margin: 0;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.req-card__click-hint {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.06);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  color: rgba(var(--color-secondary-rgb), 0.7);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: color var(--transition-fast);
}
.req-card--compact:hover .req-card__click-hint { color: var(--color-secondary); }


.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  min-height: 10rem;
  color: rgba(var(--color-primary-rgb), 0.35);
  font-size: var(--font-size-sm);
  text-align: center;
}


.avatar {
  width: 38px; height: 38px;
  border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-weight: var(--font-bold); font-size: var(--font-size-xs);
  background: rgba(var(--color-secondary-rgb), 0.14);
  color: var(--color-secondary);
}
.avatar--sm { width: 28px; height: 28px; font-size: var(--font-size-xxs); }

.tags { display: flex; flex-wrap: wrap; gap: 5px; }
.tag {
  font-size: var(--font-size-xxs); font-weight: var(--font-medium);
  padding: 3px 8px; border-radius: 999px;
  background: rgba(var(--color-primary-rgb), 0.05);
  color: var(--color-primary-hover);
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
}

.badge {
  display: inline-flex; align-items: center;
  font-size: var(--font-size-xxs); font-weight: var(--font-medium);
  letter-spacing: 0.05em; padding: 3px 9px;
  border-radius: 999px; white-space: nowrap; flex-shrink: 0;
}
.badge--pending  { background: rgba(var(--color-secondary-rgb), 0.13); color: #7a4700; }
.badge--success  { background: rgba(var(--color-success-rgb), 0.12);   color: var(--color-success); }
.badge--error    { background: rgba(var(--color-error-rgb), 0.1);      color: var(--color-error); }


.doc-chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: var(--font-size-xxs); font-weight: var(--font-medium);
  color: var(--color-secondary); text-decoration: none;
  padding: 4px 10px; border-radius: var(--radius-sm);
  border: 1px solid rgba(var(--color-secondary-rgb), 0.2);
  background: rgba(var(--color-secondary-rgb), 0.06);
  transition: var(--transition-fast); cursor: pointer;
}
.doc-chip:hover { background: rgba(var(--color-secondary-rgb), 0.13); }
.detail-links { display: flex; gap: var(--space-xs); flex-wrap: wrap; }

.act-btn {
  display: inline-flex; align-items: center; gap: 5px;
  font: inherit; font-size: var(--font-size-xs); font-weight: var(--font-medium);
  padding: 0.55rem 1rem; border-radius: 0.65rem;
  cursor: pointer; border: 1px solid transparent;
  transition: var(--transition-fast); white-space: nowrap;
}
.act-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.act-btn--validate {
  background: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success); border-color: rgba(var(--color-success-rgb), 0.22);
}
.act-btn--validate:hover:not(:disabled) { background: rgba(var(--color-success-rgb), 0.18); transform: translateY(-1px); }

.act-btn--refuse {
  background: rgba(var(--color-error-rgb), 0.07);
  color: var(--color-error); border-color: rgba(var(--color-error-rgb), 0.18);
}
.act-btn--refuse:hover:not(:disabled) { background: rgba(var(--color-error-rgb), 0.13); transform: translateY(-1px); }

.act-btn--comment {
  background: rgba(var(--color-primary-rgb), 0.05);
  color: var(--color-primary-hover); border-color: rgba(var(--color-primary-rgb), 0.12);
}
.act-btn--comment:hover:not(:disabled) { background: rgba(var(--color-primary-rgb), 0.1); transform: translateY(-1px); }

.act-btn--refuse-confirm {
  background: var(--color-error); color: #fff; border-color: transparent;
  padding: 0.6rem 1.2rem; border-radius: 0.8rem; font-size: var(--font-size-sm);
}
.act-btn--refuse-confirm:hover:not(:disabled) { background: color-mix(in srgb, var(--color-error) 85%, black); transform: translateY(-1px); }

.act-btn--comment-confirm {
  background: var(--color-primary); color: var(--color-background); border-color: transparent;
  padding: 0.6rem 1.2rem; border-radius: 0.8rem; font-size: var(--font-size-sm);
}
.act-btn--comment-confirm:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }

.toast {
  position: fixed; bottom: var(--space-lg); right: var(--space-lg); z-index: 2000;
  display: flex; align-items: center; gap: var(--space-sm);
  padding: 0.65rem var(--space-md); border-radius: var(--radius-md);
  font-size: var(--font-size-sm); font-weight: var(--font-medium);
  max-width: 28rem; box-shadow: 0 8px 24px rgba(var(--color-primary-rgb), 0.14);
}
.toast--success { background: var(--color-success); color: #fff; }
.toast--error   { background: var(--color-error);   color: #fff; }
.toast--info    { background: var(--color-primary);  color: var(--color-background); }

.slide-enter-active, .slide-leave-active { transition: opacity var(--transition-normal), transform var(--transition-normal); }
.slide-enter-from  { opacity: 0; transform: translateX(0.6rem); }
.slide-leave-to    { opacity: 0; transform: translateX(-0.6rem); }

.fade-enter-active, .fade-leave-active { transition: opacity var(--transition-normal); }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: opacity var(--transition-normal), transform var(--transition-normal); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(0.5rem); }

.dropdown-enter-active, .dropdown-leave-active { transition: opacity var(--transition-fast), transform var(--transition-fast); }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-0.25rem); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(0.75rem); }
.toast-enter-active, .toast-leave-active { transition: opacity var(--transition-normal), transform var(--transition-normal); }

.field-reveal-enter-active, .field-reveal-leave-active {
  overflow: hidden;
  transition: opacity var(--transition-normal), max-height var(--transition-normal), margin-top var(--transition-normal);
}
.field-reveal-enter-from, .field-reveal-leave-to { opacity: 0; max-height: 0; margin-top: 0; }
.field-reveal-enter-to, .field-reveal-leave-from  { opacity: 1; max-height: 16rem; }


@media (max-width: 680px) {
  .section-top { flex-direction: column; }
  .filter-chips { width: 100%; }
}

@media (max-width: 600px) {
  .prof-page { padding: var(--space-md) var(--space-sm); }
  .page-header { flex-direction: column; align-items: flex-start; }
  .page-header__stats { width: 100%; flex-direction: column; gap: var(--space-xs); }
  .stat-chip { width: 100%; flex: none; }
  .tabs-wrap { max-width: 100%; width: 100%; }
  .cards-grid { 
    grid-template-columns: 1fr; 
    gap: var(--space-xs);
  }
  .section { padding-top: var(--space-sm); }
  .section-top { flex-direction: column; }
}
</style>