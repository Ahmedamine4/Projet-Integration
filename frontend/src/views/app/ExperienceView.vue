
<script setup>
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  EyeOff,
  Pencil,
  ExternalLink,
  BadgeCheck,
  Trophy,
  Building2,
  MapPin,
} from 'lucide-vue-next';

import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';

const route = useRoute();
const router = useRouter();

const experience = ref(null);
const loading = ref(true);
const error = ref(null);
const canEdit = ref(true);

onMounted(async () => {
  try {
    loading.value = true;

    const experienceId = route.params.experienceId;

    const { data } = await api.get(
      `/users/portfolio/experience/${experienceId}`
    );

    experience.value = data.data;
  } catch (err) {
    error.value = 'Failed to load experience.';
    console.error(err);
  } finally {
    loading.value = false;
  }
});

function goBack() {
  router.back();
}

function editExperience() {
  if (!experience.value?.experience_id) return;

  router.push(`/dashboard/experiences/${experience.value.experience_id}/edit`);
}

function formatDate(date) {
  if (!date) return null;

  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

const type = computed(() => experience.value?.type);

const details = computed(() => experience.value?.details || {});

const typeLabel = computed(() => {
  return {
    projet: 'Project',
    stage: 'Internship',
    certification: 'Certification',
    activite: experience.value?.type_specifique || details.value?.type || 'Activity',
  }[type.value];
});

const title = computed(() => experience.value?.titre);

const imageUrl = computed(() => experience.value?.photo);

const isVisible = computed(() => !!experience.value?.visibilite);

const dateLabel = computed(() => {
  if (!experience.value) return null;

  if (type.value === 'stage') {
    const start = formatDate(experience.value.date_experience);
    const end = formatDate(details.value?.date_fin);

    return end ? `${start} – ${end}` : start;
  }

  return formatDate(experience.value.date_experience);
});

const hasImage = computed(() => !!imageUrl.value);

const hasGithub = computed(() => {
  return type.value === 'projet' && !!details.value?.lien_github;
});

const hasYoutube = computed(() => {
  return type.value === 'projet' && !!details.value?.lien_youtube;
});

const hasTechnologies = computed(() => {
  return experience.value?.technologies?.length > 0;
});

const hasDomains = computed(() => {
  return experience.value?.domaines?.length > 0;
});

const hasSidebar = computed(() => {
  return (
    hasGithub.value ||
    hasYoutube.value ||
    hasTechnologies.value ||
    hasDomains.value
  );
});

const primaryAction = computed(() => {
  if (!experience.value) return null;

  if (type.value === 'stage' && details.value?.rapport_stage) {
    return {
      label: 'View report',
      href: details.value.rapport_stage,
    };
  }

  if (type.value === 'certification' && details.value?.lien_URL) {
    return {
      label: 'Verify certification',
      href: details.value.lien_URL,
    };
  }

  if (type.value === 'certification' && details.value?.document) {
    return {
      label: 'View certificate',
      href: details.value.document,
    };
  }

  return null;
});

const summaryTitle = computed(() => {
  return {
    projet: 'Project summary',
    stage: 'Internship summary',
    certification: 'Certification summary',
    activite: 'Activity summary',
  }[type.value] || 'Summary';
});
</script>

<template>
  <div class="experience-page">
    <button
      type="button"
      class="experience-page__back"
      @click="goBack"
    >
      <ArrowLeft :size="16" />
      Back
    </button>

    <div
      v-if="loading"
      class="experience-page__state"
    >
      Loading experience...
    </div>

    <div
      v-else-if="error"
      class="experience-page__state"
    >
      {{ error }}
    </div>

    <div
      v-else-if="!experience"
      class="experience-page__state"
    >
      Experience not found.
    </div>

    <article
      v-else
      class="experience-page__case-study"
    >
      <button
        v-if="canEdit"
        type="button"
        class="experience-page__edit"
        aria-label="Edit experience"
        @click="editExperience"
      >
        <Pencil :size="17" />
      </button>

      <header class="experience-page__header">
        <div class="experience-page__meta">
          <span class="experience-page__type-badge">
            <BadgeCheck
              v-if="type === 'certification'"
              :size="12"
            />
            <Trophy
              v-else-if="type === 'activite'"
              :size="12"
            />
            <Building2
              v-else-if="type === 'stage'"
              :size="12"
            />
            {{ typeLabel }}
          </span>

          <span
            v-if="dateLabel"
            class="experience-page__date"
          >
            <CalendarDays :size="14" />
            {{ dateLabel }}
          </span>

          <span
            v-if="canEdit"
            class="experience-page__visibility"
          >
            <Eye
              v-if="isVisible"
              :size="14"
            />
            <EyeOff
              v-else
              :size="14"
            />
          </span>
        </div>

        <div class="experience-page__intro">
          <h1>{{ title }}</h1>

          <p
            v-if="type === 'stage' && details.missions_realisees"
            class="experience-page__subtitle"
          >
            {{ details.missions_realisees }}
          </p>

          <p
            v-if="type === 'certification' && details.validation?.institution"
            class="experience-page__subtitle"
          >
            {{ details.validation.institution.nom }}
          </p>
        </div>

        <a
          v-if="primaryAction"
          :href="primaryAction.href"
          target="_blank"
          rel="noopener noreferrer"
          class="experience-page__primary-action"
        >
          {{ primaryAction.label }}
          <ExternalLink :size="14" />
        </a>
      </header>

      <div
        v-if="hasImage"
        class="experience-page__hero"
      >
        <img
          :src="imageUrl"
          :alt="title ? `${title} image` : 'Experience image'"
          draggable="false"
        >
      </div>

      <section class="experience-page__content-grid">
        <aside
          v-if="hasSidebar"
          class="experience-page__sidebar"
        >
          <div
            v-if="hasGithub || hasYoutube"
            class="experience-page__info-block"
          >
            <h2>Links</h2>

            <div class="experience-page__links">
              <a
                v-if="hasGithub"
                :href="details.lien_github"
                target="_blank"
                rel="noopener noreferrer"
                class="experience-page__link"
              >
                GitHub repository
                <ExternalLink :size="14" />
              </a>

              <a
                v-if="hasYoutube"
                :href="details.lien_youtube"
                target="_blank"
                rel="noopener noreferrer"
                class="experience-page__link"
              >
                YouTube demo
                <ExternalLink :size="14" />
              </a>
            </div>
          </div>

          <div
            v-if="hasTechnologies"
            class="experience-page__info-block"
          >
            <h2>Technologies</h2>

            <div class="experience-page__tags">
              <span
                v-for="tech in experience.technologies"
                :key="tech"
                class="experience-page__tag experience-page__tag--tech"
              >
                {{ tech.nom }}
              </span>
            </div>
          </div>

          <div
            v-if="hasDomains"
            class="experience-page__info-block"
          >
            <h2>Domains</h2>

            <div class="experience-page__tags">
              <span
                v-for="domain in experience.domaines"
                :key="domain"
                class="experience-page__tag"
              >
                {{ domain.nom }}
              </span>
            </div>
          </div>
        </aside>

        <main class="experience-page__main">
          <section class="experience-page__section">
            <span class="experience-page__section-label">Overview</span>

            <h2>{{ summaryTitle }}</h2>

            <p v-if="experience.description">
              {{ experience.description }}
            </p>
          </section>

          <section
            v-if="type === 'projet' && details.resultat_obtenu"
            class="experience-page__section"
          >
            <span class="experience-page__section-label">Result</span>

            <h2>Result obtained</h2>

            <p>
              {{ details.resultat_obtenu }}
            </p>
          </section>

          <section
            v-if="type === 'stage' || type === 'activite' || type === 'certification'"
            class="experience-page__facts"
          >
            <template v-if="type === 'stage'">
              <div
                v-if="details.duree"
                class="experience-page__fact"
              >
                <span>Duration</span>
                <span>{{ details.duree }}</span>
              </div>

              <div
                v-if="details.validation?.professeur?.utilisateur"
                class="experience-page__fact"
              >
                <span>Validated by</span>
                <span>
                  {{ details.validation.professeur.utilisateur.prenom }}
                  {{ details.validation.professeur.utilisateur.nom }}
                </span>
              </div>
            </template>

            <template v-if="type === 'activite'">
              <div
                v-if="details.lieu"
                class="experience-page__fact"
              >
                <span>Location</span>
                <span>
                  <MapPin :size="13" />
                  {{ details.lieu }}
                </span>
              </div>

              <div
                v-if="details.clubs?.length"
                class="experience-page__fact"
              >
                <span>Club / Team</span>
                <span>
                  {{ details.clubs.map((club) => club.nom).join(', ') }}
                </span>
              </div>

              <div
                v-if="details.validation?.institution"
                class="experience-page__fact"
              >
                <span>Institution</span>
                <span>{{ details.validation.institution.nom }}</span>
              </div>
            </template>

            <template v-if="type === 'certification'">
              <div
                v-if="details.validation?.institution"
                class="experience-page__fact"
              >
                <span>Issuer</span>
                <span>{{ details.validation.institution.nom }}</span>
              </div>

              <div
                v-if="details.code"
                class="experience-page__fact"
              >
                <span>Credential ID</span>
                <span>{{ details.code }}</span>
              </div>
            </template>
          </section>
        </main>
      </section>
    </article>
  </div>
</template>

<style scoped>
.experience-page {
  position: relative;
  max-width: 95rem;
  margin: 0 auto;
  padding: var(--space-xl) clamp(2rem, 7vw, 7rem) calc(var(--space-xl) * 3);
}

.experience-page__back {
  position: absolute;
  top: calc(var(--space-xl) * 2.6);
  left: clamp(1rem, 2vw, 2.5rem);
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  border: none;
  background: transparent;
  color: rgba(var(--color-primary-rgb), 0.5);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  padding: 0;
  transition: color var(--transition-fast);
}

.experience-page__back:hover {
  color: var(--color-primary);
}

.experience-page__state {
  max-width: 60rem;
  margin: 0 auto;
  padding: calc(var(--space-xl) * 2) 0;
  color: rgba(var(--color-primary-rgb), 0.6);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
}

.experience-page__case-study {
  position: relative;
  max-width: 64rem;
  margin: 0 auto;
  display: grid;
  gap: calc(var(--space-xl) * 1.8);
  padding-top: calc(var(--space-xl) * 1.5);
}

.experience-page__edit {
  position: absolute;
  top: calc(var(--space-xl) * 1.45);
  right: 0;
  width: 2.4rem;
  height: 2.4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  background: rgba(var(--color-primary-rgb), 0.03);
  color: rgba(var(--color-primary-rgb), 0.65);
  cursor: pointer;
  transition:
    color var(--transition-fast),
    background var(--transition-fast),
    border-color var(--transition-fast),
    transform var(--transition-fast);
}

.experience-page__edit:hover {
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.07);
  border-color: rgba(var(--color-primary-rgb), 0.22);
  transform: translateY(-1px);
}

