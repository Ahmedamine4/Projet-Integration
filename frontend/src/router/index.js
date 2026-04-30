import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from '../stores/auth';
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import DashboardView from "../views/DashboardView.vue";
import AuthCallbackView from "@/views/AuthCallbackView.vue";
import NotFound from "@/views/NotFound.vue";
import GettingStarted from "@/views/GettingStarted.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { layout: 'auth' }
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
    meta: { layout: 'auth' }
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView,
    meta: {
      requiresAuth: true,
      layout: 'app',
    }
  },
  {
    path: "/getting-started",
    name: "getting-started",
    component: GettingStarted,
    meta: {
      requiresAuth: true,
      layout: 'app',
    }
  },
  {
    path: "/auth/callback",
    name: "auth-callback",
    component: AuthCallbackView,
    meta: { layout: 'auth' }
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
});
router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login';
  }
  
  return true;
})

export default router
