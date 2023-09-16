import { createRouter, createWebHistory } from 'vue-router'

// 1. Define route components.
// These can be imported from other files
function loadView(view) {
  return () => import(`./views/${view}.vue`)
}
// function loadComponent(component) {
//   return () => import(`./components/${component}.vue`)
// }
// function loadComposable(composable) {
//   return () => import(`./components/composables/${composable}.vue`)
// }

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
export const routes = [
  { path: '/', name: 'ConversationsView', component: loadView('ChatView') },
  { path: '/chat', name: 'ChatView', component: loadView('ConversationsView') },
  { path: '/login', name: 'LoginView', component: loadView('LoginView') },
  { path: '/settings', name: 'SettingsView', component: loadView('SettingsView') },
  { path: '/details', name: 'UserDetailsView', component: loadView('UserDetailsView') },
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
export const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHistory(),
  routes, // short for `routes: routes`
})