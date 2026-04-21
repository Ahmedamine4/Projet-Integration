<script setup>
    import { ref } from 'vue';
    import { useAuthStore } from '@/stores/auth';
    import { usePortfolioStore } from '@/stores/portfolio';
    import BaseButton from '@/components/BaseButton.vue';
    import BaseCard from '@/components/BaseCard.vue';
    import BaseInput from '@/components/BaseInput.vue';

    const authStore = useAuthStore();
    const portfolioStore = usePortfolioStore();
    const newPortfolio = ref('');
    const createError = ref('');

    const createPortfolioHandler = () => {
        try {
            portfolioStore.createPortfolio(newPortfolio.value, authStore.user.name);
            newPortfolio.value = '';
            createError.value = '';
        }
        catch(err) {
            createError.value = err.message;
        }
    }
</script>

<template>
    <div >
        <h2>Dashboard</h2>
        <p>Hello {{authStore.user?.name}} ({{authStore.user?.role}})</p>
        <BaseCard
            v-if="authStore.user?.role === 'student'"
            class="card--panel"
            full-width
            title="Create Portfolio"
            title-level="h3"
        >
            <BaseInput v-model="newPortfolio" label="Portfolio name" placeholder="Portfolio name" />
            <p class="error">{{createError}}</p>
            <BaseButton @click="createPortfolioHandler">Create</BaseButton>
        </BaseCard>
        <BaseCard class="card--panel" full-width title="Potfolios" title-level="h3">
            <ul>
                <li v-for="p in portfolioStore.filteredPortfolios" :key="p.name">
                    {{p.name}} - {{p.owner}}
                </li>
            </ul>
        </BaseCard>
    </div>
</template>
