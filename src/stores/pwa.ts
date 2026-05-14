import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePwaStore = defineStore('pwa', () => {
  const deferredPrompt = ref<any>(null)
  const isInstallable = ref(false)

  function capturePrompt(e: Event) {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    // Stash the event so it can be triggered later.
    deferredPrompt.value = e
    isInstallable.value = true
  }

  async function promptInstall() {
    if (!deferredPrompt.value) return false
    
    // Show the install prompt
    deferredPrompt.value.prompt()
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.value.userChoice
    
    if (outcome === 'accepted') {
      isInstallable.value = false
    }
    
    // We've used the prompt, and can't use it again, throw it away
    deferredPrompt.value = null
    return outcome === 'accepted'
  }

  return { 
    isInstallable, 
    capturePrompt, 
    promptInstall 
  }
})
