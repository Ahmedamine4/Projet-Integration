<script setup>
    import { ref } from 'vue';
    import { useAuthStore } from '@/stores/auth';
    import { usePortfolioStore } from '@/stores/portfolio';

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
        <div v-if="authStore.user?.role === 'student'" class="card">
            <h3>Create Portfolio</h3>
            <input v-model="newPortfolio" placeholder="Portfolio name" />
            <p class="error">{{createError}}</p>
            <button @click="createPortfolioHandler">Create</button>
        </div>
        <div class="card">
            <h3>Potfolios</h3>
            <ul>
                <li v-for="p in portfolioStore.filteredPortfolios" :key="p.name">
                    {{p.name}} - {{p.owner}}
                </li>
            </ul>
        </div>
    </div>
</template>