.experience-page__header {
  display: grid;
  gap: var(--space-lg);
  padding-right: 3.5rem;
}

.experience-page__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-sm);
}

.experience-page__type-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  background-color: rgba(var(--color-secondary-rgb), 0.14);
  color: var(--color-secondary);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.experience-page__date,
.experience-page__visibility {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: rgba(var(--color-primary-rgb), 0.52);
  font-size: var(--font-size-xs);
  font-weight: var(--font-medium);
}

.experience-page__intro h1 {
  margin: 0;
  max-width: 56rem;
  font-size: clamp(2rem, 3vw, 4.6rem);
  font-weight: var(--font-bold);
  line-height: 0.98;
  letter-spacing: -0.05em;
  color: var(--color-primary);
  overflow-wrap: anywhere;
}

.experience-page__hero {
  width: 100%;
  aspect-ratio: 16 / 8;
  overflow: hidden;
  border-radius: calc(var(--radius-lg) * 1.2);
  background: rgba(var(--color-primary-rgb), 0.04);
}

.experience-page__hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  -webkit-user-drag: none;
}

.experience-page__content-grid {
  display: grid;
  grid-template-columns: minmax(13rem, 16rem) minmax(0, 1fr);
  gap: calc(var(--space-xl) * 2);
  align-items: start;
}

