<script setup>
import { computed, ref, watch } from 'vue';
import { Calendar, FileText, Code, Award, User, MessageCircle } from 'lucide-vue-next';

const props = defineProps({
  open: Boolean,
  item: Object,
  itemType: {
    type: String,
    validator: (value) => ['', 'stage', 'projet', 'recommandation'].includes(value),
  },
});
const emit = defineEmits(['close', 'submit-decision']);

const mode = ref('view');
const detailComment = ref('');
const detailCommentError = ref('');

const selectedFile = ref(null);
const fileInput = ref(null);

function onFileChange(event) {
  selectedFile.value = event.target.files[0];
}

watch(
  () => props.open,
  (open) => {
    if (!open) {
      mode.value = 'view';
      detailComment.value = '';
      detailCommentError.value = '';
    }
  }
);

const status = computed(() => props.item?.status || props.item?.statut);
const isActionable = computed(() => status.value === 'pending');
const techTags = computed(() => {
  const technologies = props.item?.technologies || [];
  const domains = props.item?.domaines || [];
  return [...(technologies || []), ...(domains || [])].filter(Boolean);
});

const documents = computed(() => {
  const docs = [];
  if (props.item?.rapport_stage) docs.push({ label: 'Rapport de stage', url: props.item.rapport_stage });
  if (props.item?.documentation) docs.push({ label: 'Documentation', url: props.item.documentation });
  if (Array.isArray(props.item?.documentations) && props.item.documentations.length) {
    props.item.documentations.forEach((d, i) => {
      if (!d) return;
      if (typeof d === 'string') docs.push({ label: `Document ${i + 1}`, url: d });
      else docs.push({ label: d.label || d.name || `Document ${i + 1}`, url: d.url || d.value || d.lien || d.path });
    });
  }
  return docs;
});
void documents;

const statusMap = {
  pending:   { label: 'En attente', cls: 'badge--pending' },
  validated: { label: 'Validé',     cls: 'badge--success' },
  refused:   { label: 'Refusé',     cls: 'badge--error'   },
};

function handleClose() {
  mode.value = 'view';
  detailComment.value = '';
  detailCommentError.value = '';
  emit('close');
}

