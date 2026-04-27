const STORAGE_KEY = 'bodyflow_app_state'

export const storage = {
  load(): any {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to load state from localStorage:', error)
      return null
    }
  },

  save(state: any): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save state to localStorage:', error)
    }
  }
}
