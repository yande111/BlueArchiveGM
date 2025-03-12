import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Give from '../views/Give.vue'
import GiveAll from '../views/GiveAll.vue'
import GetPlayer from '../views/GetPlayer.vue'
import Mail from '../views/Mail.vue'
import GetEmailCode from '../views/GetEmailCode.vue'
import ItemList from '../views/ItemList.vue'
import About from '../views/About.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/give', name: 'Give', component: Give },
  { path: '/give-all', name: 'GiveAll', component: GiveAll },
  { path: '/get-player', name: 'GetPlayer', component: GetPlayer },
  { path: '/mail', name: 'Mail', component: Mail },
  { path: '/get-email-code', name: 'GetEmailCode', component: GetEmailCode },
  { path: '/item-list', name: 'ItemList', component: ItemList },
  { path: '/about', name: 'About', component: About },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