function initials(s) {
  const first = s?.firstName || s?.prenom || 'U';
  const last = s?.lastName || s?.nom || '';
  return `${(first[0] || 'U')}${(last[0] || '')}`.toUpperCase();
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function setMode(newMode) {
  mode.value = newMode;
  detailComment.value = '';
  detailCommentError.value = '';
}

function submitDecision(actionType) {
  if (!props.item) return;

  if (props.itemType === 'recommandation' && actionType === 'validate' && mode.value !== 'validate') {
    setMode('validate');
    return;
  }
  const comment = detailComment.value.trim();
  if ((actionType === 'refuse' || actionType === 'comment') && !comment) {
    detailCommentError.value = 'Ce champ est requis.';
    return;
  }

  const payload = {};
  if (actionType === 'validate') {
    payload.statut = 'valide';
    if (comment) payload.commentaire = comment;
  } else if (actionType === 'refuse') {
    payload.statut = 'refuse';
    payload.commentaire = comment;
  } else if (actionType === 'comment') {
    payload.commentaire = comment;
  }
  if (actionType === 'validate' && selectedFile.value) {
    payload.fichier = selectedFile.value;
  }

  emit('submit-decision', {
    actionType,
    itemType: props.itemType,
    experienceId: props.item.experience_id || props.item.id,
    payload,
    comment,
  });
}
</script>

<template>
  <Transition name="pop-up">
    <div v-if="open && item" class="modal-overlay" @click.self="handleClose">
      <div class="detail-modal">
        <div class="detail-modal__header">
          <div class="detail-modal__header-info">
            <div class="avatar">{{ initials(item.student) }}</div>
            <div>
              <p class="detail-modal__student-name">
                {{ item.student?.firstName }} {{ item.student?.lastName }}
              </p>
            </div>
            <span class="badge" :class="statusMap[status]?.cls">
              {{ statusMap[status]?.label }}
            </span>
          </div>
          <button class="close-button" type="button" @click="handleClose">
            ✕
          </button>
        </div>

        <div class="detail-modal__body">
          <h2 class="detail-modal__title" v-if="item.titre">{{ item.titre }}</h2>

          <div class="detail-info-grid">
            <div v-if="item.date_experience" class="detail-info-item">
              <div class="modal-label">
                <Calendar size="14" />
                <span>Date</span>
              </div>
              <span class="detail-info-value">{{ formatDate(item.date_experience) }}</span>
            </div>
            <div v-if="item.duree" class="detail-info-item">
              <div class="modal-label">
                <FileText size="14" />
                <span>Durée</span>
              </div>
              <span class="detail-info-value">{{ item.duree }}</span>
            </div>
            <div v-if="item.role" class="detail-info-item">
              <div class="modal-label">
                <User size="14" />
                <span>Rôle</span>
              </div>
              <span class="detail-info-value">{{ item.role }}</span>
            </div>
            <div v-if="item.resultat_obtenus" class="detail-info-item">
              <div class="modal-label">
                <Award size="14" />
                <span>Résultats</span>
              </div>
              <span class="detail-info-value">{{ item.resultat_obtenus }}</span>
            </div>
            <div v-if="item.photo" class="detail-info-item">
              <div class="modal-label">
                <FileText size="14" />
                <span>Photo</span>
              </div>
              <span class="detail-info-value">
                <img :src="item.photo" alt="Project photo" class="project-photo" />
              </span>
            </div>
          </div>

          <div v-if="item.description" class="detail-section">
            <div class="modal-label">
              <FileText size="14" />
              <span>Description</span>
            </div>
            <p class="detail-section-text">{{ item.description }}</p>
          </div>

          <div v-if="item.missions_realisees" class="detail-section">
            <div class="modal-label">
              <FileText size="14" />
              <span>Missions réalisées</span>
            </div>
            <p class="detail-section-text">{{ item.missions_realisees }}</p>
          </div>

          <div v-if="techTags.length" class="detail-section">
            <div class="modal-label">
              <Code size="14" />
              <span>Technologies & Domaines</span>
            </div>
            <div class="tags">
              <span v-for="t in techTags" :key="t" class="tag">{{ t }}</span>
            </div>
          </div>

          <div v-if="item.lien_github || item.lien_youtube" class="detail-section">
            <div class="modal-label">
              <Code size="14" />
              <span>Liens</span>
            </div>
            <div class="detail-links">
              <a v-if="item.lien_github" class="doc-chip" :href="item.lien_github" target="_blank">
                GitHub
              </a>
              <a v-if="item.lien_youtube" class="doc-chip" :href="item.lien_youtube" target="_blank">
                Démo vidéo
              </a>
            </div>
          </div>

          <div v-if="documents.length" class="detail-section">
            <div class="modal-label">
              <FileText size="14" />
              <span>Documents</span>
            </div>
            <div class="detail-links">
              <a v-for="(d, i) in documents" :key="i" class="doc-chip" :href="d.url" target="_blank">
                {{ d.label }}
              </a>
            </div>
          </div>

          <div v-if="item.comments && item.comments.length" class="detail-section">
            <div class="modal-label">
              <MessageCircle size="14" />
              <span>Demande de modification</span>
            </div>
            <div class="comments-thread">
              <div v-for="(c, i) in item.comments" :key="i" class="comment">
                <div class="comment__header">
                  <span class="comment__author">{{ c.author }}</span>
                  <span class="comment__date">{{ formatDate(c.date) }}</span>
                </div>
                <p class="comment__text">{{ c.text }}</p>
              </div>
            </div>
          </div>

          <Transition name="field-reveal">
            <div>
            <div v-if="mode === 'comment' || mode === 'refuse'" class="detail-action-form">
              <label class="modal-label">
                {{ mode === 'refuse' ? 'Motif du refus *' : 'Votre message *' }}
              </label>
              <textarea
                v-model="detailComment"
                class="modal__textarea"
                :class="{ 'modal__textarea--error': detailCommentError }"
                :placeholder="mode === 'refuse'
                  ? 'Expliquez clairement la raison du refus à l\'étudiant...'
                  : 'Ex : Merci de corriger la section 3 et d\'ajouter les métriques avant la prochaine soumission...'"
                rows="4"
                @input="detailCommentError = ''"
              />
              <p v-if="detailCommentError" class="field-error">{{ detailCommentError }}</p>
            </div>
            <div v-if="itemType === 'recommandation' && mode === 'validate'" class="detail-action-form">
              <label class="modal-label">Upload de la lettre (PDF) *</label>
              <input type="file" ref="fileInput" @change="onFileChange" accept="application/pdf" />
            </div>
            </div>
          </Transition>
        </div>

        <div class="detail-modal__footer">
          <template v-if="mode === 'view'">
            <template v-if="isActionable">
              <button class="act-btn act-btn--comment" @click="setMode('comment')" type="button">
                Commenter
              </button>
              <button class="act-btn act-btn--refuse" @click="setMode('refuse')" type="button">
                Refuser
              </button>
              <button class="act-btn act-btn--validate" @click="submitDecision('validate')" type="button">
                Valider
              </button>
            </template>
          </template>

          <template v-else>
  <button class="act-btn act-btn--ghost" @click="setMode('view')" type="button">Annuler</button>
  <button
    class="act-btn"
    :class="mode === 'refuse' ? 'act-btn--refuse-confirm' : 'act-btn--comment-confirm'"
    @click="submitDecision(mode)"
    type="button"
  >
    {{ mode === 'refuse' ? 'Confirmer le refus' : (mode === 'validate' ? 'Confirmer la validation' : 'Envoyer le commentaire') }}
  </button>
</template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(var(--color-primary-rgb), 0.3);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: var(--space-lg);
}

