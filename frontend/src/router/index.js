import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/auth/LoginView.vue';
import RegisterView from '@/views/auth/RegisterView.vue';
import AuthCallbackView from '@/views/auth/AuthCallbackView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
//import DashboardView from '@/views/DashboardView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { layout: 'auth' },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { layout: 'auth' },
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: AuthCallbackView,
    meta: { layout: 'auth' },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/app/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'app',
    },
  },
  {
    path: '/getting-started',
    name: 'getting-started',
    component: () => import('@/views/app/GettingStartedView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'app',
    },
  },
  {
    path: '/portfolio/:id?',
    name: 'portfolio',
    component: () => import('@/views/app/PortfolioView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'app',
    },
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('@/views/app/Test.vue'),
    meta: {
      requiresAuth: true,
      layout: 'app',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
router.beforeEach((to) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => {
    return record.meta.requiresAuth;
  });

  if (requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    };
  }

  return true;
});

export default router;
