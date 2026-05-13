import './polyfills'
import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { storage } from './utils/storage'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Hydrate state from localStorage
const savedState = storage.load()
if (savedState) {
  pinia.state.value = savedState
}

// Subscribe to state changes and save to localStorage
watch(
  pinia.state,
  (state) => {
    storage.save(state)
  },
  { deep: true }
)

app.use(router)
app.mount('#app')