.detail-modal {
  background: var(--color-background);
  width: min(42rem, 100%);
  max-height: min(88vh, 860px);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius-md);
  box-shadow: 0 20px 60px rgba(var(--color-primary-rgb), 0.16);
  display: flex; flex-direction: column;
  overflow: hidden;
}

.detail-modal__header {
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
}
.detail-modal__header-info {
  display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap; min-width: 0;
}
.detail-modal__student-name {
  font-size: var(--font-size-sm); font-weight: var(--font-medium); margin: 0;
}

.close-button {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  color: var(--color-primary-hover);
}

.detail-modal__body {
  flex: 1; min-height: 0; overflow-y: auto;
  padding: var(--space-lg);
  display: flex; flex-direction: column; gap: var(--space-md);
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--color-primary-rgb), 0.15) transparent;
}
.detail-modal__body::-webkit-scrollbar { width: 5px; }
.detail-modal__body::-webkit-scrollbar-thumb { background: rgba(var(--color-primary-rgb), 0.15); border-radius: 999px; }

.detail-modal__title {
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  font-weight: 600;
  line-height: 1.25;
  margin: 0;
  letter-spacing: -0.01em;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  gap: var(--space-sm);
}
.detail-info-item {
  display: flex; flex-direction: column; gap: 3px;
  padding: 0.55rem 0.75rem;
  background: rgba(var(--color-surface-rgb), 0.45);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(var(--color-primary-rgb), 0.07);
}
.modal-label {
  display: inline-flex; align-items: center; gap: 0.4rem;
  font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; color: rgba(var(--color-primary-rgb), 0.55);
}
.detail-info-value {
  font-size: var(--font-size-sm); color: var(--color-primary);
}

.detail-section { display: flex; flex-direction: column; gap: var(--space-xs); }
.detail-section-text {
  font-size: var(--font-size-sm); line-height: 1.65;
  color: rgba(var(--color-primary-rgb), 0.8); margin: 0;
}

