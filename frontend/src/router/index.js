import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component:  () => import(/* webpackChunkName: "about" */ '../components/home.vue')
  },
  {
    path: '/glist',
    name: 'glist',
    component: () => import(/* webpackChunkName: "about" */ '../components/gua_list.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "about" */ '../components/HelloWorld.vue')
  },
  {
    path: '/gcal',
    name: 'gcal',
    component: () => import(/* webpackChunkName: "about" */ '../components/gua_calendar.vue')
  },
  {
    path: '/gmy',
    name: 'gmy',
    component: () => import(/* webpackChunkName: "about" */ '../components/gua_mypage.vue')
  },
  {
    path: '/gnote',
    name: 'gnote',
    component: () => import(/* webpackChunkName: "about" */ '../components/gua_note.vue')
  },
  {
    path: '/gnote/post',
    name: 'gnote_post',
    component: () => import(/* webpackChunkName: "about" */ '../components/gua_note_post.vue')
  },
  {
    path: '/gnote/view',
    name: 'gnote_view',
    component: () => import(/* webpackChunkName: "about" */ '../components/gua_note_view.vue')
  },
  {
    path: '/gnote/edit',
    name: 'gnote_edit',
    component: () => import(/* webpackChunkName: "about" */ '../components/gua_note_edit.vue')
  },
  {
    path: '/chatRoom',
    name: 'chatRoom',
    component: () => import(/* webpackChunkName: "about" */ '../components/gua_chat_room.vue')
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import(/* webpackChunkName: "about" */ '../components/gua_chat_list.vue')
  },
]

const router = createRouter({
  mode: 'history',
  history: createWebHistory(),
  routes: routes,
  
})

export default router
