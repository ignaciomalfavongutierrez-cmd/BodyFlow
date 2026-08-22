import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePwaStore = defineStore('pwa', () => {
  const deferredPrompt = ref<any>(null)
  const isInstallable = ref(false)
  const isDismissed = ref(sessionStorage.getItem('bodyflow_pwa_dismissed') === 'true')
  const isStandalone = ref(
    window.matchMedia('(display-mode: standalone)').matches || 
    (window.navigator as any).standalone === true
  )
  const isIOS = ref(
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  )

  function capturePrompt(e: Event) {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    // Stash the event so it can be triggered later
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
      isStandalone.value = true
    }
    
    // Discard prompt after use
    deferredPrompt.value = null
    return outcome === 'accepted'
  }

  function dismissPrompt() {
    isDismissed.value = true
    sessionStorage.setItem('bodyflow_pwa_dismissed', 'true')
  }

  return { 
    isInstallable,
    isDismissed,
    isStandalone,
    isIOS,
    capturePrompt, 
    promptInstall,
    dismissPrompt
  }
})
