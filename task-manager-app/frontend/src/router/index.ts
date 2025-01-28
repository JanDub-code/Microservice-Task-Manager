import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginCallbackView from '../views/LoginCallbackView.vue'
import HomeviewOld from "@/views/HomeviewOld.vue";
import CreateTask from "@/views/CreateTask.vue";
import JoinTeam from "@/views/JoinTeam.vue";
import CreateTeam from "@/views/CreateTeam.vue";
import TeamDashboard from "@/views/TeamDashboard.vue";
import TeamManagement from "@/views/TeamManagement.vue";
import TeamNotifications from "@/views/TeamNotifications.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login-callback',
      name: 'login-callback',
      component: LoginCallbackView,
    },
    {
      path: '/homeold',
      name: 'homeold',
      component: HomeviewOld,
    },
    {
      path: '/createTask',
      name: 'createTask',
      component: CreateTask,
    },
    {
      path: '/createTeam',
      name: 'createTeam',
      component: CreateTeam,
    },
    {
      path: '/joinTeam',
      name: 'joinTeam',
      component: JoinTeam,
    },
    {
      path: '/teamDashboard',
      name: 'teamDashboard',
      component: TeamDashboard,
    },
    {
      path: '/teamManagement',
      name: 'teamManagement',
      component: TeamManagement,
    },
    {
      path: '/TeamNotifications',
      name: 'TeamNotifications',
      component: TeamNotifications,
    }
  ],
})

export default router
