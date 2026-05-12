<script setup>
import { useAuthStore } from '@/stores/auth';
import src from '@/assets/profile-photo.png'
import AboutMe from '@/components/portfolio/AboutMe.vue';
import Button from '@/components/common/Button.vue';
import { ArrowUpRight } from 'lucide-vue-next';

const authStore = useAuthStore();
const firstName = authStore.user.firstName;
const lastName = authStore.user.lastName;
</script>

<template>
	<div class="portfolio">
		<div class="portfolio__banner" />
		<main>
			<div class="profile">
				<div class="profile__photo">
					<img :src alt="photo">
					<button class="contact-button">
						<ArrowUpRight />
						<span>Contact me</span>
					</button>
				</div>
				<div class="profile__info">
					<h2 class="name"> Alex Thomson </h2>
					<span>Engineering Student at <strong>ENSAT</strong></span>
					<div class="statistics">
						<div>
							<span>Followers</span>
							<h2>439</h2>
						</div>
						<div>
							<span>Followings</span>
							<h2>102</h2>
						</div>
						<div>
							<span>Score</span>
							<h2>152</h2>
						</div>
					</div>
					<div class="actions">
						<Button variant="pill" block size="xs">Follow</Button>
						<Button variant="ghost" block size="xs">Recommend</Button>
					</div>
				</div>
			</div>
			<div class="about">
				<AboutMe :user-id="authStore.user.utilisateur_id" />
				<AboutMe :user-id="authStore.user.utilisateur_id" />
			</div>
		</main>
	</div>
</template>

<style scoped>
.portfolio__banner {
	width: 100%;
	height: 7.5rem;
  background:
    linear-gradient(
      165deg,
      rgba(var(--color-secondary-rgb), 0.34),
      transparent 45%
    ),
    linear-gradient(
      180deg,
      rgba(var(--color-background-rgb), 0.95),
      var(--color-surface)
    );
}

.portfolio main {
	display: flex;
	flex-direction: column;
	gap: var(--space-xl);
	padding: 0 clamp(var(--space-md), 8vw, calc(var(--space-xl) * 5));
}

.profile {
	display: flex;
	gap: var(--space-lg);
}

.profile__photo {
	position: relative;
	display: flex;
	justify-content: center;
	flex: 0 0 12rem;
	width: 12rem;
	height: 12rem;
	transform: translateY(calc(var(--space-lg) * -1.5));
	background-color: var(--color-surface);
	border-radius: calc(var(--radius-lg) * 3.5);
}

.profile__photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile__info {
	display: flex;
	font-family: var(--font-ui);
	flex-direction: column;
	gap: var(--space-sm);
	padding: var(--space-lg) 0;
}

.name {
	margin: 0;
	font-size: calc(var(--font-size-lg) + 0.6rem);
	font-weight: var(--font-bold);
	color: var(--color-primary);
}

.profile__info > span {
	font-size: var(--font-size-sm);
	color: rgba(var(--color-primary-rgb), 0.7);
}

.profile__info strong {
	color: rgba(var(--color-primary-rgb), 0.86);
	font-weight: var(--font-bold);
}

.statistics {
	margin-top: var(--space-sm);
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	justify-content: space-between;
	align-items: center;
	gap: var(--space-md);
}

.statistics > div {
	display: flex;
	flex-direction: column;
	gap: var(--space-xs);
}

.statistics span {
	color: rgba(var(--color-primary-rgb), 0.7);
	font-size: var(--font-size-xxs);
	text-transform: uppercase;
	letter-spacing: 0.1em;
}

.statistics h2 {
	margin: 0;
	font-weight: var(--font-bold);
	color: var(--color-primary);
}

.about {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: var(--space-lg);
}

.actions {
	margin-top: var(--space-xs);
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: var(--space-lg);
}

.contact-button {
	display: grid;
	grid-template-columns: 0.5rem 1fr;
	align-items: center;
	gap: var(--space-md);
	position: absolute;
	bottom: calc(var(--space-lg) * -1);
	border: 1.5px solid var(--color-primary);
	border-radius: 999px;
	padding: var(--space-xs) var(--space-md);
	color: var(--color-primary);
	font-size: var(--font-size-xs);
	font-weight: var(--font-bold);
	background-color: var(--color-background);
	cursor: pointer;
}

.contact-button svg {
	width: 1rem;
}
</style>