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

app.use(router);
app.mount("#app");

authStore.fetchProfile().then(() => {
  const currentRoute = router.currentRoute.value;
  const requiresAuth = currentRoute.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated) {
    router.replace({
      name: 'login',
      query: { redirect: currentRoute.fullPath },
    });
  }
});
