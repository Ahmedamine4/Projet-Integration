<script setup>
import { useAuthStore } from '@/stores/auth';
import src from '@/assets/images/profile-photo.png'
import AboutMe from '@/components/portfolio/AboutMe.vue';
import { ArrowUpRight } from 'lucide-vue-next';

const authStore = useAuthStore();
</script>

<template>
	<div class="portfolio">
		<div class="portfolio__banner" />
		<main>
			<div class="profile">
				<div class="profile__photo">
					<img :src alt="photo">
					<button class="contact-button">
						<div>
							<ArrowUpRight :size="13" />
						</div>
						<span>Contact me</span>
					</button>
				</div>
				<div class="profile__info">
					<h2 class="name">Elon Musk</h2>
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
						<button class="follow-button">
							Follow
						</button>
						<button class="recommend-button">
							Recommend
						</button>
					</div>
				</div>
			</div>
			<div class="about">
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
	gap: 2.5rem;
}

.profile__photo {
	--photo-diameter: 11rem;
	position: relative;
	display: flex;
	justify-content: center;
	flex: 0 0 var(--photo-diameter);
	width: var(--photo-diameter);
	height: var(--photo-diameter);
	transform: translateY(calc(var(--space-lg) * -1.5));
	background-color: var(--color-surface);
	border-radius: 40%;
}

.profile__photo img {
	border-radius: inherit;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
	object-position: center top;
}

.profile__info {
	display: flex;
	font-family: var(--font-ui);
	flex-direction: column;
	gap: var(--space-sm);
	padding: var(--space-md) 0;
}

.name {
	margin: 0;
	font-size: calc(var(--font-size-lg) + 0.2rem);
	font-weight: var(--font-bold);
	color: var(--color-primary);
	line-height: 1;
}

.profile__info > span {
	font-size: var(--font-size-xs);
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
	gap: 2.5rem;
}

.statistics > div {
	display: flex;
	flex-direction: column;
	gap: var(--space-xs);
}

.statistics span {
	color: rgba(var(--color-primary-rgb), 0.7);
	font-size: var(--font-size-xxs);
	font-weight: var(--font-bold);
}

.statistics h2 {
	margin: 0;
	font-size: var(--font-size-lg);
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
	grid-template-columns: 1fr 1.3fr;
	gap: var(--space-lg);
}

.contact-button {
	display: grid;
	grid-template-columns: 0.5rem 1fr;
	align-items: center;
	gap: 1.3rem;
	position: absolute;
	bottom: calc(1rem * -1);
	border: 1.5px solid var(--color-primary);
	border-radius: 999px;
	padding-block: var(--space-xs);
	padding-inline: var(--space-xs) 1.2rem;
	color: var(--color-primary);
	font-size: var(--font-size-xxs);
	font-weight: var(--font-bold);
	background: var(--color-background);
	cursor: pointer;
	transition: transform var(--transition-fast);
}

.contact-button:hover {
	transform: translateY(-1px);
}

:is(.contact-button, .follow-button, .recommend-button):focus-visible {
	outline: none;
	border-color: var(--color-secondary);
	box-shadow: 0 0 0 3px rgba(var(--color-secondary-rgb), 0.15);
}

:is(.contact-button, .follow-button, .recommend-button):hover {
	transform: translateY(-1px);
}

.contact-button > div {
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: var(--color-primary);
	width: 1.3rem;
	height: 1.3rem;
	border-radius: 50%;
}

.contact-button svg {
	color: var(--color-background);
}

.follow-button,
.recommend-button {
	font-size: var(--font-size-xs);
	padding: 0.45rem var(--space-md);
	border-radius: var(--radius-md);
	cursor: pointer;
}

.follow-button {
	border: 1.5px solid var(--color-primary);
	background-color: var(--color-primary);
	color: var(--color-background);
	box-shadow: 0 6px 10px rgba(0, 0, 0, 0.38);
	transition:
		background-color var(--transition-fast),
		box-shadow var(--transition-fast),
		transform var(--transition-fast);
}

.follow-button:hover {
	background-color: rgba(var(--color-primary-rgb), 0.92);
  box-shadow: 0 7px 12px rgba(0, 0, 0, 0.34);
}

.recommend-button {
	font-weight: var(--font-bold);
	border: 1.5px solid rgba(var(--color-primary-rgb), 0.78);
	background-color: var(--color-background);
	color: rgba(var(--color-primary-rgb), 0.78);
	transition: transform var(--transition-fast);
}

@media (max-width: 768px) {
	.profile {
		flex-direction: column;
		max-width: fit-content;
		margin: 0 auto;
		gap: 0;
	}

	.profile__photo {
		--photo-diameter: 10rem;
		margin: 0 auto;
	}

	.profile__info {
		text-align: center;
		padding-top: 0;
	}

	.about {
		grid-template-columns: 1fr;
		gap: var(--space-lg);
	}

}
</style>