.experience-page__sidebar {
  position: sticky;
  top: var(--space-xl);
  display: grid;
  gap: var(--space-xl);
  padding-top: var(--space-xs);
}

.experience-page__info-block {
  display: grid;
  gap: var(--space-md);
}

.experience-page__info-block h2 {
  margin: 0;
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  color: rgba(var(--color-primary-rgb), 0.45);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.experience-page__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.experience-page__tag {
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  background: rgba(var(--color-primary-rgb), 0.04);
  color: rgba(var(--color-primary-rgb), 0.58);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-medium);
  line-height: 1;
}

.experience-page__tag--tech {
  background: rgba(var(--color-secondary-rgb), 0.1);
  border-color: rgba(var(--color-secondary-rgb), 0.2);
  color: var(--color-secondary);
}

.experience-page__main {
  display: grid;
  gap: calc(var(--space-xl) * 1.6);
}

.experience-page__section {
  display: grid;
  gap: var(--space-sm);
  padding-bottom: calc(var(--space-xl) * 1.4);
}

.experience-page__section-label {
  color: var(--color-secondary);
  font-size: var(--font-size-xxs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.experience-page__section h2 {
  margin: 0;
  font-size: clamp(1.35rem, 3vw, 2rem);
  line-height: 1.2;
  color: var(--color-primary);
}

.experience-page__section p {
  margin: 0;
  max-width: 42rem;
  font-size: var(--font-size-md, 1rem);
  line-height: 1.85;
  color: rgba(var(--color-primary-rgb), 0.72);
}
.experience-page__link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  width: fit-content;
  color: var(--color-primary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  transition:
    color var(--transition-fast),
    opacity var(--transition-fast),
    transform var(--transition-fast);
}

.experience-page__link:hover {
  color: var(--color-secondary);
  transform: translateX(2px);
}

.experience-page__subtitle {
  margin: var(--space-sm) 0 0;
  max-width: 44rem;
  color: rgba(var(--color-primary-rgb), 0.58);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  line-height: 1.7;
}

.experience-page__primary-action {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  width: fit-content;
  padding: 0.65rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.03);
  text-decoration: none;
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  transition:
    color var(--transition-fast),
    background var(--transition-fast),
    border-color var(--transition-fast),
    transform var(--transition-fast);
}

.experience-page__primary-action:hover {
  color: var(--color-secondary);
  background: rgba(var(--color-primary-rgb), 0.07);
  border-color: rgba(var(--color-primary-rgb), 0.22);
  transform: translateY(-1px);
}

.experience-page__links {
  display: grid;
  gap: var(--space-sm);
}

.experience-page__facts {
  display: grid;
  gap: 0;
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.07);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.07);
}

