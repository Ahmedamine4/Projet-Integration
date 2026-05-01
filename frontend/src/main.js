import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./assets/styles/main.css";
import { useAuthStore } from "./stores/auth";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

const authStore = useAuthStore();



// PAUSE AVANT LE DÉMARRAGE (BUG F5)
// Au rafraîchissement de la page, le store se vide. 
// On attend donc que fetchProfile() vérifie cookie httpOnly auprès du backend AVANT de lancer le routeur.
// Cela évite qu'un utilisateur connecté soit redirigé à tort vers /login !
authStore.fetchProfile().finally(() => {
    app.use(router);
    app.mount("#app");
});