.project-photo {
  max-height: 80px;
  object-fit: cover;
  border-radius: 6px;
}

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
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  letter-spacing: 0.05em;
  padding: 3px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
.badge--pending { background: rgba(var(--color-secondary-rgb), 0.13); color: #7a4700; }
.badge--success { background: rgba(var(--color-success-rgb), 0.12); color: var(--color-success); }
.badge--error { background: rgba(var(--color-error-rgb), 0.1); color: var(--color-error); }

.detail-links { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.doc-chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: var(--font-size-xxs); font-weight: var(--font-medium);
  color: var(--color-secondary); text-decoration: none;
  padding: 4px 10px; border-radius: var(--radius-sm);
  border: 1px solid rgba(var(--color-secondary-rgb), 0.2);
  background: rgba(var(--color-secondary-rgb), 0.06);
}
.doc-chip:hover { background: rgba(var(--color-secondary-rgb), 0.13); }

.comments-thread {
  border-left: 2px solid rgba(var(--color-secondary-rgb), 0.25);
  padding-left: var(--space-sm);
  display: flex; flex-direction: column; gap: var(--space-xs);
}
.comment__header {
  display: flex; align-items: center; gap: var(--space-sm); margin-bottom: 3px;
}
.comment__author {
  font-size: var(--font-size-xxs); font-weight: var(--font-medium); color: var(--color-secondary);
}
.comment__date { font-size: var(--font-size-xxs); color: rgba(var(--color-primary-rgb), 0.45); }
.comment__text {
  font-size: var(--font-size-xs); color: rgba(var(--color-primary-rgb), 0.75);
  line-height: 1.55; margin: 0;
}

.detail-action-form {
  display: flex; flex-direction: column; gap: var(--space-xs);
  padding: var(--space-md);
  background: rgba(var(--color-surface-rgb), 0.35);
  border-radius: var(--radius-md);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.modal__textarea {
  width: 100%; resize: vertical; min-height: 90px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.16);
  border-radius: 0.8rem; padding: 0.65rem 0.85rem;
  background: rgba(var(--color-surface-rgb), 0.32);
  color: var(--color-primary); font: inherit; font-size: var(--font-size-sm); line-height: 1.55;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.modal__textarea:focus {
  outline: none; border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.13);
}
.modal__textarea--error { border-color: var(--color-error); }
.field-error { font-size: var(--font-size-xs); color: var(--color-error); margin: 0; }

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

.act-btn--ghost {
  background: transparent; color: var(--color-primary); border-color: rgba(var(--color-primary-rgb), 0.08);
}

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

.detail-modal__footer {
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: flex-end;
  gap: var(--space-sm); flex-wrap: wrap;
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.pop-up-enter-from, .pop-up-leave-to { opacity: 0; }
.pop-up-enter-active, .pop-up-leave-active { transition: opacity var(--transition-normal); }
.pop-up-enter-from .detail-modal, .pop-up-leave-to .detail-modal { transform: scale(0.97) translateY(0.5rem); }
.pop-up-enter-active .detail-modal, .pop-up-leave-active .detail-modal { transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }

.field-reveal-enter-active, .field-reveal-leave-active {
  overflow: hidden;
  transition: opacity var(--transition-normal), max-height var(--transition-normal), margin-top var(--transition-normal);
}
.field-reveal-enter-from, .field-reveal-leave-to { opacity: 0; max-height: 0; margin-top: 0; }
.field-reveal-enter-to, .field-reveal-leave-from  { opacity: 1; max-height: 16rem; }

@media (max-width: 600px) {
  .modal-overlay { padding: 0; align-items: flex-end; }
  .detail-modal {
    width: 100vw; max-width: 100vw; margin: 0;
    border-radius: var(--radius-md) var(--radius-md) 0 0; max-height: 85vh;
  }
  .detail-modal__body { padding: calc(var(--space-md) + env(safe-area-inset-top, 0px)); }
  .detail-modal__footer { padding: calc(var(--space-md) + env(safe-area-inset-bottom, 0px)); }
}
</style>
