import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/auth/LoginView.vue';
import RegisterView from '@/views/auth/RegisterView.vue';
import AuthCallbackView from '@/views/auth/AuthCallbackView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
import PortfolioView from '@/views/app/PortfolioView.vue';


const routes = [
{
  path: '/feed',
  name: 'feed',
  component: () => import('@/views/app/FeedPage.vue'),
  meta: { requiresAuth: true },
},
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
    path: '/dashboard/:id?',
    name: 'dashboard',
    component: () => import('@/views/app/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      role: ['etudiant', 'professionnel'],
      layout: 'app',
    },
  },
  {
    path: '/director-dashboard',
    name: 'director-dashboard',
    component: () => import('@/views/app/DirectorDashboardView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'app',
      role: 'directeur',
    },
  },
  {
    path: '/getting-started',
    name: 'getting-started',
    component: () => import('@/views/app/GettingStartedView.vue'),
    meta: {
      requiresAuth: true,
      role: 'etudiant',
      layout: 'app',
    },
  },
  {
    path: '/portfolio/experience/:experienceId',
    name: 'my-portfolio-experience',
    component: () => import('@/views/app/ExperienceView.vue'),
    meta: {
      requiresAuth: true,
      role: 'etudiant',
      layout: 'app',
    },
  },
  {
    path: '/portfolio/:id/experience/:experienceId',
    name: 'portfolio-experience',
    component: () => import('@/views/app/ExperienceView.vue'),
    meta: {
      requiresAuth: true,
      role: 'etudiant',
      layout: 'app',
    },
  },
  {
    path: '/portfolio/:id?',
    name: 'portfolio',
    component: PortfolioView,
    meta: {
      requiresAuth: true,
      role: 'etudiant',
      layout: 'app',
    },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/app/SettingsView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'app',
    },
  },
  {
    path: '/prof-dashboard',
    name: 'prof-dashboard',
    component: () => import('@/views/app/dashboard/ProfDashboardView.vue'),
    meta: {
      requiresAuth: true,
      role: 'professeur',
      layout: 'app',
    },
  },
  {
  path: '/recruiter-dashboard',
  name: 'recruiter-dashboard',
  component: () => import('@/views/app/dashboard/RecruteurDashboard.vue'),
  meta: {
    requiresAuth: true,
    role: 'professionnel',
    layout: 'app',
  },
},
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
  },
  {
  path: '/admin-dashboard',
  name: 'admin-dashboard',
  component: () => import('@/views/app/AdminDashboardView.vue'),
  meta: {
    requiresAuth: true,
    role: 'administrateur',
    layout: 'app',
  },
},
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  const requiresAuth = to.matched.some((record) => {
    return record.meta.requiresAuth;
  });

  if (requiresAuth && !authStore.profileChecked) {
    await authStore.fetchProfile();
  }

  if (requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    };
  }

  const requiredRole = to.meta.role;
  const userRole = authStore.user?.role;
  const hasRequiredRole = Array.isArray(requiredRole)
    ? requiredRole.includes(userRole)
    : userRole === requiredRole;

  if (requiredRole && !hasRequiredRole) {
    const isPublicPortfolioView =
      ['portfolio', 'portfolio-experience'].includes(to.name) && to.params.id;

    if (isPublicPortfolioView) {
      return true;
    }

    const redirects = {
      professeur: '/prof-dashboard',
      professionnel: '/recruiter-dashboard',
      etudiant: '/dashboard',
      directeur: '/director-dashboard',
      administrateur: '/admin-dashboard',
    };

    return {
      path: redirects[userRole] || '/dashboard',
    };
  }

  return true;
});

export default router;