.experience-page__fact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.06);
}

.experience-page__fact:last-child {
  border-bottom: none;
}

.experience-page__fact span:first-child {
  font-size: var(--font-size-xs);
  font-weight: var(--font-bold);
  color: rgba(var(--color-primary-rgb), 0.45);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.experience-page__fact span:last-child {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  text-align: right;
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  color: rgba(var(--color-primary-rgb), 0.82);
}

@media (max-width: 980px) {
  .experience-page {
    padding-inline: clamp(1.25rem, 5vw, 3rem);
  }

  .experience-page__back {
    position: static;
    margin-bottom: var(--space-xl);
  }

  .experience-page__case-study {
    padding-top: 0;
  }
}

@media (max-width: 820px) {
  .experience-page__content-grid {
    grid-template-columns: 1fr;
    gap: calc(var(--space-xl) * 1.4);
  }

  .experience-page__sidebar {
    position: static;
    order: 2;
  }

  .experience-page__main {
    order: 1;
  }

  .experience-page__hero {
    aspect-ratio: 16 / 10;
    border-radius: var(--radius-lg);
  }
}

@media (max-width: 640px) {
  .experience-page__header {
    padding-right: 3rem;
  }

  .experience-page__intro h1 {
    font-size: 2.2rem;
  }

  .experience-page__hero {
    aspect-ratio: 16 / 11;
  }
}
</style>