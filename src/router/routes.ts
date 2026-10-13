import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/market' },
      { path: 'market', name: 'market', component: () => import('pages/market/index.vue') },
      { path: 'map', name: 'map', component: () => import('pages/map/index.vue') },
      { path: 'bank', name: 'bank', component: () => import('pages/bank/index.vue') },
    ],
  },
  { path: '/:catchAll(.*)*', redirect: '/market' },
];

export default routes;
