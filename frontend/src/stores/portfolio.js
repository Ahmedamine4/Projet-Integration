import { defineStore } from "pinia";
import { useAuthStore } from "./auth";

export const usePortfolioStore = defineStore('portfolio', {
    state: () => ({
        portfolios: []
    }),
    getters: {
        filteredPortfolios(state) {
            const authStore = useAuthStore();
            const user = authStore.user;
            if (!user) return [];
            if (user.role === 'student') {
                return state.portfolios.filter(p => 
                    p.owner === user.name ||
                    p.isPublic
                );
            }
            return state.portfolios.filter(p => p.isPublic);
        }
    },
    actions: {
        createPortfolio(name, ownerName) {
            if (this.portfolios.find(p => p.owner === ownerName)) {
                throw new Error('You already have a portfolio');
            }
            if (!name.trim()) throw new Error('Portfolio name required');
            this.portfolios.push({
                name: name.trim(),
                owner: ownerName,
                isPublic: true
            });
        }
    }
})